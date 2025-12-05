"use client"

import { ResultsView } from "@/components/analysis/results-view"
import { use, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { FeedbackDialog } from "@/components/feedback/feedback-dialog"

export default function AnalysisResultsPage({ params }: { params: Promise<{ analysisId: string }> }) {
    const { analysisId } = use(params)
    const searchParams = useSearchParams()
    const [showFeedback, setShowFeedback] = useState(false)

    useEffect(() => {
        if (searchParams.get("showFeedback") === "true") {
            // Show feedback dialog after a short delay
            const timer = setTimeout(() => {
                setShowFeedback(true)
                // Optional: Clean up URL
                const newUrl = window.location.pathname
                window.history.replaceState({}, "", newUrl)
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [searchParams])

    return (
        <>
            <ResultsView analysisId={analysisId} />
            <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} />
        </>
    )
}
