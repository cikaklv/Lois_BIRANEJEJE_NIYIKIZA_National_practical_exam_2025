// Print utilities for receipt and document printing

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    minimumFractionDigits: 0,
  }).format(amount) + ' RWF';
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const printDocument = (elementId) => {
  const printContent = document.getElementById(elementId);
  if (!printContent) {
    console.error('Print element not found');
    return;
  }

  const originalContent = document.body.innerHTML;
  const printWindow = window.open('', '_blank');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - CWSMW Car Wash</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
            padding: 20px;
          }

          .receipt {
            max-width: 300px;
            margin: 0 auto;
            border: 1px solid #000;
            padding: 15px;
          }

          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }

          .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .company-info {
            font-size: 10px;
            margin-bottom: 2px;
          }

          .receipt-title {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
            text-align: center;
          }

          .receipt-info {
            margin-bottom: 15px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            font-size: 11px;
          }

          .service-details {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin: 15px 0;
          }

          .service-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }

          .service-name {
            font-weight: bold;
          }

          .total-section {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #000;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
          }

          .thank-you {
            font-weight: bold;
            margin-bottom: 5px;
          }

          @media print {
            body {
              padding: 0;
            }

            .receipt {
              border: none;
              max-width: none;
              width: 100%;
            }

            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export const generateReceiptHTML = (billData) => {
  if (!billData) return '';

  const currentDate = new Date();

  return `
    <div class="receipt">
      <div class="header">
        <div class="company-name">CWSMW CAR WASH</div>
        <div class="company-info">SmartPark - Rubavu District</div>
        <div class="company-info">Rwanda</div>
        <div class="company-info">Tel: +250 XXX XXX XXX</div>
      </div>

      <div class="receipt-title">PAYMENT RECEIPT</div>

      <div class="receipt-info">
        <div class="info-row">
          <span>Receipt #:</span>
          <span>${billData.billNumber}</span>
        </div>
        <div class="info-row">
          <span>Date:</span>
          <span>${formatDate(currentDate.toISOString())}</span>
        </div>
        <div class="info-row">
          <span>Time:</span>
          <span>${formatTime(currentDate.toISOString())}</span>
        </div>
        <div class="info-row">
          <span>Payment #:</span>
          <span>${billData.payment.paymentNumber}</span>
        </div>
      </div>

      <div class="service-details">
        <div class="info-row">
          <span>Vehicle:</span>
          <span>${billData.car.plateNumber}</span>
        </div>
        <div class="info-row">
          <span>Driver:</span>
          <span>${billData.car.driver || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span>Car Type:</span>
          <span>${billData.car.type || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span>Service Date:</span>
          <span>${formatDate(billData.service.serviceDate)}</span>
        </div>

        <div style="margin-top: 10px;">
          <div class="service-row">
            <span class="service-name">${billData.service.packageName}</span>
            <span>${formatCurrency(billData.service.packagePrice)}</span>
          </div>
          <div style="font-size: 10px; color: #666; margin-top: 2px;">
            ${billData.service.packageDescription || ''}
          </div>
        </div>
      </div>

      <div class="total-section">
        <div class="total-row">
          <span>TOTAL PAID:</span>
          <span>${formatCurrency(billData.payment.amountPaid)}</span>
        </div>
        <div class="info-row">
          <span>Payment Date:</span>
          <span>${formatDate(billData.payment.paymentDate)}</span>
        </div>
        <div class="info-row">
          <span>Status:</span>
          <span>COMPLETED</span>
        </div>
      </div>

      <div class="footer">
        <div class="thank-you">Thank you for choosing CWSMW!</div>
        <div>Keep this receipt for your records</div>
        <div>Visit us again soon!</div>
      </div>
    </div>
  `;
};
