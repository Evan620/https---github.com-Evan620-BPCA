import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Violation {
    requirement?: string
    details?: string
    status?: string
    code_reference?: string
    recommendation?: string
    // New fields
    severity?: string
    regulation?: string
    description?: string
    reference_documents?: string[]
    code?: string
    compliant?: boolean | null // Track compliance status
}

interface ReportData {
    overall_assessment?: {
        compliance_score: number
        summary: string
    }
    violations?: Violation[]
    warnings?: Violation[]
    // Support for flat structure
    summary?: {
        overall_compliance?: boolean
        non_compliant_clauses?: string[]
        compliance_score?: number
    }
    [key: string]: any // Allow dynamic keys for regulations
}

export function generateComplianceReport(reportData: ReportData, projectName: string = "Building Plan"): jsPDF {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Building Plan Compliance Report', 105, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Project: ${projectName}`, 105, 28, { align: 'center' })
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 34, { align: 'center' })

    // Parse Report Data (Handle both nested and flat structures)
    let allIssues: Violation[] = [];
    let complianceScore = 0;
    let summaryText = "";

    // 1. Try to extract from nested structure (legacy/original format)
    if (reportData.violations || reportData.warnings) {
        allIssues = [...(reportData.violations || []), ...(reportData.warnings || [])];
        complianceScore = reportData.overall_assessment?.compliance_score || 0;
        summaryText = reportData.overall_assessment?.summary || "";
    }
    // 2. Try to extract from flat structure (new AI format)
    else {
        // Extract score from summary if available
        if (reportData.summary && typeof (reportData as any).summary.compliance_score === 'number') {
            complianceScore = (reportData as any).summary.compliance_score;
        } else {
            // Calculate score based on compliant vs total items
            let totalItems = 0;
            let compliantItems = 0;

            Object.entries(reportData).forEach(([key, value]: [string, any]) => {
                if (key === 'summary' || key === 'disclaimer') return;
                if (typeof value === 'object' && value !== null) {
                    totalItems++;
                    if (value.compliant === true) compliantItems++;
                }
            });

            complianceScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 0;
        }

        // Extract summary text
        if ((reportData as any).summary && (reportData as any).summary.overall_compliance !== undefined) {
            const isCompliant = (reportData as any).summary.overall_compliance;
            const nonCompliantList = (reportData as any).summary.non_compliant_clauses || [];
            summaryText = `Overall Compliance: ${isCompliant ? 'YES' : 'NO'}. \n`;
            if (nonCompliantList.length > 0) {
                summaryText += `Non-compliant clauses: ${nonCompliantList.join(', ')}`;
            }
        }

        // Iterate over keys to find ALL regulations (compliant and non-compliant)
        Object.entries(reportData).forEach(([key, value]: [string, any]) => {
            if (key === 'summary' || key === 'disclaimer') return;

            if (typeof value === 'object' && value !== null && 'compliant' in value) {
                // Add ALL regulations, not just violations
                let severity = "info"; // Default for compliant items
                let status = "COMPLIANT";

                if (value.compliant === false) {
                    if (value.severity === "CRITICAL" || value.severity === "High") {
                        severity = "CRITICAL";
                        status = "VIOLATION";
                    } else if (value.severity === "Medium") {
                        severity = "WARNING";
                        status = "WARNING";
                    } else {
                        severity = "WARNING";
                        status = "WARNING";
                    }
                } else if (value.compliant === null) {
                    severity = "WARNING";
                    status = "INSUFFICIENT_DATA";
                }

                allIssues.push({
                    requirement: key, // Use key as requirement title
                    description: value.comment || value.description || "No details provided",
                    status: status,
                    severity: severity,
                    code_reference: key,
                    recommendation: value.recommendation || (value.compliant === true ? "Compliant" : "Review compliance requirements"),
                    compliant: value.compliant // Store compliance status
                });
            }
        });
    }

    // Compliance Score Section
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Compliance Score', 20, 50)

    const score = complianceScore
    doc.setFontSize(40)
    const scoreColor = score >= 90 ? [34, 197, 94] : score >= 70 ? [234, 179, 8] : [239, 68, 68]
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    doc.text(`${score}%`, 20, 70)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    // Summary
    if (summaryText) {
        doc.text('Summary:', 20, 85)
        const summaryLines = doc.splitTextToSize(summaryText, 170)
        doc.text(summaryLines, 20, 92)
    }

    // Violations Summary
    const criticalCount = allIssues.filter(v => v.status === 'VIOLATION' || v.severity === 'CRITICAL').length
    const warningCount = allIssues.filter(v => v.status === 'WARNING' || v.severity === 'WARNING').length

    let yPos = summaryText ? 110 : 95

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Issues: ${allIssues.length}`, 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(239, 68, 68)
    doc.text(`Critical: ${criticalCount}`, 20, yPos + 7)
    doc.setTextColor(234, 179, 8)
    doc.text(`Warnings: ${warningCount}`, 60, yPos + 7)
    doc.setTextColor(0, 0, 0)

    // Violations Table
    if (allIssues.length > 0) {
        yPos += 20

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Detailed Findings', 20, yPos)

        const tableData = allIssues.map((issue, index) => {
            // Determine severity
            const isCritical = issue.status === 'VIOLATION' || issue.severity === 'CRITICAL';

            // Determine requirement/title
            const requirement = issue.requirement || issue.regulation || 'N/A';

            // Determine code reference
            let codeRef = issue.code_reference || '';
            if (!codeRef && issue.reference_documents && Array.isArray(issue.reference_documents) && issue.reference_documents.length > 0) {
                codeRef = issue.reference_documents[0];
            }
            if (!codeRef && issue.code) {
                codeRef = issue.code;
            }
            if (!codeRef) codeRef = 'N/A';

            // Determine details
            const details = issue.description || issue.details || 'N/A';

            return [
                `${index + 1}`,
                isCritical ? 'Critical' : 'Warning',
                requirement,
                codeRef,
                details,
                issue.recommendation || 'N/A'
            ];
        })

        autoTable(doc, {
            startY: yPos + 5,
            head: [['#', 'Severity', 'Requirement', 'Code Reference', 'Details', 'Recommendation']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 20 },
                2: { cellWidth: 35 },
                3: { cellWidth: 30 },
                4: { cellWidth: 45 },
                5: { cellWidth: 45 }
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                overflow: 'linebreak',
                cellWidth: 'wrap'
            },
            didParseCell: function (data) {
                if (data.column.index === 1 && data.section === 'body') {
                    if (data.cell.raw === 'Critical') {
                        data.cell.styles.textColor = [239, 68, 68]
                        data.cell.styles.fontStyle = 'bold'
                    } else if (data.cell.raw === 'Warning') {
                        data.cell.styles.textColor = [234, 179, 8]
                        data.cell.styles.fontStyle = 'bold'
                    }
                }
            }
        })
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
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
