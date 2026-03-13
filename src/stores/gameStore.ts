import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameStore, GameSettings } from '../types/game';
import { getRandomLocation, getRandomLocationNear } from '../data/locations';
import { haversineDistance, calculateScore } from '../utils/haversine';

const ZONE_COUNT = 37; // ZONES 배열 크기
const HISTORY_SIZE = Math.floor(ZONE_COUNT / 2);

const DEFAULT_SETTINGS: GameSettings = {
  radiusMeters: 50,
  timeLimitSeconds: null,
  difficulty: 'normal',
  showCompass: true,
  showMinimap: false,
  isDetailedMode: false,
  detailedModeRadiusMeters: 1000,
  isMirrorMode: false,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: 'home',
      settings: DEFAULT_SETTINGS,
      currentLocation: null,
      guessLocation: null,
      distanceMeters: null,
      score: null,
      timeElapsed: 0,
      recentLocationNames: [],
      centerPoint: null,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setCenterPoint: (lat, lng) =>
        set({ centerPoint: { lat, lng } }),

      setCurrentLocation: (location) =>
        set({ currentLocation: location }),

      startGame: () => {
        const { recentLocationNames, settings, centerPoint } = get();
        
        let location;
        if (settings.isDetailedMode && centerPoint) {
          location = getRandomLocationNear(centerPoint, settings.detailedModeRadiusMeters);
        } else {
          location = getRandomLocation(recentLocationNames);
        }
        
        const updatedHistory = [location.name, ...recentLocationNames].slice(0, HISTORY_SIZE);
        set({
          phase: 'game',
          currentLocation: location,
          guessLocation: null,
          distanceMeters: null,
          score: null,
          timeElapsed: 0,
          recentLocationNames: updatedHistory,
        });
      },

      // 파노라마 데이터 없을 때 같은 존 내 다른 좌표로 재시도
      retryLocation: () => {
        const { recentLocationNames, currentLocation, settings, centerPoint } = get();
        
        let location;
        if (settings.isDetailedMode && centerPoint) {
          location = getRandomLocationNear(centerPoint, settings.detailedModeRadiusMeters);
        } else {
          // 현재 존 이름 유지하되 좌표만 새로 뽑음 (존 이름은 히스토리에 이미 있음)
          location = getRandomLocation(
            currentLocation ? recentLocationNames.filter((n) => n !== currentLocation.name) : recentLocationNames
          );
        }
        set({ currentLocation: location });
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
        const score = calculateScore(distanceMeters, settings.difficulty, settings.isDetailedMode);
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
    }),
    {
      name: 'random-roadmap-storage',
      storage: createJSONStorage(() => localStorage),
      // 설정, 히스토리, 중심점만 저장 (진행 중인 게임 상태는 제외)
      partialize: (state) => ({
        settings: state.settings,
        recentLocationNames: state.recentLocationNames,
        centerPoint: state.centerPoint,
      }),
    }
  )
);
