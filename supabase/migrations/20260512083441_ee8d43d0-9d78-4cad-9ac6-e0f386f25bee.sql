
-- Roles
create type public.app_role as enum ('admin', 'doctor', 'patient');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Doctors
create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  specialization text not null,
  experience_years int not null default 0,
  location text not null default '',
  fee numeric not null default 0,
  bio text default '',
  image_url text,
  created_at timestamptz not null default now()
);
alter table public.doctors enable row level security;

-- Appointments
create type public.appointment_status as enum ('pending','accepted','rejected','completed');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  appointment_date date not null,
  appointment_time time not null,
  problem text not null default '',
  status appointment_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.appointments enable row level security;

-- Profiles policies
create policy "profiles_select_own_or_admin" on public.profiles for select
using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "profiles_insert_self" on public.profiles for insert
with check (auth.uid() = id);
create policy "profiles_update_own_or_admin" on public.profiles for update
using (auth.uid() = id or public.has_role(auth.uid(),'admin'));

-- user_roles policies
create policy "roles_select_self_or_admin" on public.user_roles for select
using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "roles_admin_manage" on public.user_roles for all
using (public.has_role(auth.uid(),'admin'))
with check (public.has_role(auth.uid(),'admin'));

-- Doctors policies
create policy "doctors_public_read" on public.doctors for select using (true);
create policy "doctors_admin_manage" on public.doctors for all
using (public.has_role(auth.uid(),'admin'))
with check (public.has_role(auth.uid(),'admin'));
create policy "doctors_self_update" on public.doctors for update
using (auth.uid() = user_id);

-- Appointments policies
create policy "appt_select_visibility" on public.appointments for select using (
  auth.uid() = patient_id
  or exists (select 1 from public.doctors d where d.id = appointments.doctor_id and d.user_id = auth.uid())
  or public.has_role(auth.uid(),'admin')
);
create policy "appt_insert_patient" on public.appointments for insert
with check (auth.uid() = patient_id);
create policy "appt_update_doctor_or_admin" on public.appointments for update using (
  exists (select 1 from public.doctors d where d.id = appointments.doctor_id and d.user_id = auth.uid())
  or public.has_role(auth.uid(),'admin')
);
create policy "appt_delete_admin" on public.appointments for delete
using (public.has_role(auth.uid(),'admin'));

-- New user trigger: create profile + patient role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'phone',''));
  insert into public.user_roles (user_id, role) values (new.id, 'patient');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
