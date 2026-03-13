import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import './home.css';

export function SettingsPanel() {
  const { settings, updateSettings } = useGameStore();
  const [open, setOpen] = useState(false);

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
    </div>
  );
}
