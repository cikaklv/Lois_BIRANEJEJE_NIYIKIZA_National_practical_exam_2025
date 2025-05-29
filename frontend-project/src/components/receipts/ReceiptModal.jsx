import React, { useState, useEffect } from 'react';
import { FiX, FiPrinter, FiDownload } from 'react-icons/fi';
import { billAPI } from '../../services/api';
import { printDocument } from '../../utils/printUtils';
import Receipt from './Receipt';

const ReceiptModal = ({ isOpen, onClose, paymentId }) => {
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchBillData();
    }
  }, [isOpen, paymentId]);

  const fetchBillData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await billAPI.getBill(paymentId);
      if (response.data.success) {
        setBillData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load receipt data');
      }
    } catch (error) {
      console.error('Failed to fetch bill data:', error);
      setError('Failed to load receipt data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (billData) {
      printDocument('receipt-content');
    }
  };

  const handleDownload = () => {
    if (!billData) return;
    
    // Create a temporary element for download
    const element = document.createElement('a');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${billData.billNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 20px; }
            .receipt { max-width: 300px; margin: 0 auto; }
          </style>
        </head>
        <body>
          ${document.getElementById('receipt-content').innerHTML}
        </body>
      </html>
    `;
    
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `receipt-${billData.billNumber}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
           style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b"
             style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-semibold">Customer Receipt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                Loading receipt...
              </p>
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

          {billData && !loading && !error && (
            <div>
              <Receipt billData={billData} />
              
              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6 pt-4 border-t"
                   style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={handlePrint}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <FiPrinter size={16} />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                >
                  <FiDownload size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-center"
             style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            This receipt serves as proof of payment completion
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
