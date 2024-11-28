-- Create houses table
CREATE TABLE public.houses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add house_id foreign key to maintenance_requests
ALTER TABLE public.maintenance_requests 
ADD COLUMN house_id UUID REFERENCES public.houses(id);

-- Create trigger to update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.houses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at(); 