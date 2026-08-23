import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import { Chart } from 'react-google-charts';
import api, { socket } from '../../services/realtimeApi';
import {
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Waves,
  Sliders,
  History,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();

  // State thong so he thong
  const [sensorData, setSensorData] = useState({
    soilHumidity: 0,
    soilThreshold: 40,
    airHumidity: 0,
    airThreshold: 50,
    temperature: 0,
    tempThreshold: 35,
    lightIntensity: 0,
    lightThreshold: 80,
    waterLevel: 0,
    pumpStatus: 'OFF',
    mode: 'AUTO',
  });

  // State du lieu bieu do
  const [chartData, setChartData] = useState([
    ["Thoi gian", "Do am dat (%)", "Nguong kic hoat (%)"]
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Gọi song song API lấy cảm biến mới nhất, cấu hình ngưỡng và lịch sử
        const [sensorRes, settingsRes, historyRes] = await Promise.all([
          api.get('/farm/sensors/latest'),
          api.get('/farm/settings'),
          api.get('/farm/sensors/history')
        ]);

        const latest = sensorRes.data.data || {};
        const settings = settingsRes.data.data || {};
        const history = historyRes.data.data || [];

        setSensorData((prev) => ({
          ...prev,
          soilHumidity: latest.soilHumidity ?? 0,
          airHumidity: latest.airHumidity ?? 0,
          temperature: latest.temperature ?? 0,
          lightIntensity: latest.lightIntensity ?? 0,
          waterLevel: latest.waterLevel ?? 0,
          soilThreshold: settings.soilThreshold ?? 40,
          airThreshold: settings.airThreshold ?? 50,
          tempThreshold: settings.tempThreshold ?? 35,
          lightThreshold: settings.lightThreshold ?? 80,
          pumpStatus: settings.pumpStatus || 'OFF',
          mode: settings.mode || 'AUTO',
        }));

        // Chuyển đổi dữ liệu lịch sử cảm biến sang định dạng Google Charts
        if (history.length > 0) {
          const formattedChart = [
            ["Thoi gian", "Do am dat (%)", "Nguong kic hoat (%)"],
            ...history.map((item) => [
              new Date(item.createdAt || item.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              item.soilHumidity,
              settings.soilThreshold ?? 40,
            ]),
          ];
          setChartData(formattedChart);
        } else {
          setChartData([
            ["Thoi gian", "Do am dat (%)", "Nguong kic hoat (%)"],
            ["Chua co du lieu", 0, settings.soilThreshold ?? 40]
          ]);
        }
      } catch (error) {
        console.error('Loi khi tai du lieu Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // 1. Lang nghe du lieu cam bien moi tu WebSockets
    socket.on('sensor_update', (newSensor) => {
      setSensorData((prev) => ({
        ...prev,
        soilHumidity: newSensor.soilHumidity,
        airHumidity: newSensor.airHumidity,
        temperature: newSensor.temperature,
        lightIntensity: newSensor.lightIntensity,
        waterLevel: newSensor.waterLevel,
      }));

      // Cap nhat va ve lai diem moi tren bieu do
      setChartData((prevChart) => {
        const timeStr = new Date(newSensor.createdAt || Date.now()).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const currentThreshold = sensorData.soilThreshold || 40;
        const newRow = [timeStr, newSensor.soilHumidity, currentThreshold];

        // Giu toi da 15 diem du lieu gan nhat
        const rows = prevChart.slice(1);
        if (rows.length >= 15) rows.shift();
        return [prevChart[0], ...rows, newRow];
      });
    });

    // 2. Lang nghe thay doi trang thai may bom va che do
    socket.on('pump_status_change', (data) => {
      setSensorData((prev) => ({
        ...prev,
        pumpStatus: data.pumpStatus,
        mode: data.mode || prev.mode,
      }));
    });

    return () => {
      socket.off('sensor_update');
      socket.off('pump_status_change');
    };
  }, [sensorData.soilThreshold]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu hệ thống...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Tieu de & Trang thai Cloud */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Tổng quan</h1>
          <p className={styles.pageSubtitle}>Theo dõi thông số môi trường và cấu hình thời gian thực</p>
        </div>

        <div className={styles.statusBar}>
          <div className={styles.statusChip}>
            <span className={styles.dotOnline}></span>
            <span>Cloud Connected</span>
          </div>
        </div>
      </div>

      {/* Grid 3 The Thong So Phia Tren */}
      <div className={styles.topGrid}>

        {/* THE 1: THONG SO DO AM DAT */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Droplets className={styles.iconBlue} size={20} />
              <h2 className={styles.cardTitle}>Thông số Độ ẩm Đất</h2>
            </div>
            <span className={sensorData.soilHumidity < sensorData.soilThreshold ? styles.badgeOff : styles.tagSuccess}>
              {sensorData.soilHumidity < sensorData.soilThreshold ? 'Cần Tưới' : 'Tốt'}
            </span>
          </div>

          <div className={styles.soilBody}>
            <div>
              <p className={styles.subLabel}>Độ ẩm hiện tại:</p>
              <div className={styles.hugeValue}>
                {sensorData.soilHumidity}<span className={styles.hugeUnit}>%</span>
              </div>
            </div>
            <div className={styles.thresholdBadge}>
              Nguong dat: <strong>{sensorData.soilThreshold}%</strong>
            </div>
          </div>

          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${Math.min(sensorData.soilHumidity, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* THE 2: TRANG THAI & CAU HINH */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Sliders className={styles.iconDark} size={20} />
              <h2 className={styles.cardTitle}>Trạng thái & Cấu hình</h2>
            </div>
            <span className={styles.tagLive}>Live</span>
          </div>

          <div className={styles.statusRows}>
            <div className={styles.statusRow}>
              <span>Trạng thái Bơm:</span>
              <span className={sensorData.pumpStatus === 'ON' ? styles.badgeOn : styles.badgeOff}>
                {sensorData.pumpStatus}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span>Chế độ:</span>
              <span className={styles.badgeMode}>{sensorData.mode}</span>
            </div>
          </div>

          {/* 4 Khung Nguong Cai Dat */}
          <div className={styles.thresholdGrid}>
            <div className={styles.threshBox}>
              <span className={styles.threshLabel}>NGƯỠNG ĐẤT</span>
              <span className={styles.threshValue}>{sensorData.soilThreshold}%</span>
            </div>
            <div className={styles.threshBox}>
              <span className={styles.threshLabel}>NGƯỠNG KHÔNG KHÍ</span>
              <span className={styles.threshValue}>{sensorData.airThreshold}%</span>
            </div>
            <div className={styles.threshBox}>
              <span className={styles.threshLabel}>NGƯỠNG NHIỆT ĐỘ</span>
              <span className={styles.threshValue}>{sensorData.tempThreshold}°C</span>
            </div>
            <div className={styles.threshBox}>
              <span className={styles.threshLabel}>NGƯỠNG SÁNG</span>
              <span className={styles.threshValue}>{sensorData.lightThreshold}%</span>
            </div>
          </div>

          {/* Nut Chuyen Huong Nhanh */}
          <div className={styles.actionButtons}>
            <button className={styles.btnPrimary} onClick={() => navigate('/control')}>
              <Sliders size={15} /> Điều khiển
            </button>
            <button className={styles.btnSecondary} onClick={() => navigate('/history')}>
              <History size={15} /> Lịch sử
            </button>
          </div>
        </div>

        {/* THE 3: MOI TRUONG & BE NUOC */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Activity className={styles.iconDark} size={20} />
              <h2 className={styles.cardTitle}>Môi trường & Bể nước</h2>
            </div>
          </div>

          <div className={styles.envList}>
            <div className={styles.envItem}>
              <div className={styles.envIconBox} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                <Thermometer size={18} />
              </div>
              <div className={styles.envDetails}>
                <span className={styles.envLabel}>NHIỆT ĐỘ</span>
                <span className={styles.envValue}>{sensorData.temperature}°C</span>
              </div>
            </div>

            <div className={styles.envItem}>
              <div className={styles.envIconBox} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                <Wind size={18} />
              </div>
              <div className={styles.envDetails}>
                <span className={styles.envLabel}>ĐỘ ẨM KK</span>
                <span className={styles.envValue}>{sensorData.airHumidity}%</span>
              </div>
            </div>

            <div className={styles.envItem}>
              <div className={styles.envIconBox} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                <Sun size={18} />
              </div>
              <div className={styles.envDetails}>
                <span className={styles.envLabel}>ÁNH SÁNG</span>
                <span className={styles.envValue}>{sensorData.lightIntensity}%</span>
              </div>
            </div>

            <div className={styles.envItem}>
              <div className={styles.envIconBox} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <Waves size={18} />
              </div>
              <div className={styles.envDetails}>
                <span className={styles.envLabel}>MỨC NƯỚC BỂ</span>
                <span className={styles.envValue}>
                  {sensorData.waterLevel}%{' '}
                  <small className={sensorData.waterLevel < 20 ? styles.badgeOff : styles.tagOk}>
                    ({sensorData.waterLevel < 20 ? 'Dưới ngưỡng' : 'Đầy đủ'})
                  </small>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* KHOI DUOI: BIEU DO DO AM DAT REALTIME */}
      <div className={styles.fullChartCard}>
        <div className={styles.chartHeader}>
          <h2 className={styles.cardTitle}>Biểu đồ Độ ẩm đất (Realtime)</h2>
          <div className={styles.chartLegend}>
            <span className={styles.legendItem}><span className={styles.legendColorLine}></span> Độ ẩm đất (%)</span>
            <span className={styles.legendItem}><span className={styles.legendColorDashed}></span> Ngưỡng kích hoạt ({sensorData.soilThreshold}%)</span>
          </div>
        </div>

        <Chart
          chartType="AreaChart"
          width="100%"
          height="320px"
          data={chartData}
          options={{
            colors: ['#1b2a3a', '#ef4444'],
            legend: { position: 'none' },
            vAxis: { minValue: 0, maxValue: 100 },
            hAxis: { textStyle: { color: '#64748b', fontSize: 12 } },
            chartArea: { width: '92%', height: '75%' },
            backgroundColor: 'transparent',
            series: {
              0: { areaOpacity: 0.1 },
              1: { lineDashStyle: [4, 4], areaOpacity: 0 }
            }
          }}
        />
      </div>
    </div>
  );
}