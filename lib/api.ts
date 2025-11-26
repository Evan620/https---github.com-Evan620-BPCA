import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database"

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type Folder = Database["public"]["Tables"]["folders"]["Row"]

export async function getProjects() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false })

    if (error) throw error
    return data
}

export async function getFolders() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("name")

    if (error) throw error
    return data
}

export async function createProject(name: string, description: string, folderId?: string) {
    const supabase = createClient()
    const user = (await supabase.auth.getUser()).data.user

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
        .from("projects")
        .insert({
            name,
            description,
            folder_id: folderId,
            user_id: user.id,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export type Analysis = Database["public"]["Tables"]["analyses"]["Row"] & {
    version_number: number
    score?: number
    violations?: number
}

export async function getProject(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()

    if (error) throw error
    return data
}

export async function getProjectAnalyses(projectId: string) {
    const supabase = createClient()

    // First get versions
    const { data: versions, error: versionsError } = await supabase
        .from("project_versions")
        .select("id, version_number, created_at")
        .eq("project_id", projectId)
        .order("version_number", { ascending: false })

    if (versionsError) throw versionsError

    if (!versions || versions.length === 0) return []

    // Then get analyses for these versions
    const versionIds = versions.map(v => v.id)
    const { data: analyses, error: analysesError } = await supabase
        .from("analyses")
        .select("*")
        .in("version_id", versionIds)
        .order("created_at", { ascending: false })

    if (analysesError) throw analysesError

    // Merge data
    return analyses.map(analysis => {
        const version = versions.find(v => v.id === analysis.version_id)
        return {
            ...analysis,
            version_number: version?.version_number || 0,
            // Mock score/violations for now until we have report parsing
            score: analysis.status === 'completed' ? 85 : undefined,
            violations: analysis.status === 'completed' ? 3 : undefined,
        }
    })
}

export async function updateProject(projectId: string, name: string, description?: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from("projects")
        .update({
            name,
            description,
            updated_at: new Date().toISOString()
        })
        .eq("id", projectId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteProject(projectId: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)

    if (error) throw error
}
