import { jsPDF } from 'jspdf';
import { Book } from '../types/book';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  try {
    const clean = (hex || '#0f172a').replace('#', '');
    const fullHex = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    const num = parseInt(fullHex, 16);
    if (isNaN(num)) return { r: 15, g: 23, b: 42 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  } catch {
    return { r: 15, g: 23, b: 42 };
  }
}

// Draw the full styled cover page on a jsPDF document
export function drawCoverPage(doc: jsPDF, book: Book) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const cover = book.cover || {
    template: 'editorial',
    primaryColor: '#0f172a',
    accentColor: '#f59e0b',
    textColor: '#ffffff',
    fontFamily: 'serif',
    motif: 'book',
    tagline: 'Where Insight Becomes Form',
  };

  const bgRgb = hexToRgb(cover.primaryColor || '#0f172a');
  const accentRgb = hexToRgb(cover.accentColor || '#f59e0b');
  const textRgb = hexToRgb(cover.textColor || '#ffffff');

  // Background
  doc.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative borders based on template
  if (cover.template === 'classic' || cover.template === 'vintage') {
    doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
    doc.setLineWidth(2);
    doc.rect(24, 24, pageWidth - 48, pageHeight - 48);

    doc.setLineWidth(0.8);
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

    // Corner rosettes/accents
    const corners = [
      [30, 30],
      [pageWidth - 30, 30],
      [30, pageHeight - 30],
      [pageWidth - 30, pageHeight - 30],
    ];
    corners.forEach(([cx, cy]) => {
      doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
      doc.circle(cx, cy, 3, 'F');
    });
  } else if (cover.template === 'editorial') {
    // Subtle line rules
    doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
    doc.setLineWidth(1);
    doc.line(40, 60, pageWidth - 40, 60);
    doc.line(40, pageHeight - 80, pageWidth - 40, pageHeight - 80);
  }

  // Header / Genre Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
  const genreText = (book.genre || 'FolioAI Edition').toUpperCase();
  doc.text(genreText, pageWidth / 2, 85, { align: 'center' });

  // Tagline
  if (cover.tagline) {
    doc.setFont('times', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(Math.min(255, textRgb.r + 20), Math.min(255, textRgb.g + 20), Math.min(255, textRgb.b + 20));
    doc.text(`"${cover.tagline}"`, pageWidth / 2, 105, { align: 'center' });
  }

  // Center Emblem Motif (vector geometry)
  const motifY = pageHeight * 0.38;
  doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.setLineWidth(1.5);
  doc.circle(pageWidth / 2, motifY, 26, 'S');
  doc.setLineWidth(0.6);
  doc.circle(pageWidth / 2, motifY, 30, 'S');

  // Star / Diamond inside emblem
  doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.circle(pageWidth / 2, motifY, 4, 'F');
  doc.line(pageWidth / 2 - 14, motifY, pageWidth / 2 + 14, motifY);
  doc.line(pageWidth / 2, motifY - 14, pageWidth / 2, motifY + 14);

  // Main Book Title
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);

  const titleLines = doc.splitTextToSize(book.title.toUpperCase(), pageWidth - 100);
  const titleStartY = motifY + 60;
  doc.text(titleLines, pageWidth / 2, titleStartY, { align: 'center' });

  let curY = titleStartY + titleLines.length * 28;

  // Subtitle
  if (book.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
    const subLines = doc.splitTextToSize(book.subtitle, pageWidth - 120);
    doc.text(subLines, pageWidth / 2, curY + 6, { align: 'center' });
    curY += subLines.length * 16 + 10;
  }

  // Author & FolioAI Footer
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  doc.text((book.author || 'Author Name').toUpperCase(), pageWidth / 2, pageHeight - 55, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.text('FOLIOAI PUBLISHING MANUSCRIPT', pageWidth / 2, pageHeight - 38, { align: 'center' });
}

// Download ONLY the Cover as a high-resolution PDF
export function generateCoverPdf(book: Book) {
  // Standard trade book cover aspect (6" x 9" => 432pt x 648pt)
  const doc = new jsPDF({
    unit: 'pt',
    format: [432, 648],
  });

  drawCoverPage(doc, book);

  const filename = `${slugify(book.title || 'book')}-cover.pdf`;
  doc.save(filename);
}

