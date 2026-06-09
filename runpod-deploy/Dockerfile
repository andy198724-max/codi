FROM nvidia/cuda:12.4.1-cudnn9-devel-ubuntu22.04

SHELL ["/bin/bash", "-c"]

# Install Python 3.11 + pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 python3.11-dev python3-pip curl git build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set python3.11 as default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1 \
    && update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

WORKDIR /codi-core

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install PyTorch with CUDA 12.4
RUN pip install --no-cache-dir torch==2.4.0 torchvision==0.19.0 --index-url https://download.pytorch.org/whl/cu124

COPY inference/ ./inference/
COPY config/model_config.yaml ./config/model_config.yaml

ENV PYTHONPATH=/codi-core
ENV CODI_API_HOST=0.0.0.0
ENV CODI_API_PORT=8000
ENV CODI_LOAD_4BIT=true

RUN mkdir -p /workspace/model_cache

EXPOSE 8000

CMD ["python", "-u", "-m", "uvicorn", "inference.server:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
