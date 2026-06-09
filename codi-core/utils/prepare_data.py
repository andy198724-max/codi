import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def prepare_synthetic_data():
    samples = [
        {
            "messages": [
                {"role": "system", "content": "You are CODI, a world-class AI coding assistant with vision capabilities."},
                {"role": "user", "content": "Write a Python function to calculate fibonacci numbers"},
                {"role": "assistant", "content": "```python\ndef fibonacci(n: int) -> list[int]:\n    if n <= 0:\n        return []\n    if n == 1:\n        return [0]\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[i-1] + fib[i-2])\n    return fib\n```\n\nThis function generates the first `n` Fibonacci numbers."},
            ]
        },
        {
            "messages": [
                {"role": "system", "content": "You are CODI, a world-class AI coding assistant with vision capabilities."},
                {"role": "user", "content": "Explain this React component and suggest improvements:\n\n```tsx\nfunction Button(props) {\n  return <button style={{color: props.color}}>{props.label}</button>\n}\n```"},
                {"role": "assistant", "content": "This component lacks TypeScript typing and can be improved:\n\n```tsx\ninterface ButtonProps {\n  label: string;\n  color?: string;\n  onClick?: () => void;\n  variant?: 'primary' | 'secondary';\n}\n\nconst Button: React.FC<ButtonProps> = ({ label, color = '#007bff', onClick, variant = 'primary' }) => {\n  const baseStyles: React.CSSProperties = {\n    padding: '8px 16px',\n    borderRadius: '4px',\n    border: 'none',\n    cursor: 'pointer',\n    fontWeight: 600,\n  };\n\n  const variantStyles = {\n    primary: { backgroundColor: color, color: '#fff' },\n    secondary: { backgroundColor: 'transparent', color, border: `2px solid ${color}` },\n  };\n\n  return (\n    <button style={{...baseStyles, ...variantStyles[variant]}} onClick={onClick}>\n      {label}\n    </button>\n  );\n};\n```"},
            ]
        },
    ]

    train_file = DATA_DIR / "train" / "synthetic.jsonl"
    DATA_DIR.joinpath("train").mkdir(parents=True, exist_ok=True)

    with open(train_file, "w") as f:
        for sample in samples:
            f.write(json.dumps(sample) + "\n")

    print(f"Created {len(samples)} synthetic training samples at {train_file}")


def prepare_validation_data():
    val_samples = [
        {
            "messages": [
                {"role": "system", "content": "You are CODI, a world-class AI coding assistant with vision capabilities."},
                {"role": "user", "content": "Create a simple Express.js health check endpoint"},
                {"role": "assistant", "content": "```javascript\nconst express = require('express');\nconst app = express();\n\napp.get('/health', (req, res) => {\n  res.json({\n    status: 'ok',\n    timestamp: new Date().toISOString(),\n    uptime: process.uptime(),\n  });\n});\n\napp.listen(3000, () => console.log('Server on port 3000'));\n```"},
            ]
        },
    ]

    val_file = DATA_DIR / "val" / "synthetic.jsonl"
    DATA_DIR.joinpath("val").mkdir(parents=True, exist_ok=True)

    with open(val_file, "w") as f:
        for sample in val_samples:
            f.write(json.dumps(sample) + "\n")

    print(f"Created {len(val_samples)} validation samples at {val_file}")


if __name__ == "__main__":
    prepare_synthetic_data()
    prepare_validation_data()
