import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        console.log('Webhook received request')
        const body = await request.json()
        console.log('Request body:', { analysisId: body.analysisId, status: body.status, hasResult: !!body.result })

        const { analysisId, status, result } = body

        if (!analysisId || !status) {
            console.error('Missing required fields:', { analysisId, status })
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Check environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing Supabase environment variables:', {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            })
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            )
        }

        // Use service role key to bypass RLS
        console.log('Creating Supabase client with service role')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Update analysis status
        console.log('Updating analysis status:', { analysisId, status })

        // Prepare update data
        const updateData: any = {
            status,
            updated_at: new Date().toISOString(),
        }

        // If completed, extract summary data from result
        if (status === "completed" && result) {
            const score = result.overall_assessment?.compliance_score || 0
            const allIssues = [...(result.violations || []), ...(result.warnings || [])]
            const violationsCount = allIssues.length

            updateData.score = score
            updateData.violations = violationsCount

            console.log('Extracted summary data:', { score, violationsCount })
        }

        const { error } = await supabase
            .from("analyses")
            .update(updateData)
            .eq("id", analysisId)

        if (error) {
            console.error("Error updating analysis:", error)
            return NextResponse.json(
                { error: "Failed to update analysis", details: error },
                { status: 500 }
            )
        }
        console.log('Analysis status updated successfully')

        // Refund credits if analysis failed
        if (status === "failed") {
            console.log('Analysis failed, refunding credits')
            try {
                // Get the analysis to find the user
                const { data: analysisData } = await supabase
                    .from("analyses")
                    .select("project_versions(projects(user_id))")
                    .eq("id", analysisId)
                    .single()

                const analysis = analysisData as any

                if (analysis?.project_versions?.projects?.user_id) {
                    const userId = analysis.project_versions.projects.user_id

                    // Refund 25 credits
                    const { data: currentCredits } = await supabase
                        .from("user_credits")
                        .select("credits")
                        .eq("user_id", userId)

                    if (currentCredits) {
                        await supabase
                            .from("user_credits")
                            .update({
                                credits: currentCredits.credits + 25,
                                updated_at: new Date().toISOString()
                            })
                            .eq("user_id", userId)

                        console.log('Credits refunded successfully')
                    }
                }
            } catch (refundError) {
                console.error('Error refunding credits:', refundError)
                // Don't fail the webhook if refund fails
            }
        }


        // If completed, save the report
        if (status === "completed" && result) {
            console.log('Saving report to database')
            const { error: reportError } = await supabase.from("reports").insert({
                analysis_id: analysisId,
                json_report: result,
            })

            if (reportError) {
                console.error("Error saving report:", reportError)
                // Don't fail the request if report save fails
            } else {
                console.log('Report saved successfully')
            }
        }

        console.log('Webhook completed successfully')
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
