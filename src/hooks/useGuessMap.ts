import { useEffect, useRef, useState } from 'react';

interface UseGuessMapOptions {
  containerId: string;
}

export function useGuessMap({ containerId }: UseGuessMapOptions) {
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const [guessPos, setGuessPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const center = new window.naver.maps.LatLng(36.5, 127.5);
    const map = new window.naver.maps.Map(containerId, {
      center,
      zoom: 7,
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

  const reset = () => {
    setGuessPos(null);
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  };

  return { guessPos, reset };
}
