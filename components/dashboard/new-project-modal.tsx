"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProject } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useFolderStore } from "@/lib/store/folder-store"

export function NewProjectModal() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const queryClient = useQueryClient()
    const router = useRouter()
    const { activeFolder } = useFolderStore()

    const createProjectMutation = useMutation({
        mutationFn: async () => {
            return await createProject(name, description, activeFolder || undefined)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            setOpen(false)
            setName("")
            setDescription("")
            // Optional: Navigate to the new project
            // router.push(`/dashboard/project/${data.id}`)
        },
    })

    const handleSubmit = () => {
        if (!name) return
        createProjectMutation.mutate()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button id="new-project-btn">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Create a new project to start analyzing building plans.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="Project Name"
                            className="col-span-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Input
                            id="description"
                            placeholder="Optional description"
                            className="col-span-3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={createProjectMutation.isPending || !name}
                    >
                        {createProjectMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
