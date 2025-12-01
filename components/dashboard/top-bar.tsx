"use client"

import { Search, User, LogOut, Home, MessageSquare, Mail } from "lucide-react"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"


export function TopBar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [userEmail, setUserEmail] = useState<string>("")
    const [userName, setUserName] = useState<string>("")
    const [credits, setCredits] = useState<number | null>(null)
    const [feedbackOpen, setFeedbackOpen] = useState(false)

    useEffect(() => {
        loadUser()
    }, [])

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUserEmail(user.email || "")
            // Extract name from email (before @) or use user metadata if available
            const name = user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0] ||
                "User"
            setUserName(name)

            // Fetch user credits
            const { data: creditsData } = await supabase
                .from("user_credits")
                .select("credits")
                .eq("user_id", user.id)
                .single()

            if (creditsData) {
                setCredits(creditsData.credits)
            }
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
                <div
                    className="cursor-pointer hover:opacity-80 transition-opacity mr-4"
                    onClick={() => router.push('/dashboard')}
                >
                    <Logo />
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search projects..."
                        className="pl-9 bg-muted/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {credits !== null && (
                    <div className="hidden md:flex items-center gap-2 mr-2">
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border cursor-pointer hover:opacity-80 transition-opacity ${credits < 25
                                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                : "bg-primary/10 text-primary border-primary/20"
                                }`}
                            onClick={() => router.push("/dashboard/upgrade")}
                        >
                            <span className="text-lg">⚡</span>
                            <span>{credits} credits</span>
                        </div>
                        {credits < 25 && (
                            <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-xs"
                                onClick={() => router.push("/dashboard/upgrade")}
                            >
                                Upgrade
                            </Button>
                        )}
                    </div>
                )}



                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatars/01.png" alt={userName} />
                                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {userEmail}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/dashboard/upgrade")}>
                            <span className="mr-2">⚡</span>
                            <span>Upgrade Plan</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Feedback</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = 'mailto:hello@buildcompliancevault.com'}>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Contact / Request Feature</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <FeedbackDialog
                    defaultEmail={userEmail}
                    open={feedbackOpen}
                    onOpenChange={setFeedbackOpen}
                />
            </div>
        </div>
    )
}
