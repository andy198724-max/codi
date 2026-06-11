FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /codi-core

# Install PyTorch 2.4.0 with CUDA 12.4 (single install, no duplication)
RUN pip install --no-cache-dir torch==2.4.0 torchvision==0.19.0 --index-url https://download.pytorch.org/whl/cu124

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY inference/ ./inference/
COPY config/model_config.yaml ./config/model_config.yaml

ENV PYTHONPATH=/codi-core
ENV CODI_API_HOST=0.0.0.0
ENV CODI_API_PORT=8000
ENV CODI_LOAD_4BIT=true

RUN mkdir -p /model_cache /workspace/model_cache

EXPOSE 8000

CMD ["python", "-u", "inference/server.py"]
