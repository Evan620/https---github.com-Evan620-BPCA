"use client"

import { useEffect, useState } from "react"
import { useOnboardingStore } from "@/lib/store/onboarding-store"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const STEPS = [
    {
        target: "body", // General welcome, center screen
        title: "Welcome to BPCA",
        description: "Your intelligent assistant for Building Plan Compliance Analysis. Let's take a quick tour to get you started.",
        position: "center",
    },
    {
        target: "#new-project-btn",
        title: "Create a Project",
        description: "Start by creating a new project. You can organize your analyses into folders or keep them in the main dashboard.",
        position: "bottom-start",
    },
    {
        target: "#projects-grid",
        title: "Manage Analyses",
        description: "Your projects and analyses will appear here. Click on a project to view details, upload plans, and run compliance checks.",
        position: "top",
    },
    {
        target: "body", // Wrap up
        title: "Ready to Start?",
        description: "You're all set! Upload your building plans and let our AI handle the complex regulation checks for you.",
        position: "center",
    },
]

export function OnboardingTour() {
    const { isOpen, currentStep, nextStep, prevStep, closeTour, hasSeenOnboarding, startTour } = useOnboardingStore()
    const [mounted, setMounted] = useState(false)

    // Handle initial auto-start
    useEffect(() => {
        setMounted(true)
        if (!hasSeenOnboarding) {
            // Small delay to ensure UI is ready
            const timer = setTimeout(() => {
                startTour()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [hasSeenOnboarding, startTour])

    if (!mounted || !isOpen) return null

    const step = STEPS[currentStep]
    const isLastStep = currentStep === STEPS.length - 1

    // Calculate position (simplified for this MVP - mostly centered or fixed relative to viewport for robustness)
    // For a truly robust positioning, we'd use something like floating-ui, but for this "guided 4 step" request,
    // a centered modal or simple absolute positioning often works best for non-tech users to avoid confusion.
    // Let's stick to a centered overlay for steps 1 & 4, and a "spotlight" style or just a positioned card for others.

    // Actually, to make it really simple and robust:
    // We will render a fixed overlay with a "spotlight" effect if possible, or just a nice card in the center/corner.
    // Given the "non-tech savvy" requirement, a clear, centered dialog that points to things is often better than jumping UI.
    // Let's try to position it near the target if it's not "body".

    const getPositionStyles = () => {
        if (step.target === "body") {
            return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        }

        // Simple positioning logic based on target
        // In a real app we'd measure rects. For now, let's use fixed positions that we know work for the layout.
        // This is a bit brittle but fits the "MVP" constraint. 
        // BETTER APPROACH: Just center it for all steps but highlight the area? 
        // OR: Use a library. But I committed to custom.
        // Let's stick to Centered for simplicity and clarity, maybe adding a "Look here ->" indicator if needed.
        // Actually, let's just center it. It's the most "guided" and least buggy experience without a heavy library.
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    }

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            {/* Optional: Spotlight effect could go here */}

            <Card className={cn("w-[400px] shadow-2xl border-primary/20 relative animate-in fade-in zoom-in-95 duration-300")}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={closeTour}
                >
                    <X className="h-4 w-4" />
                </Button>

                <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Step {currentStep + 1} of {STEPS.length}
                        </span>
                    </div>
                    <CardTitle className="text-xl text-primary">{step.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                        {step.description}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Visual cues or icons could go here */}
                    <div className="flex justify-center py-4">
                        <div className="flex gap-2">
                            {STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "h-2 w-2 rounded-full transition-colors",
                                        idx === currentStep ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                    >
                        Previous
                    </Button>
                    <Button onClick={isLastStep ? closeTour : nextStep}>
                        {isLastStep ? "Get Started" : "Next"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
