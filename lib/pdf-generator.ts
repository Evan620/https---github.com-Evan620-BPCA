import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Violation {
    requirement: string
    details: string
    status: string
    code_reference: string
    recommendation?: string
}

interface ReportData {
    overall_assessment: {
        compliance_score: number
        summary: string
    }
    violations: Violation[]
    warnings?: Violation[]
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

    // Compliance Score Section
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Compliance Score', 20, 50)

    const score = reportData.overall_assessment?.compliance_score || 0
    doc.setFontSize(40)
    const scoreColor = score >= 90 ? [34, 197, 94] : score >= 70 ? [234, 179, 8] : [239, 68, 68]
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    doc.text(`${score}%`, 20, 70)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    // Summary
    if (reportData.overall_assessment?.summary) {
        doc.text('Summary:', 20, 85)
        const summaryLines = doc.splitTextToSize(reportData.overall_assessment.summary, 170)
        doc.text(summaryLines, 20, 92)
    }

    // Violations Summary
    const allIssues = [...(reportData.violations || []), ...(reportData.warnings || [])]
    const criticalCount = allIssues.filter(v => v.status === 'VIOLATION').length
    const warningCount = allIssues.filter(v => v.status === 'WARNING').length

    let yPos = reportData.overall_assessment?.summary ? 110 : 95

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

        const tableData = allIssues.map((issue, index) => [
            `${index + 1}`,
            issue.status === 'VIOLATION' ? 'Critical' : 'Warning',
            issue.requirement || 'N/A',
            issue.code_reference || 'N/A',
            issue.details || 'N/A',
            issue.recommendation || 'N/A'
        ])

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
