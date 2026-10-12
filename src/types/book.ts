export interface Chapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  keyTakeaways: string[];
  estimatedWords: number;
  content: string;
  status: 'draft' | 'writing' | 'completed';
}

export interface CoverDesign {
  template: 'editorial' | 'minimalist' | 'classic' | 'bold' | 'atmospheric' | 'vintage';
  primaryColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: 'serif' | 'sans' | 'cinzel' | 'playfair' | 'lora';
  motif: 'quill' | 'compass' | 'tree' | 'sun' | 'mountain' | 'book' | 'abstract-rings' | 'stars' | 'shield' | 'feather';
  tagline: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  genre: string;
  tone: string;
  targetAudience: string;
  description: string;
  chapters: Chapter[];
  cover: CoverDesign;
  createdAt: string;
  updatedAt: string;
}
