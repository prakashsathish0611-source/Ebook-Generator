import React, { useState } from 'react';
import { Book } from '../types/book';
import { downloadBookEpub } from '../utils/epubGenerator';
import { generateBookPdf, generateCoverPdf, printBookManuscript } from '../utils/pdfGenerator';
import { calculateWordCount } from '../utils/markdownParser';
import confetti from 'canvas-confetti';
import { 
  X, 
  Download, 
  BookOpen, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Palette,
  FileDown
} from 'lucide-react';

interface ExportModalProps {
  currentBook: Book;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ currentBook, onClose }) => {
  const [isExportingEpub, setIsExportingEpub] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCoverPdf, setIsExportingCoverPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const totalWords = currentBook.chapters.reduce((sum, ch) => sum + calculateWordCount(ch.content || ''), 0);
  const completedChapters = currentBook.chapters.filter((ch) => ch.content && ch.content.trim().length > 0).length;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleExportCoverPdf = () => {
    setIsExportingCoverPdf(true);
    setExportSuccess(null);
    try {
      generateCoverPdf(currentBook);
      triggerCelebration();
      setExportSuccess('Standalone Cover PDF generated and downloaded!');
    } catch (err: any) {
      alert('Error generating Cover PDF: ' + err.message);
    } finally {
      setIsExportingCoverPdf(false);
    }
  };

  const handleExportEpub = async () => {
    setIsExportingEpub(true);
    setExportSuccess(null);
    try {
      await downloadBookEpub(currentBook);
      triggerCelebration();
      setExportSuccess('EPUB file generated and downloaded successfully!');
    } catch (err: any) {
      alert('Error generating EPUB: ' + err.message);
    } finally {
      setIsExportingEpub(false);
    }
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    setExportSuccess(null);
    try {
      generateBookPdf(currentBook);
      triggerCelebration();
      setExportSuccess('PDF manuscript generated and downloaded successfully!');
    } catch (err: any) {
      alert('Error generating PDF: ' + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const fullText = [
      `# ${currentBook.title}`,
      currentBook.subtitle ? `*${currentBook.subtitle}*` : '',
      `**By ${currentBook.author || 'Author'}**\n`,
      `*${currentBook.description || ''}*\n\n---\n`,
      ...currentBook.chapters.map((ch) => ch.content || `# Chapter ${ch.number}: ${ch.title}\n\n*Drafting...*`),
    ].filter(Boolean).join('\n\n');

    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBook.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerCelebration();
    setExportSuccess('Markdown manuscript downloaded!');
  };

  const handleDownloadHtml = () => {
    const chaptersHtml = currentBook.chapters.map(ch => `
      <section style="margin-bottom: 4rem; page-break-after: always;">
        <h2 style="font-family: Georgia, serif; font-size: 1.8rem; margin-bottom: 1rem;">Chapter ${ch.number}: ${ch.title}</h2>
        <div style="line-height: 1.7; font-size: 1.1rem; color: #222;">
          ${(ch.content || '').split('\n\n').map(p => `<p style="margin-bottom: 1rem; text-indent: 1.5em;">${p}</p>`).join('')}
        </div>
      </section>
    `).join('\n');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${currentBook.title}</title>
  <style>
    body { max-width: 780px; margin: 40px auto; font-family: "Georgia", serif; padding: 0 20px; line-height: 1.6; color: #111; }
    h1 { text-align: center; font-size: 2.5rem; margin-bottom: 0.5rem; }
    .subtitle { text-align: center; font-style: italic; color: #555; margin-bottom: 2rem; }
    .author { text-align: center; font-weight: bold; margin-bottom: 4rem; }
  </style>
</head>
<body>
  <h1>${currentBook.title}</h1>
  ${currentBook.subtitle ? `<div class="subtitle">${currentBook.subtitle}</div>` : ''}
  <div class="author">By ${currentBook.author}</div>
  <hr style="margin: 3rem 0; border: 0; border-top: 1px solid #ddd;" />
  ${chaptersHtml}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBook.title.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerCelebration();
    setExportSuccess('Standalone HTML manuscript downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publishing & Export Suite</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Export Your Manuscript
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Choose your desired publication format. Compliant with standard digital distribution platforms.
          </p>
        </div>

        {/* Manuscript Health Check */}
        <div className="bg-stone-850 border border-stone-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-stone-200">{currentBook.title}</div>
              <div className="text-stone-400">
                {completedChapters} of {currentBook.chapters.length} chapters drafted • {totalWords.toLocaleString()} words
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 font-mono text-[11px] border border-stone-700">
              {completedChapters === currentBook.chapters.length ? '100% Ready' : 'Ready for Export'}
            </span>
          </div>
        </div>

        {/* Export Success Toast */}
        {exportSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* Export Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Format 1: EPUB */}
          <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 hover:border-amber-500/50 transition space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                .EPUB 3
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white group-hover:text-amber-300 transition">
                Digital eBook (EPUB)
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Standard format for Apple Books, Amazon Kindle (KDP), Kobo, and Google Play Books.
              </p>
            </div>
            <button
              onClick={handleExportEpub}
              disabled={isExportingEpub}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition active:scale-95 disabled:opacity-50"
            >
              {isExportingEpub ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Packaging EPUB...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .EPUB</span>
                </>
              )}
            </button>
          </div>

          {/* Format 2: PDF */}
          <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 hover:border-amber-500/50 transition space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                .PDF
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white group-hover:text-sky-300 transition">
                Print & Digital PDF
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Formatted manuscript with title page, TOC, headers, page numbers, and chapter breaks.
              </p>
            </div>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-semibold text-xs transition active:scale-95 disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Building PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Format 3: Print View */}
          <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 hover:border-stone-700 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                High-Res Print
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">
                Browser Print-to-PDF
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Opens clean print manuscript window with serif drop caps and typography for direct printing.
              </p>
            </div>
            <button
              onClick={() => printBookManuscript(currentBook)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-medium text-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Open Print Dialog</span>
            </button>
          </div>

          {/* Format 4: Standalone Cover PDF */}
          <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 hover:border-amber-500/50 transition space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Palette className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                .PDF (Cover)
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white group-hover:text-amber-300 transition">
                Standalone Cover PDF
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Full-bleed 6" x 9" vector cover with custom typography, foil accents, and emblems.
              </p>
            </div>
            <button
              onClick={handleExportCoverPdf}
              disabled={isExportingCoverPdf}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition active:scale-95 disabled:opacity-50"
            >
              {isExportingCoverPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Building Cover...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Cover PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Format 5: Raw Markdown & Web HTML */}
          <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 hover:border-stone-700 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Source Files
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">
                Markdown & HTML
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Download raw manuscript bundle for personal archiving, Git, or Web publishing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadMarkdown}
                className="py-2 px-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-medium text-center"
              >
                .MD File
              </button>
              <button
                onClick={handleDownloadHtml}
                className="py-2 px-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-medium text-center"
              >
                .HTML File
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
