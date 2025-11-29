-- Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set default credits for existing users
INSERT INTO public.user_credits (user_id, credits)
SELECT id, 100 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own credits
CREATE POLICY "Users can view own credits"
  ON public.user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can update credits
CREATE POLICY "Service role can update credits"
  ON public.user_credits
  FOR ALL
  USING (true);

-- Function to automatically create credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create credits on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
