import { create } from 'zustand';
import type { LitoStatus, ChatMessage, DiaryEntry, Dream, EmotionType } from '../types';

interface LitoStore {
  litoStatus: LitoStatus;
  chatMessages: ChatMessage[];
  diaryEntries: DiaryEntry[];
  dreams: Dream[];
  currentDream: Dream | null;
  userEmotion: EmotionType;
  setLitoStatus: (status: LitoStatus) => void;
  updateLitoStatus: (updates: Partial<LitoStatus>) => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addDiaryEntry: (entry: DiaryEntry) => void;
  setDiaryEntries: (entries: DiaryEntry[]) => void;
  setDreams: (dreams: Dream[]) => void;
  setCurrentDream: (dream: Dream | null) => void;
  collectFragment: (dreamId: string, fragmentId: string) => void;
  setUserEmotion: (emotion: EmotionType) => void;
}

const initialLitoStatus: LitoStatus = {
  connectionLevel: 75,
  energy: 60,
  curiosity: 80,
  calmness: 70,
  level: 5,
  experience: 230,
  hardwareStatus: {
    battery: 85,
    connected: true,
    action: 'idle',
    lightColor: '#FF7F7F',
  },
};

export const useLitoStore = create<LitoStore>((set) => ({
  litoStatus: initialLitoStatus,
  chatMessages: [],
  diaryEntries: [],
  dreams: [],
  currentDream: null,
  userEmotion: 'neutral',

  setLitoStatus: (status) => set({ litoStatus: status }),

  updateLitoStatus: (updates) =>
    set((state) => ({ litoStatus: { ...state.litoStatus, ...updates } })),

  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  setChatMessages: (messages) => set({ chatMessages: messages }),

  addDiaryEntry: (entry) =>
    set((state) => ({ diaryEntries: [...state.diaryEntries, entry] })),

  setDiaryEntries: (entries) => set({ diaryEntries: entries }),

  setDreams: (dreams) => set({ dreams }),

  setCurrentDream: (dream) => set({ currentDream: dream }),

  collectFragment: (dreamId, fragmentId) =>
    set((state) => ({
      dreams: state.dreams.map((dream) =>
        dream.id === dreamId
          ? {
              ...dream,
              fragments: dream.fragments.map((fragment) =>
                fragment.id === fragmentId
                  ? { ...fragment, collected: true }
                  : fragment
              ),
            }
          : dream
      ),
      currentDream: state.currentDream?.id === dreamId
        ? {
            ...state.currentDream,
            fragments: state.currentDream.fragments.map((fragment) =>
              fragment.id === fragmentId
                ? { ...fragment, collected: true }
                : fragment
            ),
          }
        : state.currentDream,
    })),

  setUserEmotion: (emotion) => set({ userEmotion: emotion }),
}));