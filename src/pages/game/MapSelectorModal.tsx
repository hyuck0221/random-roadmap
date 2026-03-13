import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGuessMap } from '../../hooks/useGuessMap';
import { useGameStore } from '../../stores/gameStore';
import { useNavigate } from 'react-router-dom';

interface MapSelectorModalProps {
  onClose: () => void;
}

export function MapSelectorModal({ onClose }: MapSelectorModalProps) {
  const navigate = useNavigate();
  const { setGuessLocation, submitGuess, centerPoint, settings } = useGameStore();
  const { guessPos, reset, searchAddress, searchResults, moveToCoord, error } = useGuessMap({ 
    containerId: 'guess-map',
    initialCenter: (settings.isDetailedMode && centerPoint) ? centerPoint : undefined,
    initialZoom: settings.isDetailedMode ? 14 : 7,
  });
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchAddress(searchInput);
    }
  };

  const handleConfirm = () => {
    if (!guessPos) return;
    setGuessLocation(guessPos.lat, guessPos.lng);
    submitGuess();
    navigate('/result');
  };

  return (
    <motion.div
      className="map-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="map-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="map-modal-header">
          <div>
            <h3>위치를 선택하세요</h3>
            <p>지도를 클릭하여 파노라마 위치를 추측하세요</p>
          </div>
          <button className="map-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="map-search-bar">
          <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', gap: '8px' }}>
            <input
              type="text"
              placeholder="도로명/지번 주소 또는 동 이름 (예: 산본동, 수리산역 주소)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="map-search-input"
            />
            <button type="submit" className="map-search-btn">🔍</button>
          </form>

          {error && <div className="map-search-error">{error}</div>}

          {searchResults.length > 0 && (
            <div className="map-search-results">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  className="search-result-item"
                  onClick={() => moveToCoord(Number(res.y), Number(res.x))}
                >
                  <div className="road-addr">{res.roadAddress || res.addressElements[0].longName}</div>
                  <div className="jibun-addr">{res.jibunAddress}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div id="guess-map" className="map-modal-map" />

        <div className="map-modal-footer">
          <button
            className="map-cancel-btn"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            취소
          </button>
          <button
            className="map-confirm-btn"
            disabled={!guessPos}
            onClick={handleConfirm}
          >
            {guessPos ? '여기야! 📍' : '지도를 클릭하세요'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
