import React, { useState, useRef } from 'react';
import { Book, Chapter } from '../types/book';
import { calculateWordCount, estimateReadingTime, markdownToHtml } from '../utils/markdownParser';
import { 
  Sparkles, 
  Wand2, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Quote, 
  List, 
  ListOrdered, 
  Minus, 
  SplitSquareVertical, 
  Maximize2, 
  Eye, 
  Code, 
  CheckCircle2, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Sliders,
  Send,
  Zap,
  BookOpen
} from 'lucide-react';

interface ChapterStudioProps {
  currentBook: Book;
  selectedChapterId: string;
  onSelectChapter: (id: string) => void;
  onUpdateBook: (updated: Partial<Book>) => void;
}

export const ChapterStudio: React.FC<ChapterStudioProps> = ({
  currentBook,
  selectedChapterId,
  onSelectChapter,
  onUpdateBook,
}) => {
  const currentChapter = currentBook.chapters.find((ch) => ch.id === selectedChapterId) || currentBook.chapters[0];
  const currentIndex = currentBook.chapters.findIndex((ch) => ch.id === currentChapter?.id);

  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editorialAction, setEditorialAction] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [targetLength, setTargetLength] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [showAiPanel, setShowAiPanel] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!currentChapter) {
    return <div className="p-8 text-center text-stone-400">No chapters found.</div>;
  }

  const wordCount = calculateWordCount(currentChapter.content || '');
  const readingTime = estimateReadingTime(wordCount);

  // Update chapter content
  const handleContentChange = (newContent: string) => {
    const updated = currentBook.chapters.map((ch) =>
      ch.id === currentChapter.id ? { ...ch, content: newContent, status: 'completed' as const } : ch
    );
    onUpdateBook({ chapters: updated });
  };

  // Insert markdown tag at cursor
  const insertMarkdown = (before: string, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentChapter.content.substring(start, end) || 'Text';
    const replacement = `${before}${selected}${after}`;

    const newContent =
      currentChapter.content.substring(0, start) +
      replacement +
      currentChapter.content.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  // AI Generation: Write Full Chapter
  const handleAiWriteChapter = async () => {
    setIsGenerating(true);
    setEditorialAction('Auto-drafting publication-ready chapter...');

    try {
      const res = await fetch('/api/book/write-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: currentBook.title,
          bookGenre: currentBook.genre,
          bookTone: currentBook.tone,
          chapterNumber: currentChapter.number,
          chapterTitle: currentChapter.title,
          chapterSummary: currentChapter.summary,
          keyTakeaways: currentChapter.keyTakeaways,
          targetLength,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate chapter');

      const data = await res.json();
      handleContentChange(data.content);
    } catch (err: any) {
      alert('Error generating chapter: ' + err.message);
    } finally {
      setIsGenerating(false);
      setEditorialAction('');
    }
  };

  // AI Editorial: Refine / Polish / Expand
  const handleAiRefine = async (action: string, customInstruction = '') => {
    if (!currentChapter.content.trim()) {
      alert('Draft some content first or use "Draft with AI" before refining.');
      return;
    }

    setIsGenerating(true);
    setEditorialAction(
      action === 'polish'
        ? 'Polishing prose & rhythm...'
        : action === 'expand'
        ? 'Expanding depth & scenes...'
        : action === 'shorten'
        ? 'Tightening & condensing prose...'
        : action === 'add_dialogue'
        ? 'Enriching dialogues & voices...'
        : 'Applying editorial revision...'
    );

    try {
      const res = await fetch('/api/book/refine-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentChapter.content,
          action,
          customInstruction,
          tone: currentBook.tone,
        }),
      });

      if (!res.ok) throw new Error('Failed to refine chapter');

      const data = await res.json();
      handleContentChange(data.content);
      if (action === 'custom') setCustomPrompt('');
    } catch (err: any) {
      alert('Error refining chapter: ' + err.message);
    } finally {
      setIsGenerating(false);
      setEditorialAction('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Top Chapter Selector & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-bold text-sm">
            {currentChapter.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-white">
                {currentChapter.title}
              </h2>
            </div>
            <p className="text-xs text-stone-400 truncate max-w-md">
              {currentChapter.summary}
            </p>
          </div>
        </div>

        {/* Chapter Carousel / Selector & Prev-Next */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => currentIndex > 0 && onSelectChapter(currentBook.chapters[currentIndex - 1].id)}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 disabled:opacity-30 disabled:hover:bg-stone-800"
            title="Previous Chapter"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentChapter.id}
            onChange={(e) => onSelectChapter(e.target.value)}
            className="bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-200 focus:outline-none focus:border-amber-500"
          >
            {currentBook.chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Ch {ch.number}: {ch.title.length > 25 ? ch.title.substring(0, 25) + '...' : ch.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => currentIndex < currentBook.chapters.length - 1 && onSelectChapter(currentBook.chapters[currentIndex + 1].id)}
            disabled={currentIndex === currentBook.chapters.length - 1}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 disabled:opacity-30 disabled:hover:bg-stone-800"
            title="Next Chapter"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-stone-800 mx-1" />

          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
            <button
              onClick={() => setViewMode('editor')}
              className={`p-1.5 rounded text-xs ${viewMode === 'editor' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-200'}`}
              title="Editor Only"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded text-xs ${viewMode === 'split' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-200'}`}
              title="Split View"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded text-xs ${viewMode === 'preview' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-200'}`}
              title="Book Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle AI Panel */}
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              showAiPanel
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Editor</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Editor & Preview Area */}
        <div className={showAiPanel ? 'lg:col-span-8' : 'lg:col-span-12'}>
          
          {/* Formatting Toolbar (Visible in editor and split mode) */}
          {viewMode !== 'preview' && (
            <div className="bg-stone-850 border border-stone-800 rounded-t-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-1.5 rounded hover:bg-stone-750 text-stone-300 hover:text-white"
                  title="Bold (Markdown **text**)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-1.5 rounded hover:bg-stone-750 text-stone-300 hover:text-white"
                  title="Italic (Markdown *text*)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-stone-750 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ')}
                  className="p-1.5 rounded hover:bg-stone-750 text-stone-300 hover:text-white"
                  title="Section Heading (## )"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ')}
                  className="p-1.5 rounded hover:bg-stone-750 text-stone-300 hover:text-white"
                  title="Subsection Heading (### )"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-stone-750 mx-1" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  className="p-1.5 rounded hover:bg-stone-750 text-stone-300 hover:text-white"
                  title="Pull Quote / Epigraph (> )"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('\n* * *\n\n')}
                  className="p-1.5 rounded hover:bg-stone-750 text-stone-300 hover:text-white"
                  title="Scene Break (* * *)"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="p-1.5 rounded hover:bg-stone-750 text-stone-300 hover:text-white"
                  title="Bullet List (- )"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('1. ')}
                  className="p-1.5 rounded hover:bg-stone-750 text-stone-300 hover:text-white"
                  title="Numbered List (1. )"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>

              {/* Word & Reading stats */}
              <div className="flex items-center gap-3 text-xs text-stone-400 font-mono">
                <span>{wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span>~{readingTime} min read</span>
              </div>
            </div>
          )}

          {/* Content Views */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Editor Area */}
            {(viewMode === 'editor' || viewMode === 'split') && (
              <div className={`${viewMode === 'editor' ? 'md:col-span-2' : 'md:col-span-1'} relative`}>
                <textarea
                  ref={textareaRef}
                  value={currentChapter.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="# Chapter Title&#10;&#10;Start writing or use 'Draft with AI' to generate the first draft..."
                  rows={26}
                  className="w-full bg-stone-900 border border-stone-800 rounded-b-xl md:rounded-none px-4 py-4 text-sm text-stone-200 font-mono leading-relaxed placeholder-stone-600 focus:outline-none focus:border-amber-500/80 resize-y"
                />

                {isGenerating && (
                  <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-6 text-center z-20">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
                    <p className="text-stone-200 font-medium text-sm">{editorialAction || 'Generating manuscript...'}</p>
                    <p className="text-stone-500 text-xs mt-1">Applying publication-grade prose and formatting</p>
                  </div>
                )}
              </div>
            )}

            {/* Live Book Preview */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`${viewMode === 'preview' ? 'md:col-span-2' : 'md:col-span-1'} bg-stone-950 border border-stone-800 rounded-xl p-6 sm:p-8 max-h-[660px] overflow-y-auto`}>
                <div className="max-w-prose mx-auto font-serif text-stone-200 leading-relaxed text-sm sm:text-base">
                  <div className="text-center mb-6">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-amber-500 block mb-1">
                      Chapter {currentChapter.number}
                    </span>
                    <h1 className="text-2xl font-bold font-serif text-white">
                      {currentChapter.title}
                    </h1>
                  </div>

                  {currentChapter.content ? (
                    <div 
                      className="prose prose-invert prose-stone max-w-none text-stone-300 font-serif leading-relaxed [&>h1]:hidden [&>h2]:font-serif [&>h2]:text-lg [&>h2]:text-amber-200 [&>h2]:mt-6 [&>h3]:text-base [&>blockquote]:border-l-2 [&>blockquote]:border-amber-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-stone-400 [&>p]:mb-4"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(currentChapter.content) }}
                    />
                  ) : (
                    <div className="text-center py-16 text-stone-600 font-sans">
                      <BookOpen className="w-10 h-10 mx-auto text-stone-700 mb-2" />
                      <p className="text-sm">This chapter is currently empty.</p>
                      <p className="text-xs text-stone-500 mt-1">Use the AI Editor panel on the right to draft it automatically.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* AI Assistant Sidebar */}
        {showAiPanel && (
          <div className="lg:col-span-4 space-y-4">
            
            {/* Box 1: Auto-Draft Generator */}
            <div className="bg-stone-850 border border-stone-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Wand2 className="w-4 h-4" />
                <span>AI Chapter Drafting</span>
              </div>
              <p className="text-xs text-stone-400">
                Write a complete, structured chapter based on the title, synopsis, and book tone.
              </p>

              {/* Length selector */}
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                  Target Word Count
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetLength('quick')}
                    className={`py-1.5 rounded-lg border text-center transition ${
                      targetLength === 'quick'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-medium'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-300'
                    }`}
                  >
                    Quick (~800w)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetLength('standard')}
                    className={`py-1.5 rounded-lg border text-center transition ${
                      targetLength === 'standard'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-medium'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-300'
                    }`}
                  >
                    Standard (~1.5kw)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetLength('deep')}
                    className={`py-1.5 rounded-lg border text-center transition ${
                      targetLength === 'deep'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-medium'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-300'
                    }`}
                  >
                    Deep (~2.5kw)
                  </button>
                </div>
              </div>

              <button
                onClick={handleAiWriteChapter}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs shadow-md shadow-amber-950/40 transition active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Draft This Chapter</span>
                  </>
                )}
              </button>
            </div>

            {/* Box 2: Editorial Transformations */}
            <div className="bg-stone-850 border border-stone-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Editorial Refinements</span>
              </div>
              <p className="text-xs text-stone-400">
                Transform existing chapter prose with developmental editing tools:
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleAiRefine('polish')}
                  disabled={isGenerating}
                  className="w-full text-left px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-xs text-stone-300 transition flex items-center justify-between group"
                >
                  <span>✨ Polish & Elevate Prose</span>
                  <span className="text-[10px] text-stone-500 group-hover:text-amber-400 font-mono">Rhythm & Vocab</span>
                </button>

                <button
                  onClick={() => handleAiRefine('expand')}
                  disabled={isGenerating}
                  className="w-full text-left px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-xs text-stone-300 transition flex items-center justify-between group"
                >
                  <span>📖 Expand & Deepen Details</span>
                  <span className="text-[10px] text-stone-500 group-hover:text-amber-400 font-mono">+30% Depth</span>
                </button>

                <button
                  onClick={() => handleAiRefine('shorten')}
                  disabled={isGenerating}
                  className="w-full text-left px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-xs text-stone-300 transition flex items-center justify-between group"
                >
                  <span>✂️ Condense & Punch Up</span>
                  <span className="text-[10px] text-stone-500 group-hover:text-amber-400 font-mono">Tighten Flow</span>
                </button>

                <button
                  onClick={() => handleAiRefine('add_dialogue')}
                  disabled={isGenerating}
                  className="w-full text-left px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-xs text-stone-300 transition flex items-center justify-between group"
                >
                  <span>💬 Enrich Dialogue & Scenarios</span>
                  <span className="text-[10px] text-stone-500 group-hover:text-amber-400 font-mono">Voices</span>
                </button>
              </div>

              {/* Custom Prompt Input */}
              <div className="pt-2 border-t border-stone-800/80">
                <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                  Custom AI Instruction
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Add a real-world case study about..."
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customPrompt.trim()) {
                        handleAiRefine('custom', customPrompt);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAiRefine('custom', customPrompt)}
                    disabled={isGenerating || !customPrompt.trim()}
                    className="p-1.5 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-40 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
