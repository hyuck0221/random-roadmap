import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { NaverSDKLoader } from '../../components/NaverSDKLoader';
import { formatDistance } from '../../utils/haversine';
import './result.css';

function ResultContent() {
  const navigate = useNavigate();
  const {
    currentLocation,
    guessLocation,
    distanceMeters,
    score,
    settings,
    startGame,
    resetGame,
  } = useGameStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!score) return;
    const target = score;
    const duration = 1500;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  useEffect(() => {
    if (!currentLocation || !guessLocation || !mapContainerRef.current) return;

    const realPos = new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng);
    const guessPos = new window.naver.maps.LatLng(guessLocation.lat, guessLocation.lng);

    const bounds = new window.naver.maps.LatLngBounds(realPos, guessPos);
    bounds.extend(realPos);
    bounds.extend(guessPos);

    const map = new window.naver.maps.Map(mapContainerRef.current, {
      center: realPos,
      zoom: 8,
      mapDataControl: false,
      logoControl: false,
      scaleControl: false,
      zoomControl: true,
    });

    map.fitBounds(bounds, 60);

    // Real location marker (green)
    new window.naver.maps.Marker({
      position: realPos,
      map,
      icon: {
        content: `<div style="
          width: 28px; height: 28px;
          background: #00d4aa;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,212,170,0.6);
        "></div>`,
        anchor: new window.naver.maps.Point(14, 28),
      },
    });

    // Guess location marker (red)
    new window.naver.maps.Marker({
      position: guessPos,
      map,
      icon: {
        content: `<div style="
          width: 28px; height: 28px;
          background: #ff4757;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(255,71,87,0.6);
        "></div>`,
        anchor: new window.naver.maps.Point(14, 28),
      },
    });

    // Line between markers
    new window.naver.maps.Polyline({
      path: [realPos, guessPos],
      map,
      strokeColor: '#ffd700',
      strokeWeight: 2,
      strokeOpacity: 0.8,
      strokeStyle: 'dash',
    });

    return () => map.destroy();
  }, [currentLocation, guessLocation]);

  if (!currentLocation || distanceMeters === null || score === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <button onClick={() => navigate('/')}>처음으로</button>
      </div>
    );
  }

  const getScoreComment = () => {
    if (score >= 4500) return '🏆 완벽해요!';
    if (score >= 3000) return '🎯 훌륭해요!';
    if (score >= 1500) return '👍 나쁘지 않아요!';
    if (score >= 500) return '😅 아쉬워요...';
    return '😭 더 연습이 필요해요';
  };

  return (
    <div className="result-page">
      <div className="result-bg" />
      <div className="result-content">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            {settings.isDetailedMode && (
              <span className="detailed-mode-badge">🎯 세밀 모드</span>
            )}
            {settings.isMirrorMode && (
              <span className="mirror-mode-badge">🪞 거울 세계</span>
            )}
          </div>
          <h1 className="result-title">{getScoreComment()}</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            {currentLocation.name}
          </p>
        </motion.div>

        {/* Distance card */}
        <motion.div
          className="result-card result-distance"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="result-distance-label">📏 실제 거리</div>
          <div className="result-distance-value">{formatDistance(distanceMeters)}</div>
        </motion.div>

        {/* Score card */}
        <motion.div
          className="result-card"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="result-score-label">⭐ 점수</div>
          <div>
            <span className="result-score-value">{displayScore.toLocaleString()}</span>
            <span className="result-score-max"> / 5000점</span>
          </div>
        </motion.div>

        {/* Map card */}
        <motion.div
          className="result-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            🗺️ 위치 비교
          </div>
          <div ref={mapContainerRef} className="result-map" />
          <div className="result-legend">
            <div className="result-legend-item">
              <div className="legend-dot" style={{ background: '#00d4aa' }} />
              <span>실제 위치</span>
            </div>
            <div className="result-legend-item">
              <div className="legend-dot" style={{ background: '#ff4757' }} />
              <span>내 추측</span>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="result-actions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            className="result-retry-btn"
            onClick={() => {
              startGame();
              navigate('/game');
            }}
          >
            🔄 다시하기
          </button>
          <button
            className="result-home-btn"
            onClick={() => {
              resetGame();
              navigate('/');
            }}
          >
            🏠 처음으로
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export function ResultPage() {
  return (
    <NaverSDKLoader>
      <ResultContent />
    </NaverSDKLoader>
  );
}
