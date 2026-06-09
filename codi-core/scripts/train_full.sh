#!/bin/bash
set -e

echo "=== CODI Full Training Pipeline ==="
echo ""

MODEL_DIR="models/base"
LORA_DIR="models/lora_adapters"
MERGE_DIR="models/optimized/merged"

# Step 1: Download model
echo "[1/5] Downloading base model..."
python scripts/download_model.py

# Step 2: Prepare data
echo "[2/5] Preparing training data..."
python utils/prepare_data.py

# Step 3: Train LoRA
echo "[3/5] Training LoRA adapters..."
python training/train_lora.py

# Step 4: Merge and export
echo "[4/5] Merging LoRA and exporting..."
python scripts/merge_lora.py \
    --base "$MODEL_DIR" \
    --lora "$LORA_DIR/latest" \
    --output "$MERGE_DIR" \
    --gguf

# Step 5: Start server
echo "[5/5] Starting API server..."
cd inference
python server.py

echo ""
echo "=== CODI pipeline complete ==="
