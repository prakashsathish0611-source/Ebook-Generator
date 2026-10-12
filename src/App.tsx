/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book, Chapter } from './types/book';
import { SAMPLE_BOOKS } from './data/sampleBooks';
import { Navbar } from './components/Navbar';
import { ConceptWizard } from './components/ConceptWizard';
import { OutlineBoard } from './components/OutlineBoard';
import { ChapterStudio } from './components/ChapterStudio';
import { CoverStudio } from './components/CoverStudio';
import { ReaderModal } from './components/ReaderModal';
import { ExportModal } from './components/ExportModal';

const STORAGE_KEY = 'folioai_manuscripts_v1';
const ACTIVE_BOOK_KEY = 'folioai_active_book_id';

export default function App() {
  const [allBooks, setAllBooks] = useState<Book[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load books from localStorage', e);
    }
    return SAMPLE_BOOKS;
  });

  const [currentBookId, setCurrentBookId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_BOOK_KEY);
      if (stored) return stored;
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_BOOKS[0].id;
  });

  const [activeTab, setActiveTab] = useState<'blueprint' | 'outline' | 'editor' | 'cover' | 'reader'>('outline');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Active book
  const currentBook = allBooks.find((b) => b.id === currentBookId) || allBooks[0] || SAMPLE_BOOKS[0];

  // Sync active chapter if none selected or if book switches
  useEffect(() => {
    if (!selectedChapterId && currentBook?.chapters?.length > 0) {
      setSelectedChapterId(currentBook.chapters[0].id);
    } else if (currentBook?.chapters?.length > 0 && !currentBook.chapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(currentBook.chapters[0].id);
    }
  }, [currentBook, selectedChapterId]);

  // Save to localStorage
  useEffect(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allBooks));
      localStorage.setItem(ACTIVE_BOOK_KEY, currentBookId);
    } catch (e) {
      console.error('Error saving books', e);
    }
    const timer = setTimeout(() => setIsSaving(false), 300);
    return () => clearTimeout(timer);
  }, [allBooks, currentBookId]);

  // Update current book
  const handleUpdateBook = (updated: Partial<Book>) => {
    setAllBooks((prev) =>
      prev.map((b) => (b.id === currentBook.id ? { ...b, ...updated, updatedAt: new Date().toISOString() } : b))
    );
  };

  // Create new book
  const handleNewBook = () => {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: 'Untitled Manuscript',
      subtitle: '',
      author: 'Author',
      genre: 'Non-Fiction & Business',
      tone: 'Visionary & Thought-Provoking',
      targetAudience: 'Modern readers',
      description: '',
      chapters: [
        {
          id: `ch-${Date.now()}-1`,
          number: 1,
          title: 'Introduction & Foundations',
          summary: 'The inaugural chapter establishing the premise and themes.',
          keyTakeaways: ['Foundational insight 1', 'Foundational insight 2'],
          estimatedWords: 1500,
          content: '',
          status: 'draft',
        },
      ],
      cover: {
        template: 'editorial',
        primaryColor: '#0f172a',
        accentColor: '#f59e0b',
        textColor: '#ffffff',
        fontFamily: 'serif',
        motif: 'book',
        tagline: 'A New Journey in Thought',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAllBooks((prev) => [newBook, ...prev]);
    setCurrentBookId(newBook.id);
    setSelectedChapterId(newBook.chapters[0].id);
    setActiveTab('blueprint');
  };

  // Select chapter to edit
  const handleSelectChapterToEdit = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setActiveTab('editor');
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Navbar */}
      <Navbar
        currentBook={currentBook}
        allBooks={allBooks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectBook={(book) => {
          setCurrentBookId(book.id);
          if (book.chapters.length > 0) {
            setSelectedChapterId(book.chapters[0].id);
          }
        }}
        onNewBook={handleNewBook}
        onOpenExport={() => setShowExportModal(true)}
        isSaving={isSaving}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'blueprint' && (
          <ConceptWizard
            currentBook={currentBook}
            onUpdateBook={handleUpdateBook}
            onNavigateToOutline={() => setActiveTab('outline')}
          />
        )}

        {activeTab === 'outline' && (
          <OutlineBoard
            currentBook={currentBook}
            onUpdateBook={handleUpdateBook}
            onSelectChapterToEdit={handleSelectChapterToEdit}
          />
        )}

        {activeTab === 'editor' && (
          <ChapterStudio
            currentBook={currentBook}
            selectedChapterId={selectedChapterId}
            onSelectChapter={setSelectedChapterId}
            onUpdateBook={handleUpdateBook}
          />
        )}

        {activeTab === 'cover' && (
          <CoverStudio
            currentBook={currentBook}
            onUpdateBook={handleUpdateBook}
          />
        )}

        {activeTab === 'reader' && (
          <ReaderModal
            currentBook={currentBook}
            onClose={() => setActiveTab('outline')}
          />
        )}
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          currentBook={currentBook}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
