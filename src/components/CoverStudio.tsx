import React, { useState } from 'react';
import { Book, CoverDesign } from '../types/book';
import { generateCoverPdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import { 
  Palette, 
  Sparkles, 
  Download, 
  Rotate3d, 
  Compass, 
  Feather, 
  BookOpen, 
  Sun, 
  Mountain, 
  Shield, 
  Trees, 
  Sparkle, 
  CircleDot,
  Check,
  RefreshCw,
  Sliders,
  FileDown,
  CheckCircle2
} from 'lucide-react';

interface CoverStudioProps {
  currentBook: Book;
  onUpdateBook: (updated: Partial<Book>) => void;
}

const TEMPLATES: Array<{ id: CoverDesign['template']; name: string; desc: string }> = [
  { id: 'editorial', name: 'Editorial Luxe', desc: 'Prestige publishing typography with refined line rules' },
  { id: 'classic', name: 'Classic Gold', desc: 'Timeless literary borders with gilt filigree accents' },
  { id: 'minimalist', name: 'Modern Minimalist', desc: 'Swiss typographic rhythm and stark geometric contrast' },
  { id: 'atmospheric', name: 'Atmospheric Glow', desc: 'Ethereal ambient lighting and deep cinematic mystery' },
  { id: 'bold', name: 'Bestseller Bold', desc: 'High-impact commercial title treatment that commands eyes' },
  { id: 'vintage', name: 'Vintage Cloth', desc: 'Antique library aesthetic with textured parchment motifs' },
];

const MOTIFS: Array<{ id: CoverDesign['motif']; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'quill', label: 'Quill', icon: Feather },
  { id: 'compass', label: 'Compass', icon: Compass },
  { id: 'abstract-rings', label: 'Quantum Rings', icon: CircleDot },
  { id: 'stars', label: 'Constellation', icon: Sparkle },
  { id: 'book', label: 'Tome', icon: BookOpen },
  { id: 'sun', label: 'Solar Crest', icon: Sun },
  { id: 'mountain', label: 'Peak', icon: Mountain },
  { id: 'tree', label: 'Tree of Knowledge', icon: Trees },
  { id: 'shield', label: 'Heraldic Crest', icon: Shield },
];

const PRESET_PALETTES = [
  { name: 'Midnight & Gold', primary: '#0f172a', accent: '#f59e0b', text: '#ffffff' },
  { name: 'Obsidian & Cyan', primary: '#09090b', accent: '#38bdf8', text: '#ffffff' },
  { name: 'Deep Crimson & Gilt', primary: '#450a0a', accent: '#fbbf24', text: '#fef2f2' },
  { name: 'Emerald & Champagne', primary: '#064e3b', accent: '#fef08a', text: '#ffffff' },
  { name: 'Charcoal & Amber', primary: '#1c1917', accent: '#d97706', text: '#fef3c7' },
  { name: 'Navy & Silver', primary: '#172554', accent: '#94a3b8', text: '#ffffff' },
];

