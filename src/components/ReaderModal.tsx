import React, { useState } from 'react';
import { Book, Chapter } from '../types/book';
import { markdownToHtml } from '../utils/markdownParser';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Settings2, 
  Type, 
  Bookmark, 
  BookOpen,
  Maximize,
  Minimize
} from 'lucide-react';

interface ReaderModalProps {
  currentBook: Book;
  initialChapterIndex?: number;
  onClose: () => void;
}

type ReaderTheme = 'cream' | 'white' | 'sepia' | 'dark';
type ReaderFont = 'cormorant' | 'merriweather' | 'playfair' | 'sans';

export const ReaderModal: React.FC<ReaderModalProps> = ({
  currentBook,
  initialChapterIndex = 0,
  onClose,
}) => {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(initialChapterIndex);
  const [theme, setTheme] = useState<ReaderTheme>('cream');
  const [font, setFont] = useState<ReaderFont>('cormorant');
  const [fontSize, setFontSize] = useState<number>(18);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const chaptersWithContent = currentBook.chapters.filter((ch) => ch.content && ch.content.trim().length > 0);
  const activeChapters = chaptersWithContent.length > 0 ? chaptersWithContent : currentBook.chapters;
  const chapter = activeChapters[currentChapterIdx] || activeChapters[0];

  // Theme styling rules
  const themeStyles: Record<ReaderTheme, { bg: string; text: string; header: string; border: string }> = {
    cream: {
      bg: 'bg-[#faf4e8]',
      text: 'text-[#2b2523]',
      header: 'bg-[#f3ebd7] border-[#e8ddc5] text-[#3d3431]',
      border: 'border-[#e8ddc5]',
    },
    white: {
      bg: 'bg-[#ffffff]',
      text: 'text-[#1f2937]',
      header: 'bg-[#f9fafb] border-[#e5e7eb] text-[#111827]',
      border: 'border-[#e5e7eb]',
    },
    sepia: {
      bg: 'bg-[#ede1cb]',
      text: 'text-[#382b26]',
      header: 'bg-[#e2d5bd] border-[#d4c5a9] text-[#2c201b]',
      border: 'border-[#d4c5a9]',
    },
    dark: {
      bg: 'bg-[#18181b]',
      text: 'text-[#e4e4e7]',
      header: 'bg-[#27272a] border-[#3f3f46] text-[#fafafa]',
      border: 'border-[#3f3f46]',
    },
  };

  const currentTheme = themeStyles[theme];

  // Font class
  const getFontFamily = () => {
    switch (font) {
      case 'cormorant': return 'font-[Cormorant_Garamond,Georgia,serif]';
      case 'playfair': return 'font-[Playfair_Display,serif]';
      case 'merriweather': return 'font-[Lora,Georgia,serif]';
      case 'sans': return 'font-[Inter,sans-serif]';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${currentTheme.bg} transition-colors duration-200 select-text`}>
      
      {/* Top Reading Header */}
      <header className={`h-14 px-4 sm:px-8 flex items-center justify-between border-b ${currentTheme.header} select-none transition-colors`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowToc(!showToc)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Table of Contents"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div className="truncate max-w-[200px] sm:max-w-md">
            <span className="font-serif font-bold text-xs sm:text-sm truncate block">
              {currentBook.title}
            </span>
            <span className="text-[10px] opacity-70 truncate block font-sans">
              Chapter {chapter?.number}: {chapter?.title}
            </span>
          </div>
        </div>

        {/* Progress & Controls */}
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono opacity-60 mr-2 hidden sm:block">
            {currentChapterIdx + 1} of {activeChapters.length}
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Reading Settings (Fonts, Size, Themes)"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Exit Reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Popover */}
      {showSettings && (
        <div className="absolute right-4 top-16 w-80 bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl p-5 shadow-2xl z-50 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Typography & Paper</span>
            <button onClick={() => setShowSettings(false)} className="text-stone-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme / Paper */}
          <div>
            <label className="block text-[11px] text-stone-400 mb-2">Paper Color</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'cream', label: 'Cream', bg: '#faf4e8', text: '#2b2523' },
                { id: 'white', label: 'White', bg: '#ffffff', text: '#1f2937' },
                { id: 'sepia', label: 'Sepia', bg: '#ede1cb', text: '#382b26' },
                { id: 'dark', label: 'Velvet', bg: '#18181b', text: '#e4e4e7' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ReaderTheme)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition ${
                    theme === t.id ? 'ring-2 ring-amber-400 border-amber-400' : 'border-stone-700'
                  }`}
                  style={{ backgroundColor: t.bg, color: t.text }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font choice */}
          <div>
            <label className="block text-[11px] text-stone-400 mb-2">Book Font</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'cormorant', label: 'Cormorant Garamond' },
                { id: 'merriweather', label: 'Lora Classical' },
                { id: 'playfair', label: 'Playfair Display' },
                { id: 'sans', label: 'Modern Sans' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id as ReaderFont)}
                  className={`py-2 px-2.5 rounded-xl border text-center transition ${
                    font === f.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-semibold'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <div className="flex justify-between text-[11px] text-stone-400 mb-1.5">
              <span>Text Size</span>
              <span>{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400">A</span>
              <input
                type="range"
                min={15}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-lg text-stone-200">A</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Window */}
      <div className="flex-1 overflow-y-auto flex justify-center relative">
        
        {/* Table of Contents Drawer */}
        {showToc && (
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-stone-900 border-r border-stone-800 shadow-2xl z-40 p-4 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Table of Contents</span>
              <button onClick={() => setShowToc(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {activeChapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setCurrentChapterIdx(idx);
                    setShowToc(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-serif transition flex items-start gap-2.5 ${
                    idx === currentChapterIdx
                      ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <span className="font-mono text-stone-500 text-[10px] mt-0.5">{ch.number}</span>
                  <span className="line-clamp-2">{ch.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reader Document Container */}
        <article className="max-w-2xl w-full px-6 sm:px-12 py-12 sm:py-16">
          
          {/* Chapter Opening */}
          <div className="text-center mb-10 pb-6 border-b border-black/10 dark:border-white/10">
            <div className="text-[11px] uppercase tracking-[0.2em] font-sans font-semibold opacity-60 mb-2">
              Chapter {chapter?.number}
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${getFontFamily()}`}>
              {chapter?.title}
            </h1>
          </div>

          {/* Chapter Body */}
          <div
            className={`prose max-w-none leading-relaxed ${getFontFamily()} ${currentTheme.text}
              [&>h1]:hidden
              [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-3
              [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-2
              [&>p]:mb-5 [&>p]:leading-[1.75]
              [&>blockquote]:my-6 [&>blockquote]:pl-4 [&>blockquote]:border-l-2 [&>blockquote]:border-amber-600 [&>blockquote]:italic [&>blockquote]:opacity-85
              [&>hr]:my-10 [&>hr]:border-transparent [&>hr]:text-center
            `}
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(chapter?.content || `# Chapter ${chapter?.number}\n\n*Drafting in progress...*`),
            }}
          />

          {/* Chapter Navigation Footer */}
          <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-sans">
            <button
              onClick={() => {
                if (currentChapterIdx > 0) {
                  setCurrentChapterIdx(currentChapterIdx - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={currentChapterIdx === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Chapter</span>
            </button>

            <span className="font-mono opacity-60">
              {currentChapterIdx + 1} / {activeChapters.length}
            </span>

            <button
              onClick={() => {
                if (currentChapterIdx < activeChapters.length - 1) {
                  setCurrentChapterIdx(currentChapterIdx + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={currentChapterIdx === activeChapters.length - 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-30"
            >
              <span>Next Chapter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </article>
      </div>

    </div>
  );
};
