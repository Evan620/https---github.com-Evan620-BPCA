"use client"

import { LoadingScreen } from "@/components/analysis/loading-screen"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AnalysisLoadingPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    const projectId = params.id as string
    const analysisId = searchParams.get("analysisId")

    const [currentStatus, setCurrentStatus] = useState<"uploading" | "processing" | "analyzing" | "generating" | "completed" | "failed">("uploading")

    useEffect(() => {
        if (!analysisId) {
            router.push(`/dashboard/project/${projectId}`)
            return
        }

        // Subscribe to analysis status changes
        const channel = supabase
            .channel(`analysis-${analysisId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'analyses',
                    filter: `id=eq.${analysisId}`
                },
                (payload) => {
                    const newStatus = (payload.new as any).status
                    setCurrentStatus(newStatus)

                    if (newStatus === "completed") {
                        // Wait a moment to show completion, then redirect
                        setTimeout(() => {
                            router.push(`/dashboard/project/${projectId}/analysis/${analysisId}`)
                        }, 2000)
                    } else if (newStatus === "failed") {
                        // Show error and redirect back
                        setTimeout(() => {
                            alert("Analysis failed. Please try again.")
                            router.push(`/dashboard/project/${projectId}`)
                        }, 2000)
                    } else {
                        setCurrentStatus(newStatus as any)
                    }
                }
            )
            .subscribe()

        // Polling fallback in case Realtime doesn't work
        const pollInterval = setInterval(async () => {
            const { data, error } = await supabase
                .from('analyses')
                .select('status')
                .eq('id', analysisId)
                .single()

            console.log('Polling analysis status:', { analysisId, status: data?.status, error })

            if (data?.status === 'completed') {
                console.log('Analysis completed! Redirecting...')
                clearInterval(pollInterval)
                setCurrentStatus('completed')
                setTimeout(() => {
                    router.push(`/dashboard/project/${projectId}/analysis/${analysisId}`)
                }, 2000)
            } else if (data?.status === 'failed') {
                clearInterval(pollInterval)
                setCurrentStatus('failed')
                setTimeout(() => {
                    alert("Analysis failed. Please try again.")
                    router.push(`/dashboard/project/${projectId}`)
                }, 2000)
            }
        }, 3000) // Poll every 3 seconds

        return () => {
            supabase.removeChannel(channel)
            clearInterval(pollInterval)
        }
    }, [analysisId, projectId, router, supabase])

    return <LoadingScreen status={currentStatus} />
}
