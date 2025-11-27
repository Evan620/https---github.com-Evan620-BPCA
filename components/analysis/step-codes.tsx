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
        // United States
        {
            id: "ibc-2021",
            name: "International Building Code (IBC) 2021",
            description: "General building safety, fire, and egress standards.",
            region: "🇺🇸 United States"
        },
        {
            id: "nfpa-101",
            name: "NFPA 101: Life Safety Code",
            description: "Fire protection and occupant safety standards.",
            region: "🇺🇸 United States"
        },
        // Australia
        {
            id: "ncc-2022-vol1",
            name: "National Construction Code (NCC) 2022 - Volume 1",
            description: "Commercial and multi-residential building standards.",
            region: "🇦🇺 Australia"
        },
        {
            id: "as-1428-1",
            name: "Australian Standard AS 1428.1",
            description: "Design for access and mobility (accessibility).",
            region: "🇦🇺 Australia"
        },
        // United Kingdom
        {
            id: "uk-part-b",
            name: "UK Building Regulations - Part B (Fire Safety)",
            description: "Fire safety requirements for buildings.",
            region: "🇬🇧 United Kingdom"
        },
        {
            id: "uk-part-m",
            name: "UK Building Regulations - Part M (Access)",
            description: "Access to and use of buildings.",
            region: "🇬🇧 United Kingdom"
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
                            <div className="grid gap-1.5 leading-none flex-1">
                                <div className="flex items-center gap-2">
                                    <Label
                                        htmlFor={code.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {code.name}
                                    </Label>
                                    <span className="text-xs text-muted-foreground">
                                        {code.region}
                                    </span>
                                </div>
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
