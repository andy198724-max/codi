import torch
import time
import os
import json
import threading
from pathlib import Path
from typing import Optional, List, Dict, Any, AsyncGenerator
from transformers import (
    LlavaNextForConditionalGeneration,
    AutoProcessor,
    GenerationConfig,
    AutoConfig,
    BitsAndBytesConfig,
)
from PIL import Image
import base64
import io
import logging
import yaml
import boto3
from botocore.config import Config as BotoConfig

logger = logging.getLogger("codi.engine")


class CodiInferenceEngine:
    def __init__(
        self,
        model_path: Optional[str] = None,
        device: str = "auto",
        max_context: int = 8192,
    ):
        print(">>> Engine.__init__ start", flush=True)
        self.base_path = Path(__file__).resolve().parent.parent
        self.r2_config = self._load_r2_config()
        self.device = device
        self.max_context = max_context
        self.model = None
        self.processor = None
        self.model_path = None
        self._init_errors = []
        try:
            print(">>> resolve_model_path...", flush=True)
            self._resolve_model_path(model_path)
            print(">>> download_missing_shards...", flush=True)
            self._download_missing_shards()
            print(">>> load_processor...", flush=True)
            self._load_processor()
            print(">>> load_model...", flush=True)
            self._load_model()
            print(">>> init complete", flush=True)
        except Exception as e:
            print(f">>> init ERROR: {e}", flush=True)
            self._init_errors.append(f"init: {e}")
            logger.warning(f"Model not available: {e}")
            self.model = None
            self.processor = None

    def _load_r2_config(self) -> dict:
        cfg = {}
        r2_config_path = self.base_path / "config" / "r2_config.yaml"
        if r2_config_path.exists():
            with open(r2_config_path) as f:
                cfg = (yaml.safe_load(f) or {}).get("r2", {})
        env_overrides = {
            "enabled": os.environ.get("R2_ENABLED", cfg.get("enabled", False)),
            "account_id": os.environ.get("R2_ACCOUNT_ID", cfg.get("account_id", "")),
            "access_key_id": os.environ.get("R2_ACCESS_KEY_ID", cfg.get("access_key_id", "")),
            "secret_access_key": os.environ.get("R2_SECRET_ACCESS_KEY", cfg.get("secret_access_key", "")),
            "bucket": os.environ.get("R2_BUCKET", cfg.get("bucket", "codi-models")),
            "model_path": os.environ.get("R2_MODEL_PATH", cfg.get("model_path", "llava-v1.6-34b-hf")),
            "endpoint": os.environ.get("R2_ENDPOINT", cfg.get("endpoint", "")),
        }
        if isinstance(env_overrides["enabled"], str):
            env_overrides["enabled"] = env_overrides["enabled"].lower() == "true"
        return env_overrides

    def _resolve_model_path(self, model_path: Optional[str] = None):
        if model_path:
            self.model_path = model_path
            Path(self.model_path).mkdir(parents=True, exist_ok=True)
            return
        env_path = os.environ.get("CODI_MODEL_PATH")
        if env_path:
            self.model_path = env_path
            Path(self.model_path).mkdir(parents=True, exist_ok=True)
            return
        optimized = self.base_path / "models" / "optimized" / "merged"
        if optimized.exists() and any(optimized.iterdir()):
            self.model_path = str(optimized)
            return
        base = self.base_path / "models" / "base"
        if base.exists() and any(base.iterdir()):
            self.model_path = str(base)
            return
        raise RuntimeError(
            "No model path found. Set CODI_MODEL_PATH or R2_MODEL_PATH"
        )

    def _get_s3_client(self):
        cfg = self.r2_config
        if not cfg.get("enabled"):
            return None
        return boto3.client(
            "s3",
            endpoint_url=cfg.get("endpoint") or f"https://{cfg['account_id']}.r2.cloudflarestorage.com",
            aws_access_key_id=cfg.get("access_key_id"),
            aws_secret_access_key=cfg.get("secret_access_key"),
            config=BotoConfig(
                connect_timeout=15,
                read_timeout=300,
                retries={"max_attempts": 2},
            ),
        )

    def _r2_objects(self):
        cfg = self.r2_config
        s3 = self._get_s3_client()
        if not s3:
            return []
        bucket = cfg.get("bucket", "codi-models")
        prefix = cfg.get("model_path", "llava-v1.6-34b-hf")
        paginator = s3.get_paginator("list_objects_v2")
        pages = paginator.paginate(Bucket=bucket, Prefix=f"{prefix}/")
        objects = []
        for page in pages:
            for obj in page.get("Contents", []):
                key = obj["Key"]
                rel = key[len(prefix):].lstrip("/")
                if not rel or rel.endswith(".aria2"):
                    continue
                objects.append((rel, obj["Size"]))
        return objects

    def _download_missing_shards(self):
        if not self.model_path:
            return
        model_dir = Path(self.model_path)
        try:
            self._ensure_configs_local(model_dir)
        except Exception as e:
            self._init_errors.append(f"config_download: {e}")
            logger.warning(f"Config download failed: {e}")
        index_file = model_dir / "model.safetensors.index.json"
        if not index_file.exists():
            return
        with open(index_file) as f:
            index = json.load(f)
        weight_map = index.get("weight_map", {})
        needed = sorted(set(weight_map.values()))
        local_all = all((model_dir / s).exists() for s in needed)
        if local_all:
            logger.info("All shards present locally")
            return
        if not self.r2_config.get("enabled"):
            logger.warning("Shards missing and R2 not enabled")
            return
        logger.info(f"Downloading {len(needed)} shards from R2...")
        s3 = self._get_s3_client()
        if not s3:
            logger.warning("S3 client not available")
            return
        bucket = self.r2_config.get("bucket", "codi-models")
        prefix = self.r2_config.get("model_path", "llava-v1.6-34b-hf")
        for shard in needed:
            dest = model_dir / shard
            if dest.exists() and dest.stat().st_size > 0:
                continue
            logger.info(f"  {shard}...")
            try:
                s3.download_file(bucket, f"{prefix}/{shard}", str(dest))
                sz = dest.stat().st_size
                logger.info(f"  {shard} OK ({sz / 1e9:.2f} GB)")
            except Exception as e:
                self._init_errors.append(f"shard_{shard}: {e}")
                logger.warning(f"  {shard} failed: {e}")
        logger.info("All shards downloaded")

    def _ensure_configs_local(self, model_dir: Path):
        required_configs = [
            "config.json", "tokenizer_config.json",
            "processor_config.json", "preprocessor_config.json",
            "model.safetensors.index.json", "generation_config.json",
            "chat_template.json", "special_tokens_map.json",
            "added_tokens.json", "tokenizer.model",
        ]
        missing = [f for f in required_configs if not (model_dir / f).exists()]
        if not missing:
            return
        if not self.r2_config.get("enabled"):
            raise RuntimeError(f"Config files missing in {model_dir}: {missing}")
        logger.info(f"Downloading {len(missing)} config files from R2...")
        s3 = self._get_s3_client()
        bucket = self.r2_config.get("bucket", "codi-models")
        prefix = self.r2_config.get("model_path", "llava-v1.6-34b-hf")
        for cfg_file in missing:
            try:
                logger.info(f"  {cfg_file}")
                s3.download_file(bucket, f"{prefix}/{cfg_file}", str(model_dir / cfg_file))
            except Exception as e:
                self._init_errors.append(f"cfg_{cfg_file}: {e}")
                logger.warning(f"  {cfg_file} download failed: {e}")

    def _model_kwargs(self) -> dict:
        kwargs = {
            "torch_dtype": torch.bfloat16,
            "device_map": self.device,
            "trust_remote_code": True,
        }
        use_4bit = os.environ.get("CODI_LOAD_4BIT", "false").lower() == "true"
        use_8bit = os.environ.get("CODI_LOAD_8BIT", "false").lower() == "true"
        if use_4bit:
            kwargs["quantization_config"] = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4",
            )
            kwargs["torch_dtype"] = torch.float16
            logger.info("Using 4-bit quantization")
        elif use_8bit:
            kwargs["quantization_config"] = BitsAndBytesConfig(load_in_8bit=True)
            kwargs["torch_dtype"] = torch.float16
            logger.info("Using 8-bit quantization")
        if not torch.cuda.is_available():
            kwargs["device_map"] = "cpu"
            kwargs.pop("quantization_config", None)
        return kwargs

    def _load_processor(self):
        if not self.model_path:
            return
        try:
            self.processor = AutoProcessor.from_pretrained(
                self.model_path, trust_remote_code=True
            )
            logger.info("Processor loaded")
        except Exception as e:
            self._init_errors.append(f"processor: {e}")
            logger.warning(f"Processor not loaded yet: {e}")
            self.processor = None

    def _load_model(self):
        if not self.model_path:
            return
        configs_exist = all(
            (Path(self.model_path) / f).exists()
            for f in ["config.json", "model.safetensors.index.json"]
        )
        if configs_exist:
            if self.processor is None:
                try:
                    self.processor = AutoProcessor.from_pretrained(
                        self.model_path, trust_remote_code=True
                    )
                    logger.info("Processor loaded after config download")
                except Exception as e:
                    self._init_errors.append(f"proc_retry: {e}")
                    logger.warning(f"Processor still unavailable: {e}")
                    self.model = None
                    return
        model_dir = Path(self.model_path)
        index_file = model_dir / "model.safetensors.index.json"
        if index_file.exists():
            weight_map = json.loads(index_file.read_text()).get("weight_map", {})
            needed = sorted(set(weight_map.values()))
            all_present = all((model_dir / s).exists() and (model_dir / s).stat().st_size > 0 for s in needed)
            if all_present:
                logger.info("Loading model from local files...")
                try:
                    self.model = LlavaNextForConditionalGeneration.from_pretrained(
                        self.model_path, **self._model_kwargs(),
                    )
                    self.model.eval()
                    logger.info("Model loaded successfully")
                    return
                except Exception as e:
                    self._init_errors.append(f"model_load: {e}")
                    raise
        if self.r2_config.get("enabled"):
            if index_file.exists():
                logger.info("Not all shards present — will need to download first")
            else:
                logger.info("No shard index found — loading config only")
            try:
                config = AutoConfig.from_pretrained(self.model_path, trust_remote_code=True)
                logger.info(f"Model config loaded: {config.model_type}, params: ~34B")
            except Exception as e:
                self._init_errors.append(f"config_load: {e}")
        logger.warning("Model weights not loaded")
        self.model = None

    def _process_images(self, images: List[str]) -> List[Image.Image]:
        processed = []
        for img_data in images:
            if img_data.startswith("data:image") or img_data.startswith("data:img"):
                header, encoded = img_data.split(",", 1)
                img_bytes = base64.b64decode(encoded)
            elif img_data.startswith("http"):
                import requests
                resp = requests.get(img_data, stream=True)
                resp.raise_for_status()
                img_bytes = resp.content
            elif Path(img_data).exists():
                with open(img_data, "rb") as f:
                    img_bytes = f.read()
            else:
                try:
                    img_bytes = base64.b64decode(img_data)
                except Exception:
                    raise ValueError(f"Unsupported image format")
            image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            processed.append(image)
        return processed

    async def generate(
        self,
        messages: List[Dict[str, Any]],
        temperature: float = 0.7,
        max_tokens: int = 8192,
        top_p: float = 0.95,
        stream: bool = False,
    ) -> AsyncGenerator[str, None]:
        if self.model is None:
            raise RuntimeError("Model not loaded")
        images = []
        text_messages = []
        for msg in messages:
            content = msg.get("content", "")
            msg_images = []
            if isinstance(content, list):
                for part in content:
                    if part.get("type") == "image_url":
                        url = part["image_url"]["url"]
                        msg_images.append(url)
                    elif part.get("type") == "text":
                        text_messages.append({
                            "role": msg.get("role", "user"),
                            "content": part["text"],
                        })
            else:
                text_messages.append({
                    "role": msg.get("role", "user"),
                    "content": content,
                })
            if msg_images:
                processed = self._process_images(msg_images)
                images.extend(processed)
        prompt = self.processor.apply_chat_template(
            text_messages, tokenize=False, add_generation_prompt=True
        )
        inputs = self.processor(
            text=prompt,
            images=images if images else None,
            return_tensors="pt",
            padding=True,
        ).to(self.model.device)
        gen_config = GenerationConfig(
            max_new_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            do_sample=temperature > 0,
            pad_token_id=self.processor.tokenizer.pad_token_id,
            eos_token_id=self.processor.tokenizer.eos_token_id,
        )
        with torch.no_grad():
            generated = self.model.generate(
                **inputs,
                generation_config=gen_config,
            )
        response = self.processor.tokenizer.decode(
            generated[0][inputs["input_ids"].shape[1]:],
            skip_special_tokens=True,
        )
        yield response

    def generate_sync(
        self,
        messages: List[Dict[str, Any]],
        temperature: float = 0.7,
        max_tokens: int = 8192,
        top_p: float = 0.95,
    ) -> str:
        result = ""
        async def _run():
            nonlocal result
            async for chunk in self.generate(messages, temperature, max_tokens, top_p):
                result = chunk
        import asyncio
        asyncio.run(_run())
        return result
