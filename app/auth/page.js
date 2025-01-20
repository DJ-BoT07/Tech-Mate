'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/context/AuthContext';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional()
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, signup } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(data.email, data.password);
      } else {
        await signup(data.email, data.password, data.username);
      }
      reset();
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>

          {error && (
            <div className="bg-red-800 text-white p-3 md:p-4 rounded-lg mb-4 md:mb-6 text-sm md:text-base">
              {error}
            </div>
          )}

          <div className="bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg">
            <div className="flex gap-2 md:gap-4 mb-6 md:mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-lg transition-colors text-base md:text-lg ${
                  isLogin
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-lg transition-colors text-base md:text-lg ${
                  !isLogin
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm md:text-base font-medium mb-1.5 md:mb-2">Username</label>
                  <input
                    {...register('username')}
                    type="text"
                    className="w-full p-3 md:p-3.5 text-base md:text-lg rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="Choose a username"
                    disabled={loading}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs md:text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm md:text-base font-medium mb-1.5 md:mb-2">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full p-3 md:p-3.5 text-base md:text-lg rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs md:text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium mb-1.5 md:mb-2">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full p-3 md:p-3.5 text-base md:text-lg rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs md:text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 md:py-4 px-4 rounded text-base md:text-lg transition duration-200 disabled:opacity-50 mt-2 md:mt-4"
              >
                {loading
                  ? isLogin ? 'Logging in...' : 'Signing up...'
                  : isLogin ? 'Login' : 'Sign Up'
                }
              </button>
            </form>

            {!isLogin && (
              <p className="mt-4 text-xs md:text-sm text-gray-400 text-center px-2 md:px-4">
                By signing up, you agree to participate in the TechMate Hunt and follow its rules.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 