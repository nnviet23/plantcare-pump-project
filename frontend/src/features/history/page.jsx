import React, { useState } from 'react';
import styles from './history.module.css';
import { Calendar, Filter, Clock, Droplets, Activity } from 'lucide-react';

export default function HistoryPage() {
  const [filterMode, setFilterMode] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('2026-08-02');

  // Dữ liệu mẫu nhật ký đã loại bỏ nút CSV & cập nhật đủ các trường
  const logs = [
    {
      id: 1,
      startTime: '2026-08-02 08:15:20',
      endTime: '2026-08-02 08:15:35',
      duration: '15 giây',
      mode: 'AUTO',
      humidityBefore: '38%',
      reason: 'Độ ẩm đất xuống dưới ngưỡng',
    },
    {
      id: 2,
      startTime: '2026-08-01 18:30:10',
      endTime: '2026-08-01 18:30:40',
      duration: '30 giây',
      mode: 'MANUAL',
      humidityBefore: '42%',
      reason: 'Người dùng bật/ tắt thủ công ',
    },
    {
      id: 3,
      startTime: '2026-08-01 06:00:00',
      endTime: '2026-08-01 06:00:20',
      duration: '20 giây',
      mode: 'AUTO',
      humidityBefore: '39%',
      reason: 'Độ ẩm đất xuống dưới ngưỡng',
    },
    {
      id: 4,
      startTime: '2026-07-31 15:45:12',
      endTime: '2026-07-31 15:45:27',
      duration: '15 giây',
      mode: 'AUTO',
      humidityBefore: '37%',
      reason: 'Độ ẩm đất xuống dưới ngưỡng',
    },
    {
      id: 5,
      startTime: '2026-07-31 09:20:00',
      endTime: '2026-07-31 09:20:45',
      duration: '45 giây',
      mode: 'MANUAL',
      humidityBefore: '40%',
      reason: 'Người dùng bật/ tắt thủ công ',
    },
  ];

  // Lọc danh sách theo chế độ
  const filteredLogs = logs.filter((log) => {
    if (filterMode === 'ALL') return true;
    return log.mode === filterMode;
  });

  // Tính toán số liệu thống kê
  const totalWaterings = filteredLogs.length;
  const avgDurationSeconds =
    totalWaterings > 0
      ? Math.round(
          filteredLogs.reduce((acc, log) => acc + parseInt(log.duration), 0) / totalWaterings
        )
      : 0;

  return (
    <div>
      {/* Tiêu đề trang */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Nhật Ký & Thống Kê</h1>
          <p className={styles.pageSubtitle}>Lịch sử kích hoạt máy bơm và chi tiết nguyên nhân tưới</p>
        </div>
      </div>

      {/* Thẻ Thống Kê Tổng Quan */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>TỔNG SỐ LẦN TƯỚI</span>
            <div className={styles.statIcon}><Activity size={18} /></div>
          </div>
          <div className={styles.statValue}>{totalWaterings} <span className={styles.statUnit}>lần</span></div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>TRUNG BÌNH THỜI GIAN TƯỚI</span>
            <div className={styles.statIcon}><Clock size={18} /></div>
          </div>
          <div className={styles.statValue}>{avgDurationSeconds} <span className={styles.statUnit}>giây / lần</span></div>
        </div>
      </div>

      {/* Thanh Bộ Lọc */}
      <div className={styles.filterCard}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <Calendar size={14} /> Ngày xem
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.inputSelect}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <Filter size={14} /> Chế độ tưới
          </label>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className={styles.inputSelect}
          >
            <option value="ALL">Tất cả chế độ</option>
            <option value="AUTO">Tự động (AUTO)</option>
            <option value="MANUAL">Thủ công (MANUAL)</option>
          </select>
        </div>
      </div>

      {/* Bảng Lịch Sử Detail */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>THỜI GIAN BẮT ĐẦU</th>
              <th>THỜI GIAN KẾT THÚC</th>
              <th>THỜI LƯỢNG</th>
              <th>CHẾ ĐỘ</th>
              <th>ĐỘ ẨM TRƯỚC TƯỚI</th>
              <th>NGUYÊN NHÂN</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className={styles.timeText}>{log.startTime}</td>
                <td className={styles.timeText}>{log.endTime}</td>
                <td className={styles.durationText}>{log.duration}</td>
                <td>
                  <span className={log.mode === 'AUTO' ? styles.badgeAuto : styles.badgeManual}>
                    {log.mode}
                  </span>
                </td>
                <td className={styles.humidityText}>
                  <Droplets size={13} style={{ marginRight: '4px' }} />
                  {log.humidityBefore}
                </td>
                <td className={styles.reasonText}>{log.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}