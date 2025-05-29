import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { FiActivity } from 'react-icons/fi'; // Ensure react-icons is installed

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalPackages: 0,
    totalServices: 0,
    totalRevenue: 0,
    todayServices: 0,
    monthlyRevenue: 0,
    recentServices: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reportsAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        console.error('Dashboard API returned error:', response.data.message);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData({
        totalUsers: 0,
        totalCars: 0,
        totalPackages: 0,
        totalServices: 0,
        totalRevenue: 0,
        todayServices: 0,
        monthlyRevenue: 0,
        recentServices: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color, trend }) => (
    <div className="card hover:shadow-lg transition-all duration-300 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <div
                className="w-5 h-5 sm:w-6 sm:h-6 rounded"
                style={{ backgroundColor: color }}
              ></div>
            </div>
            <div>
              <h3
                className="text-base sm:text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h3>
              {subtitle && (
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {loading ? '...' : value}
            </span>
            {trend && (
              <div className="flex items-center space-x-1">
                <span
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: 'var(--success)' }}
                >
                  {trend}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return (
      new Intl.NumberFormat('en-RW', {
        minimumFractionDigits: 0,
      }).format(amount) + ' RWF'
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-24 sm:h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Dashboard
          </h1>
          <p
            className="text-sm sm:text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            Welcome to CWSMW Car Wash Management System
          </p>
        </div>
        <div
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm sm:text-base"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <span style={{ color: 'var(--text-primary)' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard title="Total Cars" value={dashboardData.totalCars} color="var(--accent-orange)" />
        <StatCard
          title="Total Packages"
          value={dashboardData.totalPackages}
          color="var(--success)"
        />
        <StatCard
          title="Total Services"
          value={dashboardData.totalServices}
          color="var(--warning)"
        />
      </div>

      {/* Recent Services */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Recent Services
          </h2>
          <button
            className="btn-secondary text-xs sm:text-sm px-3 py-2"
            onClick={() => (window.location.href = '/services')}
          >
            View All
          </button>
        </div>

        {dashboardData.recentServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <th
                    className="text-left py-2 sm:py-3 px-2 sm:px-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Plate Number
                  </th>
                  <th
                    className="text-left py-2 sm:py-3 px-2 sm:px-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Package
                  </th>
                  <th
                    className="text-left py-2 sm:py-3 px-2 sm:px-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Date
                  </th>
                  <th
                    className="text-left py-2 sm:py-3 px-2 sm:px-4"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentServices.slice(0, 5).map((service, index) => (
                  <tr
                    key={index}
                    className="border-b"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <td
                      className="py-2 sm:py-3 px-2 sm:px-4"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {service.PlateNumber}
                    </td>
                    <td
                      className="py-2 sm:py-3 px-2 sm:px-4"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {service.PackageName}
                    </td>
                    <td
                      className="py-2 sm:py-3 px-2 sm:px-4"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {new Date(service.ServiceDate).toLocaleDateString()}
                    </td>
                    <td
                      className="py-2 sm:py-3 px-2 sm:px-4"
                      style={{ color: 'var(--success)' }}
                    >
                      {formatCurrency(service.PackagePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <FiActivity
              size={32}
              style={{ color: 'var(--text-muted)' }}
              className="mx-auto mb-4"
            />
            <p style={{ color: 'var(--text-muted)' }} className="text-sm sm:text-base">
              No recent services found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;