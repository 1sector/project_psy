/*
  # Initial Schema for Psychology Platform

  1. New Tables
    - `profiles` - User profile information
    - `tests` - Psychological tests
    - `test_results` - Results from completed tests
    - `clients` - Client records for psychologists
    - `sessions` - Therapy session records
    - `payments` - Payment records
    - `subscriptions` - Subscription plans

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text,
  role text NOT NULL CHECK (role IN ('psychologist', 'client')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  is_public boolean DEFAULT false,
  price numeric(10, 2)
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psychologists can create tests"
  ON tests
  FOR INSERT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'psychologist');

CREATE POLICY "Psychologists can update own tests"
  ON tests
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'psychologist');

CREATE POLICY "Psychologists can delete own tests"
  ON tests
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'psychologist');

CREATE POLICY "Users can read public tests"
  ON tests
  FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests(id),
  user_id uuid REFERENCES profiles(id),
  score integer NOT NULL,
  answers jsonb NOT NULL,
  analysis text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create test results"
  ON test_results
  FOR INSERT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read own test results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR 
        (SELECT created_by FROM tests WHERE id = test_id) = auth.uid());

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid REFERENCES profiles(id),
  user_id uuid REFERENCES profiles(id),
  name text NOT NULL,
  email text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psychologists can manage own clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (psychologist_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'psychologist');

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  date date NOT NULL,
  notes text,
  status text CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psychologists can manage sessions for their clients"
  ON sessions
  FOR ALL
  TO authenticated
  USING ((SELECT psychologist_id FROM clients WHERE id = client_id) = auth.uid());

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  amount numeric(10, 2) NOT NULL,
  status text CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create payments"
  ON payments
  FOR INSERT
  TO authenticated
  USING (user_id = auth.uid());

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  plan text CHECK (plan IN ('basic', 'premium', 'professional')),
  status text CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();