import os
import sys
import torch
import yaml
from pathlib import Path
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoProcessor,
    TrainingArguments,
    BitsAndBytesConfig,
)
from peft import (
    LoraConfig,
    get_peft_model,
    prepare_model_for_kbit_training,
    PeftModel,
)
from trl import SFTTrainer
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("codi.training")

BASE_DIR = Path(__file__).resolve().parent.parent


def load_config():
    config_path = BASE_DIR / "config" / "model_config.yaml"
    with open(config_path) as f:
        return yaml.safe_load(f)


def setup_lora_model(config):
    model_cfg = config["model"]
    lora_cfg = config["lora"]
    train_cfg = config["training"]

    logger.info("Loading base model...")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        str(BASE_DIR / "models" / "base"),
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
        attn_implementation="flash_attention_2",
        torch_dtype=torch.bfloat16,
    )

    model = prepare_model_for_kbit_training(model)
    model.gradient_checkpointing_enable()
    model.config.use_cache = False

    logger.info("Configuring LoRA...")
    peft_config = LoraConfig(
        r=lora_cfg["r"],
        lora_alpha=lora_cfg["alpha"],
        lora_dropout=lora_cfg["dropout"],
        target_modules=lora_cfg["target_modules"],
        bias=lora_cfg["bias"],
        task_type=lora_cfg["task_type"],
        modules_to_save=["embed_tokens", "lm_head", "vision_proj", "mm_projector"],
    )

    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    return model, peft_config


def prepare_training_args(config):
    train_cfg = config["training"]
    output_dir = BASE_DIR / "models" / "lora_adapters"

    return TrainingArguments(
        output_dir=str(output_dir),
        per_device_train_batch_size=train_cfg["batch_size"],
        gradient_accumulation_steps=train_cfg["gradient_accumulation_steps"],
        learning_rate=train_cfg["learning_rate"],
        num_train_epochs=train_cfg["num_epochs"],
        warmup_steps=train_cfg["warmup_steps"],
        logging_steps=train_cfg["logging_steps"],
        save_steps=train_cfg["save_steps"],
        eval_steps=train_cfg["eval_steps"],
        evaluation_strategy="steps",
        save_strategy="steps",
        bf16=train_cfg["bf16"],
        fp16=train_cfg["fp16"],
        gradient_checkpointing=train_cfg["gradient_checkpointing"],
        optim=train_cfg["optim"],
        deepspeed=train_cfg.get("deepspeed_config"),
        logging_dir=str(BASE_DIR / "logs"),
        report_to="tensorboard",
        remove_unused_columns=False,
        dataloader_num_workers=4,
        ddp_find_unused_parameters=False,
        save_total_limit=3,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
    )


def main():
    config = load_config()
    logger.info("Starting CODI LoRA training")
    logger.info(f"Config: r={config['lora']['r']}, alpha={config['lora']['alpha']}")

    model, peft_config = setup_lora_model(config)
    training_args = prepare_training_args(config)

    processor = AutoProcessor.from_pretrained(
        str(BASE_DIR / "models" / "base"),
        trust_remote_code=True,
    )

    dataset = load_dataset("json", data_files=str(BASE_DIR / "data" / "train" / "*.jsonl"), split="train")
    eval_dataset = load_dataset("json", data_files=str(BASE_DIR / "data" / "val" / "*.jsonl"), split="train")

    def formatting_func(example):
        text = processor.apply_chat_template(
            example["messages"], tokenize=False, add_generation_prompt=False
        )
        return text

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        eval_dataset=eval_dataset,
        tokenizer=processor.tokenizer,
        formatting_func=formatting_func,
        max_seq_length=config["model"]["context_window"],
        dataset_text_field=None,
        packing=False,
    )

    trainer.train()
    trainer.save_model(str(BASE_DIR / "models" / "lora_adapters" / "latest"))
    processor.save_pretrained(str(BASE_DIR / "models" / "lora_adapters" / "latest"))
    logger.info("Training complete!")


if __name__ == "__main__":
    main()
