-- Users table (extends auth.users)
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text,
  nickname text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies (Example: Users can view their own profile)
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to handle new user signup (Supabase Auth Hook)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'nickname', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile when signing up
-- Note: Requires permissions on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();