from fastapi import FastAPI
from pydantic import BaseModel
from typing import Literal


class PredictRequest(BaseModel):
    type: str
    lat: float
    lng: float


class PredictResponse(BaseModel):
    risk: Literal["bajo", "medio", "alto"]
    confidence: float


app = FastAPI(title="Alerta Pública - AI")


@app.get("/health")
def health():
    return {"ok": True, "service": "ai"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    risk = "medio"
    if payload.type in ["incendio", "clima"]:
        risk = "alto"
    elif payload.type in ["transporte", "protesta"]:
        risk = "medio"
    else:
        risk = "bajo"
    return {"risk": risk, "confidence": 0.62}
