import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  checkStatus: () => api.get('/auth/status'),
};

// Cars API
export const carsAPI = {
  getAll: () => api.get('/cars'),
  getById: (id) => api.get(`/cars/${id}`),
  create: (carData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      plateNumber: carData.PlateNumber,
      carType: carData.CarType,
      carSize: carData.CarSize,
      driverName: carData.DriverName,
      phoneNumber: carData.DriverPhone
    };
    return api.post('/cars', backendData);
  },
  update: (id, carData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      carType: carData.CarType,
      carSize: carData.CarSize,
      driverName: carData.DriverName,
      phoneNumber: carData.DriverPhone
    };
    return api.put(`/cars/${id}`, backendData);
  },
  delete: (id) => api.delete(`/cars/${id}`),
};

// Packages API
export const packagesAPI = {
  getAll: () => api.get('/packages'),
  getById: (id) => api.get(`/packages/${id}`),
  create: (packageData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      packageName: packageData.PackageName,
      packageDescription: packageData.PackageDescription,
      packagePrice: parseFloat(packageData.PackagePrice)
    };
    return api.post('/packages', backendData);
  },
  update: (id, packageData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      packageName: packageData.PackageName,
      packageDescription: packageData.PackageDescription,
      packagePrice: parseFloat(packageData.PackagePrice)
    };
    return api.put(`/packages/${id}`, backendData);
  },
  delete: (id) => api.delete(`/packages/${id}`),
};

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (serviceData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      serviceDate: serviceData.ServiceDate,
      plateNumber: serviceData.CarID, // CarID contains the plate number
      packageNumber: parseInt(serviceData.PackageID)
    };
    return api.post('/services', backendData);
  },
  update: (id, serviceData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      serviceDate: serviceData.ServiceDate,
      plateNumber: serviceData.CarID, // CarID contains the plate number
      packageNumber: parseInt(serviceData.PackageID)
    };
    return api.put(`/services/${id}`, backendData);
  },
  delete: (id) => api.delete(`/services/${id}`),
};

// Payments API
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  create: (paymentData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      amountPaid: parseFloat(paymentData.PaymentAmount),
      paymentDate: paymentData.PaymentDate,
      recordNumber: parseInt(paymentData.ServiceID),
      paymentMethod: paymentData.PaymentMethod || 'Cash',
      paymentStatus: paymentData.PaymentStatus || 'Completed'
    };
    console.log('Creating payment with data:', backendData);
    return api.post('/payments', backendData);
  },
  update: (id, paymentData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      amountPaid: parseFloat(paymentData.PaymentAmount),
      paymentDate: paymentData.PaymentDate
    };
    console.log('Updating payment with data:', backendData);
    return api.put(`/payments/${id}`, backendData);
  },
  delete: (id) => api.delete(`/payments/${id}`),
};

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getDaily: (date) => api.get(`/reports/daily/${date}`),
  getMonthly: (year, month) => api.get(`/reports/monthly/${year}/${month}`),
};

// Bills API
export const billAPI = {
  getBill: (paymentId) => api.get(`/bill/${paymentId}`),
};

export default api;
