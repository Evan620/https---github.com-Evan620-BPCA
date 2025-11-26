"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { StepUpload } from "./step-upload"
import { StepCodes } from "./step-codes"
import { StepReview } from "./step-review"
import { Plus, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"

export function WizardDialog() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [file, setFile] = useState<File>()
    const [fileUrl, setFileUrl] = useState<string>("")
    const [selectedCodes, setSelectedCodes] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFileSelect = (uploadedFile: File, url: string) => {
        setFile(uploadedFile)
        setFileUrl(url)
    }

    const handleNext = () => {
        if (step < 3) setStep(step + 1)
    }

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleCodeToggle = (codeId: string) => {
        setSelectedCodes((prev) =>
            prev.includes(codeId)
                ? prev.filter((id) => id !== codeId)
                : [...prev, codeId]
        )
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            if (!file || !fileUrl) {
                alert("Please upload a file first")
                return
            }

            // Get project ID from URL
            const projectId = window.location.pathname.split("/")[3]

            // Create analysis using the helper
            const response = await fetch("/api/analysis/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    fileUrl,
                    selectedCodes
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to create analysis")
            }

            const { analysisId } = await response.json()

            // Close modal and redirect to loading page
            setOpen(false)
            window.location.href = `/dashboard/project/${projectId}/loading?analysisId=${analysisId}`
        } catch (error) {
            console.error("Failed to start analysis:", error)
            alert(error instanceof Error ? error.message : "Failed to start analysis. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Analysis
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] min-h-[500px] flex flex-col">
                <div className="flex-1 py-6">
                    {step === 1 && (
                        <StepUpload onFileSelect={handleFileSelect} selectedFile={file} />
                    )}
                    {step === 2 && (
                        <StepCodes
                            selectedCodes={selectedCodes}
                            onCodeToggle={handleCodeToggle}
                        />
                    )}
                    {step === 3 && file && (
                        <StepReview file={file} selectedCodes={selectedCodes} />
                    )}
                </div>

                <DialogFooter className="flex justify-between items-center border-t pt-4">
                    <div className="flex gap-2">
                        {step > 1 && (
                            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {step < 3 ? (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !file) ||
                                    (step === 2 && selectedCodes.length === 0)
                                }
                            >
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Start Analysis
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
