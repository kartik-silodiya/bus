-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 2000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buses table
CREATE TABLE public.buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  fare DECIMAL(10, 2) NOT NULL,
  seats_available INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Success', 'Failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for buses (public read access)
CREATE POLICY "Anyone can view buses"
  ON public.buses FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, wallet_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    2000.00
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample buses
INSERT INTO public.buses (bus_id, name, from_city, to_city, fare, seats_available) VALUES
('BUS001', 'Express Travels', 'Delhi', 'Lucknow', 500, 40),
('BUS002', 'Rapid Transit', 'Mumbai', 'Pune', 300, 35),
('BUS003', 'Metro Connect', 'Bangalore', 'Chennai', 700, 42),
('BUS004', 'City Express', 'Delhi', 'Jaipur', 450, 38),
('BUS005', 'Highway King', 'Kolkata', 'Patna', 600, 40),
('BUS006', 'Royal Rides', 'Hyderabad', 'Vijayawada', 400, 36),
('BUS007', 'Speed Shuttle', 'Ahmedabad', 'Surat', 250, 32),
('BUS008', 'Comfort Plus', 'Delhi', 'Chandigarh', 350, 40),
('BUS009', 'Premium Express', 'Mumbai', 'Goa', 900, 28),
('BUS010', 'Budget Travels', 'Chennai', 'Madurai', 550, 45);