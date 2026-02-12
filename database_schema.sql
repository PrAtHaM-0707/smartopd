-- SmartOPD Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'RECEPTIONIST' CHECK (role IN ('SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  token_number INTEGER,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('walk-in', 'appointment')),
  appointment_time TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed')),
  sms BOOLEAN DEFAULT true,
  whatsapp BOOLEAN DEFAULT true,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Queue tokens table
CREATE TABLE IF NOT EXISTS queue_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  token_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  target TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert seed data
INSERT INTO departments (name, description) VALUES
  ('General Medicine', 'General healthcare services'),
  ('Cardiology', 'Heart and cardiovascular care'),
  ('Dermatology', 'Skin care and treatment')
ON CONFLICT (name) DO NOTHING;

INSERT INTO doctors (name, department_id, specialization) VALUES
  ('Dr. Sarah Johnson', (SELECT id FROM departments WHERE name = 'General Medicine'), 'General Practitioner'),
  ('Dr. Michael Chen', (SELECT id FROM departments WHERE name = 'Cardiology'), 'Cardiologist'),
  ('Dr. Emily Davis', (SELECT id FROM departments WHERE name = 'Dermatology'), 'Dermatologist')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read/update their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'DOCTOR', 'RECEPTIONIST')
    )
  );

-- Departments: Public read, authenticated write
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Authenticated insert departments" ON departments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update departments" ON departments FOR UPDATE USING (auth.role() = 'authenticated');

-- Doctors: Public read, authenticated write
CREATE POLICY "Public read doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Authenticated insert doctors" ON doctors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update doctors" ON doctors FOR UPDATE USING (auth.role() = 'authenticated');

-- Patients: Public insert (for registration), authenticated read/update
CREATE POLICY "Public insert patients" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read patients" ON patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update patients" ON patients FOR UPDATE USING (auth.role() = 'authenticated');

-- Queue tokens: Authenticated read/write
CREATE POLICY "Authenticated read queue_tokens" ON queue_tokens FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert queue_tokens" ON queue_tokens FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update queue_tokens" ON queue_tokens FOR UPDATE USING (auth.role() = 'authenticated');

-- Appointments: Authenticated read/write
CREATE POLICY "Authenticated read appointments" ON appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert appointments" ON appointments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update appointments" ON appointments FOR UPDATE USING (auth.role() = 'authenticated');

-- Audit logs: Authenticated read/write
CREATE POLICY "Authenticated read audit_logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'RECEPTIONIST');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();