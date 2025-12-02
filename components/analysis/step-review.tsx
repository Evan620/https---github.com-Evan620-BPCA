"use client"

import { Button } from "@/components/ui/button"
import { FileText, Check, AlertTriangle } from "lucide-react"

interface StepReviewProps {
    file: File
    selectedCodes: string[]
    description?: string
    pageNumbers?: string
}

export function StepReview({ file, selectedCodes, description, pageNumbers }: StepReviewProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Review & Start Analysis</h3>
                <p className="text-sm text-muted-foreground">
                    Confirm your selection before starting the analysis.
                </p>
            </div>

            <div className="space-y-4">
                <div className="bg-muted/10 p-4 rounded-lg border space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                        Selected File
                    </h4>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/10 p-4 rounded-lg border space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                        Selected Codes ({selectedCodes.length})
                    </h4>
                    <ul className="space-y-2">
                        {selectedCodes.map((code) => (
                            <li key={code} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="capitalize">{code.replace(/-/g, " ")}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {description && (
                    <div className="bg-muted/10 p-4 rounded-lg border space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Description
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">{description}</p>
                    </div>
                )}

                {pageNumbers && (
                    <div className="bg-muted/10 p-4 rounded-lg border space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Page Numbers
                        </h4>
                        <p className="text-sm font-mono">{pageNumbers}</p>
                    </div>
                )}

                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                            Analysis Estimate
                        </p>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                            This analysis will take approximately 2-5 minutes to complete. You will be notified when it's ready.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
