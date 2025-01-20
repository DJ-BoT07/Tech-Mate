'use client';

import { useState, useEffect } from 'react';
import { useDatabase } from '../../lib/context/DatabaseContext';
import { useAuth } from '../../lib/context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideIn, scaleIn, containerVariants } from '../../lib/animations';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      // Reload user status
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
        className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4 py-8 md:py-16">
          <motion.div 
            className="max-w-2xl mx-auto"
            variants={fadeIn}
          >
            <motion.h1 
              className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center"
              variants={slideIn}
            >
              Your TechMate Status
            </motion.h1>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  className="text-center text-base md:text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Loading your match status...
                </motion.div>
              ) : error ? (
                <motion.div 
                  className="bg-red-800 text-white p-3 md:p-4 rounded-lg text-center mb-4 text-sm md:text-base"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {error}
                </motion.div>
              ) : userStatus?.matched ? (
                <Card className="bg-gray-800 border-gray-700">
                  <motion.div 
                    className="p-4 md:p-8"
                    variants={scaleIn}
                  >
                    <div className="mb-6 md:mb-8">
                      <motion.h2 
                        className="text-xl md:text-2xl font-bold mb-4"
                        variants={slideIn}
                      >
                        Your Match Details
                      </motion.h2>
                      <AnimatePresence mode="wait">
                        {userStatus.verified ? (
                          userStatus.partnerName && (
                            <motion.div 
                              className="mb-4 bg-green-900 p-3 md:p-4 rounded text-center"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <h3 className="text-base md:text-lg font-semibold mb-2">Matched with:</h3>
                              <p className="text-lg md:text-xl">{userStatus.partnerName}</p>
                            </motion.div>
                          )
                        ) : (
                          <motion.div 
                            className="mb-4 bg-blue-900 p-3 md:p-4 rounded text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <h3 className="text-base md:text-lg font-semibold mb-2">Match Found!</h3>
                            <p className="text-sm md:text-base text-gray-300">Verify your match to see their username</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <motion.div className="space-y-4" variants={fadeIn}>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold mb-2">Your Part:</h3>
                          <motion.p 
                            className="bg-gray-700 p-3 md:p-4 rounded text-sm md:text-base"
                            whileHover={{ scale: 1.01 }}
                          >
                            {userStatus.questionPart ? `Question: ${userStatus.questionPart}` : `Answer: ${userStatus.answerPart}`}
                          </motion.p>
                        </div>
                        
                        <div>
                          <h3 className="text-base md:text-lg font-semibold mb-2">Your Verification Code:</h3>
                          <motion.p 
                            className="bg-blue-700 p-3 md:p-4 rounded font-mono text-sm md:text-base break-all"
                            whileHover={{ scale: 1.01 }}
                          >
                            {userStatus.uid || user?.uid || 'Loading...'}
                          </motion.p>
                          <p className="text-xs md:text-sm text-gray-400 mt-2">Share this code with your match to verify</p>
                        </div>

                        {!userStatus.verified && (
                          <motion.form 
                            onSubmit={handleVerification} 
                            className="mt-4 md:mt-6"
                            variants={fadeIn}
                          >
                            <h3 className="text-base md:text-lg font-semibold mb-2">Verify Match</h3>
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                              <Input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter your partner's code"
                                className="flex-1 bg-gray-700 border-gray-600 focus:ring-blue-500"
                              />
                              <Button
                                type="submit"
                                variant="default"
                                className="px-6"
                              >
                                Verify
                              </Button>
                            </div>
                          </motion.form>
                        )}
                        
                        <motion.div variants={fadeIn}>
                          <h3 className="text-base md:text-lg font-semibold mb-2">Hints to Find Your Match:</h3>
                          <motion.ul className="list-disc list-inside space-y-2">
                            {userStatus.hints?.map((hint, index) => (
                              <motion.li
                                key={index}
                                className="bg-gray-700 p-3 md:p-4 rounded text-sm md:text-base"
                                variants={fadeIn}
                                custom={index}
                                whileHover={{ scale: 1.01 }}
                              >
                                {hint}
                              </motion.li>
                            ))}
                          </motion.ul>
                        </motion.div>
                      </motion.div>
                    </div>

                    <motion.div 
                      className="border-t border-gray-600 pt-4 md:pt-6"
                      variants={fadeIn}
                    >
                      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">What Next?</h3>
                      <motion.ol className="list-decimal list-inside space-y-2 text-sm md:text-base">
                        {[
                          "Look for someone with the matching question/answer",
                          "Use the hints above to identify your potential match",
                          "When you find them, verify your match by comparing your question and answer",
                          "Exchange verification codes and enter them here to confirm the match"
                        ].map((step, index) => (
                          <motion.li
                            key={index}
                            variants={fadeIn}
                            custom={index}
                            whileHover={{ x: 5 }}
                          >
                            {step}
                          </motion.li>
                        ))}
                      </motion.ol>
                    </motion.div>

                    {userStatus.verified && (
                      <motion.div 
                        className="mt-6 md:mt-8 bg-green-800 p-4 md:p-6 rounded-lg text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.h3 
                          className="text-xl md:text-2xl font-bold mb-2"
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        >
                          🎉 Match Verified!
                        </motion.h3>
                        <p className="text-sm md:text-base">Congratulations! You've found and verified your TechMate!</p>
                      </motion.div>
                    )}
                  </motion.div>
                </Card>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <motion.div 
                    className="p-4 md:p-8 text-center"
                    variants={scaleIn}
                  >
                    <motion.h2 
                      className="text-xl md:text-2xl font-bold mb-3 md:mb-4"
                      variants={slideIn}
                    >
                      Waiting for Match
                    </motion.h2>
                    <motion.p 
                      className="mb-3 md:mb-4 text-sm md:text-base"
                      variants={fadeIn}
                    >
                      We're currently looking for your perfect technical match. This might take a few minutes to a few hours depending on registrations.
                    </motion.p>
                    <motion.p 
                      className="text-xs md:text-sm text-gray-400"
                      variants={fadeIn}
                    >
                      You'll be notified when we find your match!
                    </motion.p>
                  </motion.div>
                </Card>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
} 