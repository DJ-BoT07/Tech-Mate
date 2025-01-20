'use client';

import Link from 'next/link';
import { useAuth } from '../lib/context/AuthContext';
import { useState } from 'react';
import { Menu, X, Code2 } from 'lucide-react';

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
    <nav className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-lg relative z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center h-16 px-4">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-2xl font-semibold hover:opacity-90 transition-opacity"
          >
            <Code2 size={24} className="text-white" />
            <span>TechMate</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-amber-400/20 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 rounded-full hover:bg-amber-400/20 transition-colors font-medium text-lg"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-medium text-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="px-6 py-2 rounded-full bg-white text-amber-500 hover:bg-white/90 transition-colors font-semibold text-lg"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-gradient-to-r from-amber-500 to-yellow-400 border-t border-white/10 shadow-lg">
            <div className="flex flex-col p-4 space-y-2">
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="px-4 py-3 rounded-full hover:bg-amber-400/20 transition-colors font-medium text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-left font-medium text-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="px-4 py-3 rounded-full bg-white text-amber-500 hover:bg-white/90 transition-colors font-semibold text-lg text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 