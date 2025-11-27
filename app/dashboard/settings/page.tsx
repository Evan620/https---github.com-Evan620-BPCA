"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Webhook, Link2, Info, Loader2, Check, X, TestTube } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
    const router = useRouter()
    const supabase = createClient()
    const [webhookUrl, setWebhookUrl] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }

        const { data } = await supabase
            .from("settings")
            .select("n8n_webhook_url")
            .eq("user_id", user.id)
            .maybeSingle()

        if (data?.n8n_webhook_url) {
            setWebhookUrl(data.n8n_webhook_url)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveSuccess(false)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase
                .from("settings")
                .upsert({
                    user_id: user.id,
                    n8n_webhook_url: webhookUrl,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                })

            if (error) {
                // Fallback: If upsert fails with conflict, try explicit update
                if (error.code === '23505') {
                    const { error: updateError } = await supabase
                        .from("settings")
                        .update({
                            n8n_webhook_url: webhookUrl,
                            updated_at: new Date().toISOString()
                        })
                        .eq("user_id", user.id)

                    if (updateError) throw updateError
                } else {
                    throw error
                }
            }

            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (error) {
            console.error("Error saving settings:", error)
            alert("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    const handleTest = async () => {
        if (!webhookUrl) {
            setTestResult({ success: false, message: "Please enter a webhook URL first" })
            return
        }

        setIsTesting(true)
        setTestResult(null)

        try {
            const testPayload = {
                analysisId: "test-analysis-id",
                pdfUrl: "https://example.com/test.pdf",
                selectedCodes: ["IBC 2021", "NFPA 101"],
                callbackUrl: `${window.location.origin}/api/webhooks/analysis-update`,
                test: true
            }

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(testPayload),
            })

            if (response.ok) {
                setTestResult({
                    success: true,
                    message: "Webhook test successful! Your n8n workflow received the test data."
                })
            } else {
                setTestResult({
                    success: false,
                    message: `Webhook returned ${response.status}: ${response.statusText}`
                })
            }
        } catch (error) {
            setTestResult({
                success: false,
                message: error instanceof Error ? error.message : "Failed to connect to webhook"
            })
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Configure your application settings and integrations
                </p>
            </div>

            <Separator />

            {/* n8n Integration Card */}
            <Card className="border-2">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Webhook className="h-5 w-5 text-primary" />
                        <CardTitle>n8n Integration</CardTitle>
                    </div>
                    <CardDescription>
                        Connect your n8n workflow to process building plan analyses
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="webhook-url" className="text-base">
                            Webhook URL
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Link2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="webhook-url"
                                    type="url"
                                    placeholder="https://your-n8n-instance.com/webhook/..."
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    className="pl-10 h-11 text-base"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Enter your n8n webhook URL that will receive analysis requests
                        </p>
                    </div>

                    {/* Test Result */}
                    {testResult && (
                        <div className={`flex items-start gap-3 p-4 rounded-lg border ${testResult.success
                            ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                            : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                            }`}>
                            {testResult.success ? (
                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            ) : (
                                <X className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${testResult.success
                                    ? "text-green-900 dark:text-green-100"
                                    : "text-red-900 dark:text-red-100"
                                    }`}>
                                    {testResult.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleTest}
                            disabled={isTesting || !webhookUrl}
                            variant="outline"
                            className="flex-1"
                        >
                            {isTesting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <TestTube className="mr-2 h-4 w-4" />
                                    Test Webhook
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !webhookUrl}
                            className="flex-1"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : saveSuccess ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Saved!
                                </>
                            ) : (
                                "Save Settings"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Setup Guide Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        <CardTitle>Setup Instructions</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                1
                            </span>
                            <p className="text-muted-foreground">
                                Create a webhook trigger in your n8n workflow
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                2
                            </span>
                            <p className="text-muted-foreground">
                                Copy the webhook URL from n8n and paste it above
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                3
                            </span>
                            <p className="text-muted-foreground">
                                Click "Test Webhook" to verify the connection
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                4
                            </span>
                            <p className="text-muted-foreground">
                                Configure your n8n workflow to process the analysis and send results back
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
