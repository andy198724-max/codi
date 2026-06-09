import sys, os, uvicorn
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("CODI_MODEL_PATH", "")
from inference.server import app
uvicorn.run(app, host="127.0.0.1", port=11435, log_level="warning")
