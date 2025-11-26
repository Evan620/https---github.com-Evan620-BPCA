import { createClient } from "@/lib/supabase/server"

export async function getN8nWebhookUrl() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from("settings")
        .select("n8n_webhook_url")
        .eq("user_id", user.id)
        .single()

    if (error || !data) return null

    return data.n8n_webhook_url
}
