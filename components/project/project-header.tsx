"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, FileText, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface ProjectHeaderProps {
    project: {
        id: string
        name: string
        description: string
        createdAt: Date
        updatedAt: Date
        totalAnalyses: number
    }
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    const router = useRouter()

    return (
        <div className="space-y-6 pb-8 border-b">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">{project.description}</p>
                </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground pl-12">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {project.totalAnalyses} Analyses Run
                </div>
            </div>
        </div>
    )
}
