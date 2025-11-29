"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { AuthForm } from "@/components/auth/auth-form";
import { createClient } from "@/lib/supabase/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
            password: values.password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        // Password updated successfully, redirect to login
        router.push("/login?message=Password updated successfully");
    }

    return (
        <Card className="w-full border-zinc-200 shadow-lg dark:border-zinc-800">
            <CardHeader className="space-y-1 flex flex-col items-center">
                <Logo className="mb-4" />
                <CardTitle className="text-2xl font-bold tracking-tight">
                    Reset your password
                </CardTitle>
                <CardDescription>
                    Enter your new password below
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <AuthForm
                    schema={resetPasswordSchema}
                    defaultValues={{ password: "", confirmPassword: "" }}
                    onSubmit={onSubmit}
                    fields={[
                        {
                            name: "password",
                            label: "New Password",
                            type: "password",
                            placeholder: "Enter new password",
                        },
                        {
                            name: "confirmPassword",
                            label: "Confirm Password",
                            type: "password",
                            placeholder: "Confirm new password",
                        },
                    ]}
                    submitText="Reset Password"
                    isLoading={isLoading}
                />
                {error && (
                    <div className="text-sm text-red-500 dark:text-red-400">{error}</div>
                )}
            </CardContent>
        </Card>
    );
}
