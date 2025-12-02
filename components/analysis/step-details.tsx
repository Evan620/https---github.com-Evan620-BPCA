"use client"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"

interface StepDetailsProps {
    description: string
    pageNumbers: string
    onDescriptionChange: (value: string) => void
    onPageNumbersChange: (value: string) => void
}

export function StepDetails({
    description,
    pageNumbers,
    onDescriptionChange,
    onPageNumbersChange
}: StepDetailsProps) {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium">Additional Details</h3>
                <p className="text-sm text-muted-foreground">
                    Provide optional details to help our AI better understand your compliance needs.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="description">
                        Description <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Describe your specific compliance requirements or areas of concern..."
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        className="min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        Help the AI understand what you're looking for in the compliance analysis.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pageNumbers">
                        Page Numbers <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Input
                        id="pageNumbers"
                        placeholder="e.g., 1, 3-5, 8"
                        value={pageNumbers}
                        onChange={(e) => onPageNumbersChange(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Specify which pages to analyze. Supports individual pages (1, 3) and ranges (5-8).
                    </p>
                </div>
            </div>
        </div>
    )
}
