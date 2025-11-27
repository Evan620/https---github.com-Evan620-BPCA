import { NextResponse } from "next/server"
import { createAnalysis } from "@/lib/analysis"

export async function POST(request: Request) {
    try {
        const { projectId, fileUrl, selectedCodes } = await request.json()

        if (!projectId || !fileUrl || !selectedCodes) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const analysis = await createAnalysis(projectId, fileUrl, selectedCodes)

        return NextResponse.json({ analysisId: analysis.id })
    } catch (error) {
        console.error("Error creating analysis:", error)
        return NextResponse.json(
            {
                error: "Failed to create analysis",
                message: error instanceof Error ? error.message : "Unknown error",
                details: error
            },
            { status: 500 }
        )
    }
}
