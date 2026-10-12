import React, { useState } from 'react';
import { Book, Chapter } from '../types/book';
import { calculateWordCount, estimateReadingTime } from '../utils/markdownParser';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Play, 
  RefreshCw,
  Sliders,
  Layers
} from 'lucide-react';

interface OutlineBoardProps {
  currentBook: Book;
  onUpdateBook: (updated: Partial<Book>) => void;
  onSelectChapterToEdit: (chapterId: string) => void;
}

export const OutlineBoard: React.FC<OutlineBoardProps> = ({
  currentBook,
  onUpdateBook,
  onSelectChapterToEdit,
}) => {
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [writingChapterId, setWritingChapterId] = useState<string | null>(null);
  const [batchWriting, setBatchWriting] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, title: '' });

  // Manuscript stats
  const totalWords = currentBook.chapters.reduce((sum, ch) => sum + calculateWordCount(ch.content || ''), 0);
  const readingTime = estimateReadingTime(totalWords);
  const completedChapters = currentBook.chapters.filter((ch) => ch.content && ch.content.trim().length > 0).length;

  // Reordering
  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBook.chapters.length) return;

    const newChapters = [...currentBook.chapters];
    const temp = newChapters[index];
    newChapters[index] = newChapters[targetIndex];
    newChapters[targetIndex] = temp;

    // Re-number
    const renumbered = newChapters.map((ch, idx) => ({ ...ch, number: idx + 1 }));
    onUpdateBook({ chapters: renumbered });
  };

  // Add chapter
  const handleAddChapter = () => {
    const newNumber = currentBook.chapters.length + 1;
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      number: newNumber,
      title: `Chapter ${newNumber}: New Chapter`,
      summary: 'Add an evocative synopsis for this chapter...',
      keyTakeaways: ['Key point 1', 'Key point 2'],
      estimatedWords: 1500,
      content: '',
      status: 'draft',
    };
    onUpdateBook({ chapters: [...currentBook.chapters, newChapter] });
    setEditingChapterId(newChapter.id);
  };

  // Delete chapter
  const handleDeleteChapter = (id: string) => {
    if (currentBook.chapters.length <= 1) {
      alert('A manuscript must have at least one chapter.');
      return;
    }
    const filtered = currentBook.chapters.filter((ch) => ch.id !== id);
    const renumbered = filtered.map((ch, idx) => ({ ...ch, number: idx + 1 }));
    onUpdateBook({ chapters: renumbered });
  };

  // Single Chapter AI Generation
  const handleWriteChapterWithAI = async (chapter: Chapter) => {
    setWritingChapterId(chapter.id);
    try {
      const res = await fetch('/api/book/write-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: currentBook.title,
          bookGenre: currentBook.genre,
          bookTone: currentBook.tone,
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          chapterSummary: chapter.summary,
          keyTakeaways: chapter.keyTakeaways,
          targetLength: 'standard',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate chapter');

      const data = await res.json();
      const updatedChapters = currentBook.chapters.map((ch) =>
        ch.id === chapter.id
          ? { ...ch, content: data.content, status: 'completed' as const }
          : ch
      );

      onUpdateBook({ chapters: updatedChapters });
    } catch (err: any) {
      console.error(err);
      alert('Error writing chapter: ' + (err.message || 'Unknown error'));
    } finally {
      setWritingChapterId(null);
    }
  };

  // Batch Generation: Write all incomplete chapters sequentially
  const handleBatchWriteAll = async () => {
    const incomplete = currentBook.chapters.filter((ch) => !ch.content || ch.content.trim().length === 0);
    if (incomplete.length === 0) {
      if (!confirm('All chapters already have content. Would you like to regenerate all chapters from scratch?')) {
        return;
      }
    }

    const toProcess = incomplete.length > 0 ? incomplete : currentBook.chapters;
    setBatchWriting(true);
    setBatchProgress({ current: 0, total: toProcess.length, title: '' });

    let updatedChapters = [...currentBook.chapters];

    for (let i = 0; i < toProcess.length; i++) {
      const ch = toProcess[i];
      setBatchProgress({ current: i + 1, total: toProcess.length, title: ch.title });

      try {
        const res = await fetch('/api/book/write-chapter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookTitle: currentBook.title,
            bookGenre: currentBook.genre,
            bookTone: currentBook.tone,
            chapterNumber: ch.number,
            chapterTitle: ch.title,
            chapterSummary: ch.summary,
            keyTakeaways: ch.keyTakeaways,
            targetLength: 'standard',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          updatedChapters = updatedChapters.map((c) =>
            c.id === ch.id ? { ...c, content: data.content, status: 'completed' as const } : c
          );
          onUpdateBook({ chapters: updatedChapters });
        }
      } catch (err) {
        console.error('Error on chapter', ch.number, err);
      }
    }

    setBatchWriting(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Top Banner & Stats */}
      <div className="bg-stone-850 border border-stone-800 rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Manuscript Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {currentBook.title || 'Untitled Manuscript'}
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl">
              {currentBook.subtitle || currentBook.description || 'Manage chapter arcs, adjust sequence, and write content chapter by chapter.'}
            </p>
          </div>

          {/* Action: Batch Write */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleBatchWriteAll}
              disabled={batchWriting}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs shadow-md transition ${
                batchWriting
                  ? 'bg-amber-600/40 text-stone-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-amber-950/30'
              }`}
            >
              {batchWriting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Writing Chapter {batchProgress.current} of {batchProgress.total}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                  <span>Auto-Draft All Chapters</span>
                </>
              )}
            </button>

            <button
              onClick={handleAddChapter}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chapter</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-800/80 text-xs">
          <div className="bg-stone-900/50 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-500 block mb-1">Chapters</span>
            <div className="text-base font-bold text-stone-200 font-mono">
              <span className="text-amber-400">{completedChapters}</span> / {currentBook.chapters.length} Ready
            </div>
          </div>
          <div className="bg-stone-900/50 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-500 block mb-1">Total Words</span>
            <div className="text-base font-bold text-stone-200 font-mono">
              {totalWords.toLocaleString()} <span className="text-xs font-normal text-stone-500">words</span>
            </div>
          </div>
          <div className="bg-stone-900/50 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-500 block mb-1">Est. Reading Time</span>
            <div className="text-base font-bold text-stone-200 font-mono">
              ~{readingTime} <span className="text-xs font-normal text-stone-500">minutes</span>
            </div>
          </div>
          <div className="bg-stone-900/50 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-500 block mb-1">Manuscript Status</span>
            <div className="text-base font-bold text-emerald-400">
              {completedChapters === currentBook.chapters.length && completedChapters > 0 ? 'Ready to Publish' : 'Drafting In Progress'}
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Board */}
      <div className="space-y-4">
        {currentBook.chapters.map((chapter, index) => {
          const isWriting = writingChapterId === chapter.id;
          const isEditing = editingChapterId === chapter.id;
          const words = calculateWordCount(chapter.content || '');
          const hasContent = words > 50;

          return (
            <div
              key={chapter.id}
              className={`rounded-2xl border transition shadow-sm ${
                hasContent
                  ? 'bg-stone-850/80 border-stone-800 hover:border-stone-700'
                  : 'bg-stone-900/80 border-stone-800/60 hover:border-amber-500/30'
              }`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Chapter Header & Title */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700/80 flex items-center justify-center text-xs font-bold font-mono text-amber-400 shrink-0 mt-0.5">
                      {chapter.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) => {
                              const updated = currentBook.chapters.map((c) =>
                                c.id === chapter.id ? { ...c, title: e.target.value } : c
                              );
                              onUpdateBook({ chapters: updated });
                            }}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
                          />
                          <textarea
                            rows={2}
                            value={chapter.summary}
                            onChange={(e) => {
                              const updated = currentBook.chapters.map((c) =>
                                c.id === chapter.id ? { ...c, summary: e.target.value } : c
                              );
                              onUpdateBook({ chapters: updated });
                            }}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500 font-sans"
                            placeholder="Chapter synopsis..."
                          />
                          <button
                            onClick={() => setEditingChapterId(null)}
                            className="text-xs text-amber-400 font-medium hover:underline"
                          >
                            Save details
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif font-bold text-base text-white hover:text-amber-300 cursor-pointer transition"
                                onClick={() => onSelectChapterToEdit(chapter.id)}>
                              {chapter.title}
                            </h3>
                            {hasContent ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                {words.toLocaleString()} words
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-800 text-stone-400 border border-stone-700">
                                Outline only
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                            {chapter.summary || 'No synopsis provided.'}
                          </p>
                        </div>
                      )}

                      {/* Key Takeaways list */}
                      {!isEditing && chapter.keyTakeaways && chapter.keyTakeaways.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {chapter.keyTakeaways.map((takeaway, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[11px] px-2 py-0.5 rounded bg-stone-800/80 text-stone-400 border border-stone-800"
                            >
                              • {takeaway}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    
                    {/* Write with AI */}
                    <button
                      onClick={() => handleWriteChapterWithAI(chapter)}
                      disabled={isWriting}
                      title="Generate or rewrite full chapter with AI"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        hasContent
                          ? 'bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {isWriting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>Writing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{hasContent ? 'Redraft AI' : 'Draft Chapter AI'}</span>
                        </>
                      )}
                    </button>

                    {/* Open in Editor */}
                    <button
                      onClick={() => onSelectChapterToEdit(chapter.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-medium transition"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Studio</span>
                    </button>

                    {/* Quick Edit metadata */}
                    <button
                      onClick={() => setEditingChapterId(isEditing ? null : chapter.id)}
                      title="Edit Title & Synopsis"
                      className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Reorder Up/Down */}
                    <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
                      <button
                        onClick={() => handleMoveChapter(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:hover:text-stone-400"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveChapter(index, 'down')}
                        disabled={index === currentBook.chapters.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:hover:text-stone-400"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      title="Delete Chapter"
                      className="p-1.5 rounded-lg hover:bg-red-950/40 text-stone-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
