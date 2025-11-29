"use client"

import { Folder, Plus, MoreVertical, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFolders } from "@/lib/api"
import { NewFolderDialog } from "./new-folder-dialog"
import { useFolderStore } from "@/lib/store/folder-store"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface FoldersPanelProps {
    className?: string
}

export function FoldersPanel({ className }: FoldersPanelProps) {
    const { activeFolder, setActiveFolder } = useFolderStore()
    const queryClient = useQueryClient()
    const supabase = createClient()
    const router = useRouter()

    const { data: folders } = useQuery({
        queryKey: ["folders"],
        queryFn: getFolders,
    })

    const deleteFolderMutation = useMutation({
        mutationFn: async (folderId: string) => {
            const { error } = await supabase
                .from("folders")
                .delete()
                .eq("id", folderId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] })
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            if (activeFolder) {
                setActiveFolder(null)
            }
        },
    })

    const handleDeleteFolder = (folderId: string) => {
        if (confirm("Are you sure you want to delete this folder? Projects in this folder will not be deleted.")) {
            deleteFolderMutation.mutate(folderId)
        }
    }

    return (
        <div className={cn("flex flex-col h-full border-r bg-muted/10", className)}>
            <div className="p-4 border-b flex items-center justify-between">
                <div
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                        setActiveFolder(null)
                        router.push("/dashboard")
                    }}
                >
                    <h2 className="font-semibold tracking-tight">Folders</h2>
                </div>
                <NewFolderDialog />
            </div>

            <ScrollArea className="flex-1 py-4">
                <div className="px-2 space-y-1">
                    <Button
                        variant={activeFolder === null ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start",
                            activeFolder === null && "bg-secondary"
                        )}
                        onClick={() => {
                            setActiveFolder(null)
                            router.push("/dashboard")
                        }}
                    >
                        <Folder className={cn("mr-2 h-4 w-4",
                            activeFolder === null ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="flex-1 text-left truncate">All Projects</span>
                    </Button>

                    {folders?.map((folder) => (
                        <div key={folder.id} className="group relative">
                            <Button
                                variant={activeFolder === folder.id ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start pr-8",
                                    activeFolder === folder.id && "bg-secondary"
                                )}
                                onClick={() => setActiveFolder(folder.id)}
                            >
                                <Folder className={cn("mr-2 h-4 w-4",
                                    activeFolder === folder.id ? "text-primary" : "text-muted-foreground"
                                )} />
                                <span className="flex-1 text-left truncate">{folder.name}</span>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
