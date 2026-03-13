const EARTH_RADIUS_M = 6371000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateScore(
  distanceMeters: number, 
  difficulty: 'easy' | 'normal' | 'hard',
  isDetailedMode: boolean = false
): number {
  const multiplier = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.5 : 1.0;
  
  // 세밀 모드에서는 감쇠 상수를 작게 하여 거리에 더 민감하게 반응 (2000m -> 50m)
  const decayConstant = isDetailedMode ? 50 : 2000;
  const base = Math.round(5000 * Math.exp(-distanceMeters / decayConstant));
  
  return Math.round(base * multiplier);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
