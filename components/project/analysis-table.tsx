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
import { FileText, Download, ExternalLink, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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
}

export function AnalysisTable({ analyses }: AnalysisTableProps) {
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
                        <TableHead>Compliance Score</TableHead>
                        <TableHead>Violations</TableHead>
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
                            <TableCell>
                                {analysis.score ? (
                                    <span className={analysis.score >= 90 ? "text-green-500 font-medium" : analysis.score >= 70 ? "text-yellow-500 font-medium" : "text-red-500 font-medium"}>
                                        {analysis.score}%
                                    </span>
                                ) : (
                                    "-"
                                )}
                            </TableCell>
                            <TableCell>
                                {analysis.violations !== undefined ? (
                                    <Badge variant="outline" className={analysis.violations === 0 ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}>
                                        {analysis.violations} Issues
                                    </Badge>
                                ) : (
                                    "-"
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {analysis.status === "completed" && (
                                        <>
                                            <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
