"use client"

import { useState, useEffect, useRef } from "react"
import { PDFViewer } from "./pdf-viewer"
import { ViolationsSidebar } from "./violations-sidebar"
import { ScoreCard } from "./score-card"
import { Button } from "@/components/ui/button"
import { X, Download, Share2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { downloadComplianceReport, generateComplianceReport } from "@/lib/pdf-generator"

interface Violation {
    id: string
    title: string
    description: string
    severity: "critical" | "warning" | "info"
    code: string
    page: number
    x: string
    y: string
    required?: string
    proposed?: string
    recommendation?: string | Record<string, string>
    page_assessed?: string
    object_on_plan?: string
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
    const [projectId, setProjectId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pdfView, setPdfView] = useState<'report' | 'original'>('report')
    const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null)

    const [status, setStatus] = useState<"processing" | "completed" | "failed" | "waiting_for_selection">("processing")
    const [pollingAttempts, setPollingAttempts] = useState(0)
    const pollingAttemptsRef = useRef(0) // Track attempts synchronously
    const MAX_POLLING_ATTEMPTS = 60 // 5 minutes at 5s interval (analyses typically take 3-4 mins)

    useEffect(() => {
        console.log(`[ResultsView] Starting polling with ${MAX_POLLING_ATTEMPTS} max attempts (${MAX_POLLING_ATTEMPTS * 5 / 60} minutes)`)
        let intervalId: NodeJS.Timeout

        const checkStatus = async () => {
            try {
                const { data: analysis, error: analysisError } = await supabase
                    .from("analyses")
                    .select("status, reports(*), project_versions(projects(name), project_id)")
                    .eq("id", analysisId)
                    .single()

                if (analysisError) throw analysisError

                if (!analysis) {
                    throw new Error("Analysis not found")
                }

                // Update project info if available
                // Handle project_versions being potentially an array or object depending on Supabase return type
                const projectVersion = Array.isArray(analysis.project_versions)
                    ? analysis.project_versions[0]
                    : analysis.project_versions

                const project = Array.isArray(projectVersion?.projects)
                    ? projectVersion.projects[0]
                    : projectVersion?.projects

                if (project?.name) {
                    setProjectName(project.name)
                }
                if (projectVersion?.project_id) {
                    setProjectId(projectVersion.project_id)
                }

                setStatus(analysis.status)

                if (analysis.status === 'completed') {
                    if (analysis.reports && analysis.reports.length > 0) {
                        processReport(analysis.reports[0])
                        setLoading(false)
                        return true // Stop polling
                    } else {
                        // Status is completed but report not ready? Keep polling or error?
                        // Usually they should be atomic, but let's be safe
                        console.warn("Analysis completed but report not found yet")
                    }
                } else if (analysis.status === 'failed') {
                    setError("Analysis failed. Please try again or contact support.")
                    setLoading(false)
                    return true // Stop polling
                }

                return false // Continue polling
            } catch (err) {
                console.error("Error checking status:", err)
                // Don't stop polling on transient network errors, but maybe count them?
                return false
            }
        }

        const startPolling = async () => {
            setLoading(true)
            // Initial check
            const shouldStop = await checkStatus()
            if (shouldStop) return

            intervalId = setInterval(async () => {
                // Increment using ref for synchronous access
                pollingAttemptsRef.current += 1
                setPollingAttempts(pollingAttemptsRef.current)

                // Check if we've exceeded the timeout
                if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
                    clearInterval(intervalId)
                    setError("Analysis timed out after 5 minutes. The backend may have failed. Please try again or contact support.")
                    setLoading(false)
                    return
                }

                const stop = await checkStatus()
                if (stop) {
                    clearInterval(intervalId)
                }
            }, 5000)
        }

        startPolling()

        return () => {
            if (intervalId) clearInterval(intervalId)
        }
    }, [analysisId])

    const processReport = (report: any) => {
        try {
            const jsonReport = report.json_report
            setRawJsonReport(jsonReport)

            // Generate PDF URL for report view
            try {
                const doc = generateComplianceReport(jsonReport, projectName)
                const blob = doc.output('blob')
                const url = URL.createObjectURL(blob)
                setGeneratedReportUrl(url)
            } catch (e) {
                console.error("Failed to generate report PDF:", e)
            }

            const violations: Violation[] = [];
            let complianceScore = 0;

            // Extract score from summary if available
            if (jsonReport.summary && typeof jsonReport.summary.compliance_score === 'number') {
                complianceScore = jsonReport.summary.compliance_score;
            } else {
                // Calculate score based on compliant vs total items
                let totalItems = 0;
                let compliantItems = 0;

                Object.entries(jsonReport).forEach(([key, value]: [string, any]) => {
                    if (key === 'summary' || key === 'disclaimer') return;
                    if (typeof value === 'object' && value !== null) {
                        totalItems++;
                        if (value.compliant === true) compliantItems++;
                    }
                });

                complianceScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
            }

            // Iterate over all keys to find regulations/codes
            Object.entries(jsonReport).forEach(([key, value]: [string, any], index) => {
                // Skip summary and disclaimer
                if (key === 'summary' || key === 'disclaimer') return;

                // Check if it's a regulation object (has 'compliant' field)
                if (typeof value === 'object' && value !== null && 'compliant' in value) {
                    // Only add if it's NOT compliant (false or null)
                    if (value.compliant === false || value.compliant === null) {

                        // Determine severity
                        let severity: "critical" | "warning" | "info" = "warning";
                        if (value.severity === "CRITICAL" || value.severity === "High") severity = "critical";
                        else if (value.severity === "Medium") severity = "warning";
                        else if (value.severity === "Low") severity = "info";

                        // Determine title
                        const title = key; // Use the key (e.g., "IBC 1011.5.2") as the title

                        // Determine description
                        const description = value.comment || value.description || "No details provided";

                        // Handle proposed value which can be string or object
                        let proposed = "";
                        if (typeof value.proposed === 'string') {
                            proposed = value.proposed;
                        } else if (typeof value.proposed === 'object' && value.proposed !== null) {
                            proposed = Object.entries(value.proposed)
                                .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                                .join('\n');
                        }

                        violations.push({
                            id: `violation-${index}`,
                            title,
                            description,
                            severity,
                            code: key,
                            page: 1, // Default to page 1 as we don't have page info in this format
                            x: "50%",
                            y: "50%",
                            required: value.required,
                            proposed: proposed,
                            recommendation: value.recommendation,
                            page_assessed: value.page_assessed,
                            object_on_plan: value.object_on_plan
                        });
                    }
                }
            });

            const criticalCount = violations.filter(v => v.severity === "critical").length

            setReportData({
                score: complianceScore,
                violations,
                totalViolations: violations.length,
                criticalViolations: criticalCount,
                pdfUrl: report.annotated_pdf_url, // Use annotated PDF if available
                annotatedPdfUrl: report.annotated_pdf_url
            })
        } catch (err) {
            console.error("Error processing report:", err)
            setError("Failed to process report data")
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
                    <h2 className="text-xl font-semibold">Analyzing Building Plan</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        This usually takes about 3 minutes. Please don't close this tab.
                        We'll notify you when it's ready.
                    </p>
                    {pollingAttempts > 12 && (
                        <p className="text-xs text-muted-foreground animate-pulse">
                            Still working on it... ({Math.floor(pollingAttempts * 5 / 60)}m elapsed)
                        </p>
                    )}
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
                    <Button onClick={() => projectId ? router.push(`/dashboard/project/${projectId}`) : router.push('/dashboard')}>
                        <X className="mr-2 h-4 w-4" />
                        Close
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
                    <Button variant="ghost" size="icon" onClick={() => projectId ? router.push(`/dashboard/project/${projectId}`) : router.push('/dashboard')}>
                        <X className="h-4 w-4" />
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

                    {/* PDF View Toggle */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-background/95 backdrop-blur border rounded-lg p-1 flex gap-1 shadow-sm">
                            <Button
                                variant={pdfView === 'report' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setPdfView('report')}
                                className="text-xs"
                            >
                                📄 Report View
                            </Button>
                            <Button
                                variant={pdfView === 'original' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setPdfView('original')}
                                className="text-xs"
                            >
                                🏗️ Original Plan
                            </Button>
                        </div>
                    </div>

                    {/* PDF Viewer */}
                    {pdfView === 'report' && generatedReportUrl ? (
                        <div className="w-full h-full bg-muted/30">
                            <iframe
                                src={`${generatedReportUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                className="w-full h-full"
                                title="Compliance Report"
                            />
                        </div>
                    ) : (
                        <PDFViewer
                            url={reportData.annotatedPdfUrl || reportData.pdfUrl || "/mock-plan.pdf"}
                            violations={reportData.violations}
                            selectedViolationId={selectedViolationId}
                        />
                    )}
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
