import os
import json
import time
import asyncio
import logging
import threading
from typing import List, Dict, Any, Optional, AsyncGenerator
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import yaml

logger = logging.getLogger("codi.server")

API_KEY = os.environ.get("CODI_API_KEY", "codi-secret-key-2026")

_rate_counter: Dict[int, List[float]] = {}
_rate_lock = threading.Lock()

RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 100
RATE_LIMIT_TOKENS = 200000

app = FastAPI(title="CODI API", version="2.0.0", description="LLaVA inference API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = None
_model_ready = threading.Event()
_server_errors = []

logger.info("CODI server v2 starting on port %s", os.environ.get("PORT", "8000"))


def _check_api_key(request: Request):
    if request.url.path in ("/ping", "/debug", "/health", "/ready"):
        return
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer ") or auth.split(" ", 1)[1] != API_KEY:
        raise HTTPException(401, "Invalid or missing API key. Use Bearer <key>")


def _check_rate_limit(request: Request):
    tokens = 0
    if request.url.path == "/v1/chat/completions" and request.method == "POST":
        try:
            body = request.state.body if hasattr(request.state, "body") else {}
            tokens = sum(len(json.dumps(m.get("content", ""), ensure_ascii=False)) // 4
                         for m in body.get("messages", []))
        except Exception:
            pass
    now = time.time()
    key = hash(request.client.host) if request.client else 0
    with _rate_lock:
        times = [t for t in _rate_counter.get(key, []) if now - t < RATE_LIMIT_WINDOW]
        times.append(now)
        _rate_counter[key] = times
        if len(times) > RATE_LIMIT_MAX:
            raise HTTPException(429, f"Rate limit: {RATE_LIMIT_MAX} req/min. Espera un momento.")
        if tokens > RATE_LIMIT_TOKENS:
            raise HTTPException(400, f"Request too large: max {RATE_LIMIT_TOKENS} tokens estimados.")


@app.middleware("http")
async def api_key_middleware(request: Request, call_next):
    if request.url.path not in ("/ping", "/debug", "/health", "/ready", "/v1/models"):
        auth = request.headers.get("Authorization", "")
        key = os.environ.get("CODI_API_KEY", "codi-secret-key-2026")
        if not auth.startswith("Bearer ") or auth.split(" ", 1)[1] != key:
            raise HTTPException(401, "Invalid API key")
    response = await call_next(request)
    return response


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(system|user|assistant)$")
    content: Any


class ChatCompletionRequest(BaseModel):
    model: str = "codi-llava"
    messages: List[ChatMessage]
    temperature: float = 0.1
    max_tokens: int = 131072
    top_p: float = 0.95
    stream: bool = False
    max_context: Optional[int] = 32768


class ModelInfo(BaseModel):
    id: str
    object: str = "model"
    created: int
    owned_by: str = "codi"
    permission: List[Dict] = []


class ModelList(BaseModel):
    object: str = "list"
    data: List[ModelInfo]


def init_engine():
    global engine
    try:
        from inference.engine import CodiInferenceEngine
        logger.info("Initializing engine (may download model from R2)...")
        config_path = Path(__file__).resolve().parent.parent / "config" / "model_config.yaml"
        config = {}
        if config_path.exists():
            with open(config_path) as f:
                config = yaml.safe_load(f) or {}
        try:
            engine = CodiInferenceEngine(
                model_path=os.environ.get("CODI_MODEL_PATH"),
                max_context=config.get("model", {}).get("context_window", 32768),
            )
        except Exception as e:
            logger.error(f"Engine initialization failed: {e}")
            import traceback
            _server_errors.append(f"engine_create: {e}\n{traceback.format_exc()}")
            engine = None
    except Exception as e:
        logger.error(f"Engine import/config failed: {e}")
        import traceback
        _server_errors.append(f"init_engine: {e}\n{traceback.format_exc()}")
        engine = None

    if engine is not None and engine.model is not None:
        _model_ready.set()
        logger.info("Model ready")
    else:
        logger.warning("Model not loaded (engine may still be usable for config)")
        _model_ready.set() if engine else None


@app.on_event("startup")
async def startup():
    thread = threading.Thread(target=init_engine, daemon=True)
    thread.start()
    logger.info("Engine initialization started in background")


@app.get("/health")
async def health():
    if engine is None:
        raise HTTPException(503, "Engine not initialized")
    if engine.model is None:
        raise HTTPException(503, "Model not loaded")
    return {
        "status": "ok",
        "model": "codi-llava",
        "model_path": engine.model_path or "not set",
        "device": str(engine.model.device) if engine.model is not None else "none",
    }


@app.get("/debug")
async def debug():
    info = {
        "engine_created": engine is not None,
        "has_model": engine.model is not None if engine else False,
    }
    if engine:
        cache_dir = Path(engine.model_path) if engine.model_path else None
        if cache_dir and cache_dir.exists():
            info["cache_file_count"] = len(list(cache_dir.iterdir())) if cache_dir.is_dir() else 0
        else:
            info["cache_file_count"] = 0
        info["errors"] = getattr(engine, "_init_errors", [])
    else:
        info["cache_file_count"] = 0
        info["errors"] = _server_errors
    return info


@app.get("/ping")
async def ping():
    return {"status": "ok"}


@app.get("/ready")
async def ready():
    if _model_ready.is_set() and engine and engine.model:
        return {"ready": True}
    if engine and engine.model:
        _model_ready.set()
        return {"ready": True}
    return {"ready": False, "detail": "Model not loaded yet"}


@app.get("/v1/models")
async def list_models():
    if engine is None:
        raise HTTPException(503, "Engine not initialized")
    return ModelList(
        data=[ModelInfo(
            id="codi-llava",
            created=int(time.time()),
        )]
    )


@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    if engine is None or engine.model is None:
        raise HTTPException(503, "Model not loaded")
    if engine.processor is None:
        raise HTTPException(503, "Processor not loaded")

    messages = [m.model_dump() for m in request.messages]

    if request.stream:
        return StreamingResponse(
            stream_response(messages, request),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    full_response = ""
    async for chunk in engine.generate(
        messages,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        top_p=request.top_p,
        stream=True,
    ):
        full_response = chunk

    return {
        "id": f"chatcmpl-{int(time.time())}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": request.model,
        "choices": [{
            "index": 0,
            "message": {
                "role": "assistant",
                "content": full_response,
            },
            "finish_reason": "stop",
        }],
        "usage": {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
        },
    }


async def stream_response(messages: List[Dict], request: ChatCompletionRequest):
    response_id = f"chatcmpl-{int(time.time())}"
    created = int(time.time())
    yield f"data: {json.dumps({'id': response_id, 'object': 'chat.completion.chunk', 'created': created, 'model': request.model, 'choices': [{'index': 0, 'delta': {'role': 'assistant', 'content': ''}, 'finish_reason': None}]})}\n\n"
    async for chunk in engine.generate(
        messages,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        top_p=request.top_p,
        stream=True,
    ):
        yield f"data: {json.dumps({'id': response_id, 'object': 'chat.completion.chunk', 'created': created, 'model': request.model, 'choices': [{'index': 0, 'delta': {'content': chunk}, 'finish_reason': None}]})}\n\n"
    yield f"data: {json.dumps({'id': response_id, 'object': 'chat.completion.chunk', 'created': created, 'model': request.model, 'choices': [{'index': 0, 'delta': {}, 'finish_reason': 'stop'}]})}\n\n"
    yield "data: [DONE]\n\n"


if __name__ == "__main__":
    import uvicorn
    config_path = Path(__file__).resolve().parent.parent / "config" / "model_config.yaml"
    host = os.environ.get("CODI_API_HOST", "0.0.0.0")
    port = int(os.environ.get("PORT") or os.environ.get("CODI_API_PORT") or "11435")
    if not os.environ.get("PORT") and not os.environ.get("CODI_API_PORT"):
        if config_path.exists():
            with open(config_path) as f:
                config = yaml.safe_load(f) or {}
            host = config.get("inference", {}).get("api_host", host)
            port = config.get("inference", {}).get("api_port", port)

    logging.basicConfig(level=logging.INFO)
    logger.info("Starting uvicorn on %s:%s", host, port)
    uvicorn.run(app, host=host, port=port)
