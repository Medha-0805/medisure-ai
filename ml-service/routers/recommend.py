from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.recommendation_service import get_alternatives
from typing import List

router = APIRouter()

class MedicineRequest(BaseModel):
    medicine_name: str
    top_k: int = 10

class MedicineResponse(BaseModel):
    name: str
    generic_name: str
    composition: str
    manufacturer: str
    price: float
    similarity_score: float

@router.post("/alternatives")
async def get_medicine_alternatives(request: MedicineRequest):
    """Get alternative medicines using sentence transformers"""
    try:
        alternatives = await get_alternatives(
            request.medicine_name,
            request.top_k
        )
        return {
            "success": True,
            "medicine": request.medicine_name,
            "alternatives": alternatives
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))