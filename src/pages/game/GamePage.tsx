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
  const { currentLocation, settings, setGuessLocation, submitGuess, retryLocation, setCurrentLocation } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [radiusFlash, setRadiusFlash] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!currentLocation) navigate('/');
  }, [currentLocation, navigate]);

  const onRadiusExceeded = useCallback(() => {
    setRadiusFlash(true);
    setTimeout(() => setRadiusFlash(false), 400);
  }, []);

  const onPanoError = useCallback(() => {
    if (isSearching) return; // 이미 탐색 중이면 중복 호출 방지
    setIsSearching(true);
    // 잠깐 딜레이 후 새 위치 시도
    setTimeout(() => {
      retryLocation();
      setIsSearching(false);
    }, 500);
  }, [retryLocation, isSearching]);

  const onPositionChanged = useCallback((lat: number, lng: number) => {
    if (!currentLocation) return;
    // 실제 파노라마 위치가 초기 랜덤 위경도와 다를 수 있으므로 업데이트
    if (currentLocation.lat !== lat || currentLocation.lng !== lng) {
      setCurrentLocation({ ...currentLocation, lat, lng });
    }
  }, [currentLocation, setCurrentLocation]);

  // 안전장치: 4초 동안 로드뷰가 안 뜨면 에러로 간주하고 재시도
  useEffect(() => {
    if (!currentLocation || isSearching) return;

    const timer = setTimeout(() => {
      const el = document.getElementById('panorama');
      // 캔버스나 관련 요소가 생성되지 않았거나, 높이가 0이면 로드 실패로 간주
      if (el && el.innerHTML === '') {
        console.warn('Panorama load timeout - retrying...');
        onPanoError();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentLocation, isSearching, onPanoError]);

  useEffect(() => {
    (window as any).isMirrorModeActive = settings.isMirrorMode;
    return () => { (window as any).isMirrorModeActive = false; };
  }, [settings.isMirrorMode]);

  usePanorama({
    containerId: 'panorama',
    lat: currentLocation?.lat ?? 37.5665,
    lng: currentLocation?.lng ?? 126.9780,
    radiusMeters: settings.radiusMeters,
    onError: onPanoError,
    onRadiusExceeded,
    onPositionChanged,
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
      <div id="panorama" className={`panorama-container ${settings.isMirrorMode ? 'mirror-mode' : ''}`} />

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
