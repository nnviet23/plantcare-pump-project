import React, { useState, useEffect } from 'react';
import styles from './control.module.css';
import { Power, Sliders, Cpu, Save } from 'lucide-react';
import api, { socket } from '../../services/realtimeApi';

export default function ControlPage() {
  const [mode, setMode] = useState('AUTO');
  const [pumpStatus, setPumpStatus] = useState('OFF');
  const [thresholds, setThresholds] = useState({
    soilThreshold: 40,
    airThreshold: 50,
    tempThreshold: 35,
    lightThreshold: 80,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 1. Lay thong so cau hinh hien tai tu Backend CSDL
    const fetchSettings = async () => {
      try {
        const response = await api.get('/farm/settings');
        if (response.data.success && response.data.data) {
          const settings = response.data.data;
          setMode(settings.mode || 'AUTO');
          setPumpStatus(settings.pumpStatus || 'OFF');
          setThresholds({
            soilThreshold: settings.soilThreshold ?? 40,
            airThreshold: settings.airThreshold ?? 50,
            tempThreshold: settings.tempThreshold ?? 35,
            lightThreshold: settings.lightThreshold ?? 80,
          });
        }
      } catch (error) {
        console.error('Loi khi lay thong so cai dat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // 2. Lang nghe thay doi trang thai may bom va che do theo thoi gian thuc tu WebSockets
    socket.on('pump_status_change', (data) => {
      if (data.pumpStatus) setPumpStatus(data.pumpStatus);
      if (data.mode) setMode(data.mode);
    });

    return () => {
      socket.off('pump_status_change');
    };
  }, []);

  const handleSliderChange = (e) => {
    setThresholds({ ...thresholds, [e.target.name]: Number(e.target.value) });
  };

  // Switch Che Do (AUTO <-> MANUAL)
  const handleModeChange = async (newMode) => {
    if (newMode === mode) return;
    try {
      setMode(newMode);
      await api.put('/farm/settings', { mode: newMode });
    } catch (error) {
      console.error('Loi khi cap nhat che do:', error);
      alert('Khong the cap nhat che do van hanh!');
    }
  };

  // On / Off May Bom Thu Cong
  const handleTogglePump = async () => {
    if (mode === 'AUTO') {
      alert('He thong dang o che do AUTO. Vui long chuyen sang MANUAL de dieu khien may bom thu cong!');
      return;
    }

    const nextAction = pumpStatus === 'ON' ? 'OFF' : 'ON';
    try {
      setPumpStatus(nextAction);
      const res = await api.post('/farm/pump/control', { action: nextAction });
      if (!res.data.success) {
        setPumpStatus(pumpStatus);
      }
    } catch (error) {
      console.error('Loi khi gui lenh may bom:', error);
      setPumpStatus(pumpStatus);
      alert('Khong the gui lenh dieu khien may bom!');
    }
  };

  // Luu Nguong Cai Dat Len CSDL Cloud
  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.put('/farm/settings', {
        mode,
        ...thresholds,
      });
      if (response.data.success) {
        alert('Da luu cau hinh nguong tu dong len CSDL Cloud thanh cong!');
      }
    } catch (error) {
      console.error('Loi khi luu cau hinh:', error);
      alert('Luu cau hinh that bai. Vui long kiem tra lai ket noi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Dang tai bang dieu khien...</div>;
  }

  return (
    <div>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>Bang Dieu Khien Thiet Bi</h1>
        <p className={styles.pageSubtitle}>Tuy chinh che do van hanh va thiet lap thong so tu dong hoa</p>
      </div>

      <div className={styles.grid}>
        {/* Card 1: Dieu khien Bom & Che do */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Cpu size={22} /> Che Do & May Bom
          </h2>
          <p className={styles.cardDesc}>
            Chuyen doi giua che do tu dong hoa thong minh hoac dieu khien cong tac bom truc tiep.
          </p>

          <div className={styles.modeSelector}>
            <button
              className={`${styles.modeBtn} ${mode === 'AUTO' ? styles.modeBtnActive : ''}`}
              onClick={() => handleModeChange('AUTO')}
            >
              Tu dong (AUTO)
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'MANUAL' ? styles.modeBtnActive : ''}`}
              onClick={() => handleModeChange('MANUAL')}
            >
              Thu cong (MANUAL)
            </button>
          </div>

          <div className={styles.pumpControlBox}>
            <button
              className={`${styles.pumpPowerBtn} ${pumpStatus === 'ON' ? styles.pumpOn : styles.pumpOff}`}
              onClick={handleTogglePump}
            >
              <Power size={36} />
            </button>
            <span className={styles.pumpStateText}>
              {pumpStatus === 'ON' ? 'MAY BOM DANG BAT' : 'MAY BOM DANG TAT'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
              {mode === 'AUTO' ? '(Khoa thu cong o che do AUTO)' : 'Nhap vao nut de kich hoat'}
            </span>
          </div>
        </div>

        {/* Card 2: Cau hinh Nguong Tu Dong */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Sliders size={22} /> Cau Hinh Nguong Tuoi
          </h2>
          <p className={styles.cardDesc}>
            Thiet lap nguong do am va moi truong de he thong ESP32 tu dong ra quyet dinh tuoi nuoc.
          </p>

          <div className={styles.settingGroup}>
            <div className={styles.settingLabel}>
              <span>Nguong bat bom (Do am dat)</span>
              <span className={styles.settingValue}>{thresholds.soilThreshold}%</span>
            </div>
            <input
              type="range"
              name="soilThreshold"
              min="10"
              max="80"
              value={thresholds.soilThreshold}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.settingLabel}>
              <span>Nguong do am khong khi</span>
              <span className={styles.settingValue}>{thresholds.airThreshold}%</span>
            </div>
            <input
              type="range"
              name="airThreshold"
              min="20"
              max="90"
              value={thresholds.airThreshold}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.settingLabel}>
              <span>Gioi han nhiet do toi da</span>
              <span className={styles.settingValue}>{thresholds.tempThreshold}°C</span>
            </div>
            <input
              type="range"
              name="tempThreshold"
              min="20"
              max="50"
              value={thresholds.tempThreshold}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>

          <button className={styles.saveBtn} onClick={handleSaveSettings} disabled={isSubmitting}>
            {isSubmitting ? 'Dang luu...' : 'Luu Cau Hinh Nguong'}
          </button>
        </div>
      </div>
    </div>
  );
}