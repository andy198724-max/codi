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
w(f"Files in /codi-core: {os.listdir('/codi-core')}")

# Try to upload log to R2  
try:
    w("\nUploading diagnostics to R2...")
    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket=os.environ['R2_BUCKET'], Key="diagnostics.log", Body=log.getvalue())
    w("Diagnostics uploaded to R2!")
except Exception as e:
    w(f"Upload failed: {e}")

w("\n=== END ===")
