"use client"

import { NewProjectModal } from "@/components/dashboard/new-project-modal"
import { ProjectsGrid } from "@/components/dashboard/projects-grid"
import { useRealtimeSubscription } from "@/hooks/use-realtime"

export default function DashboardPage() {
    useRealtimeSubscription()

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">
                        Manage and analyze your building plans.
                    </p>
                </div>
                <NewProjectModal />
            </div>
            <div className="flex-1 bg-muted/5">
                <ProjectsGrid />
            </div>
        </div>
    )
}
