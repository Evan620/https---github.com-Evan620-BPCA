"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight } from "lucide-react"

interface StepCodesProps {
    selectedCodes: string[]
    onCodeToggle: (codeId: string) => void
}

export function StepCodes({ selectedCodes, onCodeToggle }: StepCodesProps) {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

    const regions = [
        {
            id: "australia",
            name: "Australia",
            flag: "🇦🇺",
            description: "National Construction Code and Victorian Regulations"
        },
        {
            id: "uk",
            name: "United Kingdom",
            flag: "🇬🇧",
            description: "Approved Documents and Building Regulations"
        },
        {
            id: "usa",
            name: "United States",
            flag: "🇺🇸",
            description: "International Building Code (IBC) and Residential Code (IRC)"
        }
    ]

    const allCodes = {
        australia: [
            {
                id: "victorian-building-regs-2018-part5",
                name: "Part 5 – Siting (SI-01)",
                description: "Siting requirements for single dwellings, associated buildings and fences.",
                region: "🇦🇺 Australia"
            },
            {
                id: "si-02",
                name: "SI-02 – Building Envelopes",
                description: "Regulations concerning building envelopes and setbacks.",
                region: "🇦🇺 Australia"
            },
            {
                id: "si-03",
                name: "SI-03 – Small Second Dwellings",
                description: "Requirements for small second dwellings on a lot.",
                region: "🇦🇺 Australia"
            },
            {
                id: "bp-01",
                name: "BP-01 – When Is a Building Permit Required?",
                description: "Guidelines on when a building permit is necessary.",
                region: "🇦🇺 Australia"
            },
            {
                id: "ncc-2022",
                name: "NCC 2022 - National Construction Code",
                description: "National Construction Code Volume One for commercial and multi-residential buildings.",
                region: "🇦🇺 Australia"
            }
        ],
        uk: [
            {
                id: "uk-building-regs-2010",
                name: "UK Building Regulations 2010 - Approved Documents",
                description: "Complete merged approved documents covering all aspects of building regulations.",
                region: "🇬🇧 United Kingdom"
            }
        ],
        usa: [
            {
                id: "irc-2021",
                name: "IRC 2021 - International Residential Code",
                description: "Comprehensive residential building code for one and two-family dwellings.",
                region: "🇺🇸 United States"
            },
            {
                id: "ibc-2021",
                name: "IBC 2021 - International Building Code",
                description: "General building safety, fire, and egress standards for all building types.",
                region: "🇺🇸 United States"
            }
        ]
    }

    const currentCodes = selectedRegion ? allCodes[selectedRegion as keyof typeof allCodes] : []

    if (!selectedRegion) {
        return (
            <div className="space-y-4">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium">Select Region</h3>
                    <p className="text-sm text-muted-foreground">
                        Choose the geographical location for your project.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4">
                    {regions.map((region) => (
                        <button
                            key={region.id}
                            onClick={() => setSelectedRegion(region.id)}
                            className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                        >
                            <span className="text-2xl">{region.flag}</span>
                            <div className="space-y-1">
                                <h4 className="font-medium leading-none">{region.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {region.description}
                                </p>
                            </div>
                            <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRegion(null)}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Regions
                </Button>
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Select Building Codes</h3>
                <p className="text-sm text-muted-foreground">
                    Choose compliance standards for {regions.find(r => r.id === selectedRegion)?.name}.
                </p>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-4">
                    {currentCodes.map((code) => (
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
