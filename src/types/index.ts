export interface Profile {
  id: string;
  email: string;
  full_name: string;
  clinic_name: string;
  phone: string;
  license_number: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  email: string;
  farm_name: string;
  farm_size_hectares: number;
  primary_breeds: string;
  total_animals: number;
  total_debt: number;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: string;
  user_id: string;
  client_id: string;
  ear_tag_number: string;
  name: string;
  breed: string;
  birth_date: string;
  sex: "Male" | "Female";
  color_marking: string;
  weight_kg: number;
  health_status: "Healthy" | "Under Treatment" | "Quarantine";
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface VitalSigns {
  id: string;
  user_id: string;
  animal_id: string;
  recorded_date: string;
  temperature_celsius: number | null;
  heart_rate_bpm: number | null;
  respiratory_rate_min: number | null;
  rumen_contractions: number | null;
  mucous_membranes: string | null;
  capillary_refill_seconds: number | null;
  notes: string;
  created_at: string;
}

export interface Visit {
  id: string;
  user_id: string;
  client_id: string;
  animal_id: string;
  visit_date: string;
  visit_reason: "Routine Check" | "Sick Visit" | "Follow-up" | "Vaccination";
  clinical_complaint: string;
  examination_findings: string;
  diagnosis: string;
  treatment_plan: string;
  prognosis: string;
  follow_up_date: string | null;
  follow_up_notes: string;
  total_cost: number;
  service_charge: number;
  medication_cost: number;
  status: "Completed" | "Pending" | "Follow-up Required";
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface VisitMedication {
  id: string;
  user_id: string;
  visit_id: string;
  medication_id: string;
  quantity_used: number;
  unit_type: string;
  dosage_prescribed: string;
  frequency: string;
  route_of_administration: "IV" | "IM" | "Oral" | "Topical" | "Subcutaneous";
  administration_notes: string;
  created_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  active_ingredient: string;
  concentration: string;
  manufacturer: string;
  unit_type: string;
  current_stock: number;
  reorder_level: number;
  max_stock: number;
  unit_price: number;
  supplier: string;
  expiry_date: string | null;
  batch_number: string;
  therapeutic_category: string;
  dosage_info: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationUsageHistory {
  id: string;
  user_id: string;
  medication_id: string;
  quantity_used: number;
  unit_type: string;
  usage_type: "Visit" | "Expired" | "Waste" | "Recount";
  related_visit_id: string | null;
  related_animal_id: string | null;
  notes: string;
  created_at: string;
}

export interface Vaccination {
  id: string;
  user_id: string;
  animal_id: string;
  vaccine_name: string;
  vaccine_batch: string;
  administration_date: string;
  next_due_date: string | null;
  route_of_administration: string;
  veterinarian_name: string;
  certificate_number: string;
  notes: string;
  created_at: string;
}

export interface IncomeRecord {
  id: string;
  user_id: string;
  visit_id: string | null;
  client_id: string;
  service_description: string;
  amount: number;
  currency: string;
  income_date: string;
  payment_status: "Paid" | "Pending" | "Partial";
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  income_record_id: string;
  client_id: string;
  amount_paid: number;
  payment_method: "Cash" | "Check" | "Bank Transfer" | "Credit Card";
  payment_date: string;
  check_number: string;
  check_due_date: string | null;
  bank_account: string;
  transaction_reference: string;
  notes: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  supplier: string;
  invoice_number: string;
  payment_method: string;
  notes: string;
  created_at: string;
}
