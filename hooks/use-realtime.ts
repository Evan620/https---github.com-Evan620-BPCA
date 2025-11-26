"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function useRealtimeSubscription(projectId?: string) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'projects',
                },
                (payload) => {
                    console.log('Project change received!', payload)
                    queryClient.invalidateQueries({ queryKey: ["projects"] })
                    if (projectId && payload.new && (payload.new as any).id === projectId) {
                        queryClient.invalidateQueries({ queryKey: ["project", projectId] })
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'analyses',
                },
                (payload) => {
                    console.log('Analysis change received!', payload)
                    if (projectId) {
                        queryClient.invalidateQueries({ queryKey: ["project-analyses", projectId] })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, queryClient, projectId])
}
