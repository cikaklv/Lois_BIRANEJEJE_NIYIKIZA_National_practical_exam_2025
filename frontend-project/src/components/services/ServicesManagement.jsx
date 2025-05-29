import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiTool,
  FiX,
  FiSave,
  FiCalendar,

} from 'react-icons/fi';
import { servicesAPI, carsAPI, packagesAPI } from '../../services/api';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [cars, setCars] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    CarID: '',
    PackageID: '',
    ServiceDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, carsRes, packagesRes] = await Promise.all([
        servicesAPI.getAll(),
        carsAPI.getAll(),
        packagesAPI.getAll()
      ]);

      if (servicesRes.data.success) setServices(servicesRes.data.data);
      if (carsRes.data.success) setCars(carsRes.data.data);
      if (packagesRes.data.success) setPackages(packagesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Car selection validation
    if (!formData.CarID) {
      setError('Please select a car');
      return false;
    }

    // Package selection validation
    if (!formData.PackageID) {
      setError('Please select a package');
      return false;
    }

    // Service date validation
    if (!formData.ServiceDate) {
      setError('Please select a service date');
      return false;
    }

    // Check if service date is not in the future (more than today)
    const selectedDate = new Date(formData.ServiceDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (selectedDate > today) {
      setError('Service date cannot be in the future');
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

    try {
      let response;
      if (editingService) {
        response = await servicesAPI.update(editingService.RecordNumber, formData);
      } else {
        response = await servicesAPI.create(formData);
      }

      if (response.data.success) {
        setSuccess(editingService ? 'Service updated successfully!' : 'Service recorded successfully!');
        setShowModal(false);
        setEditingService(null);
        setFormData({
          CarID: '',
          PackageID: '',
          ServiceDate: new Date().toISOString().split('T')[0]
        });
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Service operation error:', error);
      setError(error.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      CarID: service.PlateNumber, // Use PlateNumber as CarID
      PackageID: service.PackageNumber.toString(),
      ServiceDate: new Date(service.ServiceDate).toISOString().split('T')[0]
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service record? This action cannot be undone.')) return;

    setError('');
    setSuccess('');

    try {
      const response = await servicesAPI.delete(serviceId);
      if (response.data.success) {
        setSuccess('Service deleted successfully!');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete service error:', error);
      setError(error.response?.data?.message || 'Delete failed. Please try again.');
    }
  };

  const filteredServices = services.filter(service =>
    service.PlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.PackageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.DriverName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      CarID: '',
      PackageID: '',
      ServiceDate: new Date().toISOString().split('T')[0]
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Services Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Record and manage car wash services
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus size={20} />
          <span>Record New Service</span>
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

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
       
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <FiTool style={{ color: 'var(--accent-orange)' }} size={24} />
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {services.length}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Total Services</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <FiCalendar style={{ color: 'var(--info)' }} size={24} />
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {services.filter(s => new Date(s.ServiceDate).toDateString() === new Date().toDateString()).length}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Today's Services</p>
        </div>
      </div>

      {/* Services Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading services...</p>
            </div>
          ) : filteredServices.length > 0 ? (
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
                    Driver
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Package
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Price
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.RecordNumber} className="border-b hover:bg-opacity-50"
                      style={{ borderColor: 'var(--border-color)' }}
                      onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = 'var(--card-hover)'}
                      onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(service.ServiceDate)}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-semibold">{service.PlateNumber}</span>
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {service.DriverName}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {service.PackageName}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--success)' }}>
                      {formatCurrency(service.PackagePrice)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'var(--info)' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--card-bg)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.RecordNumber)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'var(--error)' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--card-bg)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <FiTool size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
              <p style={{ color: 'var(--text-muted)' }}>
                {searchTerm ? 'No services found matching your search' : 'No services recorded yet'}
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
                {editingService ? 'Edit Service' : 'Record New Service'}
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
                  Select Car
                </label>
                <select
                  required
                  className="form-input"
                  value={formData.CarID}
                  onChange={(e) => setFormData({...formData, CarID: e.target.value})}
                >
                  <option value="">Select a car</option>
                  {cars.map(car => (
                    <option key={car.PlateNumber} value={car.PlateNumber}>
                      {car.PlateNumber} - {car.DriverName} ({car.CarType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Select Package
                </label>
                <select
                  required
                  className="form-input"
                  value={formData.PackageID}
                  onChange={(e) => setFormData({...formData, PackageID: e.target.value})}
                >
                  <option value="">Select a package</option>
                  {packages.map(pkg => (
                    <option key={pkg.PackageNumber} value={pkg.PackageNumber}>
                      {pkg.PackageName} - {formatCurrency(pkg.PackagePrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Service Date
                </label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={formData.ServiceDate}
                  onChange={(e) => setFormData({...formData, ServiceDate: e.target.value})}
                />
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
                      <span>{editingService ? 'Update Service' : 'Record Service'}</span>
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
    </div>
  );
};

export default ServicesManagement;
