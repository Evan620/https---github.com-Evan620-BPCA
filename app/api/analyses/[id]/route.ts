import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

        // Delete the analysis and its associated report
        const { error } = await supabase
            .from("analyses")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Error deleting analysis:", error)
            return NextResponse.json(
                { error: "Failed to delete analysis" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in DELETE /api/analyses/[id]:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
