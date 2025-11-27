import { ResultsView } from "@/components/analysis/results-view"

export default async function AnalysisResultsPage({ params }: { params: Promise<{ analysisId: string }> }) {
    const { analysisId } = await params
    return <ResultsView analysisId={analysisId} />
}
