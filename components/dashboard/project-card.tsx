"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileText, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProject, deleteProject } from "@/lib/api"

interface ProjectCardProps {
    project: {
        id: string
        name: string
        description: string | null
        updatedAt: Date
        status?: "processing" | "completed" | "failed" | "waiting"
        version?: number
    }
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const status = project.status || "waiting"
    const version = project.version || 1

    const [renameOpen, setRenameOpen] = useState(false)
    const [newName, setNewName] = useState(project.name)
    const [newDescription, setNewDescription] = useState(project.description || "")

    const updateMutation = useMutation({
        mutationFn: () => updateProject(project.id, newName, newDescription),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            setRenameOpen(false)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: () => deleteProject(project.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
        },
    })

    const handleCardClick = () => {
        router.push(`/dashboard/project/${project.id}`)
    }

    const handleAction = (e: React.MouseEvent, action: string) => {
        e.stopPropagation()

        if (action === "open") {
            router.push(`/dashboard/project/${project.id}`)
        } else if (action === "rename") {
            setNewName(project.name)
            setNewDescription(project.description || "")
            setRenameOpen(true)
        } else if (action === "delete") {
            if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
                deleteMutation.mutate()
            }
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
            case "processing":
                return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
            case "failed":
                return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            default:
                return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="mr-1 h-3 w-3" />
            case "failed":
                return <AlertCircle className="mr-1 h-3 w-3" />
            default:
                return <Clock className="mr-1 h-3 w-3" />
        }
    }

    return (
        <>
            <Card
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={handleCardClick}
            >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-medium leading-none">
                            {project.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {project.description || "No description"}
                        </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleAction(e, "open")}>
                                Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleAction(e, "rename")}>
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => handleAction(e, "delete")}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-3 w-3" />
                            v{version}
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Badge variant="secondary" className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </CardFooter>
            </Card>

            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Project</DialogTitle>
                        <DialogDescription>
                            Update the project name and description
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Optional description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => updateMutation.mutate()}
                            disabled={!newName || updateMutation.isPending}
                        >
                            {updateMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
