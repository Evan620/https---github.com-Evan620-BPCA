import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto px-4 py-12">
                <Link href="/signup">
                    <Button variant="ghost" className="mb-8">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
                    <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing and using the Building Plan Compliance Analysis (BPCA) platform, you agree to be bound by these Terms and Conditions.
                            If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
                        <p className="mb-4">
                            BPCA provides AI-powered building plan compliance analysis services. Our platform analyzes building plans against selected
                            building codes and regulations to identify potential compliance issues. The service is provided "as is" and should be used
                            as a supplementary tool, not as a replacement for professional architectural or legal advice.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                        <p className="mb-4">You agree to:</p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Provide accurate and complete information when creating your account</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Use the service only for lawful purposes</li>
                            <li>Not attempt to reverse engineer, decompile, or extract the source code of our AI models</li>
                            <li>Not upload malicious files or content that violates intellectual property rights</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Limitations of Service</h2>
                        <p className="mb-4">
                            Our AI-powered analysis is designed to assist with compliance checking but should not be considered as:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Professional architectural advice</li>
                            <li>Legal counsel or official regulatory approval</li>
                            <li>A guarantee of building permit approval</li>
                            <li>A substitute for consultation with licensed professionals</li>
                        </ul>
                        <p className="mb-4">
                            Users are responsible for verifying all analysis results with qualified professionals and relevant authorities.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                        <p className="mb-4">
                            All content, features, and functionality of the BPCA platform, including but not limited to text, graphics, logos,
                            AI models, and software, are owned by BPCA and are protected by international copyright, trademark, and other
                            intellectual property laws.
                        </p>
                        <p className="mb-4">
                            You retain ownership of the building plans you upload. By uploading content, you grant BPCA a limited license to
                            process and analyze your files for the purpose of providing our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data Protection</h2>
                        <p className="mb-4">
                            We are committed to protecting your privacy. Your uploaded building plans and analysis results are stored securely
                            and are not shared with third parties except as necessary to provide our services or as required by law.
                        </p>
                        <p className="mb-4">
                            For detailed information about how we collect, use, and protect your data, please refer to our Privacy Policy.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Payment and Subscription</h2>
                        <p className="mb-4">
                            Access to certain features may require a paid subscription. By subscribing, you agree to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Pay all applicable fees as described in your chosen plan</li>
                            <li>Provide accurate billing information</li>
                            <li>Authorize automatic renewal unless you cancel before the renewal date</li>
                        </ul>
                        <p className="mb-4">
                            We reserve the right to modify pricing with 30 days' notice to existing subscribers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                        <p className="mb-4">
                            To the maximum extent permitted by law, BPCA shall not be liable for any indirect, incidental, special, consequential,
                            or punitive damages, including but not limited to loss of profits, data, or business opportunities arising from:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                            <li>Your use or inability to use the service</li>
                            <li>Any errors or inaccuracies in the analysis results</li>
                            <li>Decisions made based on our compliance reports</li>
                            <li>Unauthorized access to your data</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                        <p className="mb-4">
                            We reserve the right to suspend or terminate your account at our discretion if you violate these terms or engage
                            in fraudulent, abusive, or illegal activity. Upon termination, your right to use the service will immediately cease.
                        </p>
                        <p className="mb-4">
                            You may cancel your account at any time through your account settings.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
                        <p className="mb-4">
                            We may update these Terms and Conditions from time to time. We will notify users of significant changes via email
                            or through the platform. Continued use of the service after changes constitutes acceptance of the updated terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                        <p className="mb-4">
                            These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in
                            which BPCA operates, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                        <p className="mb-4">
                            If you have any questions about these Terms and Conditions, please contact us at:
                        </p>
                        <p className="mb-4">
                            Email: <a href="mailto:support@bpca.com" className="text-primary hover:underline">support@bpca.com</a>
                        </p>
                    </section>

                    <div className="mt-12 pt-8 border-t">
                        <p className="text-sm text-muted-foreground">
                            By using the Building Plan Compliance Analysis platform, you acknowledge that you have read, understood,
                            and agree to be bound by these Terms and Conditions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
