"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitFeedback(rating: number, message: string, email: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("User not authenticated")
    }

    const { error } = await supabase
        .from("feedback")
        .insert({
            user_id: user.id,
            rating,
            message,
            email,
        })

    if (error) {
        console.error("Error submitting feedback:", error)
        throw new Error("Failed to submit feedback")
    }

    revalidatePath("/dashboard")
    return { success: true }
}
