import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useGuessMap } from '../../hooks/useGuessMap';
import { NaverSDKLoader } from '../../components/NaverSDKLoader';
import './home.css';

interface CenterPointSelectorModalProps {
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
}

function CenterPointSelectorModal({ onClose, onConfirm }: CenterPointSelectorModalProps) {
  const { centerPoint } = useGameStore();
  const { guessPos, reset, searchAddress, searchResults, moveToCoord, error } = useGuessMap({ 
    containerId: 'center-map',
    initialCenter: centerPoint || undefined,
  });
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchAddress(searchInput);
    }
  };

  return (
    <motion.div
      className="map-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 2000 }}
    >
      <motion.div
        className="map-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="map-modal-header">
          <div>
            <h3>세밀 모드 중심점 선택</h3>
            <p>게임을 플레이할 중심 위치를 선택하세요. (반경 1km 내 랜덤 생성)</p>
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

        <div id="center-map" className="map-modal-map" />

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
            onClick={() => {
              if (guessPos) {
                onConfirm(guessPos.lat, guessPos.lng);
                onClose();
              }
            }}
          >
            {guessPos ? '이 위치 중심! 📍' : '지도를 클릭하세요'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SettingsPanel() {
  const { settings, updateSettings, centerPoint, setCenterPoint } = useGameStore();
  const [open, setOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const timeOptions = [
    { value: null, label: '무제한' },
    { value: 300, label: '5분' },
    { value: 600, label: '10분' },
    { value: 1200, label: '20분' },
    { value: 1800, label: '30분' },
  ];

  return (
    <div style={{ width: '100%' }}>
      <button className="settings-toggle" onClick={() => setOpen(!open)}>
        <span>⚙️</span>
        <span>설정</span>
        <span style={{ marginLeft: 'auto' }}>{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="settings-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ marginTop: 8 }}
          >
            <div className="settings-content">
              {/* Detailed Mode toggle */}
              <div className="setting-toggle-row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="setting-toggle-label">세밀 모드 (근거리)</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>특정 위치 주변에서 시작</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.isDetailedMode}
                    onChange={(e) => updateSettings({ isDetailedMode: e.target.checked })}
                  />
                  <span className="toggle-track" />
                </label>
              </div>

              {settings.isDetailedMode && (
                <>
                  <div className="setting-item" style={{ marginTop: -8, marginBottom: 12 }}>
                    <button 
                      className={`center-select-btn ${centerPoint ? 'selected' : ''}`}
                      onClick={() => setShowMap(true)}
                    >
                      {centerPoint 
                        ? `📍 위치 선택됨 (${centerPoint.lat.toFixed(3)}, ${centerPoint.lng.toFixed(3)})` 
                        : '📍 중심점 선택하기'}
                    </button>
                  </div>
                  {/* Detailed Mode Radius */}
                  <div className="setting-item" style={{ marginBottom: 16 }}>
                    <div className="setting-label">
                      <span>생성 반경 (세밀 모드)</span>
                      <span className="value">{settings.detailedModeRadiusMeters >= 1000 ? `${(settings.detailedModeRadiusMeters / 1000).toFixed(1)}km` : `${settings.detailedModeRadiusMeters}m`}</span>
                    </div>
                    <input
                      type="range"
                      className="setting-slider"
                      min={100}
                      max={3000}
                      step={100}
                      value={settings.detailedModeRadiusMeters}
                      onChange={(e) => updateSettings({ detailedModeRadiusMeters: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {/* Radius */}
              <div className="setting-item">
                <div className="setting-label">
                  <span>이동 반경</span>
                  <span className="value">{settings.radiusMeters}m</span>
                </div>
                <input
                  type="range"
                  className="setting-slider"
                  min={10}
                  max={500}
                  step={10}
                  value={settings.radiusMeters}
                  onChange={(e) => updateSettings({ radiusMeters: Number(e.target.value) })}
                />
              </div>

              {/* Time limit */}
              <div className="setting-item">
                <div className="setting-label">제한 시간</div>
                <select
                  className="setting-select"
                  value={settings.timeLimitSeconds ?? 'null'}
                  onChange={(e) =>
                    updateSettings({
                      timeLimitSeconds: e.target.value === 'null' ? null : Number(e.target.value),
                    })
                  }
                >
                  {timeOptions.map((o) => (
                    <option key={String(o.value)} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div className="setting-item">
                <div className="setting-label">난이도</div>
                <div className="difficulty-group">
                  {(['easy', 'normal', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      className={`difficulty-btn ${settings.difficulty === d ? 'active' : ''}`}
                      onClick={() => updateSettings({ difficulty: d })}
                    >
                      {d === 'easy' ? '쉬움' : d === 'normal' ? '보통' : '어려움'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compass toggle */}
              <div className="setting-toggle-row">
                <span className="setting-toggle-label">나침반 표시</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.showCompass}
                    onChange={(e) => updateSettings({ showCompass: e.target.checked })}
                  />
                  <span className="toggle-track" />
                </label>
              </div>

              {/* Minimap toggle */}
              <div className="setting-toggle-row">
                <span className="setting-toggle-label">미니맵 힌트</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.showMinimap}
                    onChange={(e) => updateSettings({ showMinimap: e.target.checked })}
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMap && (
          <NaverSDKLoader>
            <CenterPointSelectorModal 
              onClose={() => setShowMap(false)} 
              onConfirm={(lat, lng) => setCenterPoint(lat, lng)}
            />
          </NaverSDKLoader>
        )}
      </AnimatePresence>
    </div>
  );
}
