export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'admin';
  avatar_url?: string;
  phone?: string;
  blood_group?: string;
  allergies?: string[];
}

export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  composition: string;
  manufacturer?: string;
  category?: string;
  strength?: string;
  form?: string;
  price?: number;
  description?: string;
  side_effects?: string;
}

export interface Prescription {
  id: string;
  user_id: string;
  file_url: string;
  file_type: string;
  extracted_data?: ExtractedPrescription;
  status: 'pending' | 'processed' | 'failed';
  created_at: string;
}

export interface ExtractedPrescription {
  medicines: ExtractedMedicine[];
  doctor_name?: string;
  date?: string;
}

export interface ExtractedMedicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  medicine_name: string;
  dosage?: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export interface DrugInteraction {
  drug_1: string;
  drug_2: string;
  severity: 'safe' | 'warning' | 'dangerous';
  description: string;
  recommendation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}