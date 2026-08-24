from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.interaction_service import check_interactions
from typing import List

router = APIRouter()

class InteractionRequest(BaseModel):
    drugs: List[str]

@router.post("/check")
async def check_drug_interactions(request: InteractionRequest):
    """Check drug interactions using OpenFDA"""
    if len(request.drugs) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 drugs required"
        )
    try:
        interactions = await check_interactions(request.drugs)
        return {
            "success": True,
            "drugs": request.drugs,
            "interactions": interactions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))