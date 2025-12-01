-- Add DELETE policy for analyses table
CREATE POLICY "Users can delete analyses of their projects" ON public.analyses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.project_versions pv
            JOIN public.projects p ON p.id = pv.project_id
            WHERE pv.id = analyses.version_id
            AND p.user_id = auth.uid()
        )
    );
