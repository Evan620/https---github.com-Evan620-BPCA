"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { AuthForm } from "@/components/auth/auth-form";
import { createClient } from "@/lib/supabase/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    async function onSubmit(values: z.infer<typeof signupSchema>) {
        if (!termsAccepted) {
            setError("You must accept the terms and conditions");
            return;
        }

        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                data: {
                    full_name: values.name,
                },
            },
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        // Auto-login or redirect to dashboard
        router.push("/dashboard");
        router.refresh();
    }

    return (
        <Card className="w-full border-zinc-200 shadow-lg dark:border-zinc-800">
            <CardHeader className="space-y-1 flex flex-col items-center">
                <Logo className="mb-4" />
                <CardTitle className="text-2xl font-bold tracking-tight">
                    Create an account
                </CardTitle>
                <CardDescription>
                    Enter your email below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <AuthForm
                    schema={signupSchema}
                    defaultValues={{ name: "", email: "", password: "" }}
                    onSubmit={onSubmit}
                    fields={[
                        {
                            name: "name",
                            label: "Name",
                            type: "text",
                            placeholder: "John Doe",
                        },
                        {
                            name: "email",
                            label: "Email",
                            type: "email",
                            placeholder: "name@example.com",
                        },
                        {
                            name: "password",
                            label: "Password",
                            type: "password",
                            placeholder: "••••••••",
                        },
                    ]}
                    submitText="Sign Up"
                    isLoading={isLoading}
                />
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm font-normal">
                        I accept the{" "}
                        <Link href="/terms" className="underline hover:text-primary">
                            terms and conditions
                        </Link>
                    </Label>
                </div>
                {error && (
                    <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
                )}
            </CardContent>
            <CardFooter>
                <div className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Sign in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
