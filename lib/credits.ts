import { createClient } from "@/lib/supabase/server"

export const ANALYSIS_COST = 25

export async function getUserCredits(userId: string): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", userId)
        .single()

    if (error || !data) {
        console.error("Error fetching user credits:", error)
        return 0
    }

    return data.credits
}

export async function hasEnoughCredits(userId: string, required: number = ANALYSIS_COST): Promise<boolean> {
    const credits = await getUserCredits(userId)
    return credits >= required
}

export async function deductCredits(userId: string, amount: number = ANALYSIS_COST): Promise<boolean> {
    const supabase = await createClient()

    // First check if user has enough credits
    const currentCredits = await getUserCredits(userId)
    if (currentCredits < amount) {
        return false
    }

    const { error } = await supabase
        .from("user_credits")
        .update({
            credits: currentCredits - amount,
            updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)

    if (error) {
        console.error("Error deducting credits:", error)
        return false
    }

    return true
}

export async function refundCredits(userId: string, amount: number = ANALYSIS_COST): Promise<boolean> {
    const supabase = await createClient()

    const currentCredits = await getUserCredits(userId)

    const { error } = await supabase
        .from("user_credits")
        .update({
            credits: currentCredits + amount,
            updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)

    if (error) {
        console.error("Error refunding credits:", error)
        return false
    }

    return true
}

export async function addCredits(userId: string, amount: number): Promise<boolean> {
    const supabase = await createClient()

    const currentCredits = await getUserCredits(userId)

    const { error } = await supabase
        .from("user_credits")
        .update({
            credits: currentCredits + amount,
            updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)

    if (error) {
        console.error("Error adding credits:", error)
        return false
    }

    return true
}
