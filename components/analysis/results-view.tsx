"use client"

import { useState, useEffect } from "react"
import { PDFViewer } from "./pdf-viewer"
import { ViolationsSidebar } from "./violations-sidebar"
import { ScoreCard } from "./score-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Violation {
    id: string
    title: string
    description: string
    severity: "critical" | "warning" | "info"
    code: string
    page: number
    x: string
    y: string
}

interface ReportData {
    score: number
    violations: Violation[]
    totalViolations: number
    criticalViolations: number
    pdfUrl?: string
    annotatedPdfUrl?: string
}

interface ResultsViewProps {
    analysisId: string
}

export function ResultsView({ analysisId }: ResultsViewProps) {
    const router = useRouter()
    const supabase = createClient()
    const [selectedViolationId, setSelectedViolationId] = useState<string>()
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadReport()
    }, [analysisId])

    const loadReport = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch the analysis and its report
            const { data: analysis, error: analysisError } = await supabase
                .from("analyses")
                .select("*, reports(*)")
                .eq("id", analysisId)
                .single()

            if (analysisError) throw analysisError

            if (!analysis) {
                throw new Error("Analysis not found")
            }

            // Check if report exists
            if (!analysis.reports || analysis.reports.length === 0) {
                throw new Error("Report not yet available")
            }

            const report = analysis.reports[0]
            const jsonReport = report.json_report

            // Parse the report data from n8n
            // Expecting format: { score, violations: [...], summary, etc }
            const violations: Violation[] = (jsonReport.violations || []).map((v: any, index: number) => ({
                id: v.id || `violation-${index}`,
                title: v.title || v.description?.substring(0, 50) || "Violation",
                description: v.description || "",
                severity: v.severity || "warning",
                code: v.code || v.citation || "",
                page: v.page || 1,
                x: v.x || "30%",
                y: v.y || "40%"
            }))

            const criticalCount = violations.filter(v => v.severity === "critical").length

            setReportData({
                score: jsonReport.score || 0,
                violations,
                totalViolations: violations.length,
                criticalViolations: criticalCount,
                pdfUrl: analysis.pdf_url,
                annotatedPdfUrl: report.annotated_pdf_url
            })
        } catch (err) {
            console.error("Error loading report:", err)
            setError(err instanceof Error ? err.message : "Failed to load report")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading analysis results...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">⚠️</div>
                    <h2 className="text-2xl font-bold">Error Loading Results</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    if (!reportData) {
        return null
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-background/95 backdrop-blur z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="font-semibold">Analysis Results</h1>
                        <p className="text-xs text-muted-foreground">
                            Score: {reportData.score}% • {reportData.totalViolations} Violations
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                    <Button size="sm" onClick={() => {
                        if (reportData.annotatedPdfUrl) {
                            window.open(reportData.annotatedPdfUrl, '_blank')
                        }
                    }}>
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content - PDF Viewer */}
                <div className="flex-1 relative">
                    <div className="absolute top-4 left-4 z-10 w-64">
                        <ScoreCard
                            score={reportData.score}
                            totalViolations={reportData.totalViolations}
                            criticalViolations={reportData.criticalViolations}
                        />
                    </div>
                    <PDFViewer
                        url={reportData.annotatedPdfUrl || reportData.pdfUrl || "/mock-plan.pdf"}
                        violations={reportData.violations}
                        selectedViolationId={selectedViolationId}
                    />
                </div>

                {/* Sidebar - Violations */}
                <div className="w-96 border-l bg-background">
                    <ViolationsSidebar
                        violations={reportData.violations}
                        onSelectViolation={setSelectedViolationId}
                        selectedViolationId={selectedViolationId}
                    />
                </div>
            </div>
        </div>
    )
}
