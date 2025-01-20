'use client';

import { useState, useEffect } from 'react';
import { useDatabase } from '../../lib/context/DatabaseContext';
import { useAuth } from '../../lib/context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';

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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center">Your TechMate Status</h1>
            
            {loading ? (
              <div className="text-center text-base md:text-lg">Loading your match status...</div>
            ) : error ? (
              <div className="bg-red-800 text-white p-3 md:p-4 rounded-lg text-center mb-4 text-sm md:text-base">
                {error}
              </div>
            ) : userStatus?.matched ? (
              <div className="bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg">
                <div className="mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">Your Match Details</h2>
                  {userStatus.verified ? (
                    userStatus.partnerName && (
                      <div className="mb-4 bg-green-900 p-3 md:p-4 rounded text-center">
                        <h3 className="text-base md:text-lg font-semibold mb-2">Matched with:</h3>
                        <p className="text-lg md:text-xl">{userStatus.partnerName}</p>
                      </div>
                    )
                  ) : (
                    <div className="mb-4 bg-blue-900 p-3 md:p-4 rounded text-center">
                      <h3 className="text-base md:text-lg font-semibold mb-2">Match Found!</h3>
                      <p className="text-sm md:text-base text-gray-300">Verify your match to see their username</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-2">Your Part:</h3>
                      {userStatus.questionPart ? (
                        <p className="bg-gray-700 p-3 md:p-4 rounded text-sm md:text-base">Question: {userStatus.questionPart}</p>
                      ) : (
                        <p className="bg-gray-700 p-3 md:p-4 rounded text-sm md:text-base">Answer: {userStatus.answerPart}</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-2">Your Verification Code:</h3>
                      <p className="bg-blue-700 p-3 md:p-4 rounded font-mono text-sm md:text-base break-all">{userStatus.uid || user?.uid || 'Loading...'}</p>
                      <p className="text-xs md:text-sm text-gray-400 mt-2">Share this code with your match to verify</p>
                    </div>

                    {!userStatus.verified && (
                      <form onSubmit={handleVerification} className="mt-4 md:mt-6">
                        <h3 className="text-base md:text-lg font-semibold mb-2">Verify Match</h3>
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                          <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Enter your partner's code"
                            className="flex-1 p-3 md:p-3.5 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                          />
                          <button
                            type="submit"
                            className="px-6 py-3 md:py-3.5 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors text-sm md:text-base w-full md:w-auto"
                          >
                            Verify
                          </button>
                        </div>
                      </form>
                    )}
                    
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-2">Hints to Find Your Match:</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {userStatus.hints?.map((hint, index) => (
                          <li key={index} className="bg-gray-700 p-3 md:p-4 rounded text-sm md:text-base">{hint}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4 md:pt-6">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">What Next?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm md:text-base">
                    <li>Look for someone with the matching question/answer</li>
                    <li>Use the hints above to identify your potential match</li>
                    <li>When you find them, verify your match by comparing your question and answer</li>
                    <li>Exchange verification codes and enter them here to confirm the match</li>
                  </ol>
                </div>

                {userStatus.verified && (
                  <div className="mt-6 md:mt-8 bg-green-800 p-4 md:p-6 rounded-lg text-center">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">🎉 Match Verified!</h3>
                    <p className="text-sm md:text-base">Congratulations! You've found and verified your TechMate!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Waiting for Match</h2>
                <p className="mb-3 md:mb-4 text-sm md:text-base">We're currently looking for your perfect technical match. This might take a few minutes to a few hours depending on registrations.</p>
                <p className="text-xs md:text-sm text-gray-400">You'll be notified when we find your match!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 