export const CoverStudio: React.FC<CoverStudioProps> = ({
  currentBook,
  onUpdateBook,
}) => {
  const cover = currentBook.cover || {
    template: 'editorial',
    primaryColor: '#0f172a',
    accentColor: '#f59e0b',
    textColor: '#ffffff',
    fontFamily: 'serif',
    motif: 'abstract-rings',
    tagline: 'Where Insight Becomes Form',
  };

  const [is3D, setIs3D] = useState(true);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadCoverPdf = () => {
    try {
      generateCoverPdf(currentBook);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (e: any) {
      alert('Error downloading cover PDF: ' + e.message);
    }
  };

  const updateCover = (patch: Partial<CoverDesign>) => {
    onUpdateBook({
      cover: {
        ...cover,
        ...patch,
      },
    });
  };

  const handleAiSuggestPalette = async () => {
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/book/generate-cover-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentBook.title,
          genre: currentBook.genre,
          tone: currentBook.tone,
          description: currentBook.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateCover({
          primaryColor: data.primaryColor || cover.primaryColor,
          accentColor: data.accentColor || cover.accentColor,
          textColor: data.textColor || cover.textColor,
          template: (data.coverStyle as any) || cover.template,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Render motif icon
  const MotifIcon = MOTIFS.find((m) => m.id === cover.motif)?.icon || CircleDot;

  // Font classes
  const getFontClass = () => {
    switch (cover.fontFamily) {
      case 'cinzel': return 'font-[Cinzel,serif]';
      case 'playfair': return 'font-[Playfair_Display,serif]';
      case 'lora': return 'font-[Lora,serif]';
      case 'sans': return 'font-[Inter,sans-serif]';
      default: return 'font-[Cormorant_Garamond,Georgia,serif]';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>Visual Presentation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Book Cover Designer
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Customize typography, foil accents, and motifs. Embedded automatically in your EPUB and PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIs3D(!is3D)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-medium transition"
          >
            <Rotate3d className="w-3.5 h-3.5 text-amber-400" />
            <span>{is3D ? 'View 2D Flat' : 'View 3D Book'}</span>
          </button>

          <button
            onClick={handleAiSuggestPalette}
            disabled={isSuggesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 text-xs font-medium transition"
          >
            {isSuggesting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>AI Suggest Colors</span>
          </button>

          <button
            onClick={handleDownloadCoverPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs shadow-md shadow-amber-950/40 transition active:scale-95"
            title="Download this cover design as a standalone print-ready PDF"
          >
            <FileDown className="w-4 h-4 text-stone-950" />
            <span>Download Cover PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Book Cover Render (3D or 2D) */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-center p-6 sm:p-10 bg-stone-900/60 border border-stone-800 rounded-2xl min-h-[480px]">
            <div 
              className={`transition-all duration-500 ${
                is3D 
                  ? 'transform -rotate-y-12 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-300 [perspective:1000px]'
                  : ''
              }`}
            >
              {/* 3D Book Container */}
              <div 
                id="folio-book-cover"
                className="relative w-64 sm:w-72 h-96 sm:h-[440px] rounded-r-md shadow-2xl flex flex-col justify-between p-6 select-none overflow-hidden"
                style={{
                  backgroundColor: cover.primaryColor,
                  color: cover.textColor,
                  boxShadow: is3D 
                    ? '20px 20px 40px -10px rgba(0,0,0,0.8), -6px 0 16px rgba(0,0,0,0.6), inset 4px 0 8px rgba(255,255,255,0.1)'
                    : '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Spine Highlight / Crease */}
                <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-3 w-px bg-white/15 pointer-events-none" />

                {/* Template specifics */}
                {cover.template === 'classic' && (
                  <div 
                    className="absolute inset-3 border-2 pointer-events-none rounded-xs"
                    style={{ borderColor: cover.accentColor, opacity: 0.7 }}
                  >
                    <div 
                      className="absolute inset-1 border pointer-events-none"
                      style={{ borderColor: cover.accentColor, opacity: 0.4 }}
                    />
                  </div>
                )}

                {cover.template === 'vintage' && (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black/60 pointer-events-none" />
                )}

                {cover.template === 'atmospheric' && (
                  <div 
                    className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40"
                    style={{ backgroundColor: cover.accentColor }}
                  />
                )}

                {/* Cover Header / Tagline */}
                <div className="relative z-10 text-center pt-2">
                  <span 
                    className="text-[9px] uppercase tracking-[0.25em] font-sans font-bold block"
                    style={{ color: cover.accentColor }}
                  >
                    {currentBook.genre || 'FolioAI Edition'}
                  </span>
                  {cover.tagline && (
                    <p className="text-[10px] italic mt-1 text-stone-300/80 px-2 line-clamp-1">
                      "{cover.tagline}"
                    </p>
                  )}
                </div>

                {/* Center Motif & Title */}
                <div className="relative z-10 text-center my-auto px-2">
                  <div 
                    className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center border shadow-inner"
                    style={{ 
                      borderColor: `${cover.accentColor}50`, 
                      backgroundColor: `${cover.accentColor}15`,
                      color: cover.accentColor 
                    }}
                  >
                    <MotifIcon className="w-7 h-7" />
                  </div>

                  <h2 
                    className={`text-xl sm:text-2xl font-bold tracking-tight leading-tight uppercase ${getFontClass()}`}
                    style={{ color: cover.textColor }}
                  >
                    {currentBook.title || 'Untitled Book'}
                  </h2>

                  {currentBook.subtitle && (
                    <div 
                      className="mt-2 text-[11px] font-sans font-medium tracking-wide uppercase line-clamp-2"
                      style={{ color: cover.accentColor }}
                    >
                      {currentBook.subtitle}
                    </div>
                  )}
                </div>

                {/* Cover Bottom: Author & Stamp */}
                <div className="relative z-10 text-center pb-2 border-t border-white/10 pt-3">
                  <span className="text-[11px] font-sans font-semibold tracking-widest uppercase block" style={{ color: cover.textColor }}>
                    {currentBook.author || 'Author Name'}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-stone-400/80 block mt-0.5">
                    FolioAI Manuscript Engine
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* Dedicated Cover PDF Download Action Card */}
          <div className="w-full p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-2.5">
            <button
              onClick={handleDownloadCoverPdf}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs shadow-md shadow-amber-950/40 transition active:scale-95"
            >
              <FileDown className="w-4 h-4 text-stone-950" />
              <span>Download Cover as PDF</span>
            </button>
            <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 font-mono">
              <span>Standard 6" x 9" Trade Ratio</span>
              <span>Vector Print-Ready</span>
            </div>
            {downloadSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cover PDF generated and downloaded!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Customization Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Template Selection */}
          <div className="bg-stone-850 border border-stone-800 rounded-2xl p-5 shadow-lg space-y-3">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Cover Design Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => updateCover({ template: tmpl.id })}
                  className={`text-left p-3 rounded-xl border text-xs transition ${
                    cover.template === tmpl.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-medium'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                  }`}
                >
                  <div className="font-semibold">{tmpl.name}</div>
                  <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{tmpl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div className="bg-stone-850 border border-stone-800 rounded-2xl p-5 shadow-lg space-y-4">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Color Harmony
            </label>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_PALETTES.map((pal, idx) => (
                <button
                  key={idx}
                  onClick={() => updateCover({ primaryColor: pal.primary, accentColor: pal.accent, textColor: pal.text })}
                  className="flex items-center gap-2 p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition text-left"
                >
                  <div className="flex -space-x-1">
                    <span className="w-4 h-4 rounded-full border border-stone-700" style={{ backgroundColor: pal.primary }} />
                    <span className="w-4 h-4 rounded-full border border-stone-700" style={{ backgroundColor: pal.accent }} />
                  </div>
                  <span className="text-[11px] text-stone-300 truncate">{pal.name}</span>
                </button>
              ))}
            </div>

            {/* Manual Pickers */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-stone-800">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cover.primaryColor}
                    onChange={(e) => updateCover({ primaryColor: e.target.value })}
                    className="w-7 h-7 rounded border border-stone-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-stone-300 uppercase">{cover.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Accent / Gilt</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cover.accentColor}
                    onChange={(e) => updateCover({ accentColor: e.target.value })}
                    className="w-7 h-7 rounded border border-stone-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-stone-300 uppercase">{cover.accentColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cover.textColor}
                    onChange={(e) => updateCover({ textColor: e.target.value })}
                    className="w-7 h-7 rounded border border-stone-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-stone-300 uppercase">{cover.textColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Motif & Typography */}
          <div className="bg-stone-850 border border-stone-800 rounded-2xl p-5 shadow-lg space-y-4">
            
            {/* Motifs */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Center Emblem / Motif
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {MOTIFS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = cover.motif === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => updateCover({ motif: m.id })}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-[10px] truncate max-w-full">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Cover Typography
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'serif', label: 'Cormorant Serif' },
                  { id: 'cinzel', label: 'Cinzel Classical' },
                  { id: 'playfair', label: 'Playfair Display' },
                  { id: 'sans', label: 'Modern Sans' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateCover({ fontFamily: f.id as any })}
                    className={`py-2 px-3 rounded-lg border text-center transition ${
                      cover.fontFamily === f.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-semibold'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tagline / Subtitle */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-stone-400">
                Front Cover Tagline / Hook
              </label>
              <input
                type="text"
                value={cover.tagline || ''}
                onChange={(e) => updateCover({ tagline: e.target.value })}
                placeholder="e.g. Where Insight Becomes Form"
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
