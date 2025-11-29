import jsPDF from 'jspdf'

interface ReportData {
    summary?: {
        overall_compliance?: boolean
        non_compliant_clauses?: string[]
        compliance_score?: number
    }
    [key: string]: any // Allow dynamic keys for regulations
}

export function generateComplianceReport(reportData: ReportData, projectName: string = "Building Plan"): jsPDF {
    const doc = new jsPDF()
    let yPos = 0

    // Colors
    const colors = {
        primary: [30, 58, 138], // Deep Blue
        secondary: [71, 85, 105], // Slate 600
        success: [22, 163, 74], // Green 600
        danger: [220, 38, 38], // Red 600
        warning: [202, 138, 4], // Yellow 600
        neutral: [100, 116, 139], // Slate 500
        light: [241, 245, 249], // Slate 100
        white: [255, 255, 255]
    }

    // Helper to check page break
    const checkPageBreak = (heightNeeded: number) => {
        if (yPos + heightNeeded > 280) {
            doc.addPage()
            yPos = 20
            return true
        }
        return false
    }

    // --- Header ---
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Compliance Analysis Report', 20, 20)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Project: ${projectName}`, 20, 30)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 30, { align: 'right' })

    yPos = 55

    // Parse Report Data
    let complianceScore = 0;
    let summaryText = "";
    const regulations: any[] = [];

    // Extract compliance score
    if (reportData.summary && typeof reportData.summary.compliance_score === 'number') {
        complianceScore = reportData.summary.compliance_score;
    } else {
        let totalItems = 0;
        let compliantItems = 0;
        Object.entries(reportData).forEach(([key, value]: [string, any]) => {
            if (key === 'summary' || key === 'disclaimer') return;
            if (typeof value === 'object' && value !== null && 'compliant' in value) {
                totalItems++;
                if (value.compliant === true) compliantItems++;
            }
        });
        complianceScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
    }

    // Extract summary
    if (reportData.summary) {
        const isCompliant = reportData.summary.overall_compliance;
        const nonCompliantList = reportData.summary.non_compliant_clauses || [];
        summaryText = `Overall Compliance: ${isCompliant ? 'YES' : 'NO'}`;
        if (nonCompliantList.length > 0) {
            summaryText += `\nIssues Found: ${nonCompliantList.length} clauses require attention.`;
        }
    }

    // Collect regulations
    Object.entries(reportData).forEach(([key, value]: [string, any]) => {
        if (key === 'summary' || key === 'disclaimer') return;
        if (typeof value === 'object' && value !== null && 'compliant' in value) {
            regulations.push({ key, ...value });
        }
    });

    // --- Score Section ---
    doc.setFontSize(14)
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
    doc.setFont('helvetica', 'bold')
    doc.text('OVERALL SCORE', 20, yPos)

    // Score Circle/Value
    const scoreColor = complianceScore >= 90 ? colors.success : complianceScore >= 70 ? colors.warning : colors.danger
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    doc.setFontSize(48)
    doc.setFont('helvetica', 'bold')
    doc.text(`${complianceScore}%`, 20, yPos + 15)

    // Summary Text next to score
    if (summaryText) {
        doc.setFontSize(10)
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
        doc.setFont('helvetica', 'normal')
        const summaryLines = doc.splitTextToSize(summaryText, 120)
        doc.text(summaryLines, 80, yPos + 5)
    }

    yPos += 35

    // --- Detailed Findings ---
    doc.setFontSize(14)
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    doc.setFont('helvetica', 'bold')
    doc.text('DETAILED FINDINGS', 20, yPos)
    yPos += 10

    regulations.forEach((reg) => {
        // Calculate approximate height needed
        let heightNeeded = 30 // Base padding + header
        const descLines = reg.description ? doc.splitTextToSize(reg.description, 160).length * 5 : 0
        const commentLines = reg.comment ? doc.splitTextToSize(reg.comment, 160).length * 5 : 0
        const recLines = (reg.recommendation && !reg.compliant) ? doc.splitTextToSize(reg.recommendation, 160).length * 5 : 0
        const extraLines = 20 // For other fields
        heightNeeded += descLines + commentLines + recLines + extraLines

        checkPageBreak(heightNeeded)

        // Card Background
        doc.setFillColor(colors.light[0], colors.light[1], colors.light[2])
        doc.roundedRect(15, yPos, 180, heightNeeded, 3, 3, 'F')

        let cardY = yPos + 10

        // Regulation Title & Status Badge
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(reg.key, 25, cardY)

        // Status Badge
        let statusColor = colors.neutral
        let statusText = "NOT ASSESSED"
        if (reg.compliant === true) {
            statusColor = colors.success
            statusText = "COMPLIANT"
        } else if (reg.compliant === false) {
            statusColor = colors.danger
            statusText = "NON-COMPLIANT"
        }

        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
        doc.roundedRect(140, cardY - 5, 45, 8, 2, 2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(statusText, 162.5, cardY, { align: 'center' })

        cardY += 10

        // Content
        doc.setFontSize(9)
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])

        if (reg.description) {
            doc.setFont('helvetica', 'bold')
            doc.text("Description:", 25, cardY)
            doc.setFont('helvetica', 'normal')
            const lines = doc.splitTextToSize(reg.description, 130)
            doc.text(lines, 50, cardY)
            cardY += lines.length * 5
        }

        if (reg.required) {
            doc.setFont('helvetica', 'bold')
            doc.text("Required:", 25, cardY)
            doc.setFont('helvetica', 'normal')
            const lines = doc.splitTextToSize(reg.required, 130)
            doc.text(lines, 50, cardY)
            cardY += lines.length * 5
        }

        if (reg.proposed) {
            doc.setFont('helvetica', 'bold')
            doc.text("Proposed:", 25, cardY)
            doc.setFont('helvetica', 'normal')
            const val = typeof reg.proposed === 'object' ? JSON.stringify(reg.proposed) : String(reg.proposed)
            const lines = doc.splitTextToSize(val, 130)
            doc.text(lines, 50, cardY)
            cardY += lines.length * 5
        }

        if (reg.comment) {
            doc.setFont('helvetica', 'bold')
            doc.text("Analysis:", 25, cardY)
            doc.setFont('helvetica', 'normal')
            const lines = doc.splitTextToSize(reg.comment, 130)
            doc.text(lines, 50, cardY)
            cardY += lines.length * 5
        }

        if (reg.recommendation && reg.compliant === false) {
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2])
            doc.text("Action Required:", 25, cardY)
            doc.setFont('helvetica', 'normal')
            const lines = doc.splitTextToSize(reg.recommendation, 130)
            doc.text(lines, 55, cardY)
            cardY += lines.length * 5
        }

        yPos += heightNeeded + 5
    })

    // Disclaimer
    checkPageBreak(30)
    yPos += 10
    doc.setDrawColor(colors.neutral[0], colors.neutral[1], colors.neutral[2])
    doc.line(20, yPos, 190, yPos)
    yPos += 5

    const disclaimer = "This report is generated by an automated tool and is intended for preliminary compliance review only. It does not replace the professional judgement of a registered building surveyor.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, 170)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(colors.neutral[0], colors.neutral[1], colors.neutral[2])
    doc.text(disclaimerLines, 20, yPos)

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(colors.neutral[0], colors.neutral[1], colors.neutral[2])
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        )
    }

    return doc
}

export function downloadComplianceReport(reportData: ReportData, projectName: string = "Building Plan") {
    const doc = generateComplianceReport(reportData, projectName)
    const fileName = `compliance-report-${projectName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
    doc.save(fileName)
}
