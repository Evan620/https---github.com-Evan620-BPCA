import { cn } from "@/lib/utils"

interface LogoProps {
    className?: string
    showText?: boolean
    variant?: "default" | "light" | "dark"
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
    const primaryColor = variant === "light" ? "white" : "currentColor"
    const accentColor = "#F59E0B" // Construction amber/orange

    return (
        <div className={cn("flex items-center gap-2 font-bold text-xl tracking-tight", className)}>


            {showText && (
                <span className={cn(
                    variant === "light" ? "text-white" : "text-foreground"
                )}>
                    BPCA
                </span>
            )}
        </div>
    )
}
