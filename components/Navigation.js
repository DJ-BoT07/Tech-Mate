'use client';

import Link from 'next/link';
import { useAuth } from '../lib/context/AuthContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-gray-900 text-white p-4 relative z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            TechMate Hunt
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-800 rounded"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth" className="hover:text-blue-400 transition-colors">
                Login / Register
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-gray-900 border-t border-gray-800 p-4 shadow-lg">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="hover:text-blue-400 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hover:text-red-400 transition-colors text-left py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="hover:text-blue-400 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 