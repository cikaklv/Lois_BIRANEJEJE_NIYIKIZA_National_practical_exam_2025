import React, { useState, useEffect } from 'react';
import { paymentsAPI, servicesAPI } from '../../services/api';
import ReceiptModal from '../receipts/ReceiptModal';
import { FiX, FiCreditCard, FiSave } from 'react-icons/fi'; // Add this line

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    ServiceID: '',
    PaymentAmount: '',
    PaymentMethod: '',
    PaymentDate: new Date().toISOString().split('T')[0],
    PaymentStatus: 'Completed'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, servicesRes] = await Promise.all([
        paymentsAPI.getAll(),
        servicesAPI.getAll()
      ]);

      if (paymentsRes.data.success) setPayments(paymentsRes.data.data);
      if (servicesRes.data.success) setServices(servicesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Service selection validation
    if (!formData.ServiceID) {
      setError('Please select a service');
      return false;
    }

    // Payment amount validation
    if (!formData.PaymentAmount || parseFloat(formData.PaymentAmount) <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return false;
    }

    // Payment method validation
    if (!formData.PaymentMethod) {
      setError('Please select a payment method');
      return false;
    }

    // Payment date validation
    if (!formData.PaymentDate) {
      setError('Please select a payment date');
      return false;
    }

    // Check if payment date is not in the future (more than today)
    const selectedDate = new Date(formData.PaymentDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (selectedDate > today) {
      setError('Payment date cannot be in the future');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    console.log('Form data being submitted:', formData);

    try {
      let response;
      if (editingPayment) {
        console.log('Updating payment:', editingPayment.PaymentNumber);
        response = await paymentsAPI.update(editingPayment.PaymentNumber, formData);
      } else {
        console.log('Creating new payment');
        response = await paymentsAPI.create(formData);
      }

      if (response.data.success) {
        setSuccess(editingPayment ? 'Payment updated successfully!' : 'Payment recorded successfully!');
        setShowModal(false);
        setEditingPayment(null);
        setFormData({
          ServiceID: '',
          PaymentAmount: '',
          PaymentMethod: '',
          PaymentDate: new Date().toISOString().split('T')[0],
          PaymentStatus: 'Completed'
        });
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Payment operation error:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.data?.errors) {
        // Show validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        setError(`Validation failed: ${errorMessages}`);
      } else {
        setError(error.response?.data?.message || 'Operation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      ServiceID: payment.RecordNumber.toString(),
      PaymentAmount: payment.AmountPaid.toString(),
      PaymentMethod: payment.PaymentMethod || 'Cash',
      PaymentDate: new Date(payment.PaymentDate).toISOString().split('T')[0],
      PaymentStatus: payment.PaymentStatus || 'Completed'
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) return;

    setError('');
    setSuccess('');

    try {
      const response = await paymentsAPI.delete(paymentId);
      if (response.data.success) {
        setSuccess('Payment deleted successfully!');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete payment error:', error);
      setError(error.response?.data?.message || 'Delete failed. Please try again.');
    }
  };

  const handlePrintReceipt = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setShowReceiptModal(true);
  };

  const filteredPayments = payments.filter(payment =>
    payment.PlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.PaymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.PaymentStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingPayment(null);
    setFormData({
      ServiceID: '',
      PaymentAmount: '',
      PaymentMethod: '',
      PaymentDate: new Date().toISOString().split('T')[0],
      PaymentStatus: 'Completed'
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      minimumFractionDigits: 0,
    }).format(amount) + ' RWF';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--success)' }}></div>;
      case 'Pending':
        return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--warning)' }}></div>;
      default:
        return <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }}></div>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'var(--success)';
      case 'Pending':
        return 'var(--warning)';
      default:
        return 'var(--text-muted)';
    }
  };

  const totalRevenue = payments.reduce((sum, payment) => sum + (payment.AmountPaid || 0), 0);
  const completedPayments = payments.filter(p => p.PaymentStatus === 'Completed').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Payments Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track and manage payment transactions
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center space-x-2"
        >
          <span>Record Payment</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 rounded-lg border"
             style={{
               backgroundColor: 'rgba(16, 185, 129, 0.1)',
               borderColor: 'var(--success)',
               color: 'var(--success)'
             }}>
          {success}
        </div>
      )}

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--success)' }}></div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Total Revenue</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--accent-orange)' }}></div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {payments.length}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Total Payments</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--success)' }}></div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {completedPayments}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Completed</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--info)' }}></div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {payments.filter(p => new Date(p.PaymentDate).toDateString() === new Date().toDateString()).length}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Today's Payments</p>
        </div>
      </div>



      {/* Payments Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading payments...</p>
            </div>
          ) : filteredPayments.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Date
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Plate Number
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Package
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Amount
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Method
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Status
                  </th>
                 
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.PaymentNumber} className="border-b hover:bg-opacity-50"
                      style={{ borderColor: 'var(--border-color)' }}
                      onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = 'var(--card-hover)'}
                      onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(payment.PaymentDate)}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-semibold">{payment.PlateNumber}</span>
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {payment.PackageName}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--success)' }}>
                      {formatCurrency(payment.AmountPaid)}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {payment.PaymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.PaymentStatus)}
                        <span style={{ color: getStatusColor(payment.PaymentStatus) }}>
                          {payment.PaymentStatus}
                        </span>
                      </div>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <FiCreditCard size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
              <p style={{ color: 'var(--text-muted)' }}>
                {searchTerm ? 'No payments found matching your search' : 'No payments recorded yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingPayment ? 'Edit Payment' : 'Record Payment'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Select Service
                </label>
                <select
                  required
                  className="form-input"
                  value={formData.ServiceID}
                  onChange={(e) => setFormData({...formData, ServiceID: e.target.value})}
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service.RecordNumber} value={service.RecordNumber}>
                      {service.PlateNumber} - {service.PackageName} ({formatCurrency(service.PackagePrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Payment Amount (RWF)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  className="form-input"
                  placeholder="Enter payment amount"
                  value={formData.PaymentAmount}
                  onChange={(e) => setFormData({...formData, PaymentAmount: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Payment Method
                </label>
                <select
                  required
                  className="form-input"
                  value={formData.PaymentMethod}
                  onChange={(e) => setFormData({...formData, PaymentMethod: e.target.value})}
                >
                  <option value="">Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={formData.PaymentDate}
                  onChange={(e) => setFormData({...formData, PaymentDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Payment Status
                </label>
                <select
                  required
                  className="form-input"
                  value={formData.PaymentStatus}
                  onChange={(e) => setFormData({...formData, PaymentStatus: e.target.value})}
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      <span>{editingPayment ? 'Update Payment' : 'Record Payment'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        paymentId={selectedPaymentId}
      />
    </div>
  );
};

export default PaymentsManagement;
