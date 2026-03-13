import { useEffect, useRef, useState } from 'react';

interface UseGameTimerOptions {
  timeLimitSeconds: number | null;
  onExpire?: () => void;
}

export function useGameTimer({ timeLimitSeconds, onExpire }: UseGameTimerOptions) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (timeLimitSeconds !== null && next >= timeLimitSeconds) {
          clearInterval(intervalRef.current!);
          onExpireRef.current?.();
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeLimitSeconds]);

  const remaining =
    timeLimitSeconds !== null ? Math.max(0, timeLimitSeconds - elapsed) : null;

  return { elapsed, remaining };
}
