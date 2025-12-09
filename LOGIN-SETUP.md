# Login Setup Guide - Custom Users Table

## ✅ Login is Now Fixed!

Your login now uses your custom `users` table in Supabase instead of Supabase Authentication.

## How to Add Users

### Method 1: Using SQL Editor (Recommended)

1. Go to https://app.supabase.com
2. Select your project: `fkyefdebtvpjehuflrkt`
3. Click **SQL Editor** in the left sidebar
4. Copy and paste this SQL:

```sql
-- Add a user
INSERT INTO public.users (name, email, password)
VALUES ('Rehman', 'rehman@gmail.com', 'your_password');

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow reading users
CREATE POLICY "Allow read access to users"
ON public.users
FOR SELECT
USING (true);
```

5. Click **Run**

### Method 2: Using Table Editor

1. Go to https://app.supabase.com
2. Select your project: `fkyefdebtvpjehuflrkt`
3. Click **Table Editor** in left sidebar
4. Select **users** table
5. Click **Insert** → **Insert row**
6. Fill in:
   - **name**: Rehman
   - **email**: rehman@gmail.com
   - **password**: your_password
7. Click **Save**

## Enable Row Level Security (Important!)

Run this SQL to allow the app to read users:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to users"
ON public.users
FOR SELECT
USING (true);
```

## Test Login

1. Run your app: `npm run electron`
2. Enter:
   - **Email**: rehman@gmail.com
   - **Password**: (whatever you set)
3. Click **Sign In**

## Your Users Table Schema

```sql
create table public.users (
  id serial not null,
  name character varying(100) null,
  email character varying(100) null,
  password character varying(100) null,
  constraint users_pkey primary key (id)
);
```

## Example Users to Insert

```sql
INSERT INTO public.users (name, email, password)
VALUES
  ('Admin', 'admin@example.com', 'admin123'),
  ('Rehman', 'rehman@gmail.com', '12345678'),
  ('Test User', 'test@example.com', 'test123');
```

## Security Note

⚠️ **Important**: Passwords are stored in plain text in this example. For production, you should:
1. Hash passwords using bcrypt or similar
2. Use proper authentication
3. Add email verification
4. Implement proper session management

For now (development/testing), plain text works fine.

## How It Works

1. User enters email and password
2. App queries Supabase: `SELECT * FROM users WHERE email = ? AND password = ?`
3. If match found, user data is stored in localStorage
4. User is redirected to dashboard
5. Dashboard checks localStorage for user data

## Troubleshooting

### "Invalid login credentials"
- Check that user exists in Supabase users table
- Verify email and password are correct
- Make sure RLS policy is created

### "Error fetching data"
- Check RLS policy is enabled
- Verify policy allows SELECT
- Check Supabase URL and API key in `.env.local`

### Can't access users table
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- If rowsecurity is true, add the policy
CREATE POLICY "Allow read access to users"
ON public.users
FOR SELECT
USING (true);
```

## Quick SQL Commands

```sql
-- View all users
SELECT * FROM public.users;

-- Add a user
INSERT INTO public.users (name, email, password)
VALUES ('Your Name', 'your@email.com', 'yourpassword');

-- Delete a user
DELETE FROM public.users WHERE email = 'email@example.com';

-- Update password
UPDATE public.users
SET password = 'newpassword'
WHERE email = 'email@example.com';
```

## Ready to Go!

1. Add user to Supabase (use SQL above)
2. Enable RLS policy
3. Run app: `npm run electron`
4. Login with your credentials

You're all set! 🎉
