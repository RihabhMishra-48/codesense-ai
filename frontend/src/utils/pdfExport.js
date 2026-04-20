import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadPDFReport(reviewResult, code, language) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const MARGIN = 15;
  let y = MARGIN;

  // Helpers
  const addPage = () => {
    pdf.addPage();
    y = MARGIN;
  };
  const checkPage = (height = 10) => {
    if (y + height > 280) addPage();
  };

  // ── Title ──
  pdf.setFillColor(10, 10, 15);
  pdf.rect(0, 0, 210, 297, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(168, 85, 247);
  pdf.text('AI CODE REVIEW REPORT', MARGIN, y);
  y += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(160, 160, 180);
  pdf.text(`Language: ${language.toUpperCase()}  |  Generated: ${new Date().toLocaleString()}`, MARGIN, y);
  y += 4;

  // Divider
  pdf.setDrawColor(168, 85, 247);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, W - MARGIN, y);
  y += 8;

  // ── Score ──
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(168, 85, 247);
  pdf.text(`Quality Score: ${reviewResult.score}/10`, MARGIN, y);
  y += 6;

  if (reviewResult.summary) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(200, 200, 220);
    const lines = pdf.splitTextToSize(reviewResult.summary, W - MARGIN * 2);
    pdf.text(lines, MARGIN, y);
    y += lines.length * 5 + 5;
  }

  // ── Issue sections ──
  const sections = [
    { key: 'bugs', label: 'BUGS DETECTED', color: [239, 68, 68] },
    { key: 'security_issues', label: 'SECURITY ISSUES', color: [249, 115, 22] },
    { key: 'optimizations', label: 'PERFORMANCE OPTIMIZATIONS', color: [234, 179, 8] },
    { key: 'improvements', label: 'CODE IMPROVEMENTS', color: [59, 130, 246] },
  ];

  for (const section of sections) {
    const items = reviewResult[section.key] || [];
    if (items.length === 0) continue;

    checkPage(15);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(...section.color);
    pdf.text(`${section.label} (${items.length})`, MARGIN, y);
    y += 6;

    for (const item of items) {
      checkPage(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...section.color);
      const header = `[${(item.severity || 'info').toUpperCase()}]${item.line ? ` Line ${item.line}` : ''} — ${item.description}`;
      const hLines = pdf.splitTextToSize(header, W - MARGIN * 2);
      pdf.text(hLines, MARGIN, y);
      y += hLines.length * 4.5;

      if (item.why) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(160, 160, 190);
        const wLines = pdf.splitTextToSize(`Why: ${item.why}`, W - MARGIN * 2 - 5);
        pdf.text(wLines, MARGIN + 3, y);
        y += wLines.length * 4 + 3;
      }

      if (item.fix) {
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(134, 239, 172);
        const fLines = pdf.splitTextToSize(`Fix: ${item.fix}`, W - MARGIN * 2 - 5);
        pdf.text(fLines, MARGIN + 3, y);
        y += fLines.length * 4 + 4;
        checkPage(2);
      }
    }
    y += 4;
  }

  // ── Improved Code ──
  if (reviewResult.improved_code) {
    addPage();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(168, 85, 247);
    pdf.text('IMPROVED CODE', MARGIN, y);
    y += 6;

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(200, 240, 200);
    const codeLines = pdf.splitTextToSize(reviewResult.improved_code, W - MARGIN * 2);
    for (const line of codeLines) {
      checkPage(4);
      pdf.text(line, MARGIN, y);
      y += 4;
    }
  }

  pdf.save(`code-review-${Date.now()}.pdf`);
}
