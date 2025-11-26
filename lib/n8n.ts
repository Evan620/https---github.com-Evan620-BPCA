import { getN8nWebhookUrl } from "./settings"

export async function triggerAnalysisWorkflow(analysisId: string, pdfUrl: string, selectedCodes: string[]) {
    const webhookUrl = await getN8nWebhookUrl()

    if (!webhookUrl) {
        throw new Error("n8n webhook URL is not configured. Please add it in Settings.")
    }

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                analysisId,
                pdfUrl,
                selectedCodes,
                callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/analysis-update`,
            }),
        })

        if (!response.ok) {
            throw new Error(`Failed to trigger workflow: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Error triggering analysis workflow:", error)
        throw error
    }
}
