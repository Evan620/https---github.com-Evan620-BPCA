"use client"

import { Button } from "@/components/ui/button"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { uploadBuildingPlan, getBuildingPlanUrl } from "@/lib/supabase/storage"

interface StepUploadProps {
    onFileSelect: (file: File, url: string) => void
    selectedFile?: File
}

export function StepUpload({ onFileSelect, selectedFile }: StepUploadProps) {
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0]
            if (file.type === "application/pdf") {
                setIsUploading(true)
                try {
                    // Mock project ID and version for now - should come from props/context
                    const projectId = "1"
                    const version = 1

                    const { path } = await uploadBuildingPlan(file, projectId, version)
                    const url = await getBuildingPlanUrl(path)

                    onFileSelect(file, url)
                } catch (error) {
                    console.error("Upload failed:", error)
                    alert("Upload failed. Please try again.")
                } finally {
                    setIsUploading(false)
                }
            } else {
                alert("Please upload a PDF file")
            }
        }
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        disabled: isUploading
    })

    if (selectedFile) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/5">
                <div className="flex items-center space-x-4 p-4 bg-background rounded-lg border shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <p className="text-sm font-medium truncate max-w-[200px]">
                            {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onFileSelect(null as any, "")}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
        >
            <input {...getInputProps()} />
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                {isUploading ? (
                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                )}
            </div>
            <h3 className="text-lg font-semibold mb-1">
                {isUploading ? "Uploading..." : "Upload Building Plan"}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
                Drag and drop your PDF file here, or click to browse.
            </p>
            <Button variant="secondary" disabled={isUploading}>
                Select File
            </Button>
        </div>
    )
}
