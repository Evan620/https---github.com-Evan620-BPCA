import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { BlueprintBackground } from "@/components/ui/blueprint-background"
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface LoadingScreenProps {
    status: "uploading" | "processing" | "analyzing" | "generating" | "completed" | "failed"
    error?: string | null
    projectId?: string
}

export function LoadingScreen({ status, error, projectId }: LoadingScreenProps) {
    const [progress, setProgress] = useState(0)
    const router = useRouter()

    const steps = [
        { id: "uploading", label: "Uploading Plan" },
        { id: "processing", label: "Processing PDF" },
        { id: "analyzing", label: "Analyzing Compliance" },
        { id: "generating", label: "Generating Report" },
    ]

    useEffect(() => {
        // Simulate progress based on status
        let targetProgress = 0
        switch (status) {
            case "uploading":
                targetProgress = 25
                break
            case "processing":
                targetProgress = 50
                break
            case "analyzing":
                targetProgress = 75
                break
            case "generating":
                targetProgress = 90
                break
            case "completed":
                targetProgress = 100
                break
            case "failed":
                targetProgress = 100
                break
        }

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev < targetProgress) {
                    return prev + 1
                }
                return prev
            })
        }, 50)

        return () => clearInterval(timer)
    }, [status])

    if (status === "failed") {
        return (
            <div className="relative h-full w-full flex flex-col items-center justify-center p-8 overflow-hidden">
                <BlueprintBackground />

                <div className="z-10 w-full max-w-md space-y-8 bg-background/95 backdrop-blur-sm p-8 rounded-xl border border-red-200 shadow-lg">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-red-600">Analysis Failed</h2>
                            <p className="text-muted-foreground">
                                {error || "We couldn't analyze this document. It might not be a valid building plan."}
                            </p>
                        </div>

                        <div className="pt-4 flex flex-col gap-2">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>

                            {projectId && (
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/dashboard/project/${projectId}`)}
                                    className="w-full"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Project
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center p-8 overflow-hidden">
            <BlueprintBackground />

            <div className="z-10 w-full max-w-md space-y-8 bg-background/80 backdrop-blur-sm p-8 rounded-xl border shadow-lg">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Analyzing Plan</h2>
                    <p className="text-muted-foreground">
                        Our AI is reviewing your building plan against selected codes.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <Progress value={progress} className="h-2" />
                        <div className="absolute top-0 left-0 h-full w-full bg-blue-500/20 animate-pulse rounded-full" />
                    </div>

                    <div className="space-y-4">
                        {steps.map((step, index) => {
                            const isActive = step.id === status
                            const isCompleted = steps.findIndex(s => s.id === status) > index || status === "completed"

                            return (
                                <div key={step.id} className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center border transition-colors",
                                        isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                            isActive ? "border-primary text-primary" : "border-muted text-muted-foreground"
                                    )}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : isActive ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-current" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-sm font-medium transition-colors",
                                        isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Scanning Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-[scan_3s_ease-in-out_infinite]" />
            </div>
        </div>
    )
}
