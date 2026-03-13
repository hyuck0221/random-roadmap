import { useGameStore } from '../../stores/gameStore';
import { useGameTimer } from '../../hooks/useGameTimer';

interface GameHUDProps {
  onTimerExpire: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function GameHUD({ onTimerExpire }: GameHUDProps) {
  const { settings, currentLocation } = useGameStore();
  const { remaining } = useGameTimer({
    timeLimitSeconds: settings.timeLimitSeconds,
    onExpire: onTimerExpire,
  });

  const isWarning = remaining !== null && remaining <= 60;

  return (
    <div className="game-hud">
      {remaining !== null && (
        <div className={`hud-timer ${isWarning ? 'warning' : ''}`}>
          {formatTime(remaining)}
        </div>
      )}
      <div className="hud-radius">
        반경 {settings.radiusMeters}m
      </div>
      {currentLocation && (
        <div className="hud-location">
          📍 위치를 찾아보세요
        </div>
      )}
    </div>
  );
}
