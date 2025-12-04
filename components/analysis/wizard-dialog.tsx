"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { StepUpload } from "./step-upload"
import { StepDetails } from "./step-details"
import { StepCodes } from "./step-codes"
import { StepReview } from "./step-review"
import { Plus, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ANALYSIS_COST } from "@/lib/constants"

import { useRouter } from "next/navigation"

export interface WizardDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function WizardDialog({ open: controlledOpen, onOpenChange }: WizardDialogProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false)

    const [step, setStep] = useState(1)
    const [file, setFile] = useState<File>()
    const [fileUrl, setFileUrl] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [pageNumbers, setPageNumbers] = useState<string>("")
    const [selectedCodes, setSelectedCodes] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [credits, setCredits] = useState<number | null>(null)
    const [supabase] = useState(() => createClient())
    const router = useRouter()

    // Fetch credits on mount
    useEffect(() => {
        fetchCredits()
    }, [])

    // Use controlled open state if provided, otherwise use internal state
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = (value: boolean) => {
        if (onOpenChange) {
            onOpenChange(value)
        } else {
            setInternalOpen(value)
        }
    }

    const fetchCredits = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase
                .from("user_credits")
                .select("credits")
                .eq("user_id", user.id)
                .single()

            if (data) setCredits(data.credits)
        }
    }

    const handleNewAnalysis = () => {
        if (credits !== null && credits < ANALYSIS_COST) {
            router.push("/dashboard/upgrade")
            return
        }
        setOpen(true)
    }

    const handleFileSelect = (uploadedFile: File, url: string) => {
        setFile(uploadedFile)
        setFileUrl(url)
    }

    const handleNext = () => {
        if (step < 4) setStep(step + 1)
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
        if (credits !== null && credits < ANALYSIS_COST) {
            router.push("/dashboard/upgrade")
            return
        }

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
                    selectedCodes,
                    description: description || undefined,
                    pageNumbers: pageNumbers || undefined
                })
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 402) {
                    throw new Error(data.message || "Insufficient credits")
                }
                throw new Error(data.message || "Failed to create analysis")
            }

            const { analysisId } = data

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
            <Button onClick={handleNewAnalysis}>
                <Plus className="mr-2 h-4 w-4" />
                New Analysis
            </Button>
            <DialogContent className="sm:max-w-[600px] min-h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>New Analysis</DialogTitle>
                    <DialogDescription>
                        Upload a plan and select codes to analyze.
                        {credits !== null && (
                            <span className={`block mt-1 ${credits < ANALYSIS_COST ? "text-red-500" : "text-muted-foreground"}`}>
                                Cost: {ANALYSIS_COST} credits (Balance: {credits})
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 py-6">
                    {step === 1 && (
                        <StepUpload onFileSelect={handleFileSelect} selectedFile={file} />
                    )}
                    {step === 2 && (
                        <StepDetails
                            description={description}
                            pageNumbers={pageNumbers}
                            onDescriptionChange={setDescription}
                            onPageNumbersChange={setPageNumbers}
                        />
                    )}
                    {step === 3 && (
                        <StepCodes
                            selectedCodes={selectedCodes}
                            onCodeToggle={handleCodeToggle}
                        />
                    )}
                    {step === 4 && file && (
                        <StepReview
                            file={file}
                            selectedCodes={selectedCodes}
                            description={description}
                            pageNumbers={pageNumbers}
                        />
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
                        {step < 4 ? (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !file) ||
                                    (step === 3 && selectedCodes.length === 0)
                                }
                            >
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || (credits !== null && credits < ANALYSIS_COST)}
                                className={credits !== null && credits < ANALYSIS_COST ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {credits !== null && credits < ANALYSIS_COST ? "Insufficient Credits" : `Start Analysis (${ANALYSIS_COST} Credits)`}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
