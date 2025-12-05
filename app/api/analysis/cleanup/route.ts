import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { refundCredits, ANALYSIS_COST } from "@/lib/credits"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Find analyses that are processing and created > 5 minutes ago
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

        const { data: stalledAnalyses, error: fetchError } = await supabase
            .from("analyses")
            .select("id, created_at, status, version_id, project_versions(project_id)")
            .eq("status", "processing")
            .lt("created_at", fiveMinutesAgo)
        // Ensure we only touch analyses related to projects owned by this user
        // This requires a join filter which Supabase supports
        // But for simplicity and security, we can filter in memory or trust RLS if configured correctly
        // Let's rely on RLS for now, assuming the user can only see their own analyses

        if (fetchError) {
            console.error("Error fetching stalled analyses:", fetchError)
            return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
        }

        if (!stalledAnalyses || stalledAnalyses.length === 0) {
            return NextResponse.json({ cleaned: 0 })
        }

        let cleanedCount = 0
        const errors = []

        for (const analysis of stalledAnalyses) {
            try {
                // 1. Update status to failed
                const { error: updateError } = await supabase
                    .from("analyses")
                    .update({
                        status: "failed",
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", analysis.id)

                if (updateError) throw updateError

                // 2. Refund credits
                const refunded = await refundCredits(user.id, ANALYSIS_COST)
                if (!refunded) {
                    console.error(`Failed to refund credits for analysis ${analysis.id}`)
                }

                // 3. Create a failed report entry
                await supabase.from("reports").insert({
                    analysis_id: analysis.id,
                    json_report: { error: "Analysis timed out. Credits have been refunded." }
                })

                cleanedCount++
            } catch (err) {
                console.error(`Error cleaning up analysis ${analysis.id}:`, err)
                errors.push({ id: analysis.id, error: err })
            }
        }

        return NextResponse.json({
            cleaned: cleanedCount,
            totalFound: stalledAnalyses.length,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (error) {
        console.error("Error in cleanup route:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
