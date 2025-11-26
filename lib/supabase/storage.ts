import { createClient } from "@/lib/supabase/client"

export async function uploadBuildingPlan(file: File, projectId: string, version: number) {
    const supabase = createClient()
    const user = (await supabase.auth.getUser()).data.user

    if (!user) throw new Error("User not authenticated")

    const filePath = `${user.id}/${projectId}/v${version}/${file.name}`

    const { data, error } = await supabase.storage
        .from("building-plans")
        .upload(filePath, file, {
            upsert: true,
        })

    if (error) {
        console.error("Error uploading file:", error)
        throw error
    }

    // Get the public URL (though it's a private bucket, we might need a signed URL later)
    // For now, we'll return the path which is enough to generate signed URLs
    return { path: data.path }
}

export async function getBuildingPlanUrl(path: string) {
    const supabase = createClient()

    const { data, error } = await supabase.storage
        .from("building-plans")
        .createSignedUrl(path, 3600) // 1 hour expiry

    if (error) {
        console.error("Error creating signed URL:", error)
        throw error
    }

    return data.signedUrl
}
