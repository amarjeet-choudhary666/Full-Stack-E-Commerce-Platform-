import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

interface AdminSignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  adminCode: string;
  agreeToTerms: boolean;
}

const AdminSignup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdminSignupFormData>();

  const password = watch('password');

  const onSubmit = async (data: AdminSignupFormData) => {
    try {
      setIsLoading(true);
      
      // Simple admin code check (in production, this should be more secure)
      if (data.adminCode !== 'ADMIN2024') {
        toast.error('Invalid admin code');
        return;
      }

      // Register as admin
      await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'admin'
      });
      
      toast.success('Admin account created successfully! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Admin Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
              error={errors.name?.message}
            />

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Admin Code"
              type="password"
              placeholder="Enter admin access code"
              {...register('adminCode', {
                required: 'Admin code is required',
              })}
              error={errors.adminCode?.message}
              helperText="Contact system administrator for admin code"
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('agreeToTerms', {
                required: 'You must agree to the terms and conditions',
              })}
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
          )}

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Create Admin Account
            </Button>
          </div>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Need customer account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              Sign up as customer
            </Link>
          </p>
          <p className="text-xs text-gray-500">
            Admin Code: <code className="bg-gray-100 px-1 rounded">ADMIN2024</code> (for demo)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;