/*
  # Professional Veterinary Management System Schema

  ## Overview
  Complete database schema for managing large animal (cattle) veterinary practice.
  Includes animals, visits, medications, financial management, and authentication.

  ## Tables Created
  1. `profiles` - User profiles (vets, staff)
  2. `clients` - Farm/owner information
  3. `animals` - Individual cattle records
  4. `visits` - Visit history with detailed exams
  5. `visit_medications` - Medications used per visit
  6. `medications` - Stock management
  7. `medication_usage_history` - Track all medication usage
  8. `vaccinations` - Vaccination records
  9. `treatments` - Treatment protocols and history
  10. `income_records` - Financial tracking
  11. `payment_transactions` - Payment details
  12. `expenses` - Expense tracking
  13. `vital_signs` - Examination vital signs

  ## Security
  - RLS enabled on all tables
  - Policies ensure users only access their own data
  - Timestamps for audit trails
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  clinic_name text DEFAULT '',
  phone text DEFAULT '',
  license_number text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  address text DEFAULT '',
  city text DEFAULT '',
  email text DEFAULT '',
  farm_name text DEFAULT '',
  farm_size_hectares numeric DEFAULT 0,
  primary_breeds text DEFAULT '',
  total_animals integer DEFAULT 0,
  total_debt numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_clients_user_id ON clients(user_id);

-- Create animals table
CREATE TABLE IF NOT EXISTS animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  ear_tag_number text NOT NULL,
  name text DEFAULT '',
  breed text NOT NULL,
  birth_date date,
  sex text NOT NULL,
  color_marking text DEFAULT '',
  weight_kg numeric DEFAULT 0,
  health_status text DEFAULT 'Healthy',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, client_id, ear_tag_number)
);

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own animals"
  ON animals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own animals"
  ON animals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own animals"
  ON animals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own animals"
  ON animals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_animals_user_id ON animals(user_id);
CREATE INDEX idx_animals_client_id ON animals(client_id);
CREATE INDEX idx_animals_ear_tag ON animals(user_id, ear_tag_number);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  active_ingredient text DEFAULT '',
  concentration text DEFAULT '',
  manufacturer text DEFAULT '',
  unit_type text NOT NULL,
  current_stock numeric NOT NULL DEFAULT 0,
  reorder_level numeric NOT NULL DEFAULT 10,
  max_stock numeric NOT NULL DEFAULT 100,
  unit_price numeric NOT NULL DEFAULT 0,
  supplier text DEFAULT '',
  expiry_date date,
  batch_number text DEFAULT '',
  therapeutic_category text DEFAULT '',
  dosage_info text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name, batch_number)
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_name ON medications(user_id, name);

-- Create vital_signs table
CREATE TABLE IF NOT EXISTS vital_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  animal_id uuid NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  recorded_date timestamptz DEFAULT now(),
  temperature_celsius numeric,
  heart_rate_bpm integer,
  respiratory_rate_min integer,
  rumen_contractions integer,
  mucous_membranes text,
  capillary_refill_seconds numeric,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vital signs"
  ON vital_signs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own vital signs"
  ON vital_signs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_vital_signs_animal_id ON vital_signs(animal_id);
CREATE INDEX idx_vital_signs_user_id ON vital_signs(user_id);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  animal_id uuid NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  visit_date timestamptz DEFAULT now(),
  visit_reason text NOT NULL,
  clinical_complaint text NOT NULL,
  examination_findings text NOT NULL,
  diagnosis text NOT NULL,
  treatment_plan text DEFAULT '',
  prognosis text DEFAULT '',
  follow_up_date date,
  follow_up_notes text DEFAULT '',
  total_cost numeric NOT NULL DEFAULT 0,
  service_charge numeric DEFAULT 0,
  medication_cost numeric DEFAULT 0,
  status text DEFAULT 'Completed',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own visits"
  ON visits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own visits"
  ON visits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own visits"
  ON visits FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_visits_user_id ON visits(user_id);
CREATE INDEX idx_visits_client_id ON visits(client_id);
CREATE INDEX idx_visits_animal_id ON visits(animal_id);
CREATE INDEX idx_visits_date ON visits(visit_date);

-- Create visit_medications
CREATE TABLE IF NOT EXISTS visit_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visit_id uuid NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE RESTRICT,
  quantity_used numeric NOT NULL,
  unit_type text NOT NULL,
  dosage_prescribed text NOT NULL,
  frequency text NOT NULL,
  route_of_administration text NOT NULL,
  administration_notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visit_medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own visit medications"
  ON visit_medications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own visit medications"
  ON visit_medications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_visit_medications_visit_id ON visit_medications(visit_id);
CREATE INDEX idx_visit_medications_medication_id ON visit_medications(medication_id);
CREATE INDEX idx_visit_medications_user_id ON visit_medications(user_id);

-- Create medication_usage_history
CREATE TABLE IF NOT EXISTS medication_usage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  quantity_used numeric NOT NULL,
  unit_type text NOT NULL,
  usage_type text NOT NULL,
  related_visit_id uuid REFERENCES visits(id) ON DELETE SET NULL,
  related_animal_id uuid REFERENCES animals(id) ON DELETE SET NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medication_usage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medication usage"
  ON medication_usage_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own medication usage"
  ON medication_usage_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_med_usage_medication_id ON medication_usage_history(medication_id);
CREATE INDEX idx_med_usage_user_id ON medication_usage_history(user_id);
CREATE INDEX idx_med_usage_date ON medication_usage_history(created_at);

-- Create vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  animal_id uuid NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  vaccine_batch text DEFAULT '',
  administration_date date NOT NULL,
  next_due_date date,
  route_of_administration text NOT NULL,
  veterinarian_name text DEFAULT '',
  certificate_number text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vaccinations"
  ON vaccinations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own vaccinations"
  ON vaccinations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_vaccinations_animal_id ON vaccinations(animal_id);
CREATE INDEX idx_vaccinations_user_id ON vaccinations(user_id);

-- Create income_records table
CREATE TABLE IF NOT EXISTS income_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visit_id uuid REFERENCES visits(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_description text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'TRY',
  income_date date NOT NULL,
  payment_status text DEFAULT 'Pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income"
  ON income_records FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own income"
  ON income_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own income"
  ON income_records FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_income_user_id ON income_records(user_id);
CREATE INDEX idx_income_client_id ON income_records(client_id);
CREATE INDEX idx_income_date ON income_records(income_date);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  income_record_id uuid NOT NULL REFERENCES income_records(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount_paid numeric NOT NULL,
  payment_method text NOT NULL,
  payment_date date NOT NULL,
  check_number text DEFAULT '',
  check_due_date date,
  bank_account text DEFAULT '',
  transaction_reference text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payments"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_payments_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payments_client_id ON payment_transactions(client_id);
CREATE INDEX idx_payments_income_id ON payment_transactions(income_record_id);
CREATE INDEX idx_payments_date ON payment_transactions(payment_date);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'TRY',
  expense_date date NOT NULL,
  supplier text DEFAULT '',
  invoice_number text DEFAULT '',
  payment_method text DEFAULT 'Cash',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category ON expenses(user_id, category);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