export function generateBookPdf(book: Book) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54; // 0.75 in
  const contentWidth = pageWidth - margin * 2;

  let currentPage = 1;

  // Helper for adding headers and footers
  const addHeaderFooter = (chapterTitle?: string) => {
    if (currentPage > 2) {
      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);

      // Running header
      if (chapterTitle) {
        doc.text(chapterTitle, pageWidth / 2, 36, { align: 'center' });
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, 42, pageWidth - margin, 42);
      }

      // Running footer with page number
      doc.text(String(currentPage), pageWidth / 2, pageHeight - 30, { align: 'center' });
    }
  };

  // 1. Cover Page (Full-bleed colored cover design)
  drawCoverPage(doc, book);

  // 2. Interior Title / Half-title Page
  doc.addPage();
  currentPage++;
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(20, 20, 20);

  const titleLines = doc.splitTextToSize(book.title, contentWidth - 40);
  doc.text(titleLines, pageWidth / 2, 220, { align: 'center' });

  let yPos = 220 + titleLines.length * 30;

  if (book.subtitle) {
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.setTextColor(80, 80, 80);
    const subtitleLines = doc.splitTextToSize(book.subtitle, contentWidth - 40);
    doc.text(subtitleLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += subtitleLines.length * 18 + 20;
  }

  doc.setFont('times', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text(`By ${book.author || 'Author'}`, pageWidth / 2, 450, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(140, 140, 140);
  doc.text('Published with FolioAI Manuscript Engine', pageWidth / 2, pageHeight - 50, { align: 'center' });

  // 3. Table of Contents
  doc.addPage();
  currentPage++;
  addHeaderFooter('Table of Contents');

  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text('Table of Contents', pageWidth / 2, 90, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(margin + 40, 105, pageWidth - margin - 40, 105);

  let tocY = 140;
  const validChapters = book.chapters.filter((ch) => ch.content && ch.content.trim().length > 0);
  const chaptersToExport = validChapters.length > 0 ? validChapters : book.chapters;

  chaptersToExport.forEach((ch) => {
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    const itemText = `Chapter ${ch.number}: ${ch.title}`;
    doc.text(itemText, margin + 20, tocY);

    doc.setDrawColor(220, 220, 220);
    doc.setLineDashPattern([2, 4], 0);
    doc.line(margin + 20 + doc.getTextWidth(itemText) + 8, tocY - 2, pageWidth - margin - 20, tocY - 2);
    doc.setLineDashPattern([], 0);

    tocY += 26;
  });

  // 3. Chapters
  chaptersToExport.forEach((chapter) => {
    doc.addPage();
    currentPage++;
    addHeaderFooter(`Chapter ${chapter.number}: ${chapter.title}`);

    let cursorY = 80;

    // Chapter Number
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(140, 140, 140);
    doc.text(`CHAPTER ${chapter.number}`, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 24;

    // Chapter Title
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    const chTitleLines = doc.splitTextToSize(chapter.title, contentWidth);
    doc.text(chTitleLines, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += chTitleLines.length * 22 + 25;

    // Content processing
    const contentText = chapter.content || chapter.summary || 'Content in progress...';
    const lines = contentText.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        cursorY += 10;
        continue;
      }

      // Check page overflow
      if (cursorY > pageHeight - margin - 40) {
        doc.addPage();
        currentPage++;
        addHeaderFooter(`Chapter ${chapter.number}: ${chapter.title}`);
        cursorY = 70;
      }

      // Headings
      if (line.startsWith('## ')) {
        cursorY += 12;
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        const headingText = line.replace(/^##\s+/, '');
        const headingLines = doc.splitTextToSize(headingText, contentWidth);
        doc.text(headingLines, margin, cursorY);
        cursorY += headingLines.length * 16 + 8;
        continue;
      }

      if (line.startsWith('### ')) {
        cursorY += 8;
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        const headingText = line.replace(/^###\s+/, '');
        const headingLines = doc.splitTextToSize(headingText, contentWidth);
        doc.text(headingLines, margin, cursorY);
        cursorY += headingLines.length * 14 + 6;
        continue;
      }

      // Blockquotes
      if (line.startsWith('>')) {
        doc.setFont('times', 'italic');
        doc.setFontSize(10.5);
        doc.setTextColor(80, 80, 80);
        const quoteText = line.replace(/^>\s?/, '');
        const quoteLines = doc.splitTextToSize(quoteText, contentWidth - 40);

        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(1.5);
        doc.line(margin + 10, cursorY - 8, margin + 10, cursorY + quoteLines.length * 14);

        doc.text(quoteLines, margin + 20, cursorY);
        cursorY += quoteLines.length * 14 + 10;
        continue;
      }

      // Horizontal rule / scene break
      if (/^(\*\s*\*\s*\*|---\s*|___\s*)$/.test(line)) {
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(140, 140, 140);
        doc.text('* * *', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 18;
        continue;
      }

      // Standard paragraph
      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 30, 30);
      
      // Clean markdown tokens for simple text rendering
      const cleaned = line
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1');

      const pLines = doc.splitTextToSize(cleaned, contentWidth);
      doc.text(pLines, margin, cursorY);
      cursorY += pLines.length * 14 + 6;
    }
  });

  const filename = `${slugify(book.title || 'manuscript')}.pdf`;
  doc.save(filename);
}

export function printBookManuscript(book: Book) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the print manuscript view.');
    return;
  }

  const chaptersHtml = book.chapters.map((ch) => `
    <div class="page chapter-break">
      <div class="chapter-num">Chapter ${ch.number}</div>
      <h2 class="chapter-title">${ch.title}</h2>
      <div class="chapter-content">
        ${(ch.content || '').split('\n\n').map(p => {
          if (p.startsWith('#')) {
            const hText = p.replace(/^#+\s*/, '');
            return `<h3>${hText}</h3>`;
          }
          if (p.startsWith('>')) {
            return `<blockquote>${p.replace(/^>\s*/, '')}</blockquote>`;
          }
          return `<p>${p}</p>`;
        }).join('')}
      </div>
    </div>
  `).join('\n');

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${book.title} - Manuscript Print</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 20mm 25mm 20mm;
    }
    body {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #111;
      margin: 0;
      padding: 0;
    }
    .page {
      page-break-after: always;
    }
    .cover-page {
      height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .title {
      font-size: 28pt;
      font-weight: bold;
      margin-bottom: 8pt;
    }
    .subtitle {
      font-size: 14pt;
      font-style: italic;
      color: #444;
      margin-bottom: 24pt;
    }
    .author {
      font-size: 14pt;
      margin-top: 40pt;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .chapter-break {
      page-break-before: always;
    }
    .chapter-num {
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #666;
      font-size: 10pt;
      margin-top: 30pt;
    }
    .chapter-title {
      text-align: center;
      font-size: 20pt;
      margin-bottom: 30pt;
      font-weight: bold;
    }
    p {
      margin: 0 0 12pt 0;
      text-indent: 1.5em;
      text-align: justify;
    }
    p:first-of-type, h3 + p, blockquote + p {
      text-indent: 0;
    }
    blockquote {
      margin: 16pt 24pt;
      font-style: italic;
      border-left: 2px solid #999;
      padding-left: 12pt;
    }
    h3 {
      font-size: 14pt;
      margin-top: 20pt;
      margin-bottom: 8pt;
    }
    @media screen {
      body {
        background: #f3f4f6;
        padding: 40px;
      }
      .page {
        max-width: 800px;
        margin: 0 auto 40px auto;
        background: white;
        padding: 60px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
    }
  </style>
</head>
<body>
  <div class="page cover-page">
    <div class="title">${book.title}</div>
    ${book.subtitle ? `<div class="subtitle">${book.subtitle}</div>` : ''}
    <div class="author">By ${book.author}</div>
  </div>
  ${chaptersHtml}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>
  `);
  printWindow.document.close();
}
