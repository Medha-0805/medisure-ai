from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict, Any
import os

# Load model once
model = None

def get_model():
    global model
    if model is None:
        print("Loading Sentence Transformer model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Model loaded!")
    return model

# Sample medicine database (in production, load from Supabase)
SAMPLE_MEDICINES = [
    {"id": "1", "name": "Paracetamol 500mg", "generic_name": "Acetaminophen", "composition": "Paracetamol 500mg", "manufacturer": "GSK", "price": 10.0, "category": "Analgesic"},
    {"id": "2", "name": "Crocin 650mg", "generic_name": "Acetaminophen", "composition": "Paracetamol 650mg", "manufacturer": "GSK", "price": 15.0, "category": "Analgesic"},
    {"id": "3", "name": "Dolo 650", "generic_name": "Acetaminophen", "composition": "Paracetamol 650mg", "manufacturer": "Micro Labs", "price": 30.0, "category": "Analgesic"},
    {"id": "4", "name": "Calpol 500mg", "generic_name": "Acetaminophen", "composition": "Paracetamol 500mg", "manufacturer": "GSK", "price": 12.0, "category": "Analgesic"},
    {"id": "5", "name": "Ibuprofen 400mg", "generic_name": "Ibuprofen", "composition": "Ibuprofen 400mg", "manufacturer": "Abbott", "price": 20.0, "category": "NSAID"},
    {"id": "6", "name": "Brufen 400mg", "generic_name": "Ibuprofen", "composition": "Ibuprofen 400mg", "manufacturer": "Abbott", "price": 25.0, "category": "NSAID"},
    {"id": "7", "name": "Combiflam", "generic_name": "Ibuprofen+Paracetamol", "composition": "Ibuprofen 400mg + Paracetamol 325mg", "manufacturer": "Sanofi", "price": 35.0, "category": "Analgesic"},
    {"id": "8", "name": "Azithromycin 500mg", "generic_name": "Azithromycin", "composition": "Azithromycin 500mg", "manufacturer": "Cipla", "price": 85.0, "category": "Antibiotic"},
    {"id": "9", "name": "Zithromax 500mg", "generic_name": "Azithromycin", "composition": "Azithromycin 500mg", "manufacturer": "Pfizer", "price": 120.0, "category": "Antibiotic"},
    {"id": "10", "name": "Amoxicillin 500mg", "generic_name": "Amoxicillin", "composition": "Amoxicillin 500mg", "manufacturer": "Cipla", "price": 45.0, "category": "Antibiotic"},
    {"id": "11", "name": "Metformin 500mg", "generic_name": "Metformin", "composition": "Metformin HCl 500mg", "manufacturer": "USV", "price": 25.0, "category": "Antidiabetic"},
    {"id": "12", "name": "Glycomet 500mg", "generic_name": "Metformin", "composition": "Metformin HCl 500mg", "manufacturer": "USV", "price": 30.0, "category": "Antidiabetic"},
    {"id": "13", "name": "Atorvastatin 10mg", "generic_name": "Atorvastatin", "composition": "Atorvastatin 10mg", "manufacturer": "Ranbaxy", "price": 55.0, "category": "Statin"},
    {"id": "14", "name": "Lipitor 10mg", "generic_name": "Atorvastatin", "composition": "Atorvastatin 10mg", "manufacturer": "Pfizer", "price": 150.0, "category": "Statin"},
    {"id": "15", "name": "Omeprazole 20mg", "generic_name": "Omeprazole", "composition": "Omeprazole 20mg", "manufacturer": "AstraZeneca", "price": 40.0, "category": "PPI"},
]

async def get_alternatives(medicine_name: str, top_k: int = 10) -> List[Dict[str, Any]]:
    """Get medicine alternatives using sentence transformers"""
    try:
        transformer = get_model()
        
        # Create embeddings for query
        query_text = f"{medicine_name}"
        query_embedding = transformer.encode([query_text])
        
        # Create embeddings for all medicines
        medicine_texts = [
            f"{m['name']} {m['generic_name']} {m['composition']} {m['category']}"
            for m in SAMPLE_MEDICINES
        ]
        medicine_embeddings = transformer.encode(medicine_texts)
        
        # Calculate similarity
        similarities = cosine_similarity(query_embedding, medicine_embeddings)[0]
        
        # Get top k results
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            med = SAMPLE_MEDICINES[idx].copy()
            med['similarity_score'] = float(similarities[idx])
            results.append(med)
        
        return results
        
    except Exception as e:
        print(f"Recommendation error: {e}")
        return []