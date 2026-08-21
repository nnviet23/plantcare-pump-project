import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import { Chart } from 'react-google-charts';
import {
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Waves,
  Sliders,
  History,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();

  // State thông số hệ thống
  const [sensorData] = useState({
    soilHumidity: 68,
    soilThreshold: 40,
    airHumidity: 72,
    airThreshold: 50,
    temperature: 28.5,
    tempThreshold: 35,
    lightIntensity: 85,
    lightThreshold: 80,
    waterLevel: 80,
    pumpStatus: 'OFF',
    mode: 'AUTO',
    cloudConnection: 'ONLINE'
  });

  // Dữ liệu biểu đồ so sánh Độ ẩm đất & Ngưỡng đặt
  const chartData = [
    ["Thời gian", "Độ ẩm đất (%)", "Ngưỡng kích hoạt (%)"],
    ["06:00", 42, 40],
    ["08:00", 38, 40],
    ["08:15", 75, 40],
    ["12:00", 68, 40],
    ["15:00", 62, 40],
    ["17:00", 68, 40],
  ];

  return (
    <div className={styles.container}>
      {/* Tiêu đề & Trạng thái Cloud */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Tổng Quan Hệ Thống</h1>
          <p className={styles.pageSubtitle}>Theo dõi thông số môi trường & cấu hình vận hành thời gian thực</p>
        </div>

        <div className={styles.statusBar}>
          <div className={styles.statusChip}>
            <span className={styles.dotOnline}></span>
          </div>
        </div>
      </div>

      {/* Grid 3 Thẻ Thông Số Phía Trên */}
      <div className={styles.topGrid}>

        {/* THẺ 1: THÔNG SỐ ĐỘ ẨM ĐẤT */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Droplets className={styles.iconBlue} size={20} />
              <h2 className={styles.cardTitle}>Thông số Độ ẩm Đất</h2>
            </div>
            <span className={styles.tagSuccess}>Tối ưu</span>
          </div>

          <div className={styles.soilBody}>
            <div>
              <p className={styles.subLabel}>Độ ẩm hiện tại:</p>
              <div className={styles.hugeValue}>
                {sensorData.soilHumidity}<span className={styles.hugeUnit}>%</span>
              </div>
            </div>
            <div className={styles.thresholdBadge}>
              Ngưỡng đặt: <strong>{sensorData.soilThreshold}%</strong>
            </div>
          </div>

          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${sensorData.soilHumidity}%` }}
            ></div>
          </div>
        </div>

        {/* THẺ 2: TRẠNG THÁI & CẤU HÌNH */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Sliders className={styles.iconDark} size={20} />
              <h2 className={styles.cardTitle}>Trạng thái & Cấu hình</h2>
            </div>
            <span className={styles.tagLive}>● Live</span>
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

          {/* 4 Khung Ngưỡng Cài Đặt */}
          <div className={styles.thresholdGrid}>
            <div className={styles.threshBox}>
              <span className={styles.threshLabel}>💧 NGƯỠNG ĐẤT</span>
              <span className={styles.threshValue}>{sensorData.soilThreshold}%</span>
            </div>
            <div className={styles.threshBox}>
              <span className={styles.threshLabel}>💨 NGƯỠNG KK</span>
              <span className={styles.threshValue}>{sensorData.airThreshold}%</span>
            </div>
            <div className={styles.threshBox}>
              <span className={styles.threshLabel}>🌡️ GIỚI HẠN NHIỆT</span>
              <span className={styles.threshValue}>{sensorData.tempThreshold}°C</span>
            </div>
            <div className={styles.threshBox}>
              <span className={styles.threshLabel}>☀️ NGƯỠNG SÁNG</span>
              <span className={styles.threshValue}>{sensorData.lightThreshold}%</span>
            </div>
          </div>

          {/* Nút Chuyển Hướng Nhanh */}
          <div className={styles.actionButtons}>
            <button className={styles.btnPrimary} onClick={() => navigate('/control')}>
              <Sliders size={15} /> Điều khiển
            </button>
            <button className={styles.btnSecondary} onClick={() => navigate('/history')}>
              <History size={15} /> Lịch sử
            </button>
          </div>
        </div>

        {/* THẺ 3: MÔI TRƯỜNG & BỂ NƯỚC */}
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
                <span className={styles.envValue}>{sensorData.lightIntensity}% <small>(Sáng)</small></span>
              </div>
            </div>

            <div className={styles.envItem}>
              <div className={styles.envIconBox} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <Waves size={18} />
              </div>
              <div className={styles.envDetails}>
                <span className={styles.envLabel}>MỰC NƯỚC BỂ</span>
                <span className={styles.envValue}>{sensorData.waterLevel}% <small className={styles.tagOk}>(Đầy nước)</small></span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* KHỐI DƯỚI: BIỂU ĐỒ ĐỘ ẨM ĐẤT REALTIME (TRÀN CHIỀU RỘNG) */}
      <div className={styles.fullChartCard}>
        <div className={styles.chartHeader}>
          <h2 className={styles.cardTitle}>Biểu đồ Độ ẩm Đất (Realtime)</h2>
          <div className={styles.chartLegend}>
            <span className={styles.legendItem}><span className={styles.legendColorLine}></span> Độ ẩm Đất (%)</span>
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