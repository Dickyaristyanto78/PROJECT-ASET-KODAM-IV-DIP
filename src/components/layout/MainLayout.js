
import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './MainLayout.css'; // Import the new CSS

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="content-area">
        <Sidebar show={isSidebarOpen} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
