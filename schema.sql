-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Charities Table
CREATE TABLE IF NOT EXISTS public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'public' CHECK (role IN ('admin', 'subscriber', 'public')),
    stripe_customer_id TEXT UNIQUE,
    selected_charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    charity_contribution_percentage NUMERIC DEFAULT 10 CHECK (charity_contribution_percentage >= 10 AND charity_contribution_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
    plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
    renewal_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Scores Table
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Draws Table
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
    prize_pool NUMERIC DEFAULT 0,
    draw_type TEXT CHECK (draw_type IN ('random', 'algorithmic')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Winnings Table
CREATE TABLE IF NOT EXISTS public.winnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    match_type TEXT NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
    amount NUMERIC NOT NULL,
    proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'paid', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Rolling 5 scores trigger logic
CREATE OR REPLACE FUNCTION maintain_latest_five_scores()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.scores
    WHERE id IN (
        SELECT id FROM public.scores
        WHERE user_id = NEW.user_id
        ORDER BY date DESC
        OFFSET 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_maintain_latest_five_scores ON public.scores;
CREATE TRIGGER tr_maintain_latest_five_scores
AFTER INSERT ON public.scores
FOR EACH ROW
EXECUTE FUNCTION maintain_latest_five_scores();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'public');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winnings ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Charities are viewable by everyone." ON public.charities FOR SELECT USING (true);

CREATE POLICY "Users can view own subscriptions." ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scores." ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores." ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Draws are viewable by everyone." ON public.draws FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view own winnings." ON public.winnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own winning proof." ON public.winnings FOR UPDATE USING (auth.uid() = user_id);
