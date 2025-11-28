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
    let yPos = 20

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Building Plan Compliance Report', 105, yPos, { align: 'center' })
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Project: ${projectName}`, 105, yPos, { align: 'center' })
    yPos += 6
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' })
    yPos += 15

    // Parse Report Data
    let complianceScore = 0;
    let summaryText = "";
    const regulations: any[] = [];

    // Extract compliance score
    if (reportData.summary && typeof reportData.summary.compliance_score === 'number') {
        complianceScore = reportData.summary.compliance_score;
    } else {
        // Calculate score
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
            summaryText += `\nNon-compliant clauses: ${nonCompliantList.join(', ')}`;
        }
    }

    // Collect all regulations
    Object.entries(reportData).forEach(([key, value]: [string, any]) => {
        if (key === 'summary' || key === 'disclaimer') return;
        if (typeof value === 'object' && value !== null && 'compliant' in value) {
            regulations.push({ key, ...value });
        }
    });

    // Compliance Score Section
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Compliance Score', 20, yPos)
    yPos += 10

    const score = complianceScore
    doc.setFontSize(40)
    const scoreColor = score >= 90 ? [34, 197, 94] : score >= 70 ? [234, 179, 8] : [239, 68, 68]
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    doc.text(`${score}%`, 20, yPos)
    yPos += 15

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    // Summary
    if (summaryText) {
        const summaryLines = doc.splitTextToSize(summaryText, 170)
        doc.text(summaryLines, 20, yPos)
        yPos += summaryLines.length * 5 + 10
    }

    // Regulations in text format
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Detailed Findings', 20, yPos)
    yPos += 10

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    regulations.forEach((reg) => {
        // Check if we need a new page
        if (yPos > 270) {
            doc.addPage()
            yPos = 20
        }

        // Regulation header
        doc.setFont('helvetica', 'bold')
        doc.text(`=== ${reg.key} ===`, 20, yPos)
        yPos += 5

        doc.setFont('helvetica', 'normal')

        // Compliant status
        let compliantText = 'Not assessed';
        if (reg.compliant === true) compliantText = 'Yes';
        else if (reg.compliant === false) compliantText = 'No';

        doc.text(`Compliant: ${compliantText}`, 20, yPos)
        yPos += 5

        // Description
        if (reg.description) {
            const descLines = doc.splitTextToSize(`description: ${reg.description}`, 170)
            doc.text(descLines, 20, yPos)
            yPos += descLines.length * 4
        }

        // Required
        if (reg.required) {
            const reqLines = doc.splitTextToSize(`required: ${reg.required}`, 170)
            doc.text(reqLines, 20, yPos)
            yPos += reqLines.length * 4
        }

        // Proposed
        if (reg.proposed) {
            const propText = typeof reg.proposed === 'object' ? JSON.stringify(reg.proposed) : reg.proposed;
            const propLines = doc.splitTextToSize(`proposed: ${propText}`, 170)
            doc.text(propLines, 20, yPos)
            yPos += propLines.length * 4
        }

        // Additional measurements (if any)
        const excludeKeys = ['compliant', 'description', 'required', 'proposed', 'comment', 'severity', 'recommendation', 'key'];
        Object.entries(reg).forEach(([key, value]) => {
            if (!excludeKeys.includes(key) && value !== null && value !== undefined) {
                const valueText = typeof value === 'object' ? JSON.stringify(value) : String(value);
                const lines = doc.splitTextToSize(`${key}: ${valueText}`, 170)
                doc.text(lines, 20, yPos)
                yPos += lines.length * 4
            }
        });

        // Comment
        if (reg.comment) {
            const commentLines = doc.splitTextToSize(`comment: ${reg.comment}`, 170)
            doc.text(commentLines, 20, yPos)
            yPos += commentLines.length * 4
        }

        // Recommendation (if non-compliant)
        if (reg.recommendation && reg.compliant !== true) {
            const recLines = doc.splitTextToSize(`recommendation: ${reg.recommendation}`, 170)
            doc.text(recLines, 20, yPos)
            yPos += recLines.length * 4
        }

        yPos += 5 // Space between regulations
    });

    // Disclaimer
    if (yPos > 250) {
        doc.addPage()
        yPos = 20
    }

    yPos += 10
    const disclaimer = "This report is generated by an automated tool and is intended for preliminary compliance review only. It does not replace the professional judgement of a registered building surveyor.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, 170)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.text(disclaimerLines, 20, yPos)

    // Footer on all pages
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.setFont('helvetica', 'normal')
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
