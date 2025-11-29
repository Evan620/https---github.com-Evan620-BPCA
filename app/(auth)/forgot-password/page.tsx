"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Logo } from "@/components/ui/logo";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
            redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setIsLoading(false);
    }

    return (
        <Card className="w-full border-zinc-200 shadow-lg dark:border-zinc-800">
            <CardHeader className="space-y-1 flex flex-col items-center">
                <Logo className="mb-4" />
                <CardTitle className="text-2xl font-bold tracking-tight">
                    Forgot password
                </CardTitle>
                <CardDescription>
                    Enter your email address and we will send you a link to reset your
                    password
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {success ? (
                    <div className="text-sm text-green-600 dark:text-green-400">
                        Check your email for the reset link.
                    </div>
                ) : (
                    <AuthForm
                        schema={forgotPasswordSchema}
                        defaultValues={{ email: "" }}
                        onSubmit={onSubmit}
                        fields={[
                            {
                                name: "email",
                                label: "Email",
                                type: "email",
                                placeholder: "name@example.com",
                            },
                        ]}
                        submitText="Send Reset Link"
                        isLoading={isLoading}
                    />
                )}
                {error && (
                    <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
                )}
            </CardContent>
            <CardFooter>
                <div className="text-sm text-muted-foreground">
                    Remember your password?{" "}
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
