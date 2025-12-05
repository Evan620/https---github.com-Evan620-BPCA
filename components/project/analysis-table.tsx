"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, ExternalLink, CheckCircle2, AlertCircle, Clock, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface Analysis {
    id: string
    version: number
    status: "processing" | "completed" | "failed" | "waiting_for_selection"
    createdAt: Date
    score?: number
    violations?: number
    pdf_url?: string
}

interface AnalysisTableProps {
    analyses: Analysis[]
    projectId: string
}

export function AnalysisTable({ analyses, projectId }: AnalysisTableProps) {
    const router = useRouter()

    // Cleanup stalled analyses on mount
    useEffect(() => {
        const cleanupAnalyses = async () => {
            try {
                const response = await fetch('/api/analysis/cleanup', {
                    method: 'POST',
                })
                const data = await response.json()
                if (data.cleaned > 0) {
                    console.log(`Cleaned up ${data.cleaned} stalled analyses`)
                    router.refresh()
                }
            } catch (error) {
                console.error("Error running cleanup:", error)
            }
        }

        cleanupAnalyses()
    }, [])

    const getFileName = (url?: string) => {
        if (!url) return "Unknown Document"
        try {
            const decoded = decodeURIComponent(url)
            const cleanUrl = decoded.split('?')[0]
            return cleanUrl.split('/').pop() || "Unknown Document"
        } catch {
            const cleanUrl = url.split('?')[0]
            return cleanUrl.split('/').pop() || "Unknown Document"
        }
    }

    const handleDownload = async (analysisId: string) => {
        try {
            const supabase = createClient()

            // Fetch the analysis and its report
            const { data: analysis, error: analysisError } = await supabase
                .from("analyses")
                .select("*, reports(*), project_versions(projects(name))")
                .eq("id", analysisId)
                .single()

            if (analysisError) throw analysisError
            if (!analysis || !analysis.reports || analysis.reports.length === 0) {
                alert("Report not available")
                return
            }

            const report = analysis.reports[0]
            const jsonReport = report.json_report
            const projectName = analysis.project_versions?.projects?.name || "Building Plan"

            // Import PDF generator dynamically
            const { downloadComplianceReport } = await import("@/lib/pdf-generator")
            downloadComplianceReport(jsonReport, projectName)
        } catch (error) {
            console.error("Error downloading report:", error)
            alert("Failed to download report")
        }
    }

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = (analysisId: string) => {
        setAnalysisToDelete(analysisId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!analysisToDelete) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/analyses/${analysisToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete analysis');
            }

            // Use router.refresh() for better state management
            router.refresh();
            setDeleteDialogOpen(false)
            setAnalysisToDelete(null)
        } catch (error) {
            console.error("Error deleting analysis:", error);
            alert(error instanceof Error ? error.message : "An error occurred while deleting the analysis");
        } finally {
            setIsDeleting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                    </Badge>
                )
            case "processing":
                return (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                        <Clock className="mr-1 h-3 w-3 animate-spin" /> Processing
                    </Badge>
                )
            case "failed":
                return (
                    <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                        <AlertCircle className="mr-1 h-3 w-3" /> Failed
                    </Badge>
                )
            default:
                return (
                    <Badge variant="secondary" className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">
                        <Clock className="mr-1 h-3 w-3" /> Waiting
                    </Badge>
                )
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {analyses.map((analysis) => (
                        <TableRow key={analysis.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate max-w-[300px]" title={getFileName(analysis.pdf_url)}>
                                        {getFileName(analysis.pdf_url)}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(analysis.status)}</TableCell>
                            <TableCell>{formatDistanceToNow(analysis.createdAt, { addSuffix: true })}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {analysis.status === "completed" && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDownload(analysis.id)}
                                                title="Download Report"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/dashboard/project/${projectId}/analysis/${analysis.id}`)}
                                                title="View Report"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteClick(analysis.id)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                        title="Delete Analysis"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Analysis"
                description="Are you sure you want to delete this analysis? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
            />
        </div>
    )
}
