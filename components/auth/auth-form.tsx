"use client";

import * as React from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuthFormProps {
    schema: z.ZodType<any, any, any>;
    defaultValues: any;
    onSubmit: (values: any) => Promise<void>;
    fields: {
        name: string;
        label: string;
        type: string;
        placeholder?: string;
    }[];
    submitText: string;
    isLoading?: boolean;
    className?: string;
}

export function AuthForm({
    schema,
    defaultValues,
    onSubmit,
    fields,
    submitText,
    isLoading,
    className,
}: AuthFormProps) {
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: defaultValues,
    });

    const [showPassword, setShowPassword] = React.useState<Record<string, boolean>>({});

    const togglePasswordVisibility = (fieldName: string) => {
        setShowPassword(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    return (
        <div className={cn("grid gap-6", className)}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {fields.map((field) => (
                        <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name}
                            render={({ field: formField }: { field: ControllerRenderProps<any, any> }) => (
                                <FormItem>
                                    <FormLabel>{field.label}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={field.type === "password" && showPassword[field.name] ? "text" : field.type}
                                                placeholder={field.placeholder}
                                                {...formField}
                                                disabled={isLoading}
                                                className={field.type === "password" ? "pr-10" : ""}
                                            />
                                            {field.type === "password" && (
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility(field.name)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    disabled={isLoading}
                                                >
                                                    {showPassword[field.name] ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitText}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
