import { useEffect, useRef } from 'react';
import { haversineDistance } from '../utils/haversine';

interface UsePanoramaOptions {
  containerId: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  onError?: () => void;
  onRadiusExceeded?: () => void;
  onPositionChanged?: (lat: number, lng: number) => void;
  enabled?: boolean;
}

export function usePanorama({
  containerId,
  lat,
  lng,
  radiusMeters,
  onError,
  onRadiusExceeded,
  onPositionChanged,
  enabled = true,
}: UsePanoramaOptions) {
  const panoRef = useRef<naver.maps.Panorama | null>(null);
  const isSnappingRef = useRef(false);
  const lastLatRef = useRef(lat);
  const lastLngRef = useRef(lng);

  // 외부에서 좌표가 크게 바뀌었을 때 (retry 등) 위치 재설정
  useEffect(() => {
    if (panoRef.current && (lastLatRef.current !== lat || lastLngRef.current !== lng)) {
      const dist = haversineDistance(lat, lng, lastLatRef.current, lastLngRef.current);
      // 10미터 이상 차이나면 외부에서 강제로 바꾼 것으로 간주 (사용자 이동이 아님)
      if (dist > 10) {
        lastLatRef.current = lat;
        lastLngRef.current = lng;
        panoRef.current.setPosition(new window.naver.maps.LatLng(lat, lng));
      }
    }
  }, [lat, lng]);

  useEffect(() => {
    if (!enabled) return;

    let rafId: number;
    let radiusListener: any;
    let statusListener: any;
    let positionListener: any;

    rafId = requestAnimationFrame(() => {
      const el = document.getElementById(containerId);
      if (!el) return;

      el.style.width = '100%';
      el.style.height = '100%';

      const origin = new window.naver.maps.LatLng(lat, lng);
      const pano = new window.naver.maps.Panorama(el, {
        position: origin,
        pov: { pan: 0, tilt: 0, fov: 100 },
      });
      panoRef.current = pano;

      // 파노라마 로드 직후 및 이동 시 실제 위치 업데이트
      positionListener = window.naver.maps.Event.addListener(
        pano,
        'position_changed',
        () => {
          if (isSnappingRef.current) return;
          const currentPos = pano.getPosition();
          const newLat = currentPos.lat();
          const newLng = currentPos.lng();
          
          // 내부 참조 업데이트 (자신에 의한 재호출 방지)
          lastLatRef.current = newLat;
          lastLngRef.current = newLng;
          
          onPositionChanged?.(newLat, newLng);
        }
      );

      // 반경 초과 → 즉시 pointer-events 차단 후 스냅백
      radiusListener = window.naver.maps.Event.addListener(
        pano,
        'pano_changed',
        () => {
          if (isSnappingRef.current) return;
          const currentPos = pano.getPosition();
          const dist = haversineDistance(
            currentPos.lat(),
            currentPos.lng(),
            lat, // 게임 시작 시점의 기준점
            lng
          );
          if (dist > radiusMeters) {
            isSnappingRef.current = true;
            el.style.pointerEvents = 'none';
            onRadiusExceeded?.();
            pano.setPosition(origin);
            setTimeout(() => {
              isSnappingRef.current = false;
              el.style.pointerEvents = '';
            }, 800);
          }
        }
      );

      statusListener = window.naver.maps.Event.addListener(
        pano,
        'pano_status_changed',
        (...args: unknown[]) => {
          const status = args[0] as naver.maps.PanoramaStatus;
          if (status !== window.naver.maps.PanoramaStatus.OK) {
            console.warn('Panorama status changed to:', status);
            onError?.();
          }
        }
      );

      const hideStyle = document.createElement('style');
      hideStyle.id = `pano-hide-${containerId}`;
      hideStyle.textContent = `
        #${containerId} a span, #${containerId} a p, #${containerId} a em,
        #${containerId} [class*="label"], #${containerId} [class*="roadname"],
        #${containerId} [class*="RoadName"], #${containerId} [class*="LinkName"] {
          display: none !important;
        }
        #${containerId} img[src*="airplane"], #${containerId} [class*="airplane"] {
          display: none !important;
        }
      `;
      document.head.appendChild(hideStyle);

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            node.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
              const src = (img.src || img.getAttribute('src') || '').toLowerCase();
              if (src.includes('air') || src.includes('plane') || src.includes('flight')) {
                img.style.setProperty('display', 'none', 'important');
              }
            });
          }
        }
      });
      observer.observe(el, { childList: true, subtree: true });
      (el as any)._panoObserver = observer;

      el.addEventListener('pointerdown', (e: PointerEvent) => {
        if (isSnappingRef.current) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        const target = e.target as HTMLElement;
        if (target.tagName.toLowerCase() !== 'canvas') return;

        const candidates = Array.from(el.querySelectorAll<HTMLElement>('*')).filter((child) => {
          if (child.tagName.toLowerCase() === 'canvas' || child === el) return false;
          const r = child.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.width <= 120 && r.height <= 120;
        });

        if (candidates.length === 0) return;

        let closest: HTMLElement | null = null;
        let minDist = Infinity;
        for (const child of candidates) {
          const r = child.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const d = Math.hypot(e.clientX - cx, e.clientY - cy);
          if (d < minDist) {
            minDist = d;
            closest = child;
          }
        }
        if (closest) {
          closest.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: e.clientX, clientY: e.clientY }));
          closest.click();
        }
      }, { capture: true });
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (radiusListener) window.naver.maps.Event.removeListener(radiusListener);
      if (statusListener) window.naver.maps.Event.removeListener(statusListener);
      if (positionListener) window.naver.maps.Event.removeListener(positionListener);
      panoRef.current = null;
      const el = document.getElementById(containerId) as any;
      if (el) {
        el._panoObserver?.disconnect();
        el.innerHTML = '';
      }
      document.getElementById(`pano-hide-${containerId}`)?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, enabled]);

  return panoRef;
}
