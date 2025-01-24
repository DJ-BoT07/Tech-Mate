'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/context/AuthContext';

// Admin emails that are allowed to access admin routes
const ADMIN_EMAILS = [
  'admin@techmate.com',
  // Add more admin emails here
];

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  console.log(user);
  

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If no user, redirect to auth page
        router.push('/auth');
      } else if (adminOnly && !ADMIN_EMAILS.includes(user.email)) {
        // If admin route but user is not admin, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render anything if:
  // 1. No user is logged in, or
  // 2. Route requires admin access but user is not admin
  if (!user || (adminOnly && !ADMIN_EMAILS.includes(user.email))) {
    return null;
  }

  return children;
} 