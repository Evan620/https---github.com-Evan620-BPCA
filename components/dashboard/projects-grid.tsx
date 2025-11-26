"use client"

import { ProjectCard } from "./project-card"
import { useQuery } from "@tanstack/react-query"
import { getProjects } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { useFolderStore } from "@/lib/store/folder-store"
import { useMemo } from "react"

export function ProjectsGrid() {
    const { activeFolder } = useFolderStore()

    const { data: projects, isLoading, error } = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
    })

    const filteredProjects = useMemo(() => {
        if (!projects) return []
        if (activeFolder === null) return projects
        return projects.filter(p => p.folder_id === activeFolder)
    }, [projects, activeFolder])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                Error loading projects. Please try again.
            </div>
        )
    }

    if (!filteredProjects || filteredProjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm">
                    {activeFolder ? "This folder is empty" : "Create your first project to get started"}
                </p>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProjects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={{
                            ...project,
                            createdAt: new Date(project.created_at),
                            updatedAt: new Date(project.updated_at),
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
