-- Fix RLS Policies for SmartOPD
-- Run this in Supabase SQL Editor AFTER running database_schema.sql

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Public insert patients" ON patients;
DROP POLICY IF EXISTS "Authenticated read patients" ON patients;
DROP POLICY IF EXISTS "Authenticated update patients" ON patients;

-- Recreate patient policies with proper syntax
CREATE POLICY "Public insert patients" ON patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated read patients" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update patients" ON patients
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Ensure queue_tokens policies are correct
DROP POLICY IF EXISTS "Authenticated read queue_tokens" ON queue_tokens;
DROP POLICY IF EXISTS "Authenticated insert queue_tokens" ON queue_tokens;
DROP POLICY IF EXISTS "Authenticated update queue_tokens" ON queue_tokens;

CREATE POLICY "Authenticated read queue_tokens" ON queue_tokens
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert queue_tokens" ON queue_tokens
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update queue_tokens" ON queue_tokens
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Ensure appointments policies are correct
DROP POLICY IF EXISTS "Authenticated read appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated insert appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated update appointments" ON appointments;

CREATE POLICY "Authenticated read appointments" ON appointments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert appointments" ON appointments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update appointments" ON appointments
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Ensure audit_logs policies are correct
DROP POLICY IF EXISTS "Authenticated read audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated insert audit_logs" ON audit_logs;

CREATE POLICY "Authenticated read audit_logs" ON audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');