import React, { useState } from 'react';
import { Book } from '../types/book';
import { Sparkles, Wand2, Compass, ArrowRight, Lightbulb, CheckCircle2, RefreshCw } from 'lucide-react';

interface ConceptWizardProps {
  currentBook: Book;
  onUpdateBook: (updated: Partial<Book>) => void;
  onNavigateToOutline: () => void;
}

const GENRES = [
  'Non-Fiction & Business',
  'Technology & AI',
  'Sci-Fi & Cyberpunk',
  'Fantasy & Adventure',
  'Self-Help & Habits',
  'Mystery & Thriller',
  'Philosophy & Mind',
  'Memoir & Personal Journey',
];

const TONES = [
  'Visionary & Thought-Provoking',
  'Practical & Step-by-Step',
  'Atmospheric & Cinematic',
  'Conversational & Warm',
  'Scholarly & Authoritative',
  'Poetic & Reflective',
];

const INSPIRATION_PROMPTS = [
  {
    topic: 'The Solo Founder Playbook: Building Multi-Million Dollar Software in 2026',
    genre: 'Non-Fiction & Business',
    tone: 'Practical & Step-by-Step',
    chapters: 6,
  },
  {
    topic: 'Echoes of the Starlit Forest: A Journey Beyond the Veil of Time',
    genre: 'Fantasy & Adventure',
    tone: 'Atmospheric & Cinematic',
    chapters: 5,
  },
  {
    topic: 'The Focused Mind: Deep Work and Cognitive Sovereignty in the Age of Noise',
    genre: 'Self-Help & Habits',
    tone: 'Visionary & Thought-Provoking',
    chapters: 6,
  },
  {
    topic: 'Silicon & Soul: How AI is Redefining Creativity, Love, and Philosophy',
    genre: 'Technology & AI',
    tone: 'Poetic & Reflective',
    chapters: 5,
  },
];

export const ConceptWizard: React.FC<ConceptWizardProps> = ({
  currentBook,
  onUpdateBook,
  onNavigateToOutline,
}) => {
  const [topic, setTopic] = useState(currentBook.description || currentBook.title || '');
  const [genre, setGenre] = useState(currentBook.genre || 'Non-Fiction & Business');
  const [tone, setTone] = useState(currentBook.tone || 'Visionary & Thought-Provoking');
  const [targetAudience, setTargetAudience] = useState(currentBook.targetAudience || 'Modern thinkers, creators, and professionals');
  const [authorName, setAuthorName] = useState(currentBook.author || 'Author');
  const [chapterCount, setChapterCount] = useState(Math.max(3, currentBook.chapters.length || 6));
  const [customNotes, setCustomNotes] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleApplyPreset = (preset: typeof INSPIRATION_PROMPTS[0]) => {
    setTopic(preset.topic);
    setGenre(preset.genre);
    setTone(preset.tone);
    setChapterCount(preset.chapters);
  };

  const handleGenerateBlueprint = async () => {
    if (!topic.trim()) {
      setErrorMessage('Please describe your book premise or topic.');
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);
    setGenerationStep('Architecting narrative structure & themes...');

    try {
      const res = await fetch('/api/book/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          genre,
          tone,
          targetAudience,
          targetChapterCount: chapterCount,
          authorName: authorName || 'FolioAI Author',
          customNotes,
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned an error generating blueprint');
      }

      const blueprint = await res.json();

      onUpdateBook({
        title: blueprint.title || currentBook.title,
        subtitle: blueprint.subtitle || currentBook.subtitle,
        author: blueprint.author || authorName,
        genre: blueprint.genre || genre,
        tone: blueprint.tone || tone,
        targetAudience: blueprint.targetAudience || targetAudience,
        description: blueprint.description || topic,
        chapters: blueprint.chapters || currentBook.chapters,
        cover: {
          ...currentBook.cover,
          primaryColor: blueprint.themeColor || currentBook.cover.primaryColor,
        },
      });

      setGenerationStep('Complete! Directing to your manuscript outline...');
      setTimeout(() => {
        setIsGenerating(false);
        onNavigateToOutline();
      }, 700);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate blueprint. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Publishing Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Shape Your Next Masterpiece
        </h1>
        <p className="mt-2 text-stone-400 text-sm sm:text-base max-w-xl mx-auto">
          Provide your core premise or choose an inspiration prompt. Our AI editor will structure your chapters, pacing, and chapter synopses automatically.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="bg-stone-850 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
        
        {/* Inspiration chips */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Need inspiration? Try these presets</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {INSPIRATION_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(prompt)}
                className="text-left p-3 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 hover:border-amber-500/40 text-stone-300 transition group"
              >
                <div className="text-xs font-medium text-amber-400 group-hover:text-amber-300 truncate">
                  {prompt.genre} • {prompt.chapters} Chapters
                </div>
                <div className="text-xs text-stone-300 font-sans mt-0.5 line-clamp-2">
                  {prompt.topic}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Premise / Topic */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-200">
            Book Premise, Core Idea, or Working Title <span className="text-amber-400">*</span>
          </label>
          <textarea
            rows={3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. A comprehensive, actionable guide to building automated micro-SaaS businesses in 2026, focusing on lean principles and AI tools..."
            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-sans"
          />
          <p className="text-xs text-stone-500">
            Be as brief or detailed as you like. The AI will extrapolate themes, character arcs, or technical chapters.
          </p>
        </div>

        {/* Genre Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-200">
            Genre & Category
          </label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  genre === g
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm shadow-amber-500/20'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-750 border border-stone-700/60'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-200">
            Tone & Narrative Voice
          </label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  tone === t
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-750 border border-stone-700/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience & Author Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-300">
              Author Name (for Cover & Copyright)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. John Doe, Elena Vance"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3.5 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-stone-300">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Aspiring entrepreneurs, sci-fi readers"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3.5 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Chapter Count Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-stone-200">Desired Chapter Count</span>
            <span className="text-amber-400 font-bold font-mono">{chapterCount} Chapters</span>
          </div>
          <input
            type="range"
            min={3}
            max={12}
            step={1}
            value={chapterCount}
            onChange={(e) => setChapterCount(Number(e.target.value))}
            className="w-full accent-amber-500 h-2 bg-stone-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-500 font-mono">
            <span>3 (Quick Novella / Guide)</span>
            <span>6 (Standard Book)</span>
            <span>12 (Comprehensive Manuscript)</span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Action button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ready to generate complete outline and ready-to-write chapters</span>
          </div>

          <button
            type="button"
            onClick={handleGenerateBlueprint}
            disabled={isGenerating}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm transition shadow-lg ${
              isGenerating
                ? 'bg-amber-600/50 text-stone-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-amber-950/40 hover:shadow-amber-500/20 transform active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>{generationStep}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-stone-950" />
                <span>Generate Manuscript Blueprint</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Quick Jump to Existing Outline if book already has content */}
      {currentBook.chapters.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-300 font-medium">{currentBook.title}</span>
            <span className="text-stone-500 ml-2">({currentBook.chapters.length} chapters configured)</span>
          </div>
          <button
            onClick={onNavigateToOutline}
            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>Go directly to Outline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
