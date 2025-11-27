"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ScoreCardProps {
    score: number
    totalViolations: number
    criticalViolations: number
}

export function ScoreCard({ score, totalViolations, criticalViolations }: ScoreCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-500"
        if (score >= 70) return "text-yellow-500"
        return "text-red-500"
    }

    const getProgressColorHex = (score: number) => {
        if (score >= 90) return "#22c55e" // green-500
        if (score >= 70) return "#eab308" // yellow-500
        return "#ef4444" // red-500
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Compliance Score
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between mb-2">
                    <span className={cn("text-4xl font-bold", getScoreColor(score))}>
                        {score}%
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">
                        {totalViolations} Issues Found
                    </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                    <div
                        className="h-full transition-all"
                        style={{
                            width: `${score}%`,
                            backgroundColor: getProgressColorHex(score),
                        }}
                    />
                </div>

                <div className="mt-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="font-medium">{criticalViolations} Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="font-medium">{totalViolations - criticalViolations} Warnings</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}