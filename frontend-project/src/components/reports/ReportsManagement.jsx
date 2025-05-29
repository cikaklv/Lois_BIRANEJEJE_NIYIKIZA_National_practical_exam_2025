  import React, { useState, useEffect } from 'react';
  import {
    FiCalendar,
    FiDownload,
    FiBarChart2,
    FiDollarSign,
    FiTool,
    FiTruck,
    FiTrendingUp,
    FiActivity,
    FiPrinter
  } from 'react-icons/fi';
  import { reportsAPI, paymentsAPI } from '../../services/api';
  import ReceiptModal from '../receipts/ReceiptModal';

  const ReportsManagement = () => {
    const [reportData, setReportData] = useState({
      daily: null,
      monthly: null,
      dashboard: null
    });
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [error, setError] = useState('');
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
      fetchDashboardData();
      fetchPayments();
    }, []);

    const fetchPayments = async () => {
      try {
        const response = await paymentsAPI.getAll();
        if (response.data.success) {
          setPayments(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      }
    };

    const fetchDashboardData = async () => {
      try {
        const response = await reportsAPI.getDashboard();
        if (response.data.success) {
          setReportData(prev => ({ ...prev, dashboard: response.data.data }));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      }
    };

    const fetchDailyReport = async () => {
      if (!selectedDate) {
        setError('Please select a date');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await reportsAPI.getDaily(selectedDate);
        if (response.data.success) {
          setReportData(prev => ({ ...prev, daily: response.data.data }));
        } else {
          setError(response.data.message || 'Failed to generate daily report');
        }
      } catch (error) {
        console.error('Failed to fetch daily report:', error);
        setError(error.response?.data?.message || 'Failed to generate daily report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchMonthlyReport = async () => {
      if (!selectedMonth || !selectedYear) {
        setError('Please select month and year');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await reportsAPI.getMonthly(selectedYear, selectedMonth);
        if (response.data.success) {
          setReportData(prev => ({ ...prev, monthly: response.data.data }));
        } else {
          setError(response.data.message || 'Failed to generate monthly report');
        }
      } catch (error) {
        console.error('Failed to fetch monthly report:', error);
        setError(error.response?.data?.message || 'Failed to generate monthly report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0,
      }).format(amount || 0);
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const handlePrintReceipt = (service) => {
      // Find the payment for this service
      const payment = payments.find(p =>
        p.PlateNumber === service.PlateNumber &&
        p.PackageName === service.PackageName &&
        new Date(p.PaymentDate).toDateString() === new Date(service.ServiceDate || selectedDate).toDateString()
      );

      if (payment) {
        setSelectedPaymentId(payment.PaymentNumber);
        setShowReceiptModal(true);
      } else {
        alert('Payment record not found for this service. Receipt cannot be generated.');
      }
    };

    // Export functions
    const exportToCSV = () => {
      let csvContent = '';
      let filename = '';

      if (reportData.daily) {
        // Export daily report
        filename = `daily-report-${selectedDate}.csv`;
        csvContent = 'Date,Plate Number,Package,Driver,Amount Paid\n';

        if (reportData.daily.services && reportData.daily.services.length > 0) {
          reportData.daily.services.forEach(service => {
            csvContent += `${selectedDate},"${service.PlateNumber}","${service.PackageName}","${service.DriverName || 'N/A'}","${service.AmountPaid || service.PackagePrice || 0}"\n`;
          });
        }
      } else if (reportData.monthly) {
        // Export monthly report
        filename = `monthly-report-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.csv`;
        csvContent = 'Date,Services Count,Revenue\n';

        if (reportData.monthly.services && reportData.monthly.services.length > 0) {
          // Group by date
          const dailyData = {};
          reportData.monthly.services.forEach(service => {
            const date = service.ServiceDate;
            if (!dailyData[date]) {
              dailyData[date] = { count: 0, revenue: 0 };
            }
            dailyData[date].count++;
            dailyData[date].revenue += service.AmountPaid || service.PackagePrice || 0;
          });

          Object.keys(dailyData).sort().forEach(date => {
            csvContent += `${date},${dailyData[date].count},${dailyData[date].revenue}\n`;
          });
        }
      } else {
        // Export dashboard overview
        filename = `dashboard-overview-${new Date().toISOString().split('T')[0]}.csv`;
        csvContent = 'Metric,Value\n';
        if (reportData.dashboard) {
          csvContent += `Total Users,${reportData.dashboard.totalUsers}\n`;
          csvContent += `Total Cars,${reportData.dashboard.totalCars}\n`;
          csvContent += `Total Packages,${reportData.dashboard.totalPackages}\n`;
          csvContent += `Total Services,${reportData.dashboard.totalServices}\n`;
          csvContent += `Total Revenue,${reportData.dashboard.totalRevenue}\n`;
          csvContent += `Today's Services,${reportData.dashboard.todayServices}\n`;
          csvContent += `Monthly Revenue,${reportData.dashboard.monthlyRevenue}\n`;
        }
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    const exportToPDF = () => {
      // Create a printable version of the current report
      const printWindow = window.open('', '_blank');
      let content = '';
      let title = '';

      if (reportData.daily) {
        title = `Daily Report - ${formatDate(selectedDate)}`;
        content = `
          <h1>${title}</h1>
          <div style="margin: 20px 0;">
            <p><strong>Total Services:</strong> ${reportData.daily.totalServices || 0}</p>
            <p><strong>Total Revenue:</strong> ${formatCurrency(reportData.daily.totalRevenue || 0)}</p>
          </div>
        `;

        if (reportData.daily.services && reportData.daily.services.length > 0) {
          content += `
            <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Plate Number</th>
                  <th style="padding: 10px; text-align: left;">Package</th>
                  <th style="padding: 10px; text-align: left;">Driver</th>
                  <th style="padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
          `;

          reportData.daily.services.forEach(service => {
            content += `
              <tr>
                <td style="padding: 8px;">${service.PlateNumber}</td>
                <td style="padding: 8px;">${service.PackageName}</td>
                <td style="padding: 8px;">${service.DriverName || 'N/A'}</td>
                <td style="padding: 8px; text-align: right;">${formatCurrency(service.AmountPaid || service.PackagePrice || 0)}</td>
              </tr>
            `;
          });

          content += '</tbody></table>';
        }
      } else if (reportData.monthly) {
        title = `Monthly Report - ${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        content = `
          <h1>${title}</h1>
          <div style="margin: 20px 0;">
            <p><strong>Total Services:</strong> ${reportData.monthly.totalServices || 0}</p>
            <p><strong>Total Revenue:</strong> ${formatCurrency(reportData.monthly.totalRevenue || 0)}</p>
            <p><strong>Average per Service:</strong> ${formatCurrency(Math.round((reportData.monthly.totalRevenue || 0) / (reportData.monthly.totalServices || 1)))}</p>
          </div>
        `;
      } else if (reportData.dashboard) {
        title = `Dashboard Overview - ${formatDate(new Date().toISOString().split('T')[0])}`;
        content = `
          <h1>${title}</h1>
          <div style="margin: 20px 0;">
            <p><strong>Total Users:</strong> ${reportData.dashboard.totalUsers}</p>
            <p><strong>Total Cars:</strong> ${reportData.dashboard.totalCars}</p>
            <p><strong>Total Packages:</strong> ${reportData.dashboard.totalPackages}</p>
            <p><strong>Total Services:</strong> ${reportData.dashboard.totalServices}</p>
            <p><strong>Total Revenue:</strong> ${formatCurrency(reportData.dashboard.totalRevenue)}</p>
            <p><strong>Today's Services:</strong> ${reportData.dashboard.todayServices}</p>
            <p><strong>Monthly Revenue:</strong> ${formatCurrency(reportData.dashboard.monthlyRevenue)}</p>
          </div>
        `;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            ${content}
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()} | CWSMW Car Wash Management System</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
      <div className="card hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={24} style={{ color }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {value}
              </span>
              {trend && (
                <div className="flex items-center space-x-1">
                  <FiTrendingUp size={16} style={{ color: 'var(--success)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                    {trend}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Reports & Analytics
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              View detailed reports and business analytics
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportToPDF}
              className="btn-secondary flex items-center space-x-2"
              disabled={!reportData.dashboard && !reportData.daily && !reportData.monthly}
            >
              <FiDownload size={16} />
              <span>Print PDF</span>
            </button>
          
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg border"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'var(--error)',
                color: 'var(--error)'
              }}>
            {error}
          </div>
        )}



        {/* Daily Report Section */}
        <div className="card ">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Daily Report
            </h2>
            <div className="flex items-center space-x-3">
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button
                onClick={fetchDailyReport}
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <FiCalendar size={16} />
                )}
                <span>Generate</span>
              </button>
              
            </div>
          </div>

          {reportData.daily ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {reportData.daily.totalServices || 0}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Services</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                    {(reportData.daily.totalRevenue)} RWF
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Revenue</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {reportData.daily.uniqueCars || 0}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Unique Cars</div>
                </div>
              </div>

              {reportData.daily.services && reportData.daily.services.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Services for {formatDate(selectedDate)}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                          <th className="text-left py-2 px-3" style={{ color: 'var(--text-secondary)' }}>
                            Plate Number
                          </th>
                          <th className="text-left py-2 px-3" style={{ color: 'var(--text-secondary)' }}>
                            Package
                          </th>
                          <th className="text-left py-2 px-3" style={{ color: 'var(--text-secondary)' }}>
                            Amount
                          </th>
                          <th className="text-left py-2 px-3" style={{ color: 'var(--text-secondary)' }}>
                            Print Bill
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.daily.services.map((service, index) => (
                          <tr key={index} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <td className="py-2 px-3" style={{ color: 'var(--text-primary)' }}>
                              {service.PlateNumber}
                            </td>
                            <td className="py-2 px-3" style={{ color: 'var(--text-primary)' }}>
                              {service.PackageName}
                            </td>
                            <td className="py-2 px-3" style={{ color: 'var(--success)' }}>
                              {formatCurrency(service.PackagePrice)}
                            </td>
                            <td className="py-2 px-3">
                              <button
                                onClick={() => handlePrintReceipt(service)}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: 'var(--success)' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--card-bg)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                title="Print Receipt"
                              >
                                <FiPrinter size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCalendar size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
              <p style={{ color: 'var(--text-muted)' }}>
                Select a date and click Generate to view daily report
              </p>
            </div>
          )}
        </div>



        {/* Receipt Modal */}
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          paymentId={selectedPaymentId}
        />
      </div>
    );
  };

  export default ReportsManagement;
