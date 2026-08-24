import easyocr
import re
from PIL import Image
import os
from typing import Dict, List, Any

# Initialize EasyOCR reader (downloads model on first run)
reader = None

def get_reader():
    global reader
    if reader is None:
        print("Loading EasyOCR model...")
        reader = easyocr.Reader(['en'], gpu=False)
        print("EasyOCR model loaded!")
    return reader

def extract_medicines_from_text(text: str) -> List[Dict]:
    """Extract medicine names, dosages and frequencies from text"""
    medicines = []
    
    # Common medicine patterns
    medicine_patterns = [
        r'([A-Za-z]+(?:\s[A-Za-z]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|IU))',
        r'Tab\.?\s+([A-Za-z]+(?:\s[A-Za-z]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g))',
        r'Cap\.?\s+([A-Za-z]+(?:\s[A-Za-z]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g))',
        r'Inj\.?\s+([A-Za-z]+(?:\s[A-Za-z]+)?)',
        r'Syp\.?\s+([A-Za-z]+(?:\s[A-Za-z]+)?)',
    ]
    
    frequency_patterns = {
        'once daily': r'(?:once daily|OD|od|1-0-0|QD)',
        'twice daily': r'(?:twice daily|BD|bd|BID|bid|1-0-1|2 times)',
        'thrice daily': r'(?:thrice daily|TDS|tds|TID|tid|1-1-1|3 times)',
        'four times': r'(?:four times|QID|qid|1-1-1-1|4 times)',
        'at night': r'(?:at night|HS|hs|bedtime|SOS)',
    }
    
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        for pattern in medicine_patterns:
            matches = re.findall(pattern, line, re.IGNORECASE)
            if matches:
                for match in matches:
                    med_name = match[0] if isinstance(match, tuple) else match
                    dosage = match[1] if isinstance(match, tuple) and len(match) > 1 else ""
                    
                    frequency = ""
                    for freq_name, freq_pattern in frequency_patterns.items():
                        if re.search(freq_pattern, line, re.IGNORECASE):
                            frequency = freq_name
                            break
                    
                    medicines.append({
                        "name": med_name.strip(),
                        "dosage": dosage.strip(),
                        "frequency": frequency,
                        "duration": extract_duration(line)
                    })
    
    return medicines

def extract_duration(text: str) -> str:
    """Extract duration from text"""
    duration_pattern = r'(\d+)\s*(?:days?|weeks?|months?)'
    match = re.search(duration_pattern, text, re.IGNORECASE)
    if match:
        return match.group(0)
    return ""

def extract_doctor_name(text: str) -> str:
    """Extract doctor name from prescription"""
    patterns = [
        r'Dr\.?\s+([A-Za-z]+(?:\s[A-Za-z]+)?)',
        r'Doctor:?\s+([A-Za-z]+(?:\s[A-Za-z]+)?)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return ""

async def extract_prescription(file_path: str, content_type: str) -> Dict[str, Any]:
    """Main function to extract prescription data"""
    try:
        ocr_reader = get_reader()
        
        if content_type == "application/pdf":
            # For PDF, convert first page to image
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(file_path)
                page = doc[0]
                pix = page.get_pixmap()
                img_path = file_path.replace('.pdf', '.png')
                pix.save(img_path)
                results = ocr_reader.readtext(img_path)
                os.unlink(img_path)
            except ImportError:
                # If PyMuPDF not available, return empty
                results = []
        else:
            results = ocr_reader.readtext(file_path)
        
        # Combine all text
        full_text = ' '.join([result[1] for result in results])
        lines_text = '\n'.join([result[1] for result in results])
        
        # Extract information
        medicines = extract_medicines_from_text(lines_text)
        doctor_name = extract_doctor_name(full_text)
        
        return {
            "raw_text": full_text,
            "doctor_name": doctor_name,
            "medicines": medicines,
            "confidence": "high" if len(medicines) > 0 else "low"
        }
        
    except Exception as e:
        print(f"OCR Error: {e}")
        return {
            "raw_text": "",
            "doctor_name": "",
            "medicines": [],
            "confidence": "failed",
            "error": str(e)
        }