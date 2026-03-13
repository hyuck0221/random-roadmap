import { useEffect, useRef } from 'react';
import { haversineDistance } from '../utils/haversine';

interface UsePanoramaOptions {
  containerId: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  onError?: () => void;
  onRadiusExceeded?: () => void;
  enabled?: boolean;
}

export function usePanorama({
  containerId,
  lat,
  lng,
  radiusMeters,
  onError,
  onRadiusExceeded,
  enabled = true,
}: UsePanoramaOptions) {
  const panoRef = useRef<naver.maps.Panorama | null>(null);
  const isSnappingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let rafId: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let radiusListener: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let statusListener: any;

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
            lat,
            lng
          );
          if (dist > radiusMeters) {
            isSnappingRef.current = true;
            el.style.pointerEvents = 'none'; // 클릭 즉시 차단
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
          const status = args[0] as string;
          if (status === 'ERROR') {
            onError?.();
          }
        }
      );

      // 고속도로 라벨·비행기 아이콘 숨김
      const hideStyle = document.createElement('style');
      hideStyle.id = `pano-hide-${containerId}`;
      hideStyle.textContent = `
        /* 화살표 위 도로명 라벨 */
        #${containerId} a span,
        #${containerId} a p,
        #${containerId} a em,
        #${containerId} [class*="label"],
        #${containerId} [class*="roadname"],
        #${containerId} [class*="road_name"],
        #${containerId} [class*="RoadName"],
        #${containerId} [class*="LinkName"],
        #${containerId} [class*="link_name"] {
          display: none !important;
        }
        /* 비행기 아이콘 */
        #${containerId} img[src*="airplane"],
        #${containerId} img[src*="aircraft"],
        #${containerId} img[src*="flight"],
        #${containerId} img[src*="fly"],
        #${containerId} [class*="airplane"],
        #${containerId} [class*="aircraft"] {
          display: none !important;
        }
      `;
      document.head.appendChild(hideStyle);

      // CSS 선택자로 안 잡히는 경우를 위해 MutationObserver로 img src 검사
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

      // cleanup에서 정리할 수 있도록 ref에 저장
      (el as HTMLElement & { _panoObserver?: MutationObserver })._panoObserver = observer;

      // 배경 클릭 → 가장 가까운 nav 요소로 포워딩
      el.addEventListener(
        'pointerdown',
        (e: PointerEvent) => {
          if (isSnappingRef.current) {
            e.stopPropagation();
            e.preventDefault();
            return;
          }
          const target = e.target as HTMLElement;
          if (target.tagName.toLowerCase() !== 'canvas') return;

          // 캔버스(배경) 클릭 시 가장 가까운 nav 요소 탐색
          const candidates = Array.from(el.querySelectorAll<HTMLElement>('*')).filter(
            (child) => {
              if (child.tagName.toLowerCase() === 'canvas') return false;
              if (child === el) return false;
              const r = child.getBoundingClientRect();
              // 작은 요소(화살표/버튼)만 대상
              return r.width > 0 && r.height > 0 && r.width <= 120 && r.height <= 120;
            }
          );

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
        },
        { capture: true }
      );
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (radiusListener) window.naver.maps.Event.removeListener(radiusListener);
      if (statusListener) window.naver.maps.Event.removeListener(statusListener);
      panoRef.current = null;
      const el = document.getElementById(containerId) as (HTMLElement & { _panoObserver?: MutationObserver }) | null;
      if (el) {
        el._panoObserver?.disconnect();
        el.innerHTML = '';
      }
      document.getElementById(`pano-hide-${containerId}`)?.remove();
    };
  }, [containerId, lat, lng, radiusMeters, onError, onRadiusExceeded, enabled]);

  return panoRef;
}
