import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/cars', label: 'Cars' },
    { path: '/packages', label: 'Packages' },
    { path: '/services', label: 'Services' },
    { path: '/payments', label: 'Payments' },
    { path: '/reports', label: 'Reports' },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Hamburger Menu Button (Visible on Mobile/Tablet) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange)]"
        style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--text-primary)' }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 h-screen supports-[padding-top:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]`}
        style={{ backgroundColor: 'var(--primary-dark)' }}
      >
        {/* Logo Section */}
        <div className="p-3 sm:p-4 md:p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-orange)' }}
            >
              <span className="text-sm sm:text-base md:text-lg font-bold text-white">CW</span>
            </div>
            <div>
              <h1
                className="text-base sm:text-lg md:text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                CWSMW
              </h1>
              <p
                className="text-[10px] sm:text-xs md:text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Car Wash Management System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 sm:p-4">
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange)] ${
                      active ? 'shadow-lg' : 'hover:transform hover:translate-x-1'
                    }`}
                    style={{
                      backgroundColor: active ? 'var(--accent-orange)' : 'transparent',
                      color: active ? 'white' : 'var(--text-secondary)',
                    }}
                    onClick={() => setIsOpen(false)}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.target.style.backgroundColor = 'var(--card-bg)';
                        e.target.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded"
                      style={{ backgroundColor: active ? 'white' : 'var(--accent-orange)' }}
                    ></div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-3 sm:p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-orange)' }}
              >
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p
                  className="text-[10px] sm:text-xs md:text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user?.username}
                </p>
                <p
                  className="text-[10px] sm:text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Administrator
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:transform hover:translate-x-1 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[var(--error)]"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--card-bg)';
              e.target.style.color = 'var(--error)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--text-secondary)';
            }}
          >
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded"
              style={{ backgroundColor: 'var(--error)' }}
            ></div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for Mobile Menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default Sidebar;