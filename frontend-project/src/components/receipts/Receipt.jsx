import React from 'react';
import { formatCurrency, formatDate, formatTime } from '../../utils/printUtils';

const Receipt = ({ billData }) => {
  if (!billData) return null;

  const currentDate = new Date();

  return (
    <div className="receipt" id="receipt-content">
      <div className="header">
        <div className="company-name">CWSMW CAR WASH</div>
        <div className="company-info">SmartPark - Rubavu District</div>
        <div className="company-info">Rwanda</div>
        <div className="company-info">Tel: +250 XXX XXX XXX</div>
      </div>

      <div className="receipt-title">PAYMENT RECEIPT</div>

      <div className="receipt-info">
        <div className="info-row">
          <span>Receipt #:</span>
          <span>{billData.billNumber}</span>
        </div>
        <div className="info-row">
          <span>Date:</span>
          <span>{formatDate(currentDate.toISOString())}</span>
        </div>
        <div className="info-row">
          <span>Time:</span>
          <span>{formatTime(currentDate.toISOString())}</span>
        </div>
        <div className="info-row">
          <span>Payment #:</span>
          <span>{billData.payment.paymentNumber}</span>
        </div>
      </div>

      <div className="service-details">
        <div className="info-row">
          <span>Vehicle:</span>
          <span>{billData.car.plateNumber}</span>
        </div>
        <div className="info-row">
          <span>Driver:</span>
          <span>{billData.car.driver || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span>Car Type:</span>
          <span>{billData.car.type || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span>Service Date:</span>
          <span>{formatDate(billData.service.serviceDate)}</span>
        </div>

        <div style={{ marginTop: '10px' }}>
          <div className="service-row">
            <span className="service-name">{billData.service.packageName}</span>
            <span>{formatCurrency(billData.service.packagePrice)}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
            {billData.service.packageDescription || ''}
          </div>
        </div>
      </div>

      <div className="total-section">
        <div className="total-row">
          <span>TOTAL PAID:</span>
          <span>{formatCurrency(billData.payment.amountPaid)}</span>
        </div>
        <div className="info-row">
          <span>Payment Date:</span>
          <span>{formatDate(billData.payment.paymentDate)}</span>
        </div>
        <div className="info-row">
          <span>Status:</span>
          <span>COMPLETED</span>
        </div>
      </div>

      <div className="footer">
        <div className="thank-you">Thank you for choosing CWSMW!</div>
        <div>Keep this receipt for your records</div>
        <div>Visit us again soon!</div>
      </div>

      <style>{`
        .receipt {
          max-width: 300px;
          margin: 0 auto;
          border: 1px solid #000;
          padding: 15px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
        }

        .receipt .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }

        .receipt .company-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .receipt .company-info {
          font-size: 10px;
          margin-bottom: 2px;
        }

        .receipt .receipt-title {
          font-size: 14px;
          font-weight: bold;
          margin: 10px 0;
          text-align: center;
        }

        .receipt .receipt-info {
          margin-bottom: 15px;
        }

        .receipt .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 11px;
        }

        .receipt .service-details {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 10px 0;
          margin: 15px 0;
        }

        .receipt .service-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .receipt .service-name {
          font-weight: bold;
        }

        .receipt .total-section {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #000;
        }

        .receipt .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .receipt .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px dashed #000;
          font-size: 10px;
        }

        .receipt .thank-you {
          font-weight: bold;
          margin-bottom: 5px;
        }

        @media print {
          .receipt {
            border: none;
            max-width: none;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;
