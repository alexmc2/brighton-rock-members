-- Insert initial houses
INSERT INTO public.houses (name) VALUES
  ('House A'),
  ('House B'),
  ('House C'),
  ('House D'),
  ('House E')
ON CONFLICT (name) DO NOTHING; 