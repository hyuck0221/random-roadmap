import { motion } from 'framer-motion';
import { useGuessMap } from '../../hooks/useGuessMap';
import { useGameStore } from '../../stores/gameStore';
import { useNavigate } from 'react-router-dom';

interface MapSelectorModalProps {
  onClose: () => void;
}

export function MapSelectorModal({ onClose }: MapSelectorModalProps) {
  const navigate = useNavigate();
  const { setGuessLocation, submitGuess } = useGameStore();
  const { guessPos, reset } = useGuessMap({ containerId: 'guess-map' });

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
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
