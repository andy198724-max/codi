# CODI Core

The brain of CODI - LLaVA-1.6 34B model inference and API server.

## Architecture

- **models/base/** - Base model weights (llava-hf/llava-v1.6-34b-hf)
- **models/optimized/** - Merged/fused model output from training (auto-detected by server)
- **models/r2_mount/** - Cloudflare R2 mount point for direct model access
- **training/** - LoRA training pipeline with DeepSpeed
- **inference/** - OpenAI-compatible API server with LLaVA vision support
- **config/** - Model, training, and R2 configuration
- **data/** - Training/validation datasets

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Download base model (from HuggingFace or R2)
python scripts/download_model.py

# Start API server
python inference/server.py

# API runs at http://localhost:11435
# Compatible with OpenAI SDK
```

## Model Sources

The model is loaded from the first available path:

1. `CODI_MODEL_PATH` environment variable
2. `models/optimized/merged/` - auto-detected after training
3. `models/base/` - downloaded base model
4. R2 mount (`models/r2_mount/`) - via Cloudflare R2 sync

## Cloudflare R2 Storage

The model (93 GiB) is stored in Cloudflare R2 at `codi-models/llava-v1.6-34b-hf/`.

To enable R2 downloads, edit `config/r2_config.yaml`:

```yaml
r2:
  enabled: true
  account_id: "your-account-id"
  access_key_id: "your-access-key"
  secret_access_key: "your-secret-key"
  bucket: "codi-models"
  model_path: "llava-v1.6-34b-hf"
```

Then run: `python scripts/download_model.py`

## Auto-Reload

The server watches `models/optimized/merged/` every 10 seconds. When a new merged model appears (after training completes), it automatically reloads without restart.

## API

The server exposes OpenAI-compatible endpoints:

- `GET /health` - Health check with model status
- `GET /v1/models` - List available models (codi-llava)
- `POST /v1/chat/completions` - Chat completion (supports streaming + vision)

### Vision Support

Send images as Base64 URLs:
```json
{
  "model": "codi-llava",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "What does this code do?"},
      {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
    ]
  }],
  "stream": true
}
```

## Configuration

Edit `config/model_config.yaml` to adjust LoRA parameters, training settings, and inference defaults.

Edit `config/r2_config.yaml` to configure Cloudflare R2 storage access.
