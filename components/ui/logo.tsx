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
            <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                {/* Blueprint background grid hint */}
                <path
                    d="M4 4H28V28H4V4Z"
                    stroke={primaryColor}
                    strokeOpacity="0.1"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                />

                {/* Building structure */}
                <path
                    d="M8 24V12L16 6L24 12V24"
                    stroke={primaryColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 24V16H20V24"
                    stroke={primaryColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Compliance checkmark accent */}
                <circle cx="24" cy="24" r="5" fill={accentColor} stroke="none" />
                <path
                    d="M22 24L23.5 25.5L26.5 22.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

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
