-- ScreenQuest Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    total_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_url TEXT NOT NULL,
    points_reward INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submissions table
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    recording_path TEXT NOT NULL,
    recording_duration INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_campaign_id ON public.submissions(campaign_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_profiles_total_points ON public.profiles(total_points DESC);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-award points on approval
CREATE OR REPLACE FUNCTION public.handle_submission_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE public.profiles
        SET total_points = total_points + (
            SELECT points_reward FROM public.campaigns WHERE id = NEW.campaign_id
        ), updated_at = NOW()
        WHERE id = NEW.user_id;

        NEW.points_awarded := (SELECT points_reward FROM public.campaigns WHERE id = NEW.campaign_id);
        NEW.reviewed_at := NOW();
    END IF;
    IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        NEW.reviewed_at := NOW();
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_submission_status_change
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW EXECUTE FUNCTION public.handle_submission_approval();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = 'user');
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can view all campaigns" ON public.campaigns FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can create campaigns" ON public.campaigns FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update campaigns" ON public.campaigns FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete campaigns" ON public.campaigns FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Submissions policies
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all submissions" ON public.submissions FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create own submissions" ON public.submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update submissions" ON public.submissions FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage bucket for recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('recordings', 'recordings', false, 524288000, ARRAY['video/webm', 'video/mp4']);

-- Storage policies
CREATE POLICY "Users can upload recordings" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own recordings" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins can view all recordings" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'recordings' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete recordings" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'recordings' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
