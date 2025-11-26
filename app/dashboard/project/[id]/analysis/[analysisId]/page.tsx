import { ResultsView } from "@/components/analysis/results-view"

export default function AnalysisResultsPage({ params }: { params: { analysisId: string } }) {
    return <ResultsView analysisId={params.analysisId} />
}
