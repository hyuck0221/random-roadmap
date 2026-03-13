import type { Location } from '../types/game';

export const LOCATIONS: Location[] = [
  { lat: 37.5665, lng: 126.9780, name: '서울 시청' },
  { lat: 37.5796, lng: 126.9770, name: '경복궁' },
  { lat: 35.1796, lng: 129.0756, name: '부산 해운대' },
  { lat: 35.1587, lng: 129.1603, name: '부산 광안리' },
  { lat: 37.4563, lng: 126.7052, name: '인천 차이나타운' },
  { lat: 35.8714, lng: 128.6014, name: '대구 동성로' },
  { lat: 36.3504, lng: 127.3845, name: '대전 시청' },
  { lat: 35.1595, lng: 126.8526, name: '광주 충장로' },
  { lat: 37.8813, lng: 127.7298, name: '춘천 남이섬' },
  { lat: 37.7519, lng: 128.8761, name: '강릉 경포대' },
  { lat: 35.9745, lng: 126.7128, name: '군산 근대문화거리' },
  { lat: 36.9910, lng: 127.0950, name: '수원 화성' },
  { lat: 37.6392, lng: 127.0017, name: '성북동' },
  { lat: 37.5172, lng: 127.0473, name: '강남 가로수길' },
  { lat: 37.5210, lng: 126.9233, name: '여의도' },
  { lat: 37.5447, lng: 127.0557, name: '건대입구' },
  { lat: 37.5340, lng: 126.9925, name: '이태원' },
  { lat: 37.5663, lng: 126.9779, name: '청계천' },
  { lat: 37.5704, lng: 126.9831, name: '인사동' },
  { lat: 35.8140, lng: 127.1130, name: '전주 한옥마을' },
  { lat: 33.4996, lng: 126.5312, name: '제주 시청' },
  { lat: 33.2541, lng: 126.5601, name: '제주 서귀포' },
  { lat: 33.4890, lng: 126.4983, name: '제주 한림' },
  { lat: 36.8090, lng: 127.1473, name: '천안 독립기념관' },
  { lat: 37.3595, lng: 127.1052, name: '성남 판교' },
  { lat: 37.4112, lng: 127.0591, name: '분당 서현' },
  { lat: 37.2636, lng: 127.0286, name: '수원 팔달문' },
  { lat: 37.6545, lng: 126.8356, name: '고양 일산' },
  { lat: 37.7399, lng: 127.0474, name: '의정부' },
  { lat: 37.4138, lng: 126.9945, name: '과천' },
  { lat: 35.5384, lng: 129.3114, name: '울산 태화강' },
  { lat: 36.4800, lng: 127.2890, name: '세종시청' },
  { lat: 38.0481, lng: 127.3200, name: '포천 한탄강' },
  { lat: 34.7604, lng: 127.6622, name: '여수 돌산도' },
  { lat: 35.0034, lng: 126.7133, name: '나주 영산강' },
];

export function getRandomLocation(): Location {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
}
