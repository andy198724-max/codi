import sys
import torch
from pathlib import Path
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoProcessor

BASE_DIR = Path(__file__).resolve().parent.parent

def merge_lora(
    base_model_path: str = None,
    lora_path: str = None,
    output_path: str = None,
    export_gguf: bool = False,
    export_onnx: bool = False,
):
    if base_model_path is None:
        base_model_path = str(BASE_DIR / "models" / "base")
    if lora_path is None:
        lora_path = str(BASE_DIR / "models" / "lora_adapters" / "latest")
    if output_path is None:
        output_path = str(BASE_DIR / "models" / "optimized" / "merged")

    print(f"[*] Loading base model from: {base_model_path}")
    model = AutoModelForCausalLM.from_pretrained(
        base_model_path,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        trust_remote_code=True,
    )

    print(f"[*] Loading LoRA adapters from: {lora_path}")
    model = PeftModel.from_pretrained(model, lora_path)
    model = model.merge_and_unload()

    Path(output_path).mkdir(parents=True, exist_ok=True)
    print(f"[*] Saving merged model to: {output_path}")
    model.save_pretrained(output_path, safe_serialization=True)

    processor = AutoProcessor.from_pretrained(base_model_path, trust_remote_code=True)
    processor.save_pretrained(output_path)

    print("[✓] LoRA merged successfully")

    if export_gguf:
        export_to_gguf(model, output_path)
    if export_onnx:
        export_to_onnx(model, output_path)

def export_to_gguf(model, source_path):
    print("[*] Exporting to GGUF format...")
    try:
        from transformers import AutoTokenizer
        from gguf import GGUFWriter
        import numpy as np
        tokenizer = AutoTokenizer.from_pretrained(source_path)
        output_path = Path(source_path) / "codi-model-q4_k_m.gguf"
        print(f"[✓] GGUF export placeholder: {output_path}")
        print("[*] For production GGUF export, use llama.cpp's convert.py")
    except ImportError:
        print("[WARN] gguf package not installed. Skipping GGUF export.")
        print("[*] Install with: pip install gguf")

def export_to_onnx(model, source_path):
    print("[*] Exporting to ONNX format...")
    try:
        from transformers import AutoTokenizer
        import torch.onnx
        output_path = Path(source_path) / "codi-model.onnx"
        dummy_input = torch.randint(0, 100, (1, 128))
        torch.onnx.export(
            model,
            dummy_input,
            str(output_path),
            input_names=["input_ids"],
            output_names=["logits"],
            dynamic_axes={"input_ids": {0: "batch", 1: "sequence"}},
            opset_version=17,
        )
        print(f"[✓] ONNX export complete: {output_path}")
    except Exception as e:
        print(f"[WARN] ONNX export failed: {e}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", help="Base model path")
    parser.add_argument("--lora", help="LoRA adapter path")
    parser.add_argument("--output", help="Output path")
    parser.add_argument("--gguf", action="store_true", help="Export to GGUF")
    parser.add_argument("--onnx", action="store_true", help="Export to ONNX")
    args = parser.parse_args()
    merge_lora(args.base, args.lora, args.output, args.gguf, args.onnx)
