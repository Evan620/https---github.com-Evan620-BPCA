import { BlueprintBackground } from "@/components/ui/blueprint-background";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen items-center justify-center p-4">
            <BlueprintBackground />
            <div className="w-full max-w-md space-y-8">{children}</div>
        </div>
    );
}
