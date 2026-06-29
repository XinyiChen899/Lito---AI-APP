export type EmotionType = 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral' | 'calm';

export type DreamType = 'memory' | 'emotion' | 'exploration' | 'collaborative';

export type LitoAction = 'company' | 'listen' | 'play' | 'meditate';

export interface LitoStatus {
  connectionLevel: number;
  energy: number;
  curiosity: number;
  calmness: number;
  level: number;
  experience: number;
  hardwareStatus?: HardwareStatus;
}

export interface HardwareStatus {
  battery: number;
  connected: boolean;
  action: 'idle' | 'wave' | 'spin' | 'snuggle' | 'sleep';
  lightColor: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  reply: string;
  emotion: EmotionType;
  emotionScore: number;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: string;
  mood: EmotionType;
  content: string;
  createdAt: string;
}

export interface MemoryFragment {
  id: string;
  dreamId: string;
  content: string;
  imageUrl?: string;
  unlocked: boolean;
  collected: boolean;
}

export interface Dream {
  id: string;
  userId: string;
  type: DreamType;
  title: string;
  content: string;
  fragments: MemoryFragment[];
  isActive: boolean;
  createdAt: string;
}

export interface EmotionReport {
  userId: string;
  period: string;
  avgMood: string;
  moodTrend: Array<{ date: string; mood: string; score: number }>;
  suggestions: string[];
  dreamSuggestions: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  nickname: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}