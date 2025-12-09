-- Add User to Supabase Custom Users Table
-- Run this in Supabase SQL Editor

-- Insert a test user
INSERT INTO public.users (name, email, password)
VALUES ('Admin User', 'rehman@gmail.com', 'your_password_here');

-- Or insert multiple users
INSERT INTO public.users (name, email, password)
VALUES
  ('Admin', 'admin@example.com', 'admin123'),
  ('Test User', 'test@example.com', 'test123'),
  ('Rehman', 'rehman@gmail.com', '12345678');

-- Enable Row Level Security (RLS) if needed
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading users
CREATE POLICY "Allow read access to users"
ON public.users
FOR SELECT
USING (true);

-- View all users
SELECT * FROM public.users;
