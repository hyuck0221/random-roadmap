import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { usePanorama } from '../../hooks/usePanorama';
import { NaverSDKLoader } from '../../components/NaverSDKLoader';
import { GameHUD } from './GameHUD';
import { MapSelectorModal } from './MapSelectorModal';
import './game.css';

function GameContent() {
  const navigate = useNavigate();
  const { currentLocation, settings, setGuessLocation, submitGuess, retryLocation } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [radiusFlash, setRadiusFlash] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!currentLocation) navigate('/');
  }, [currentLocation, navigate]);

  // 위치 바뀔 때마다 로딩 상태 초기화
  useEffect(() => {
    setIsSearching(false);
  }, [currentLocation?.lat, currentLocation?.lng]);

  const onRadiusExceeded = useCallback(() => {
    setRadiusFlash(true);
    setTimeout(() => setRadiusFlash(false), 400);
  }, []);

  const onPanoError = useCallback(() => {
    setIsSearching(true);
    // 잠깐 딜레이 후 새 위치 시도
    setTimeout(() => retryLocation(), 300);
  }, [retryLocation]);

  usePanorama({
    containerId: 'panorama',
    lat: currentLocation?.lat ?? 37.5665,
    lng: currentLocation?.lng ?? 126.9780,
    radiusMeters: settings.radiusMeters,
    onError: onPanoError,
    onRadiusExceeded,
    enabled: !!currentLocation,
  });

  const handleTimerExpire = useCallback(() => {
    const korea = { lat: 36.5, lng: 127.5 };
    setGuessLocation(korea.lat, korea.lng);
    submitGuess();
    navigate('/result');
  }, [setGuessLocation, submitGuess, navigate]);

  if (!currentLocation) return null;

  return (
    <div className="game-page">
      <div id="panorama" className="panorama-container" />

      <div className={`radius-flash ${radiusFlash ? 'active' : ''}`} />

      {isSearching && (
        <div className="searching-overlay">
          <div className="searching-spinner" />
          <span>로드뷰 탐색 중...</span>
        </div>
      )}

      <GameHUD onTimerExpire={handleTimerExpire} />

      <div className="game-actions">
        <button className="guess-btn" onClick={() => setShowModal(true)}>
          📍 위치 선택하기
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <MapSelectorModal onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export function GamePage() {
  return (
    <NaverSDKLoader>
      <GameContent />
    </NaverSDKLoader>
  );
}
