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
                // Prioritize NEXT_PUBLIC_APP_URL, then VERCEL_URL, then localhost
                callbackUrl: (() => {
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
                    const url = `${baseUrl}/api/webhooks/analysis-update`;
                    console.log('🔗 Generated Callback URL:', url); // Debug log
                    return url;
                })(),
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
