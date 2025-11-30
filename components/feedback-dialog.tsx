"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Star } from "lucide-react"
import { submitFeedback } from "@/lib/actions/feedback"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FeedbackDialogProps {
    defaultEmail?: string
}

export function FeedbackDialog({ defaultEmail = "" }: FeedbackDialogProps) {
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState(0)
    const [message, setMessage] = useState("")
    const [email, setEmail] = useState(defaultEmail)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (defaultEmail) {
            setEmail(defaultEmail)
        }
    }, [defaultEmail])

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating")
            return
        }

        if (!email) {
            toast.error("Please enter your email")
            return
        }

        setIsSubmitting(true)
        try {
            await submitFeedback(rating, message, email)
            toast.success("Thank you for your feedback!")
            setOpen(false)
            setRating(0)
            setMessage("")
        } catch (error) {
            toast.error("Failed to submit feedback. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Feedback</DialogTitle>
                    <DialogDescription>
                        Help us improve by sharing your experience.
                        <br />
                        <span className="text-xs mt-2 block">
                            Or email us directly at <a href="mailto:hello@buildcompliancevault.com" className="text-primary hover:underline">hello@buildcompliancevault.com</a>
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                onClick={() => setRating(value)}
                                className="focus:outline-none transition-transform hover:scale-110"
                                type="button"
                            >
                                <Star
                                    className={cn(
                                        "h-8 w-8 transition-colors",
                                        value <= rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                            id="message"
                            placeholder="Tell us what you think..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Feedback"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
