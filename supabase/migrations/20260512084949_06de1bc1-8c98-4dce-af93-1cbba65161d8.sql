
-- Seed sample doctors with images
INSERT INTO public.doctors (name, specialization, experience_years, location, fee, bio, image_url) VALUES
('Dr. Ayesha Khan', 'Cardiology', 12, 'Lahore', 150, 'Senior cardiologist specializing in preventive heart care and echocardiography.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80'),
('Dr. Bilal Ahmed', 'Dermatology', 8, 'Karachi', 90, 'Expert in clinical and cosmetic dermatology, acne and laser treatments.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80'),
('Dr. Sara Malik', 'Pediatrics', 10, 'Islamabad', 80, 'Pediatrician dedicated to child wellness, vaccinations and growth monitoring.', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80'),
('Dr. Imran Yousaf', 'Neurology', 15, 'Lahore', 200, 'Neurologist with expertise in stroke, epilepsy and headache disorders.', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&q=80'),
('Dr. Hina Raza', 'Orthopedics', 9, 'Faisalabad', 120, 'Orthopedic surgeon focusing on joint replacement and sports injuries.', 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&q=80'),
('Dr. Omar Sheikh', 'General Physician', 6, 'Online', 50, 'Family medicine practitioner offering online consultations for everyday health.', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80')
ON CONFLICT DO NOTHING;

-- Replace trigger function: first ever signup becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  has_admin boolean;
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'phone',''));

  select exists(select 1 from public.user_roles where role = 'admin') into has_admin;

  if has_admin then
    insert into public.user_roles (user_id, role) values (new.id, 'patient');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
    insert into public.user_roles (user_id, role) values (new.id, 'patient');
  end if;

  return new;
end;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
