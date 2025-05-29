import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--primary-bg)' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--primary-bg)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
