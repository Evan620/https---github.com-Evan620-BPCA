"use client"

import { useState, useEffect, useRef } from "react"
import { PDFViewer } from "./pdf-viewer"
import { ViolationsSidebar } from "./violations-sidebar"
import { ScoreCard } from "./score-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { downloadComplianceReport } from "@/lib/pdf-generator"

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
    const [rawJsonReport, setRawJsonReport] = useState<any>(null)
    const [projectName, setProjectName] = useState<string>("Building Plan")
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
                .select("*, reports(*), projects(name)")
                .eq("id", analysisId)
                .single()

            if (analysisError) throw analysisError

            if (!analysis) {
                throw new Error("Analysis not found")
            }

            // Set project name
            if (analysis.projects?.name) {
                setProjectName(analysis.projects.name)
            }

            // Check if report exists
            if (!analysis.reports || analysis.reports.length === 0) {
                throw new Error("Report not yet available")
            }

            const report = analysis.reports[0]
            const jsonReport = report.json_report

            // Store raw JSON for PDF generation
            setRawJsonReport(jsonReport)

            // Parse the report data from n8n
            // JSON structure: { overall_assessment: { compliance_score: ... }, violations: [{ requirement: ..., details: ..., ... }] }

            const rawViolations = [...(jsonReport.violations || []), ...(jsonReport.warnings || [])];

            const violations: Violation[] = rawViolations.map((v: any, index: number) => ({
                id: v.id || `violation-${index}`,
                title: v.requirement || "Violation",
                description: v.details || v.recommendation || "",
                severity: v.status === "VIOLATION" ? "critical" : "warning",
                code: v.code_reference || "",
                page: v.page || 1,
                x: v.x || "50%", // Default to center if no coordinates
                y: v.y || "50%"
            }))

            const criticalCount = violations.filter(v => v.severity === "critical").length

            setReportData({
                score: jsonReport.overall_assessment?.compliance_score || 0,
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

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            alert("Link copied to clipboard!")
        } catch (err) {
            console.error("Failed to copy link:", err)
        }
    }

    const handleExport = () => {
        if (rawJsonReport) {
            downloadComplianceReport(rawJsonReport, projectName)
        } else {
            alert("Report data not available")
        }
    }

    const [sidebarWidth, setSidebarWidth] = useState(400)
    const isResizing = useRef(false)

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault()
        isResizing.current = true
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = window.innerWidth - e.clientX
            if (newWidth > 300 && newWidth < 1200) { // Increased max width
                setSidebarWidth(newWidth)
            }
        }

        const stopResizing = () => {
            isResizing.current = false
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', stopResizing)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', stopResizing)
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
            <div className="h-16 border-b flex items-center justify-between px-6 bg-background/95 backdrop-blur z-10 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="font-semibold">Analysis Results</h1>
                        <p className="text-xs text-muted-foreground">
                            Score: {reportData.score}% • {reportData.totalViolations} Issues
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                    <Button size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content - PDF Viewer */}
                <div className="flex-1 relative min-w-0">
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

                {/* Resizer Handle */}
                <div
                    className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors z-20 flex items-center justify-center group"
                    onMouseDown={startResizing}
                >
                    <div className="h-8 w-1 bg-muted-foreground/20 group-hover:bg-primary rounded-full" />
                </div>

                {/* Sidebar - Violations */}
                <div
                    className="border-l bg-background flex-shrink-0"
                    style={{ width: sidebarWidth }}
                >
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
