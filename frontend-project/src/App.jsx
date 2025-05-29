
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Suppress React Router future flag warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('React Router Future Flag Warning')) {
    return;
  }
  originalWarn(...args);
};
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CarsManagement from './components/cars/CarsManagement';
import PackagesManagement from './components/packages/PackagesManagement';
import ServicesManagement from './components/services/ServicesManagement';
import PaymentsManagement from './components/payments/PaymentsManagement';
import ReportsManagement from './components/reports/ReportsManagement';
import SystemTest from './components/test/SystemTest';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/cars" element={
              <ProtectedRoute>
                <Layout>
                  <CarsManagement />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/packages" element={
              <ProtectedRoute>
                <Layout>
                  <PackagesManagement />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/services" element={
              <ProtectedRoute>
                <Layout>
                  <ServicesManagement />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/payments" element={
              <ProtectedRoute>
                <Layout>
                  <PaymentsManagement />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <ReportsManagement />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/test" element={
              <ProtectedRoute>
                <Layout>
                  <SystemTest />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
