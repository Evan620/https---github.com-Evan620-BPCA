import { NextResponse } from "next/server"
import { createAnalysis } from "@/lib/analysis"
import { createClient } from "@/lib/supabase/server"
import { hasEnoughCredits, deductCredits, refundCredits, ANALYSIS_COST } from "@/lib/credits"

export async function POST(request: Request) {
    let user: any = null
    let creditsDeducted = false

    try {
        const { projectId, fileUrl, selectedCodes, description, pageNumbers } = await request.json()

        if (!projectId || !fileUrl || !selectedCodes) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Get current user
        const supabase = await createClient()
        const { data: authData, error: authError } = await supabase.auth.getUser()
        user = authData?.user

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Check if user has enough credits
        const hasCredits = await hasEnoughCredits(user.id)
        if (!hasCredits) {
            return NextResponse.json(
                {
                    error: "Insufficient credits",
                    message: `You need ${ANALYSIS_COST} credits to run an analysis. Please upgrade your plan.`,
                    required: ANALYSIS_COST
                },
                { status: 402 } // Payment Required
            )
        }

        // Deduct credits before creating analysis
        const deducted = await deductCredits(user.id)
        if (!deducted) {
            return NextResponse.json(
                { error: "Failed to deduct credits" },
                { status: 500 }
            )
        }
        creditsDeducted = true

        const analysis = await createAnalysis(projectId, fileUrl, selectedCodes, description, pageNumbers)

        return NextResponse.json({
            analysisId: analysis.id,
            creditsDeducted: ANALYSIS_COST
        })
    } catch (error) {
        console.error("Error creating analysis:", error)

        // Refund credits if analysis creation failed and credits were deducted
        if (creditsDeducted && user) {
            try {
                await refundCredits(user.id, ANALYSIS_COST)
                console.log("Credits refunded due to analysis creation failure")
            } catch (refundError) {
                console.error("Failed to refund credits after analysis creation error:", refundError)
            }
        }

        const errorMessage = error instanceof Error ? error.message : (error as any)?.message || "Unknown error"
        return NextResponse.json(
            {
                error: "Failed to create analysis",
                message: errorMessage,
                details: error
            },
            { status: 500 }
        )
    }
}
