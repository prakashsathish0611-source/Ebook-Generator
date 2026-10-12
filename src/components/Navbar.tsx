import React, { useState } from 'react';
import { Book, Chapter } from '../types/book';
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  Palette, 
  Download, 
  Eye, 
  Plus, 
  ChevronDown, 
  Check, 
  BookMarked,
  Library
} from 'lucide-react';
import { SAMPLE_BOOKS } from '../data/sampleBooks';

interface NavbarProps {
  currentBook: Book;
  allBooks: Book[];
  activeTab: 'blueprint' | 'outline' | 'editor' | 'cover' | 'reader';
  setActiveTab: (tab: 'blueprint' | 'outline' | 'editor' | 'cover' | 'reader') => void;
  onSelectBook: (book: Book) => void;
  onNewBook: () => void;
  onOpenExport: () => void;
  isSaving?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBook,
  allBooks,
  activeTab,
  setActiveTab,
  onSelectBook,
  onNewBook,
  onOpenExport,
  isSaving = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const completedChapters = currentBook.chapters.filter((ch) => ch.content && ch.content.trim().length > 0).length;
  const totalChapters = currentBook.chapters.length;

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Book Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-900/20">
              <BookOpen className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Folio<span className="text-amber-400">AI</span>
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Studio
                </span>
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-800 hidden sm:block" />

          {/* Current Book Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-sm font-medium text-stone-200 transition max-w-[220px] sm:max-w-[280px]"
            >
              <BookMarked className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate text-left">{currentBook.title || 'Untitled Book'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-auto" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute left-0 mt-2 w-72 rounded-xl bg-stone-800 border border-stone-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Your Books</span>
                  <span className="text-amber-400">{allBooks.length}</span>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {allBooks.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBook(b);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-stone-700/60 transition ${
                        b.id === currentBook.id ? 'bg-amber-500/10 text-amber-300 font-medium' : 'text-stone-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{b.title}</div>
                        <div className="text-[11px] text-stone-400 truncate">{b.genre} • {b.chapters.length} ch</div>
                      </div>
                      {b.id === currentBook.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-stone-700/80 pt-1.5 mt-1 px-2 space-y-1">
                  <button
                    onClick={() => {
                      onNewBook();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Book</span>
                  </button>
                  <button
                    onClick={() => {
                      // Switch to another sample book
                      const otherSample = SAMPLE_BOOKS.find((s) => s.id !== currentBook.id) || SAMPLE_BOOKS[0];
                      onSelectBook(otherSample);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:bg-stone-700/50 transition"
                  >
                    <Library className="w-3.5 h-3.5 text-stone-400" />
                    <span>Explore Sample Books</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-950/60 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'blueprint'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab('outline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'outline'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Outline</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
              activeTab === 'outline' ? 'bg-stone-900/40 text-stone-950' : 'bg-stone-800 text-stone-400'
            }`}>
              {completedChapters}/{totalChapters}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'editor'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Chapter Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('cover')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'cover'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Cover Designer</span>
          </button>

          <button
            onClick={() => setActiveTab('reader')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'reader'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Reader Mode</span>
          </button>
        </nav>

        {/* Right Actions: Status & Export */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-400 font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isSaving ? 'Autosaving...' : 'Saved locally'}</span>
          </div>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs shadow-md shadow-amber-950/40 hover:shadow-amber-500/20 transition transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-stone-950" />
            <span>Export Book (EPUB / PDF)</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-stone-800/80 bg-stone-950/80 text-xs">
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'blueprint' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'}`}
        >
          Blueprint
        </button>
        <button
          onClick={() => setActiveTab('outline')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'outline' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'}`}
        >
          Outline ({completedChapters}/{totalChapters})
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'editor' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'}`}
        >
          Studio
        </button>
        <button
          onClick={() => setActiveTab('cover')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'cover' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'}`}
        >
          Cover
        </button>
        <button
          onClick={() => setActiveTab('reader')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'reader' ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-400'}`}
        >
          Reader
        </button>
      </div>
    </header>
  );
};
