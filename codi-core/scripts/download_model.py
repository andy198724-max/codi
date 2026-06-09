import os
import sys
import json
import hashlib
from pathlib import Path
from huggingface_hub import snapshot_download, login
from transformers import AutoConfig
import requests
import yaml

MODEL_REPO = "llava-hf/llava-v1.6-34b-hf"
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models" / "base"
R2_CONFIG_PATH = BASE_DIR / "config" / "r2_config.yaml"

REQUIRED_FILES = [
    "config.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "model-00001-of-00015.safetensors",
    "model-00002-of-00015.safetensors",
    "model-00003-of-00015.safetensors",
    "model-00004-of-00015.safetensors",
    "model-00005-of-00015.safetensors",
    "model-00006-of-00015.safetensors",
    "model-00007-of-00015.safetensors",
    "model-00008-of-00015.safetensors",
    "model-00009-of-00015.safetensors",
    "model-00010-of-00015.safetensors",
    "model-00011-of-00015.safetensors",
    "model-00012-of-00015.safetensors",
    "model-00013-of-00015.safetensors",
    "model-00014-of-00015.safetensors",
    "model-00015-of-00015.safetensors",
    "model.safetensors.index.json",
    "preprocessor_config.json",
    "processor_config.json",
]

def check_integrity(model_path: Path) -> bool:
    if not model_path.exists():
        return False
    config_path = model_path / "config.json"
    if not config_path.exists():
        return False
    try:
        cfg = AutoConfig.from_pretrained(str(model_path))
        return True
    except Exception as e:
        print(f"[WARN] Config validation failed: {e}")
        return False

def verify_shard_integrity(model_path: Path) -> bool:
    index_file = model_path / "model.safetensors.index.json"
    if not index_file.exists():
        print("[WARN] No shard index found, skipping integrity check")
        return False
    with open(index_file) as f:
        index = json.load(f)
    weight_map = index.get("weight_map", {})
    shard_files = set(weight_map.values())
    all_ok = True
    for shard in shard_files:
        shard_path = model_path / shard
        if not shard_path.exists():
            print(f"[ERROR] Missing shard: {shard}")
            all_ok = False
        else:
            size = shard_path.stat().st_size
            print(f"[OK] {shard}: {size / 1e9:.2f} GB")
    return all_ok

def download_from_r2():
    r2_config_path = BASE_DIR / "config" / "r2_config.yaml"
    if not r2_config_path.exists():
        print("[ERROR] R2 config not found at config/r2_config.yaml")
        return False

    with open(r2_config_path) as f:
        r2_cfg = yaml.safe_load(f).get("r2", {})

    if not r2_cfg.get("enabled"):
        print("[INFO] R2 sync is not enabled in config")
        return False

    account_id = r2_cfg.get("account_id", "")
    access_key = r2_cfg.get("access_key_id", "")
    secret_key = r2_cfg.get("secret_access_key", "")
    bucket = r2_cfg.get("bucket", "codi-models")
    model_path = r2_cfg.get("model_path", "llava-v1.6-34b-hf")

    if not account_id or not access_key or not secret_key:
        print("[ERROR] R2 credentials not configured. Set account_id, access_key_id, and secret_access_key in config/r2_config.yaml")
        return False

    print(f"[*] Downloading from R2: {bucket}/{model_path}")
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    r2_endpoint = f"https://{account_id}.r2.cloudflarestorage.com"
    r2_url = f"https://{bucket}.{account_id}.r2.cloudflarestorage.com/{model_path}"

    try:
        import boto3
        s3 = boto3.client(
            "s3",
            endpoint_url=r2_endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )

        paginator = s3.get_paginator("list_objects_v2")
        pages = paginator.paginate(Bucket=bucket, Prefix=model_path)

        objects = []
        allowed_exts = (".safetensors", ".json", ".model", ".md", ".txt")
        for page in pages:
            for obj in page.get("Contents", []):
                key = obj["Key"]
                rel_path = key[len(model_path):].lstrip("/")
                if not rel_path or rel_path.endswith(".aria2"):
                    continue
                if obj["Size"] == 0 and rel_path not in REQUIRED_FILES:
                    continue
                if rel_path in REQUIRED_FILES or rel_path.endswith(allowed_exts):
                    objects.append((rel_path, obj["Size"]))

        if not objects:
            print(f"[ERROR] No objects found at r2://{bucket}/{model_path}/")
            return False

        print(f"[*] Found {len(objects)} objects in R2")

        for rel_path, size in objects:
            dest = MODELS_DIR / rel_path
            dest.parent.mkdir(parents=True, exist_ok=True)
            print(f"  Downloading {rel_path} ({size / 1e9:.2f} GB)...")
            s3.download_file(bucket, f"{model_path}/{rel_path}", str(dest))

        print("[✓] R2 download complete")
        return True

    except ImportError:
        print("[ERROR] boto3 not installed. Run: pip install boto3")
        return False
    except Exception as e:
        print(f"[ERROR] R2 download failed: {e}")
        return False

def download_from_hf():
    print(f"\n[*] Downloading from HuggingFace: {MODEL_REPO}")
    try:
        snapshot_download(
            repo_id=MODEL_REPO,
            local_dir=str(MODELS_DIR),
            local_dir_use_symlinks=False,
            resume_download=True,
            ignore_patterns=["*.pt", "optimizer.pt", "*.bin"],
        )
        print("[✓] HuggingFace download complete")
        return True
    except Exception as e:
        print(f"[ERROR] HuggingFace download failed: {e}")
        return False

def main():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[*] CODI - Model Downloader")
    print(f"[*] Target: {MODEL_REPO}")
    print(f"[*] Destination: {MODELS_DIR}")

    if check_integrity(MODELS_DIR):
        print("[*] Model already exists and passes integrity check")
        if verify_shard_integrity(MODELS_DIR):
            print("[✓] Model is complete and ready")
            return
        else:
            print("[*] Model exists but may be incomplete, re-downloading...")

    if download_from_r2():
        pass
    elif download_from_hf():
        pass
    else:
        print("[ERROR] Could not download model from any source")
        sys.exit(1)

    if not check_integrity(MODELS_DIR):
        print("[ERROR] Downloaded model failed integrity check")
        sys.exit(1)

    print("[✓] Download completed successfully")

if __name__ == "__main__":
    main()
