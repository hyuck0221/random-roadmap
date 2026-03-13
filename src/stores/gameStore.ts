import { create } from 'zustand';
import type { GameStore, GameSettings } from '../types/game';
import { getRandomLocation } from '../data/locations';
import { haversineDistance, calculateScore } from '../utils/haversine';

const DEFAULT_SETTINGS: GameSettings = {
  radiusMeters: 50,
  timeLimitSeconds: null,
  difficulty: 'normal',
  showCompass: true,
  showMinimap: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'home',
  settings: DEFAULT_SETTINGS,
  currentLocation: null,
  guessLocation: null,
  distanceMeters: null,
  score: null,
  timeElapsed: 0,

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  startGame: () => {
    const location = getRandomLocation();
    set({
      phase: 'game',
      currentLocation: location,
      guessLocation: null,
      distanceMeters: null,
      score: null,
      timeElapsed: 0,
    });
  },

  setGuessLocation: (lat, lng) =>
    set({ guessLocation: { lat, lng } }),

  submitGuess: () => {
    const { currentLocation, guessLocation, settings } = get();
    if (!currentLocation || !guessLocation) return;

    const distanceMeters = haversineDistance(
      currentLocation.lat,
      currentLocation.lng,
      guessLocation.lat,
      guessLocation.lng
    );
    const score = calculateScore(distanceMeters, settings.difficulty);

    set({ phase: 'result', distanceMeters, score });
  },

  resetGame: () =>
    set({
      phase: 'home',
      currentLocation: null,
      guessLocation: null,
      distanceMeters: null,
      score: null,
      timeElapsed: 0,
    }),
}));
