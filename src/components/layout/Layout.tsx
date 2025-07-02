'use client';

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  noPadding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Дашборд',
  breadcrumbs = [],
  noPadding = false
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="flex flex-col h-screen bg-background-default">
      {/* Header - full width at top */}
      <Header 
        onToggleSidebar={toggleSidebar}
        onToggleSidebarCollapse={toggleSidebarCollapse}
        sidebarCollapsed={sidebarCollapsed}
        title={title}
        breadcrumbs={breadcrumbs}
      />

      {/* Content area below header */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - full height of remaining space */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main content */}
        <main className={`flex-1 overflow-auto ${noPadding ? '' : 'p-4'}`}>
          {noPadding ? (
            children
          ) : (
            <div className="max-w-[1800px] mx-auto w-full">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout; 