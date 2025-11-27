import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { analysisId, status, result } = body

        if (!analysisId || !status) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Use service role key to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Update analysis status
        const { error } = await supabase
            .from("analyses")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", analysisId)

        if (error) {
            console.error("Error updating analysis:", error)
            return NextResponse.json(
                { error: "Failed to update analysis" },
                { status: 500 }
            )
        }

        // If completed, save the report
        if (status === "completed" && result) {
            const { error: reportError } = await supabase.from("reports").insert({
                analysis_id: analysisId,
                json_report: result,
            })

            if (reportError) {
                console.error("Error saving report:", reportError)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
