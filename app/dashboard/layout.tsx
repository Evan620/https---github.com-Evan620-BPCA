import { FoldersPanel } from "@/components/dashboard/folders-panel"
import { TopBar } from "@/components/dashboard/top-bar"
import { BlueprintBackground } from "@/components/ui/blueprint-background"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-screen overflow-hidden relative">
            <BlueprintBackground />
            <TopBar />
            <div className="flex flex-1 overflow-hidden z-10">
                <aside className="w-64 hidden md:block">
                    <FoldersPanel className="h-full" />
                </aside>
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
