import React, { useState, useEffect } from 'react';
import styles from './history.module.css';
import { Calendar, Filter, Clock, Droplets, Activity } from 'lucide-react';
import api from '../../services/realtimeApi';

export default function HistoryPage() {
  const [filterMode, setFilterMode] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy danh sách nhật ký tưới từ CSDL Backend
    const fetchLogs = async () => {
      try {
        const response = await api.get('/farm/logs');
        if (response.data.success) {
          setLogs(response.data.data || []);
        }
      } catch (error) {
        console.error('Lỗi khi tải nhật ký tưới:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Lọc danh sách theo chế độ tưới và ngày được chọn
  const filteredLogs = logs.filter((log) => {
    const matchesMode = filterMode === 'ALL' || log.mode === filterMode;

    let matchesDate = true;
    if (selectedDate) {
      const logDate = log.createdAt
        ? new Date(log.createdAt).toISOString().slice(0, 10)
        : log.startTime?.slice(0, 10);
      matchesDate = logDate === selectedDate;
    }

    return matchesMode && matchesDate;
  });

  // Tính toán số liệu thống kê từ danh sách đã lọc
  const totalWaterings = filteredLogs.length;
  const avgDurationSeconds =
    totalWaterings > 0
      ? Math.round(
          filteredLogs.reduce((acc, log) => {
            const parsedDuration = parseInt(log.duration) || 0;
            return acc + parsedDuration;
          }, 0) / totalWaterings
        )
      : 0;

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Đang tải dữ liệu nhật ký...
      </div>
    );
  }

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

      {/* Bảng Lịch Sử Chi Tiết */}
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
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log._id || log.id}>
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
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  Không tìm thấy nhật ký tưới nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}