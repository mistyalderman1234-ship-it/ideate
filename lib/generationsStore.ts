import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CategoryId, Generation } from './types';
import { FREE_DAILY_CREDITS } from './catalog';

function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

interface GenerationsState {
  history: Generation[];
  creditsDate: string;
  creditsUsed: number;
  hydrated: boolean;
  addGeneration: (input: {
    categoryId: CategoryId;
    categoryTitle: string;
    prompt: string;
    output: string;
  }) => Generation;
  toggleFavorite: (id: string) => void;
  removeGeneration: (id: string) => void;
  clearHistory: () => void;
  consumeCredit: () => void;
  getRemainingCredits: () => number;
  resetCreditsIfNewDay: () => void;
}

export const useGenerationsStore = create<GenerationsState>()(
  persist(
    (set, get) => ({
      history: [],
      creditsDate: todayKey(),
      creditsUsed: 0,
      hydrated: false,
      addGeneration: (input) => {
        const generation: Generation = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          categoryId: input.categoryId,
          categoryTitle: input.categoryTitle,
          prompt: input.prompt,
          output: input.output,
          createdAt: Date.now(),
          favorite: false,
        };
        set((state) => ({ history: [generation, ...state.history] }));
        return generation;
      },
      toggleFavorite: (id) =>
        set((state) => ({
          history: state.history.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)),
        })),
      removeGeneration: (id) =>
        set((state) => ({ history: state.history.filter((g) => g.id !== id) })),
      clearHistory: () => set({ history: [] }),
      resetCreditsIfNewDay: () => {
        const key = todayKey();
        if (get().creditsDate !== key) {
          set({ creditsDate: key, creditsUsed: 0 });
        }
      },
      consumeCredit: () => {
        const key = todayKey();
        if (get().creditsDate !== key) {
          set({ creditsDate: key, creditsUsed: 1 });
        } else {
          set((state) => ({ creditsUsed: state.creditsUsed + 1 }));
        }
      },
      getRemainingCredits: () => {
        const state = get();
        if (state.creditsDate !== todayKey()) return FREE_DAILY_CREDITS;
        return Math.max(0, FREE_DAILY_CREDITS - state.creditsUsed);
      },
    }),
    {
      name: 'ai-business-generations',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
        creditsDate: state.creditsDate,
        creditsUsed: state.creditsUsed,
      }),
      onRehydrateStorage: () => (state) => {
        state?.resetCreditsIfNewDay();
        useGenerationsStore.setState({ hydrated: true });
      },
    },
  ),
);
