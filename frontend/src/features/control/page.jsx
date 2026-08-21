import React, { useState } from 'react';
import styles from './control.module.css';
import { Power, Sliders, ShieldAlert, Cpu } from 'lucide-react';

export default function ControlPage() {
  const [mode, setMode] = useState('AUTO'); // AUTO hoặc MANUAL
  const [isPumpOn, setIsPumpOn] = useState(false);
  const [thresholds, setThresholds] = useState({
    minSoilHumidity: 40, // Dưới 40% tự động bật bơm
    maxSoilHumidity: 80, // Đạt 80% tự động tắt bơm
    minWaterLevel: 20,   // Mực nước bể < 20% thì ngắt bơm an toàn
    timerDuration: 15,   // Thời gian tưới mỗi lần (giây)
  });

  const handleSliderChange = (e) => {
    setThresholds({ ...thresholds, [e.target.name]: Number(e.target.value) });
  };

  const handleTogglePump = () => {
    if (mode === 'AUTO') {
      alert('Hệ thống đang ở chế độ AUTO. Vui lòng chuyển sang MANUAL để điều khiển máy bơm thủ công!');
      return;
    }
    setIsPumpOn(!isPumpOn);
  };

  const handleSaveSettings = () => {
    alert('Đã lưu cấu hình ngưỡng tự động lên Cloud Azure thành công!');
  };

  return (
    <div>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>Bảng Điều Khiển Thiết Bị</h1>
        <p className={styles.pageSubtitle}>Tùy chỉnh chế độ vận hành và thiết lập thông số tự động hóa</p>
      </div>

      <div className={styles.grid}>
        {/* Card 1: Điều khiển Bơm & Chế độ */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Cpu size={22} /> Chế Độ & Máy Bơm
          </h2>
          <p className={styles.cardDesc}>
            Chuyển đổi giữa chế độ tự động hóa thông minh hoặc điều khiển công tắc bơm trực tiếp.
          </p>

          <div className={styles.modeSelector}>
            <button
              className={`${styles.modeBtn} ${mode === 'AUTO' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('AUTO')}
            >
              🤖 Tự động (AUTO)
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'MANUAL' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('MANUAL')}
            >
              🖐️ Thủ công (MANUAL)
            </button>
          </div>

          <div className={styles.pumpControlBox}>
            <button
              className={`${styles.pumpPowerBtn} ${isPumpOn ? styles.pumpOn : styles.pumpOff}`}
              onClick={handleTogglePump}
            >
              <Power size={36} />
            </button>
            <span className={styles.pumpStateText}>
              {isPumpOn ? 'MÁY BƠM ĐANG BẬT' : 'MÁY BƠM ĐANG TẮT'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
              {mode === 'AUTO' ? '(Khóa thủ công ở chế độ AUTO)' : 'Nhấp vào nút để kích hoạt'}
            </span>
          </div>
        </div>

        {/* Card 2: Cấu hình Ngưỡng Tự Động */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Sliders size={22} /> Cấu Hình Ngưỡng Tưới
          </h2>
          <p className={styles.cardDesc}>
            Thiết lập ngưỡng độ ẩm đất để hệ thống ESP32 tự động ra quyết định tưới nước.
          </p>

          <div className={styles.settingGroup}>
            <div className={styles.settingLabel}>
              <span>Ngưỡng bật bơm (Độ ẩm đất tối thiểu)</span>
              <span className={styles.settingValue}>{thresholds.minSoilHumidity}%</span>
            </div>
            <input
              type="range"
              name="minSoilHumidity"
              min="10"
              max="60"
              value={thresholds.minSoilHumidity}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.settingLabel}>
              <span>Ngưỡng tắt bơm (Độ ẩm đất tối đa)</span>
              <span className={styles.settingValue}>{thresholds.maxSoilHumidity}%</span>
            </div>
            <input
              type="range"
              name="maxSoilHumidity"
              min="60"
              max="95"
              value={thresholds.maxSoilHumidity}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.settingLabel}>
              <span>Thời gian tưới mỗi lần</span>
              <span className={styles.settingValue}>{thresholds.timerDuration} giây</span>
            </div>
            <input
              type="range"
              name="timerDuration"
              min="5"
              max="60"
              step="5"
              value={thresholds.timerDuration}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>

          <button className={styles.saveBtn} onClick={handleSaveSettings}>
            Lưu Cấu Hình Ngưỡng
          </button>
        </div>
      </div>
    </div>
  );
}