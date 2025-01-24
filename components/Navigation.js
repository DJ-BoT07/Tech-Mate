'use client';

import Link from 'next/link';
import { useAuth } from '../lib/context/AuthContext';
import { useState } from 'react';
import { Menu, X, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <nav className="bg-white fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link 
            href="/" 
            className="flex items-center space-x-3"
          >
            <div className="bg-[#ffc629] p-2 rounded-xl">
              <Code2 size={28} className="text-black" />
            </div>
            <span className="hero-text text-2xl text-black">TECHMATE</span>
          </Link>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} className="text-black" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} className="text-black" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-black hover:text-[#ffc629] transition-colors font-medium text-lg"
                >
                  Dashboard
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="px-8 py-3 rounded-full bg-[#ffc629] text-black font-medium text-lg shadow-md"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: '#ffd666'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <Link href="/auth">
                <motion.button
                  className="px-8 py-3 rounded-full bg-[#ffc629] text-black font-medium text-lg shadow-md"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: '#ffd666'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-100"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className="p-6 space-y-6">
                {user ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="block text-center text-black hover:text-[#ffc629] transition-colors font-medium text-xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <motion.button
                      onClick={handleLogout}
                      className="w-full py-4 rounded-full bg-[#ffc629] text-black font-medium text-xl shadow-md"
                      whileHover={{ backgroundColor: '#ffd666' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <Link 
                    href="/auth" 
                    className="block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.button
                      className="w-full py-4 rounded-full bg-[#ffc629] text-black font-medium text-xl shadow-md"
                      whileHover={{ backgroundColor: '#ffd666' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
} 