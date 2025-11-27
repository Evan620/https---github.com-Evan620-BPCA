"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertTriangle, AlertCircle, CheckCircle2, Filter } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Violation {
    id: string
    title: string
    description: string
    severity: "critical" | "warning" | "info"
    code: string
    page: number
}

interface ViolationsSidebarProps {
    violations: Violation[]
    onSelectViolation: (id: string) => void
    selectedViolationId?: string
}

export function ViolationsSidebar({ violations, onSelectViolation, selectedViolationId }: ViolationsSidebarProps) {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<"all" | "critical" | "warning">("all")

    const filteredViolations = violations.filter(v => {
        const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
            v.code.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === "all" || v.severity === filter
        return matchesSearch && matchesFilter
    })

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case "critical": return <AlertCircle className="h-4 w-4 text-red-500" />
            case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            default: return <CheckCircle2 className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <div className="flex flex-col h-full border-l bg-background">
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Violations</h3>
                    <Badge variant="secondary">{filteredViolations.length}</Badge>
                </div>

                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search issues..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={filter === "all" ? "secondary" : "ghost"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setFilter("all")}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === "critical" ? "secondary" : "ghost"}
                        size="sm"
                        className="flex-1 text-red-500 hover:text-red-600"
                        onClick={() => setFilter("critical")}
                    >
                        Critical
                    </Button>
                    <Button
                        variant={filter === "warning" ? "secondary" : "ghost"}
                        size="sm"
                        className="flex-1 text-yellow-500 hover:text-yellow-600"
                        onClick={() => setFilter("warning")}
                    >
                        Warning
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                    {filteredViolations.map((violation) => (
                        <div
                            key={violation.id}
                            className={cn(
                                "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                                selectedViolationId === violation.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card hover:border-primary/50"
                            )}
                            onClick={() => onSelectViolation(violation.id)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getSeverityIcon(violation.severity)}</div>
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-sm leading-tight break-words">{violation.title}</p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">Pg {violation.page}</span>
                                    </div>
                                    <p className={cn("text-xs text-muted-foreground break-words", selectedViolationId !== violation.id && "line-clamp-2")}>
                                        {violation.description}
                                    </p>
                                    <Badge variant="outline" className="text-[10px] min-h-5 h-auto whitespace-normal text-left py-1 break-words leading-tight">
                                        {violation.code}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
