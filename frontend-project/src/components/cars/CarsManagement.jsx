import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiTruck,
  FiX,
  FiSave,
  FiDownload
} from 'react-icons/fi';
import { carsAPI } from '../../services/api';

const CarsManagement = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    PlateNumber: '',
    CarType: '',
    CarSize: '',
    DriverName: '',
    DriverPhone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await carsAPI.getAll();
      if (response.data.success) {
        setCars(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error);
      setError('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Plate number validation
    if (!formData.PlateNumber.trim()) {
      setError('Plate number is required');
      return false;
    }

    // Driver name validation
    if (!formData.DriverName.trim()) {
      setError('Driver name is required');
      return false;
    }

    // Phone validation (basic)
    if (!formData.DriverPhone.trim()) {
      setError('Driver phone is required');
      return false;
    }

    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(formData.DriverPhone)) {
      setError('Please enter a valid phone number');
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
      if (editingCar) {
        response = await carsAPI.update(editingCar.CarID, formData);
      } else {
        response = await carsAPI.create(formData);
      }

      if (response.data.success) {
        setSuccess(editingCar ? 'Car updated successfully!' : 'Car added successfully!');
        setShowModal(false);
        setEditingCar(null);
        setFormData({
          PlateNumber: '',
          CarType: '',
          CarSize: '',
          DriverName: '',
          DriverPhone: ''
        });
        fetchCars();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Car operation error:', error);
      setError(error.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      PlateNumber: car.PlateNumber,
      CarType: car.CarType,
      CarSize: car.CarSize,
      DriverName: car.DriverName,
      DriverPhone: car.PhoneNumber // Backend returns PhoneNumber
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleDelete = async (plateNumber) => {
    if (!window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) return;

    setError('');
    setSuccess('');

    try {
      const response = await carsAPI.delete(plateNumber);
      if (response.data.success) {
        setSuccess('Car deleted successfully!');
        fetchCars();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete car error:', error);
      setError(error.response?.data?.message || 'Delete failed. Please try again.');
    }
  };

  const filteredCars = cars.filter(car =>
    car.PlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.CarType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.DriverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCar(null);
    setFormData({
      PlateNumber: '',
      CarType: '',
      CarSize: '',
      DriverName: '',
      DriverPhone: ''
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const exportToCSV = () => {
    if (cars.length === 0) {
      setError('No cars data to export');
      return;
    }

    const csvContent = 'Plate Number,Car Type,Car Size,Driver Name,Driver Phone\n' +
      cars.map(car =>
        `"${car.PlateNumber}","${car.CarType}","${car.CarSize}","${car.DriverName}","${car.PhoneNumber || ''}"`
      ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cars-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess('Cars data exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Cars Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage registered cars and their information
          </p>
        </div>
       <div className="flex space-x-3">
          
          <button
            onClick={openAddModal}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus size={20} />
            <span>Add New Car</span>
          </button>
        </div>
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
            <FiTruck style={{ color: 'var(--accent-orange)' }} size={24} />
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {cars.length}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Total Cars</p>
        </div>
      </div>

      {/* Cars Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading cars...</p>
            </div>
          ) : filteredCars.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Plate Number
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Type
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Size
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Driver Name
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    Driver Phone
                  </th>
                 
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car) => (
                  <tr key={car.PlateNumber} className="border-b hover:bg-opacity-50"
                      style={{ borderColor: 'var(--border-color)' }}
                      onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = 'var(--card-hover)'}
                      onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-semibold">{car.PlateNumber}</span>
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {car.CarType}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {car.CarSize}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {car.DriverName}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {car.PhoneNumber}
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <FiTruck size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
              <p style={{ color: 'var(--text-muted)' }}>
                {searchTerm ? 'No cars found matching your search' : 'No cars registered yet'}
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
                {editingCar ? 'Edit Car' : 'Add New Car'}
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
                  Plate Number
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Enter plate number"
                  value={formData.PlateNumber}
                  onChange={(e) => setFormData({...formData, PlateNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Car Type
                </label>
                <select
                  required
                  className="form-input"
                  value={formData.CarType}
                  onChange={(e) => setFormData({...formData, CarType: e.target.value})}
                >
                  <option value="">Select car type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Coupe">Coupe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Car Size
                </label>
                <select
                  required
                  className="form-input"
                  value={formData.CarSize}
                  onChange={(e) => setFormData({...formData, CarSize: e.target.value})}
                >
                  <option value="">Select car size</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Extra Large">Extra Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Driver Name
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Enter driver name"
                  value={formData.DriverName}
                  onChange={(e) => setFormData({...formData, DriverName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Driver Phone
                </label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder="Enter driver phone"
                  value={formData.DriverPhone}
                  onChange={(e) => setFormData({...formData, DriverPhone: e.target.value})}
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
                      <span>{editingCar ? 'Update Car' : 'Add Car'}</span>
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

export default CarsManagement;
