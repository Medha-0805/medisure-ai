from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="MediSure AI - ML Service",
    description="Machine Learning service for prescription OCR and medicine recommendations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5000",
    "https://scintillating-manatee-8af5c1.netlify.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "MediSure AI ML Service", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "OK", "service": "MediSure ML Service"}

# Import routers
from routers import prescription, recommend, interaction

app.include_router(prescription.router, prefix="/prescription", tags=["Prescription"])
app.include_router(recommend.router, prefix="/recommend", tags=["Recommendations"])
app.include_router(interaction.router, prefix="/interaction", tags=["Interactions"])