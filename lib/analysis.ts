import { createClient } from "@/lib/supabase/server"
import { triggerAnalysisWorkflow } from "@/lib/n8n"

export async function createAnalysis(
    projectId: string,
    fileUrl: string,
    selectedCodes: string[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    // Get or create project version
    const { data: existingVersions } = await supabase
        .from("project_versions")
        .select("version_number")
        .eq("project_id", projectId)
        .order("version_number", { ascending: false })
        .limit(1)

    const nextVersion = existingVersions && existingVersions.length > 0
        ? existingVersions[0].version_number + 1
        : 1

    // Create new version
    const { data: version, error: versionError } = await supabase
        .from("project_versions")
        .insert({
            project_id: projectId,
            version_number: nextVersion
        })
        .select()
        .single()

    if (versionError) throw versionError

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
        .from("analyses")
        .insert({
            version_id: version.id,
            status: "processing",
            pdf_url: fileUrl
        })
        .select()
        .single()

    if (analysisError) throw analysisError

    // Trigger n8n workflow
    try {
        await triggerAnalysisWorkflow(analysis.id, fileUrl, selectedCodes)
    } catch (error) {
        // Update analysis status to failed if webhook trigger fails
        await supabase
            .from("analyses")
            .update({ status: "failed" })
            .eq("id", analysis.id)

        throw error
    }

    return analysis
}
