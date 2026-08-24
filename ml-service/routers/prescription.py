from fastapi import APIRouter, File, UploadFile, HTTPException
from services.ocr_service import extract_prescription
import tempfile
import os

router = APIRouter()

@router.post("/extract")
async def extract_prescription_data(file: UploadFile = File(...)):
    """Extract medicine information from prescription image/PDF"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: JPEG, PNG, PDF"
        )
    
    try:
        # Save file temporarily
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f".{file.filename.split('.')[-1]}"
        ) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Extract prescription data
        result = await extract_prescription(tmp_path, file.content_type)
        
        # Cleanup
        os.unlink(tmp_path)
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))