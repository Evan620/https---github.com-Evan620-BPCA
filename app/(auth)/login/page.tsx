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
import { Logo } from "@/components/ui/logo";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <Card className="w-full border-zinc-200 shadow-lg dark:border-zinc-800">
            <CardHeader className="space-y-1 flex flex-col items-center">
                <Logo className="mb-4" />
                <CardTitle className="text-2xl font-bold tracking-tight">
                    Sign in
                </CardTitle>
                <CardDescription>
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <AuthForm
                    schema={loginSchema}
                    defaultValues={{ email: "", password: "" }}
                    onSubmit={onSubmit}
                    fields={[
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
                    submitText="Sign In"
                    isLoading={isLoading}
                />
                {error && (
                    <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">
                    <Link
                        href="/forgot-password"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Forgot your password?
                    </Link>
                </div>
                <div className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
