"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight } from "lucide-react"

interface PDFViewerProps {
    url: string
    violations: any[]
    selectedViolationId?: string
}

export function PDFViewer({ url, violations, selectedViolationId }: PDFViewerProps) {
    const [scale, setScale] = useState(1)
    const [page, setPage] = useState(1)

    // Mock PDF viewer for now - in production use react-pdf
    return (
        <div className="flex flex-col h-full bg-muted/20">
            <div className="h-12 border-b bg-background flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setPage(Math.max(1, page - 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">Page {page} of 5</span>
                    <Button variant="ghost" size="icon" onClick={() => setPage(Math.min(5, page + 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setScale(Math.min(2, scale + 0.1))}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-2" />
                    <Button variant="ghost" size="icon">
                        <Maximize className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
                <div
                    className="bg-white shadow-lg relative transition-transform duration-200"
                    style={{
                        width: `${595 * scale}px`,
                        height: `${842 * scale}px`,
                        transformOrigin: "center top"
                    }}
                >
                    {/* Mock PDF Content */}
                    <div className="absolute inset-0 p-12 border m-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                        <p className="text-2xl font-bold mb-4">BUILDING PLAN PDF</p>
                        <p>Page {page}</p>
                    </div>

                    {/* Violation Overlays */}
                    {violations
                        .filter(v => v.page === page)
                        .map((v) => (
                            <div
                                key={v.id}
                                className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center cursor-pointer transition-all
                  ${selectedViolationId === v.id
                                        ? "bg-primary text-primary-foreground scale-125 z-10 shadow-lg ring-4 ring-primary/20"
                                        : v.severity === "critical"
                                            ? "bg-red-500/20 border-2 border-red-500 text-red-700"
                                            : "bg-yellow-500/20 border-2 border-yellow-500 text-yellow-700"
                                    }`}
                                style={{ left: v.x, top: v.y }}
                                title={v.title}
                            >
                                {v.id}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
