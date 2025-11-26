-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_versions table
CREATE TABLE IF NOT EXISTS public.project_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, version_number)
);

-- Create analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES public.project_versions(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('waiting_for_selection', 'processing', 'completed', 'failed')),
    pdf_url TEXT,
    page_number INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preset_codes table
CREATE TABLE IF NOT EXISTS public.preset_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analysis_codes table (junction table)
CREATE TABLE IF NOT EXISTS public.analysis_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    preset_code_id UUID REFERENCES public.preset_codes(id) ON DELETE CASCADE,
    custom_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    json_report JSONB,
    annotated_pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preset_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folders
CREATE POLICY "Users can view their own folders" ON public.folders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" ON public.folders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" ON public.folders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" ON public.folders
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for project_versions
CREATE POLICY "Users can view versions of their projects" ON public.project_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_versions.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create versions for their projects" ON public.project_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_versions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- RLS Policies for analyses
CREATE POLICY "Users can view analyses of their projects" ON public.analyses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.project_versions pv
            JOIN public.projects p ON p.id = pv.project_id
            WHERE pv.id = analyses.version_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create analyses for their projects" ON public.analyses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.project_versions pv
            JOIN public.projects p ON p.id = pv.project_id
            WHERE pv.id = analyses.version_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update analyses of their projects" ON public.analyses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.project_versions pv
            JOIN public.projects p ON p.id = pv.project_id
            WHERE pv.id = analyses.version_id
            AND p.user_id = auth.uid()
        )
    );

-- RLS Policies for preset_codes (public read)
CREATE POLICY "Anyone can view preset codes" ON public.preset_codes
    FOR SELECT USING (true);

-- RLS Policies for analysis_codes
CREATE POLICY "Users can view codes for their analyses" ON public.analysis_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            JOIN public.project_versions pv ON pv.id = a.version_id
            JOIN public.projects p ON p.id = pv.project_id
            WHERE a.id = analysis_codes.analysis_id
            AND p.user_id = auth.uid()
        )
    );

-- RLS Policies for reports
CREATE POLICY "Users can view reports of their analyses" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            JOIN public.project_versions pv ON pv.id = a.version_id
            JOIN public.projects p ON p.id = pv.project_id
            WHERE a.id = reports.analysis_id
            AND p.user_id = auth.uid()
        )
    );

-- RLS Policies for feedback
CREATE POLICY "Users can view their own feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_folder_id ON public.projects(folder_id);
CREATE INDEX idx_project_versions_project_id ON public.project_versions(project_id);
CREATE INDEX idx_analyses_version_id ON public.analyses(version_id);
CREATE INDEX idx_analyses_status ON public.analyses(status);
CREATE INDEX idx_analysis_codes_analysis_id ON public.analysis_codes(analysis_id);
CREATE INDEX idx_reports_analysis_id ON public.reports(analysis_id);
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
