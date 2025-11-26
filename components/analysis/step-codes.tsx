"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StepCodesProps {
    selectedCodes: string[]
    onCodeToggle: (codeId: string) => void
}

export function StepCodes({ selectedCodes, onCodeToggle }: StepCodesProps) {
    const codes = [
        {
            id: "ibc-2021",
            name: "International Building Code (IBC) 2021",
            description: "General building safety and fire prevention standards.",
        },
        {
            id: "ada-2010",
            name: "ADA Standards for Accessible Design 2010",
            description: "Accessibility requirements for public accommodations.",
        },
        {
            id: "nfpa-101",
            name: "NFPA 101: Life Safety Code",
            description: "Strategies to protect people based on building construction.",
        },
        {
            id: "iecc-2021",
            name: "International Energy Conservation Code (IECC) 2021",
            description: "Energy efficiency standards for building envelopes.",
        },
        {
            id: "ipc-2021",
            name: "International Plumbing Code (IPC) 2021",
            description: "Regulations for plumbing systems and fixtures.",
        },
    ]

    return (
        <div className="space-y-4">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Select Building Codes</h3>
                <p className="text-sm text-muted-foreground">
                    Choose which compliance standards to check against.
                </p>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-4">
                    {codes.map((code) => (
                        <div
                            key={code.id}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-muted"
                        >
                            <Checkbox
                                id={code.id}
                                checked={selectedCodes.includes(code.id)}
                                onCheckedChange={() => onCodeToggle(code.id)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor={code.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {code.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {code.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
