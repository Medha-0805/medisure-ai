import pandas as pd
from supabase import create_client
from dotenv import load_dotenv
import os
import time

load_dotenv()

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

def load_medicines():
    print("Reading CSV...")
    df = pd.read_csv(r'C:\Users\jhame\Downloads\MedicineDataset\Medicine_Details.csv')
    
    print(f"Total medicines: {len(df)}")
    df = df.fillna('')
    df.columns = df.columns.str.strip()
    
    success = 0
    failed = 0
    batch_size = 50
    total_batches = len(df) // batch_size + 1
    
    for batch_num in range(total_batches):
        start = batch_num * batch_size
        end = start + batch_size
        batch = df.iloc[start:end]
        
        if len(batch) == 0:
            break
            
        records = []
        for _, row in batch.iterrows():
            try:
                excellent = int(row.get('Excellent Review %', 0))
            except:
                excellent = 0
            try:
                average = int(row.get('Average Review %', 0))
            except:
                average = 0
            try:
                poor = int(row.get('Poor Review %', 0))
            except:
                poor = 0

            record = {
                'name': str(row.get('Medicine Name', ''))[:255],
                'composition': str(row.get('Composition', ''))[:500],
                'uses': str(row.get('Uses', ''))[:500],
                'side_effects': str(row.get('Side_effects', ''))[:500],
                'manufacturer': str(row.get('Manufacturer', ''))[:255],
                'image_url': str(row.get('Image URL', ''))[:500],
                'excellent_review': excellent,
                'average_review': average,
                'poor_review': poor,
                'category': 'General',
                'is_verified': True
            }
            records.append(record)
        
        try:
            supabase.table('medicines').insert(records).execute()
            success += len(records)
            print(f"Batch {batch_num + 1}/{total_batches} — {success} inserted")
        except Exception as e:
            failed += len(records)
            print(f"Batch {batch_num + 1} failed: {e}")
        
        time.sleep(0.3)
    
    print(f"\nDone! Success: {success}, Failed: {failed}")

if __name__ == '__main__':
    load_medicines()