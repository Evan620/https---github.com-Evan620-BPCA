"use client"

import { Search, Bell, User, Settings, LogOut, Home } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/dashboard')}
                    className="shrink-0"
                >
                    <Home className="h-5 w-5" />
                </Button>
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
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                </Button>

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
                        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
