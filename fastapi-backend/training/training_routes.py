from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from fastapi.responses import StreamingResponse, JSONResponse
from starlette.background import BackgroundTask
import os
import json
import uuid
import shutil
import subprocess
import threading
from pathlib import Path
from typing import Dict, Any

router = APIRouter(tags=["training"])

BASE_DIR = Path(__file__).resolve().parents[1]
DATASETS_DIR = BASE_DIR / "training_datasets"
MODELS_DIR = BASE_DIR / "models"
LOGS_DIR = BASE_DIR / "training_logs"

for d in (DATASETS_DIR, MODELS_DIR, LOGS_DIR):
    d.mkdir(parents=True, exist_ok=True)

JOBS: Dict[str, Dict[str, Any]] = {}

@router.post("/api/upload_training_dataset")
async def upload_training_dataset(file: UploadFile = File(...), file_type: str = Form("json")):
    if file_type not in {"json", "jsonl", "csv", "xlsx", "tsv", "txt"}:
        raise HTTPException(400, "Unsupported dataset type")
    dataset_id = uuid.uuid4().hex
    target_path = DATASETS_DIR / f"{dataset_id}_{file.filename}"
    with target_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"dataset_id": dataset_id, "filename": file.filename, "path": str(target_path)}


def _stream_file_lines(path: Path):
    path = Path(path)
    path.touch(exist_ok=True)
    with path.open("r") as f:
        # Seek to start and stream
        while True:
            line = f.readline()
            if not line:
                import time
                time.sleep(0.2)
                continue
            yield f"data: {line.rstrip()}\n\n"


@router.get("/api/training/stream/{job_id}")
async def stream_training_logs(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    log_path = Path(job["log_path"])  # type: ignore
    return StreamingResponse(
        _stream_file_lines(log_path),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/api/start_training")
async def start_training(payload: Dict[str, Any] = Body(...)):
    dataset_entries = payload.get("datasets") or []
    if not dataset_entries:
        raise HTTPException(400, "No datasets provided")
    # Use first dataset path
    dataset_info = dataset_entries[0]
    dataset_id = dataset_info.get("id")
    # Expect filename to be in training_datasets directory; scan for it
    dataset_path = None
    for p in DATASETS_DIR.glob(f"{dataset_id}_*"):
        dataset_path = p
        break
    if not dataset_path:
        raise HTTPException(404, "Dataset file not found on server")

    job_id = uuid.uuid4().hex
    job_dir = MODELS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    log_path = LOGS_DIR / f"{job_id}.log"

    model_name = (payload.get("model") or "llama3.1")
    hp = payload.get("hyperparameters") or {}

    cmd = [
        "python3", "-u",
        str(BASE_DIR / "fine_tuning" / "fine_tune.py"),
        "--dataset", str(dataset_path),
        "--output_dir", str(job_dir),
        "--base_model", str(model_name),
        "--learning_rate", str(hp.get("learning_rate", 2e-4)),
        "--batch_size", str(hp.get("per_device_train_batch_size", 2)),
        "--epochs", str(hp.get("num_train_epochs", 1)),
    ]

    with log_path.open("w") as lf:
        lf.write("[trainer] Starting training...\n")

    def run_proc():
        with log_path.open("a", buffering=1) as lf:
            try:
                proc = subprocess.Popen(
                    cmd,
                    cwd=str(BASE_DIR),
                    stdout=lf,
                    stderr=lf,
                    bufsize=1,
                    universal_newlines=True,
                )
                rc = proc.wait()
                lf.write(f"\n[trainer] Finished with code {rc}\n")
            except Exception as e:
                lf.write(f"\n[trainer] Error: {e}\n")

    t = threading.Thread(target=run_proc, daemon=True)
    t.start()

    JOBS[job_id] = {"log_path": str(log_path), "model_dir": str(job_dir)}
    return {"job_id": job_id}


@router.get("/api/training/models")
async def list_models():
    items = []
    for d in MODELS_DIR.iterdir():
        if d.is_dir():
            items.append({"id": d.name, "path": str(d)})
    return {"models": items}


