"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export function PageLoadingIndicator() {
    const pathname = usePathname()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        const timeout = setTimeout(() => setLoading(false), 300)
        return () => clearTimeout(timeout)
    }, [pathname])

    if (!loading) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20">
            <div className="h-full bg-primary animate-[loading_1s_ease-in-out_infinite]" style={{
                width: '30%',
                animation: 'loading 1s ease-in-out infinite'
            }} />
            <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
        </div>
    )
}
