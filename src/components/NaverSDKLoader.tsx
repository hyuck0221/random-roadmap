import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function NaverSDKLoader({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (window.naver?.maps?.Panorama) {
      setReady(true);
      return;
    }

    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) {
      console.error('VITE_NAVER_CLIENT_ID is not set');
      setError(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=panorama`;
    script.async = true;
    script.onerror = () => setError(true);
    document.head.appendChild(script);

    const poll = setInterval(() => {
      if (window.naver?.maps?.Panorama) {
        clearInterval(poll);
        setReady(true);
      }
    }, 100);

    return () => {
      clearInterval(poll);
    };
  }, []);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f1117',
        color: '#ff4757',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'sans-serif',
      }}>
        <h2>네이버 지도 API 로딩 실패</h2>
        <p style={{ color: '#8b8fa8' }}>VITE_NAVER_CLIENT_ID 환경변수를 확인해주세요</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f1117',
        color: '#00d4aa',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #2a2d3a',
          borderTop: '3px solid #00d4aa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p>지도 로딩 중...</p>
      </div>
    );
  }

  return <>{children}</>;
}
