"use client"

import { ResultsView } from "@/components/analysis/results-view"
import { use } from "react"

export default function AnalysisResultsPage({ params }: { params: Promise<{ analysisId: string }> }) {
    const { analysisId } = use(params)
    return <ResultsView analysisId={analysisId} />
}
