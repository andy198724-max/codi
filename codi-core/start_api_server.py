import sys, os, threading, time, uvicorn

core_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, core_dir)
os.chdir(core_dir)
os.environ.setdefault("CODI_MODEL_PATH", "")

from inference.server import app

def run():
    uvicorn.run(app, host="127.0.0.1", port=11435, log_level="warning")

t = threading.Thread(target=run, daemon=True)
t.start()

while True:
    time.sleep(1)
