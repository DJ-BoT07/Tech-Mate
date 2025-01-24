'use client';

import { useState, useEffect } from 'react';
import { useDatabase } from '../../lib/context/DatabaseContext';
import { useAuth } from '../../lib/context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideIn } from '../../lib/animations';
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const { getUserMatchStatus, verifyMatch } = useDatabase();
  const { user } = useAuth();

  useEffect(() => {
    const loadUserStatus = async () => {
      try {
        if (!user) return;
        const status = await getUserMatchStatus(user.uid);
        setUserStatus(status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserStatus();
  }, [getUserMatchStatus, user]);

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError('Please enter your partner\'s code');
      return;
    }

    try {
      await verifyMatch(user.uid, verificationCode);
      const status = await getUserMatchStatus(user.uid);
      setUserStatus(status);
      setVerificationCode('');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ProtectedRoute>
      <motion.div 
        className="min-h-screen bg-white"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="container mx-auto px-4 py-24">
          <motion.div 
            className="max-w-3xl mx-auto"
            variants={fadeIn}
          >
            <motion.h1 
              className="hero-text text-4xl md:text-5xl mb-12 text-center text-black"
              variants={slideIn}
            >
              YOUR TECHMATE STATUS
            </motion.h1>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  className="flex items-center justify-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="w-8 h-8 animate-spin text-[#ffc629]" />
                </motion.div>
              ) : error ? (
                <motion.div 
                  className="bg-red-50 text-red-600 p-4 rounded-2xl text-center mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {error}
                </motion.div>
              ) : userStatus?.matched ? (
                <motion.div 
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                  variants={fadeIn}
                >
                  <div className="p-8">
                    <div className="mb-8">
                      <AnimatePresence mode="wait">
                        {userStatus.verified ? (
                          userStatus.partnerName && (
                            <motion.div 
                              className="bg-[#ffc629] p-6 rounded-2xl text-center mb-8"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                            >
                              <h3 className="text-xl font-semibold mb-2 text-black">Matched with:</h3>
                              <p className="text-2xl text-black hero-text">{userStatus.partnerName}</p>
                            </motion.div>
                          )
                        ) : (
                          <motion.div 
                            className="bg-blue-50 p-6 rounded-2xl text-center mb-8"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <h3 className="text-xl font-semibold mb-2 text-blue-600">Match Found!</h3>
                            <p className="text-blue-600">Verify your match to see their username</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-black">Your Part:</h3>
                          <motion.div 
                            className="bg-gray-50 p-6 rounded-2xl"
                            whileHover={{ scale: 1.01 }}
                          >
                            <p className="text-lg text-gray-700">
                              {userStatus.questionPart ? `Question: ${userStatus.questionPart}` : `Answer: ${userStatus.answerPart}`}
                            </p>
                          </motion.div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold mb-3 text-black">Your Verification Code:</h3>
                          <motion.div 
                            className="bg-[#fff8e6] p-6 rounded-2xl"
                            whileHover={{ scale: 1.01 }}
                          >
                            <p className="font-mono text-lg break-all text-[#ffc629]">
                              {userStatus.uid || user?.uid || 'Loading...'}
                            </p>
                          </motion.div>
                          <p className="text-sm text-gray-500 mt-2">Share this code with your match to verify</p>
                        </div>

                        {!userStatus.verified && (
                          <motion.form 
                            onSubmit={handleVerification}
                            className="mt-8"
                          >
                            <h3 className="text-xl font-semibold mb-4 text-black">Verify Match</h3>
                            <div className="space-y-4">
                              <Input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter your partner's code"
                                className="w-full p-4 text-lg bg-gray-50 border-gray-200 rounded-xl focus:ring-[#ffc629] focus:border-[#ffc629]"
                              />
                              <motion.button
                                type="submit"
                                className="w-full py-4 bg-[#ffc629] text-black rounded-xl text-lg font-semibold shadow-md"
                                whileHover={{ scale: 1.02, backgroundColor: '#ffd666' }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Verify Match
                              </motion.button>
                            </div>
                          </motion.form>
                        )}
                        
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-black">Hints to Find Your Match:</h3>
                          <div className="space-y-3">
                            {userStatus.hints?.map((hint, index) => (
                              <motion.div
                                key={index}
                                className="bg-gray-50 p-4 rounded-xl"
                                variants={fadeIn}
                                custom={index}
                                whileHover={{ scale: 1.01 }}
                              >
                                <p className="text-gray-700">{hint}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {userStatus.verified && (
                      <motion.div 
                        className="mt-8 bg-[#ffc629] p-8 rounded-2xl text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.h3 
                          className="text-3xl font-bold mb-3 text-black hero-text"
                          animate={{ 
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ 
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        >
                          🎉 MATCH VERIFIED!
                        </motion.h3>
                        <p className="text-lg text-black">Congratulations! You've found and verified your TechMate!</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
                  variants={fadeIn}
                >
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-6 bg-[#ffc629] rounded-full flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Loader2 className="w-10 h-10 text-black animate-spin" />
                  </motion.div>
                  <motion.h2 
                    className="text-2xl font-bold mb-4 text-black hero-text"
                    variants={slideIn}
                  >
                    FINDING YOUR MATCH
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 text-lg"
                    variants={fadeIn}
                  >
                    We're currently looking for your perfect technical match. This might take a few minutes.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
} 