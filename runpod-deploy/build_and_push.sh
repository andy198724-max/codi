#!/bin/bash
set -e

REGISTRY="${1:-docker.io}"
IMAGE_NAME="${2:-codi-llava-runpod}"
IMAGE_TAG="${3:-latest}"

FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "=== Building CODI LLaVA Serverless Image ==="
echo "Image: ${FULL_IMAGE}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo ""
echo "[1/4] Copying codi-core files..."
rm -rf runpod-deploy/inference runpod-deploy/config
cp -r codi-core/inference runpod-deploy/
cp -r codi-core/config runpod-deploy/

echo "[2/4] Building Docker image..."
docker build -t "${FULL_IMAGE}" -f runpod-deploy/Dockerfile runpod-deploy/

echo "[3/4] Pushing to registry..."
docker push "${FULL_IMAGE}"

echo "[4/4] Cleaning up..."
rm -rf runpod-deploy/inference runpod-deploy/config

echo ""
echo "=== Done ==="
echo "Image pushed: ${FULL_IMAGE}"
echo ""
echo "Now create RunPod endpoint with:"
echo "  Docker Image: ${FULL_IMAGE}"
echo "  GPU Type: RTX 3090 (24 GB)"
echo "  Workers: Min=0, Max=1"
echo "  Idle Timeout: 30s"
echo "  Container Disk: 10 GB"
echo "  Network Volume: <your-volume> (mount at /workspace)"
echo ""
echo "Environment Variables:"
echo "  R2_ENABLED=true"
echo "  R2_ACCOUNT_ID=6efcfaf5ca5e8d2fe4010fc86754c6d4"
echo "  R2_ACCESS_KEY_ID=f8b77f17e9724b476be4ff11542e2638"
echo "  R2_SECRET_ACCESS_KEY=e67793e9aea918851a96ab7bc98f4e2fbb3cbb977e2761c98cafe206f82bd232"
echo "  R2_BUCKET=codi-models"
echo "  R2_MODEL_PATH=llava-v1.6-34b-hf"
echo "  CODI_MODEL_PATH=/workspace/model_cache"
echo "  CODI_LOAD_4BIT=true"
