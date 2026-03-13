import type { Location } from '../types/game';

// 전국 주요 지역 존 (중심 좌표 + 반경 도 단위)
const ZONES = [
  // 수도권
  { lat: 37.56, lng: 126.97, r: 0.30, name: '서울' },
  { lat: 37.46, lng: 126.71, r: 0.15, name: '인천' },
  { lat: 37.27, lng: 127.01, r: 0.12, name: '수원' },
  { lat: 37.66, lng: 126.83, r: 0.10, name: '고양' },
  { lat: 37.42, lng: 127.13, r: 0.10, name: '성남' },
  { lat: 37.24, lng: 127.20, r: 0.10, name: '용인' },
  { lat: 37.74, lng: 127.05, r: 0.08, name: '의정부' },
  { lat: 37.40, lng: 126.92, r: 0.08, name: '안양' },
  { lat: 37.32, lng: 126.83, r: 0.08, name: '안산' },
  { lat: 37.89, lng: 127.20, r: 0.10, name: '가평·포천' },
  // 강원
  { lat: 37.75, lng: 128.88, r: 0.12, name: '강릉' },
  { lat: 37.34, lng: 128.62, r: 0.08, name: '원주' },
  { lat: 37.88, lng: 127.73, r: 0.10, name: '춘천' },
  { lat: 37.17, lng: 128.99, r: 0.08, name: '동해·삼척' },
  { lat: 38.20, lng: 128.59, r: 0.10, name: '속초·고성' },
  // 충청
  { lat: 36.35, lng: 127.38, r: 0.12, name: '대전' },
  { lat: 36.64, lng: 127.49, r: 0.10, name: '청주' },
  { lat: 36.81, lng: 127.15, r: 0.10, name: '천안' },
  { lat: 36.48, lng: 127.29, r: 0.08, name: '세종' },
  { lat: 36.97, lng: 126.93, r: 0.08, name: '평택' },
  // 전라
  { lat: 35.16, lng: 126.85, r: 0.12, name: '광주' },
  { lat: 35.82, lng: 127.15, r: 0.10, name: '전주' },
  { lat: 34.76, lng: 127.66, r: 0.10, name: '여수' },
  { lat: 34.84, lng: 128.42, r: 0.08, name: '통영' },
  { lat: 35.54, lng: 126.85, r: 0.10, name: '군산·익산' },
  { lat: 34.51, lng: 126.63, r: 0.08, name: '목포' },
  // 경상
  { lat: 35.18, lng: 129.08, r: 0.20, name: '부산' },
  { lat: 35.87, lng: 128.60, r: 0.15, name: '대구' },
  { lat: 35.54, lng: 129.31, r: 0.12, name: '울산' },
  { lat: 35.23, lng: 128.68, r: 0.10, name: '창원' },
  { lat: 35.86, lng: 129.22, r: 0.10, name: '경주' },
  { lat: 36.01, lng: 129.37, r: 0.10, name: '포항' },
  { lat: 35.18, lng: 128.11, r: 0.08, name: '진주' },
  { lat: 36.57, lng: 128.73, r: 0.08, name: '안동' },
  { lat: 35.99, lng: 128.37, r: 0.08, name: '구미' },
  // 제주
  { lat: 33.50, lng: 126.53, r: 0.15, name: '제주시' },
  { lat: 33.25, lng: 126.56, r: 0.12, name: '서귀포' },
];

export function generateRandomLocation(): Location {
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
  // 원형 균등 분포 (박스 샘플링보다 균일)
  const angle = Math.random() * 2 * Math.PI;
  const radius = zone.r * Math.sqrt(Math.random());
  return {
    lat: zone.lat + radius * Math.sin(angle),
    lng: zone.lng + radius * Math.cos(angle),
    name: zone.name,
  };
}

// 하위호환 유지
export function getRandomLocation(recentNames: string[] = []): Location {
  // recentNames는 이제 존 이름 기준으로 중복 방지
  const available = ZONES.filter((z) => !recentNames.includes(z.name));
  const pool = available.length > 0 ? available : ZONES;
  const zone = pool[Math.floor(Math.random() * pool.length)];
  const angle = Math.random() * 2 * Math.PI;
  const radius = zone.r * Math.sqrt(Math.random());
  return {
    lat: zone.lat + radius * Math.sin(angle),
    lng: zone.lng + radius * Math.cos(angle),
    name: zone.name,
  };
}

export function getRandomLocationNear(center: { lat: number, lng: number }, radiusMeters: number): Location {
  const DEGREE_METERS = 111320;
  
  const r = (radiusMeters / DEGREE_METERS) * Math.sqrt(Math.random());
  const angle = Math.random() * 2 * Math.PI;
  
  const latOffset = r * Math.sin(angle);
  const lngOffset = (r * Math.cos(angle)) / Math.cos(center.lat * Math.PI / 180);

  return {
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset,
    name: '세밀 모드',
    description: '선택한 위치 근처'
  };
}

export const LOCATIONS = ZONES.map((z) => ({
  lat: z.lat,
  lng: z.lng,
  name: z.name,
}));
