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
                    {/* Page navigation removed as iframe handles scrolling */}
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
                    {/* PDF Content */}
                    <iframe
                        src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="absolute inset-0 w-full h-full"
                        title="Building Plan"
                    />
                </div>
            </div>
        </div>
    )
}
