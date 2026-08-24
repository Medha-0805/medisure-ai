import requests
from typing import List, Dict, Any

OPENFDA_BASE_URL = "https://api.fda.gov/drug"

# Known interactions database (fallback)
KNOWN_INTERACTIONS = {
    ("warfarin", "aspirin"): {
        "severity": "dangerous",
        "description": "Concurrent use increases risk of bleeding significantly.",
        "recommendation": "Avoid combination. If necessary, monitor INR closely."
    },
    ("metformin", "alcohol"): {
        "severity": "warning",
        "description": "Alcohol increases risk of lactic acidosis with metformin.",
        "recommendation": "Avoid alcohol while taking metformin."
    },
    ("simvastatin", "amiodarone"): {
        "severity": "dangerous",
        "description": "Risk of myopathy and rhabdomyolysis increased.",
        "recommendation": "Avoid combination or limit simvastatin dose."
    },
    ("ssri", "tramadol"): {
        "severity": "dangerous",
        "description": "Risk of serotonin syndrome.",
        "recommendation": "Avoid combination."
    },
    ("ibuprofen", "aspirin"): {
        "severity": "warning",
        "description": "Ibuprofen may interfere with aspirin's cardioprotective effect.",
        "recommendation": "Take aspirin at least 30 minutes before ibuprofen."
    },
    ("ciprofloxacin", "antacids"): {
        "severity": "warning",
        "description": "Antacids reduce absorption of ciprofloxacin.",
        "recommendation": "Take ciprofloxacin 2 hours before or 6 hours after antacids."
    },
}

async def check_openfda(drug1: str, drug2: str) -> Dict[str, Any]:
    """Check drug interactions using OpenFDA API"""
    try:
        url = f"{OPENFDA_BASE_URL}/event.json"
        params = {
            "search": f'patient.drug.medicinalproduct:"{drug1}" AND patient.drug.medicinalproduct:"{drug2}"',
            "limit": 1
        }
        response = requests.get(url, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('meta', {}).get('results', {}).get('total', 0) > 0:
                return {
                    "severity": "warning",
                    "description": f"Adverse events reported for {drug1} and {drug2} combination.",
                    "recommendation": "Consult your doctor before taking these together.",
                    "source": "OpenFDA"
                }
    except Exception as e:
        print(f"OpenFDA error: {e}")
    
    return None

async def check_interactions(drugs: List[str]) -> List[Dict[str, Any]]:
    """Check all drug interactions"""
    interactions = []
    drugs_lower = [d.lower() for d in drugs]
    
    # Check all pairs
    for i in range(len(drugs_lower)):
        for j in range(i + 1, len(drugs_lower)):
            drug1 = drugs_lower[i]
            drug2 = drugs_lower[j]
            
            interaction = None
            
            # Check local database first
            key1 = (drug1, drug2)
            key2 = (drug2, drug1)
            
            if key1 in KNOWN_INTERACTIONS:
                interaction = KNOWN_INTERACTIONS[key1].copy()
                interaction['drug1'] = drugs[i]
                interaction['drug2'] = drugs[j]
                interaction['source'] = 'Local Database'
            elif key2 in KNOWN_INTERACTIONS:
                interaction = KNOWN_INTERACTIONS[key2].copy()
                interaction['drug1'] = drugs[i]
                interaction['drug2'] = drugs[j]
                interaction['source'] = 'Local Database'
            else:
                # Check OpenFDA
                fda_result = await check_openfda(drug1, drug2)
                if fda_result:
                    interaction = fda_result
                    interaction['drug1'] = drugs[i]
                    interaction['drug2'] = drugs[j]
                else:
                    # No interaction found
                    interaction = {
                        "drug1": drugs[i],
                        "drug2": drugs[j],
                        "severity": "safe",
                        "description": f"No known interactions found between {drugs[i]} and {drugs[j]}.",
                        "recommendation": "Generally safe to use together, but consult your doctor.",
                        "source": "MediSure Database"
                    }
            
            interactions.append(interaction)
    
    return interactions