
export interface Poem {
  title: string;
  author: string;
  dynasty: string;
  content: string[]; // Array of lines
  analysis: string; // Brief explanation of why it matches
  context: string; // Historical context
}

export interface KeywordCard {
  term: string;
  category: string; // Changed from specific English union to string to support Chinese categories (地理, 风物 etc)
  description: string;
  culturalSignificance: string;
}

export interface PoetLetter {
  content: string;
  poet: string;
  replyTo: string; // The user's input feeling
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppScreen {
  HOME = 'HOME',
  POEM_DISPLAY = 'POEM_DISPLAY',
  SHAN_HE_ZHI = 'SHAN_HE_ZHI', // The card explorer
  LETTER = 'LETTER', // Changed from CHAT to LETTER
  COLLECTION = 'COLLECTION'
}

export interface UserCollectionItem {
  id: string;
  type: 'card' | 'poem' | 'letter';
  data: Poem | KeywordCard | PoetLetter;
  date: string;
  sourcePrompt?: string; // The user's input feeling (if applicable)
}
