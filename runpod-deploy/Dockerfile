FROM pytorch/pytorch:2.4.0-cuda12.4-cudnn9-devel

SHELL ["/bin/bash", "-c"]

WORKDIR /codi-core

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY inference/ ./inference/
COPY config/model_config.yaml ./config/model_config.yaml

ENV PYTHONPATH=/codi-core
ENV CODI_API_HOST=0.0.0.0
ENV CODI_API_PORT=8000
ENV CODI_LOAD_4BIT=true

RUN mkdir -p /workspace/model_cache

EXPOSE 8000

CMD ["python", "-u", "-m", "uvicorn", "inference.server:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
