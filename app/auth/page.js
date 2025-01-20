'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideIn, containerVariants } from '../../lib/animations';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 relative overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={containerVariants}
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-[800px] h-[800px] -top-[400px] -left-[400px] bg-gradient-to-br from-slate-200/50 to-slate-300/50 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3] 
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] -bottom-[300px] -right-[300px] bg-gradient-to-tr from-slate-200/50 to-slate-300/50 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3] 
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4 
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          className="max-w-md mx-auto"
          variants={fadeIn}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center tracking-tight text-slate-900"
            variants={slideIn}
          >
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </motion.h1>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                className="bg-red-50 text-red-600 p-3 md:p-4 rounded-lg mb-4 md:mb-6 text-sm md:text-base border border-red-200"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="bg-white/80 backdrop-blur-lg border-slate-200">
            <motion.div className="p-6 md:p-8" variants={fadeIn}>
              <div className="flex gap-2 md:gap-4 mb-6 md:mb-8">
                <Button
                  onClick={() => setIsLogin(true)}
                  variant={isLogin ? "default" : "outline"}
                  className={`flex-1 ${isLogin ? 'bg-slate-900 hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  Login
                </Button>
                <Button
                  onClick={() => setIsLogin(false)}
                  variant={!isLogin ? "default" : "outline"}
                  className={`flex-1 ${!isLogin ? 'bg-slate-900 hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  Sign Up
                </Button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-4">
                        <label className="block text-sm md:text-base font-medium mb-1.5 md:mb-2 text-slate-700">Username</label>
                        <Input
                          {...register('username')}
                          type="text"
                          className="bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-slate-900"
                          placeholder="Choose a username"
                          disabled={loading}
                        />
                        {errors.username && (
                          <motion.p 
                            className="text-red-600 text-xs md:text-sm mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {errors.username.message}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm md:text-base font-medium mb-1.5 md:mb-2 text-slate-700">Email</label>
                  <Input
                    {...register('email')}
                    type="email"
                    className="bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-slate-900"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                  {errors.email && (
                    <motion.p 
                      className="text-red-600 text-xs md:text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm md:text-base font-medium mb-1.5 md:mb-2 text-slate-700">Password</label>
                  <Input
                    {...register('password')}
                    type="password"
                    className="bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-slate-900"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  {errors.password && (
                    <motion.p 
                      className="text-red-600 text-xs md:text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800"
                  variant="default"
                >
                  {loading
                    ? isLogin ? 'Logging in...' : 'Signing up...'
                    : isLogin ? 'Login' : 'Sign Up'
                  }
                </Button>
              </form>

              {!isLogin && (
                <motion.p 
                  className="mt-4 text-xs md:text-sm text-slate-600 text-center px-2 md:px-4"
                  variants={fadeIn}
                >
                  By signing up, you agree to participate in the TechMate Hunt and follow its rules.
                </motion.p>
              )}
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
} 