import { useEffect, useRef, useState } from 'react';

interface UseGuessMapOptions {
  containerId: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

export function useGuessMap({ containerId, initialCenter, initialZoom }: UseGuessMapOptions) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const [guessPos, setGuessPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!window.naver?.maps) return;

    const center = initialCenter 
      ? new window.naver.maps.LatLng(initialCenter.lat, initialCenter.lng)
      : new window.naver.maps.LatLng(36.5, 127.5);
    
    const map = new window.naver.maps.Map(containerId, {
      center,
      zoom: initialZoom ?? (initialCenter ? 14 : 7),
      mapDataControl: false,
      logoControl: false,
      scaleControl: false,
      zoomControl: true,
    });
    mapRef.current = map;

    const clickListener = window.naver.maps.Event.addListener(
      map,
      'click',
      (...args: unknown[]) => {
        const e = args[0] as { coord: naver.maps.LatLng };
        const pos = { lat: e.coord.lat(), lng: e.coord.lng() };
        setGuessPos(pos);

        if (markerRef.current) {
          markerRef.current.setPosition(e.coord);
        } else {
          markerRef.current = new window.naver.maps.Marker({
            position: e.coord,
            map,
            icon: {
              content: `<div style="
                width: 24px; height: 24px;
                background: #ff4757;
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 2px 8px rgba(0,0,0,0.5);
              "></div>`,
              anchor: new window.naver.maps.Point(12, 24),
            },
          });
        }
      }
    );

    return () => {
      window.naver.maps.Event.removeListener(clickListener);
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      map.destroy();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [containerId]);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setGuessPos(null);
    setSearchResults([]);
    setError(null);
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  };

  const moveToCoord = (lat: number, lng: number) => {
    setError(null);
    if (mapRef.current) {
      const coord = new window.naver.maps.LatLng(lat, lng);
      mapRef.current.setCenter(coord);
      mapRef.current.setZoom(16);
    }
  };

  const searchAddress = (address: string) => {
    setError(null);
    if (!window.naver?.maps?.Service?.geocode) {
      console.error('Naver Maps Geocoder service is not loaded');
      return;
    }

    window.naver.maps.Service.geocode(
      { query: address },
      (status: naver.maps.Service.Status, response: naver.maps.Service.GeocodeResponse) => {
        if (status !== window.naver.maps.Service.Status.OK || response.v2.meta.totalCount === 0) {
          setSearchResults([]);
          setError('검색 결과가 없습니다. 도로명 주소나 지번 주소, 또는 "동 이름"으로 검색해 보세요. (예: 산본동, 번영로 407)');
          return;
        }

        const results = response.v2.addresses;
        setSearchResults(results);

        // 결과가 하나면 바로 이동
        if (results.length === 1) {
          moveToCoord(Number(results[0].y), Number(results[0].x));
        }
      }
    );
  };

  return { guessPos, reset, searchAddress, searchResults, moveToCoord, error };
}
