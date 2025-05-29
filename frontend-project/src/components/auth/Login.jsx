import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" 
         style={{ backgroundColor: 'var(--primary-bg)' }}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">

          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome Back
          </h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your CWSMW account
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2"
                     style={{ color: 'var(--text-primary)' }}>
                Username
              </label>
              <div className="relative">

                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="form-input pl-10"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2"
                     style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input pl-10 pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <FiEye style={{ color: 'var(--text-muted)' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p style={{ color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium hover:underline"
                  style={{ color: 'var(--accent-orange)' }}
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
