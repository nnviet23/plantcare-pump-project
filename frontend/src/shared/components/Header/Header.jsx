import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.logo}>
        <span>🌱</span> SmartFarm
      </NavLink>

      <nav className={styles.navLinks}>
        <NavLink to="/" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
          Trang chủ
        </NavLink>
        <NavLink to="/control" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
          Điều khiển
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
          Thống kê
        </NavLink>
        <NavLink to="/chatbot" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}>
          Trợ lý AI
        </NavLink>
      </nav>

      <div className={styles.userProfileContainer} ref={profileRef}>
        <div className={styles.userProfile} onClick={() => setShowProfile((prev) => !prev)}>
          <span>👤</span> Nguyễn Nam Việt
        </div>

        {showProfile && (
          <div className={styles.profilePopover}>
            <div className={styles.popoverAvatar}><User size={28} /></div>
            <h4 className={styles.popoverName}>Nguyễn Nam Việt</h4>
            <p className={styles.popoverEmail}>viet.nn@vnu.edu.vn</p>
            <div className={styles.popoverDivider}></div>
            <button className={styles.logoutBtn} onClick={() => navigate('/login')}>
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}