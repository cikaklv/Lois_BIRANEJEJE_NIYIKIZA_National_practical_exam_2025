import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiX,
  FiSave,
  FiDollarSign
} from 'react-icons/fi';
import { packagesAPI } from '../../services/api';

const PackagesManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    PackageName: '',
    PackageDescription: '',
    PackagePrice: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packagesAPI.getAll();
      if (response.data.success) {
        setPackages(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      setError('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Package name validation
    if (!formData.PackageName.trim()) {
      setError('Package name is required');
      return false;
    }

    // Description validation
    if (!formData.PackageDescription.trim()) {
      setError('Package description is required');
      return false;
    }

    // Price validation
    if (!formData.PackagePrice || parseFloat(formData.PackagePrice) <= 0) {
      setError('Please enter a valid price greater than 0');
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
      if (editingPackage) {
        response = await packagesAPI.update(editingPackage.PackageNumber, formData);
      } else {
        response = await packagesAPI.create(formData);
      }

      if (response.data.success) {
        setSuccess(editingPackage ? 'Package updated successfully!' : 'Package added successfully!');
        setShowModal(false);
        setEditingPackage(null);
        setFormData({
          PackageName: '',
          PackageDescription: '',
          PackagePrice: ''
        });
        fetchPackages();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Package operation error:', error);
      setError(error.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      PackageName: pkg.PackageName,
      PackageDescription: pkg.PackageDescription,
      PackagePrice: pkg.PackagePrice.toString()
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleDelete = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) return;

    setError('');
    setSuccess('');

    try {
      const response = await packagesAPI.delete(packageId);
      if (response.data.success) {
        setSuccess('Package deleted successfully!');
        fetchPackages();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete package error:', error);
      setError(error.response?.data?.message || 'Delete failed. Please try again.');
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.PackageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.PackageDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingPackage(null);
    setFormData({
      PackageName: '',
      PackageDescription: '',
      PackagePrice: ''
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Packages Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage service packages and pricing
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus size={20} />
          <span>Add New Package</span>
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
            <FiPackage style={{ color: 'var(--accent-orange)' }} size={24} />
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {packages.length}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Total Packages</p>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-4"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          ))
        ) : filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => (
            <div key={pkg.PackageNumber} className="card hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-orange)20' }}
                  >
                    <FiPackage size={24} style={{ color: 'var(--accent-orange)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {pkg.PackageName}
                    </h3>
                  </div>
                </div>
                
              </div>

              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {pkg.PackageDescription}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                    {(pkg.PackagePrice)} RWF
                  </span>
                </div>
              
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FiPackage size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
            <p style={{ color: 'var(--text-muted)' }}>
              {searchTerm ? 'No packages found matching your search' : 'No packages created yet'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingPackage ? 'Edit Package' : 'Add New Package'}
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
                  Package Name
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Enter package name"
                  value={formData.PackageName}
                  onChange={(e) => setFormData({...formData, PackageName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  className="form-input"
                  placeholder="Enter package description"
                  value={formData.PackageDescription}
                  onChange={(e) => setFormData({...formData, PackageDescription: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Price (RWF)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  className="form-input"
                  placeholder="Enter package price"
                  value={formData.PackagePrice}
                  onChange={(e) => setFormData({...formData, PackagePrice: e.target.value})}
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
                      <span>{editingPackage ? 'Update Package' : 'Add Package'}</span>
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

export default PackagesManagement;
