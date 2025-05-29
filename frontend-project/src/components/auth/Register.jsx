import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
    setSuccess(''); // Clear success when user types
  };

  const validateForm = () => {
    // Username validation
    const usernameRegex = /^[a-zA-Z][a-zA-Z]*$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username must start with a letter and contain only letters');
      return false;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 6 characters with letters, numbers, and at least one capital letter');
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        username: formData.username,
        password: formData.password
      });
      
      if (result.success) {
        setSuccess('Registration successful! You can now sign in.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
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
            Create Account
          </h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Join CWSMW Car Wash Management System
          </p>
        </div>

        {/* Register Form */}
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

            {success && (
              <div className="p-4 rounded-lg border flex items-center" 
                   style={{ 
                     backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                     borderColor: 'var(--success)',
                     color: 'var(--success)'
                   }}>
                <FiCheck className="mr-2" />
                {success}
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
                  placeholder="Enter username (letters only)"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Must start with a letter and contain only letters
              </p>
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
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Min 6 chars, letters + numbers, at least one capital
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2"
                     style={{ color: 'var(--text-primary)' }}>
                Confirm Password
              </label>
              <div className="relative">

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="form-input pl-10 pr-10"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p style={{ color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium hover:underline"
                  style={{ color: 'var(--accent-orange)' }}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
