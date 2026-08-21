import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Cột 1: Logo & Mô tả dự án */}
        <div className={styles.brandCol}>
          <h3 className={styles.logo}>
            <span>🌱</span> SmartFarm
          </h3>
          <p className={styles.description}>
            Hệ thống quản lý và giám sát tưới cây tự động thông minh ứng dụng công nghệ IoT và Cloud Computing.
          </p>
        </div>

        {/* Cột 2: Điều hướng (NAVIGATION) */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>NAVIGATION</h4>
          <ul className={styles.linkList}>
            <li>
              <NavLink to="/" className={styles.link}>Trang chủ (Dashboard)</NavLink>
            </li>
            <li>
              <NavLink to="/control" className={styles.link}>Điều khiển máy bơm</NavLink>
            </li>
            <li>
              <NavLink to="/history" className={styles.link}>Thống kê & Lịch sử</NavLink>
            </li>
            <li>
              <NavLink to="/chatbot" className={styles.link}>Trợ lý AI PlantCare</NavLink>
            </li>
          </ul>
        </div>

        {/* Cột 3: Thông tin đồ án (THÔNG TIN) */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>THÔNG TIN DỰ ÁN</h4>
          <ul className={styles.linkList}>
            <li><span className={styles.infoText}>Trường ĐH Khoa học Tự nhiên – VNU - HCM</span></li>
            <li><span className={styles.infoText}>Khoa Công nghệ thông tin</span></li>
            <li><span className={styles.infoText}>Đồ án Hệ thống tưới cây tự động</span></li>
          </ul>
        </div>
      </div>

      {/* Đường kẻ vạch phân cách */}
      <div className={styles.divider}></div>

      {/* Dòng Copyright phía dưới */}
      <div className={styles.copyrightContainer}>
        <p className={styles.copyrightText}>
          © 2026 SmartFarm. Hệ thống quản lý tưới cây tự động.
        </p>
      </div>
    </footer>
  );
}