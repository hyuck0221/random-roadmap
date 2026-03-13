export interface GameSettings {
  radiusMeters: number;
  timeLimitSeconds: number | null; // null = unlimited
  difficulty: 'easy' | 'normal' | 'hard';
  showCompass: boolean;
  showMinimap: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  name: string;
  description?: string;
}

export interface GameState {
  phase: 'home' | 'game' | 'result';
  settings: GameSettings;
  currentLocation: Location | null;
  guessLocation: { lat: number; lng: number } | null;
  distanceMeters: number | null;
  score: number | null;
  timeElapsed: number;
  recentLocationNames: string[];
}

export interface GameStore extends GameState {
  updateSettings: (settings: Partial<GameSettings>) => void;
  startGame: () => void;
  retryLocation: () => void;
  setGuessLocation: (lat: number, lng: number) => void;
  submitGuess: () => void;
  resetGame: () => void;
}

export type GamePhase = 'home' | 'game' | 'result';
