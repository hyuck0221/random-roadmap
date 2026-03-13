import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { SettingsPanel } from './SettingsPanel';
import './home.css';

export function HomePage() {
  const navigate = useNavigate();
  const startGame = useGameStore((s) => s.startGame);

  const handleStart = () => {
    startGame();
    navigate('/game');
  };

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="home-bg-gradient" />
      <div className="home-content">
        <motion.div
          className="home-logo"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="home-logo-icon">🗺️</div>
          <h1>랜덤 로드맵</h1>
          <p>랜덤 위치의 로드뷰를 보고<br />지도에서 정확한 위치를 맞혀보세요!</p>
        </motion.div>

        <motion.div
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button className="home-start-btn" onClick={handleStart}>
            게임 시작 🎮
          </button>
          <SettingsPanel />
        </motion.div>
      </div>
    </motion.div>
  );
}
