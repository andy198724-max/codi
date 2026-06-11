import sys, traceback, io, boto3, time

log = io.StringIO()
def w(msg):
    log.write(f"{msg}\n")
    print(msg, flush=True)

w("=== CODI Startup Diagnostic ===")
w(f"Python: {sys.version}")
w(f"Args: {sys.argv}")

try:
    w("1. importing os..."); import os
    w("2. importing json..."); import json
    w("3. importing time..."); import time
    w("4. importing pathlib..."); from pathlib import Path
    w("5. importing fastapi..."); from fastapi import FastAPI; w("   ok")
    w("6. importing uvicorn..."); import uvicorn; w("   ok")
    w("7. importing yaml..."); import yaml; w("   ok")
    w("8. importing transformers libs..."); 
    from transformers import LlavaForConditionalGeneration; w("   LlavaForConditionalGeneration ok")
    from transformers import LlavaNextForConditionalGeneration; w("   LlavaNextForConditionalGeneration ok")
    from transformers import AutoProcessor; w("   AutoProcessor ok")
    w("9. importing engine..."); from inference.engine import CodiInferenceEngine; w("   engine import ok")
    w("10. importing boto3..."); import boto3; w("   ok")
except Exception as e:
    w(f"ERROR at import: {e}")
    w(traceback.format_exc())

w(f"\nPYTHONPATH: {os.environ.get('PYTHONPATH','not set')}")
w(f"Working dir: {os.getcwd()}")

# Test engine creation
w("\n--- Testing Engine Creation ---")
try:
    w("Creating CodiInferenceEngine...")
    eng = CodiInferenceEngine(
        model_path=os.environ.get("CODI_MODEL_PATH"),
        max_context=8192,
    )
    w(f"Engine created: model={eng.model is not None}, processor={eng.processor is not None}")
    w(f"model_path: {eng.model_path}")
    w(f"r2_enabled: {eng.r2_config.get('enabled')}")
    if eng._init_errors:
        w(f"Init errors: {eng._init_errors}")
    if eng.model_path:
        import os as _os
        cache = Path(eng.model_path)
        if cache.exists():
            w(f"Cache files ({len(list(cache.iterdir()))}): {sorted([p.name for p in cache.iterdir()])[:30]}")
except Exception as e:
    w(f"ENGINE CREATION FAILED: {e}")
    w(traceback.format_exc())
w(f"Files in /codi-core: {os.listdir('/codi-core')}")

# Test DNS first
try:
    import socket
    endpoint = f"{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com"
    w(f"\nDNS resolution for {endpoint}...")
    ip = socket.gethostbyname(endpoint)
    w(f"  Resolved to {ip}")
except Exception as e:
    w(f"DNS FAILED: {e}")

# Try to upload log to R2  
try:
    w("\nUploading diagnostics to R2...")
    from botocore.config import Config as BotoConfig
    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
        config=BotoConfig(connect_timeout=15, read_timeout=60, retries={"max_attempts": 1}),
    )
    w("  S3 client created")
    body = log.getvalue()
    w(f"  Log size: {len(body)} bytes, uploading...")
    s3.put_object(Bucket=os.environ['R2_BUCKET'], Key="diagnostics.log", Body=body)
    w("Diagnostics uploaded to R2!")
except Exception as e:
    w(f"Upload failed: {e}")
    w(traceback.format_exc())

w("\n=== END ===")
