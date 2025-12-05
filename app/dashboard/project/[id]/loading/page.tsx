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
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        if (!analysisId) {
            router.push(`/dashboard/project/${projectId}`)
            return
        }

        const fetchErrorAndFail = async () => {
            // Fetch the report to get the error message
            const { data: report } = await supabase
                .from('reports')
                .select('json_report')
                .eq('analysis_id', analysisId)
                .single()

            if (report?.json_report?.error) {
                setErrorMessage(report.json_report.error)
            }
            setCurrentStatus('failed')
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
                async (payload) => {
                    const newStatus = (payload.new as any).status

                    if (newStatus === "completed") {
                        setCurrentStatus('completed')
                        // Wait a moment to show completion, then redirect
                        setTimeout(() => {
                            const showFeedback = searchParams.get("showFeedback")
                            router.push(`/dashboard/project/${projectId}/analysis/${analysisId}${showFeedback ? "?showFeedback=true" : ""}`)
                        }, 2000)
                    } else if (newStatus === "failed") {
                        await fetchErrorAndFail()
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
                    const showFeedback = searchParams.get("showFeedback")
                    router.push(`/dashboard/project/${projectId}/analysis/${analysisId}${showFeedback ? "?showFeedback=true" : ""}`)
                }, 2000)
            } else if (data?.status === 'failed') {
                clearInterval(pollInterval)
                await fetchErrorAndFail()
            }
        }, 3000) // Poll every 3 seconds

        return () => {
            supabase.removeChannel(channel)
            clearInterval(pollInterval)
        }
    }, [analysisId, projectId, router, supabase])

    return <LoadingScreen status={currentStatus} error={errorMessage} projectId={projectId} />
}
