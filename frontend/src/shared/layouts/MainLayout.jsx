import React from 'react';
import { Outlet } from 'react-router-dom'; // 1. Import Outlet
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        {/* Outlet đóng vai trò là nơi chứa nội dung của trang tương ứng */}
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
}