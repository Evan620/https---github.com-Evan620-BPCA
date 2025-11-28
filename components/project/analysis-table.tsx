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

interface Analysis {
    id: string
    version: number
    status: "processing" | "completed" | "failed" | "waiting_for_selection"
    createdAt: Date
    score?: number
    violations?: number
}

interface AnalysisTableProps {
    analyses: Analysis[]
    projectId: string
}

export function AnalysisTable({ analyses, projectId }: AnalysisTableProps) {
    const router = useRouter()

    const handleDownload = async (analysisId: string) => {
        // Trigger direct PDF download
        router.push(`/dashboard/project/${projectId}/analysis/${analysisId}`)
    }

    const handleDelete = async (analysisId: string) => {
        if (confirm("Are you sure you want to delete this analysis? This action cannot be undone.")) {
            try {
                const response = await fetch(`/api/analyses/${analysisId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    window.location.reload();
                } else {
                    alert("Failed to delete analysis");
                }
            } catch (error) {
                console.error("Error deleting analysis:", error);
                alert("An error occurred while deleting the analysis");
            }
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
                        <TableHead>Version</TableHead>
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
                                    v{analysis.version}
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
                                        onClick={() => handleDelete(analysis.id)}
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
        </div>
    )
}
