import Link from "next/link"
import { ArrowLeft, Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const pricingPlans = [
    {
        name: "Starter",
        price: "$20",
        credits: 500,
        analyses: 20,
        features: [
            "500 credits",
            "20 compliance analyses",
            "All building codes",
            "PDF reports",
            "Email support"
        ],
        popular: false
    },
    {
        name: "Professional",
        price: "$50",
        credits: 1500,
        analyses: 60,
        features: [
            "1,500 credits",
            "60 compliance analyses",
            "All building codes",
            "PDF reports",
            "Priority email support",
            "Advanced analytics"
        ],
        popular: true
    },
    {
        name: "Enterprise",
        price: "$150",
        credits: 5000,
        analyses: 200,
        features: [
            "5,000 credits",
            "200 compliance analyses",
            "All building codes",
            "PDF reports",
            "Priority support",
            "Advanced analytics",
            "Custom integrations",
            "Dedicated account manager"
        ],
        popular: false
    }
]

export default function UpgradePage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-7xl mx-auto px-4 py-12">
                <Link href="/dashboard">
                    <Button variant="ghost" className="mb-8">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Upgrade Your Plan</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Get more credits to run additional compliance analyses. Choose the plan that fits your needs.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pricingPlans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <CardHeader className="text-center pb-8 pt-8">
                                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                                <div className="mb-4">
                                    <span className="text-5xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground ml-2">one-time</span>
                                </div>
                                <CardDescription className="text-base">
                                    {plan.credits.toLocaleString()} credits • {plan.analyses} analyses
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.popular ? "default" : "outline"}
                                    size="lg"
                                >
                                    Get {plan.name}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Need a custom plan?</h2>
                    <p className="text-muted-foreground mb-6">
                        Contact us for enterprise solutions and volume discounts
                    </p>
                    <Button variant="outline" size="lg">
                        Contact Sales
                    </Button>
                </div>

                <div className="mt-16 max-w-3xl mx-auto">
                    <h3 className="text-xl font-semibold mb-6 text-center">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-medium mb-2">How do credits work?</h4>
                            <p className="text-sm text-muted-foreground">
                                Each compliance analysis costs 25 credits. Credits never expire and can be used anytime.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">What happens if my analysis fails?</h4>
                            <p className="text-sm text-muted-foreground">
                                If an analysis fails due to a system error, your credits will be automatically refunded.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Can I upgrade later?</h4>
                            <p className="text-sm text-muted-foreground">
                                Yes! You can purchase additional credits at any time. Credits are cumulative and never expire.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
