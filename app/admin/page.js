'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { useDatabase } from '../../lib/context/DatabaseContext';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, UserX, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { Loader } from '../../components/Loader';
import { getRandomLocation } from '../../lib/data/location';

export default function AdminPanel() {
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answer: '',
    hints: ['', '', '']
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();
  const { questions, addQuestion, loading: dbLoading } = useDatabase();
  const router = useRouter();

  // Admin emails that are allowed to access this page
  const ADMIN_EMAILS = [
    'admin@techmate.com',
    'dj07.gdscdypcoe@gmail.com'
  ];

  // Get random question
  const getRandomQuestion = () => {
    if (!questions || questions.length === 0) {
      return {
        id: 'default',
        question: "What architectural style defines stateless communication between client and server?",
        answer: "REST",
        hints: ["Think about web services", "Involves client-server communication", "Stateless architecture"]
      };
    }
    const activeQuestions = questions.filter(q => q.active !== false);
    const randomQuestion = activeQuestions[Math.floor(Math.random() * activeQuestions.length)];
    return {
      id: randomQuestion.id,
      question: randomQuestion.question,
      answer: randomQuestion.answer,
      hints: randomQuestion.hints || []
    };
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (user && ADMIN_EMAILS.includes(user.email)) {
      fetchUsers();
    }
  }, [user]);

  // Admin check effect
  useEffect(() => {
    if (!authLoading && (!user || !ADMIN_EMAILS.includes(user.email))) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Delete user handler
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        setError('Error deleting user: ' + error.message);
      }
    }
  };

  // Reset user match handler
  const handleResetMatch = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s match?')) {
      try {
        // Get the user's data first to find their partner
        const userDoc = await doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);
        const userData = userSnapshot.data();

        // If user has a partner, reset partner's data too
        if (userData.partnerId) {
          const partnerId = userData.partnerId;
          
          // Reset partner
          await updateDoc(doc(db, 'users', partnerId), {
            partnerId: null,
            questionPart: null,
            answerPart: null,
            matched: false,
            matchedAt: null,
            status: 'waiting',
            verified: false,
            verifiedAt: null,
            hints: [],
            meetingLocation: null
          });

          // Find and update match record
          const matchQuery = query(
            collection(db, 'matches'),
            where('user1Id', 'in', [userId, partnerId]),
            where('user2Id', 'in', [userId, partnerId])
          );
          const matchSnapshot = await getDocs(matchQuery);
          if (!matchSnapshot.empty) {
            const matchDoc = matchSnapshot.docs[0];
            await deleteDoc(doc(db, 'matches', matchDoc.id));
          }
        }

        // Reset original user
        await updateDoc(doc(db, 'users', userId), {
          partnerId: null,
          questionPart: null,
          answerPart: null,
          matched: false,
          matchedAt: null,
          status: 'waiting',
          verified: false,
          verifiedAt: null,
          hints: [],
          meetingLocation: null
        });

        // Refresh users list
        await refreshUsersList();
        setError('');
      } catch (error) {
        console.error('Error resetting match:', error);
        setError('Error resetting match: ' + error.message);
      }
    }
  };

  // Handle user selection for matching
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      if (prev.length < 2) {
        return [...prev, userId];
      }
      return prev;
    });
  };

  // Manual match handler
  const handleManualMatch = async () => {
    if (selectedUsers.length !== 2) {
      setError('Please select exactly 2 users to match');
      return;
    }

    if (window.confirm('Are you sure you want to match these users?')) {
      try {
        const questionData = getRandomQuestion();
        console.log('Selected question:', questionData);

        const matchTimestamp = serverTimestamp();
        const [user1Id, user2Id] = selectedUsers;

        // Get random meeting location
        const meetingLocation = getRandomLocation();
        console.log('Selected meeting location:', meetingLocation);

        // Randomly decide who gets question and who gets answer
        const isFirstUserQuestionHolder = Math.random() < 0.5;

        // Update first user
        const user1Update = {
          partnerId: user2Id,
          questionPart: isFirstUserQuestionHolder ? questionData.question : null,
          answerPart: isFirstUserQuestionHolder ? null : questionData.answer,
          hints: questionData.hints,
          matched: true,
          status: 'matched',
          matchedAt: matchTimestamp,
          verified: false,
          meetingLocation: meetingLocation
        };

        // Update second user
        const user2Update = {
          partnerId: user1Id,
          questionPart: isFirstUserQuestionHolder ? null : questionData.question,
          answerPart: isFirstUserQuestionHolder ? questionData.answer : null,
          hints: questionData.hints,
          matched: true,
          status: 'matched',
          matchedAt: matchTimestamp,
          verified: false,
          meetingLocation: meetingLocation
        };

        // Perform updates
        await updateDoc(doc(db, 'users', user1Id), user1Update);
        await updateDoc(doc(db, 'users', user2Id), user2Update);

        // Create match record
        await addDoc(collection(db, 'matches'), {
          user1Id,
          user2Id,
          questionId: questionData.id,
          createdAt: matchTimestamp,
          status: 'active',
          completed: false,
          meetingLocation: meetingLocation
        });

        // Reset selection and refresh users list
        setSelectedUsers([]);
        await refreshUsersList();
        setError('');
      } catch (error) {
        console.error('Matching error:', error);
        setError('Error matching users: ' + error.message);
      }
    }
  };

  // Function to refresh users list
  const refreshUsersList = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  // Fetch users with auto-refresh every 5 seconds
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (user && ADMIN_EMAILS.includes(user.email)) {
      fetchUsers();
      // Set up auto-refresh
      const interval = setInterval(fetchUsers, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Filter users based on search query
  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.status?.toLowerCase().includes(query)
    );
  });

  // Show loading state
  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20 md:pt-24">
        <div className="text-center">
          <Loader size={48} />
          <p className="mt-4 text-black text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not admin, don't render anything (router will redirect)
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newQuestion.question || !newQuestion.answer) {
      setError('Please fill in all required fields');
      return;
    }

    // Filter out empty hints
    const hints = newQuestion.hints.filter(hint => hint.trim() !== '');
    if (hints.length === 0) {
      setError('Please provide at least one hint');
      return;
    }

    try {
      await addQuestion({
        ...newQuestion,
        hints
      });

      // Reset form
      setNewQuestion({
        question: '',
        answer: '',
        hints: ['', '', '']
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <motion.h1 
            className="hero-text text-4xl md:text-5xl mb-8 md:mb-12 text-center text-black"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ADMIN DASHBOARD
          </motion.h1>

          {error && (
            <motion.div 
              className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <motion.button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-4 text-lg font-medium transition-colors ${
                  activeTab === 'questions'
                    ? 'bg-[#ffc629] text-black'
                    : 'text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Questions
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-4 text-lg font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-[#ffc629] text-black'
                    : 'text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Users
              </motion.button>
            </div>

            <div className="p-6 md:p-8">
              {activeTab === 'questions' ? (
                <div className="space-y-8">
                  <div>
                    <h2 className="hero-text text-2xl mb-6 text-black">ADD NEW QUESTION</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Question</label>
                        <input
                          type="text"
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-base focus:ring-[#ffc629] focus:border-[#ffc629]"
                          placeholder="Enter the question"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Answer</label>
                        <input
                          type="text"
                          value={newQuestion.answer}
                          onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                          className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-base focus:ring-[#ffc629] focus:border-[#ffc629]"
                          placeholder="Enter the answer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Hints</label>
                        {newQuestion.hints.map((hint, index) => (
                          <input
                            key={index}
                            type="text"
                            value={hint}
                            onChange={(e) => {
                              const newHints = [...newQuestion.hints];
                              newHints[index] = e.target.value;
                              setNewQuestion({ ...newQuestion, hints: newHints });
                            }}
                            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-base mb-3 focus:ring-[#ffc629] focus:border-[#ffc629]"
                            placeholder={`Hint ${index + 1}`}
                          />
                        ))}
                      </div>
                      <motion.button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-[#ffc629] text-black rounded-xl text-lg font-medium shadow-md flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02, backgroundColor: '#ffd666' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus size={20} />
                        Add Question
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <h2 className="hero-text text-2xl mb-6 text-black">EXISTING QUESTIONS</h2>
                    <div className="space-y-4">
                      {questions?.map((q) => (
                        <motion.div 
                          key={q.id} 
                          className="bg-gray-50 p-6 rounded-2xl"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-base mb-2"><strong>Q:</strong> {q.question}</p>
                              <p className="text-base mb-3"><strong>A:</strong> {q.answer}</p>
                              {q.hints && (
                                <div>
                                  <p className="text-sm text-gray-500 mb-2">Hints:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {q.hints.map((hint, i) => (
                                      <li key={i} className="text-sm text-gray-600">{hint}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <motion.button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-red-500 hover:text-red-600 p-2"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 size={20} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h2 className="hero-text text-2xl text-black">MANAGE USERS</h2>
                    <div className="w-full md:w-auto flex gap-4 items-center">
                      <div className="relative flex-1 md:min-w-[300px]">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search users..."
                          className="w-full p-4 pr-12 rounded-xl bg-gray-50 border border-gray-200 text-base focus:ring-[#ffc629] focus:border-[#ffc629]"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      </div>
                      {selectedUsers.length === 2 && (
                        <motion.button
                          onClick={handleManualMatch}
                          className="px-6 py-4 bg-[#ffc629] text-black rounded-xl font-medium shadow-md whitespace-nowrap flex items-center gap-2"
                          whileHover={{ scale: 1.02, backgroundColor: '#ffd666' }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Match Selected
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredUsers.map((u) => (
                      <motion.div 
                        key={u.id} 
                        className={`bg-white rounded-2xl shadow-md p-6 border ${
                          selectedUsers.includes(u.id) ? 'border-[#ffc629]' : 'border-gray-100'
                        }`}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(u.id)}
                                onChange={() => handleUserSelect(u.id)}
                                disabled={u.matched || (selectedUsers.length === 2 && !selectedUsers.includes(u.id))}
                                className="w-5 h-5 rounded border-gray-300 text-[#ffc629] focus:ring-[#ffc629]"
                              />
                              <div>
                                <p className="hero-text text-xl text-black">{u.username || 'No username'}</p>
                                <p className="text-gray-500 text-sm">{u.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3 w-full md:w-auto">
                            <motion.button
                              onClick={() => handleResetMatch(u.id)}
                              disabled={!u.matched}
                              className="flex-1 md:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <RotateCcw size={16} />
                              Reset Match
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteUser(u.id)}
                              className="flex-1 md:flex-none px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl text-sm transition-colors flex items-center gap-2"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <UserX size={16} />
                              Delete User
                            </motion.button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-2">Status Information</h3>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Status:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    u.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                                    u.status === 'matched' && !u.verified ? 'bg-blue-100 text-blue-700' :
                                    u.status === 'matched' && u.verified ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {u.status === 'waiting' ? 'Waiting' :
                                     u.status === 'matched' && !u.verified ? 'Matched (Unverified)' :
                                     u.status === 'matched' && u.verified ? 'Matched & Verified' :
                                     u.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Matched: <span className="text-black">{u.matched ? 'Yes' : 'No'}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  Verified: <span className="text-black">{u.verified ? 'Yes' : 'No'}</span>
                                </p>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-2">Timestamps</h3>
                              <div className="space-y-2 text-xs">
                                <p className="text-gray-600">
                                  Registered: <span className="text-black">{u.registeredAt?.toDate().toLocaleString() || 'N/A'}</span>
                                </p>
                                <p className="text-gray-600">
                                  Last Active: <span className="text-black">{u.lastActive?.toDate().toLocaleString() || 'N/A'}</span>
                                </p>
                                {u.matchedAt && (
                                  <p className="text-gray-600">
                                    Matched At: <span className="text-black">{u.matchedAt.toDate().toLocaleString()}</span>
                                  </p>
                                )}
                                {u.verifiedAt && (
                                  <p className="text-gray-600">
                                    Verified At: <span className="text-black">{u.verifiedAt.toDate().toLocaleString()}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-2">Match Information</h3>
                              {u.matched ? (
                                <div className="space-y-3">
                                  <div className="bg-gray-50 p-3 rounded-xl space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">User ID</p>
                                      <p className="text-sm text-black break-all font-mono">{u.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Partner ID</p>
                                      <p className="text-sm text-black break-all font-mono">{u.partnerId}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Partner Username</p>
                                      <p className="text-sm text-black">
                                        {users.find(user => user.id === u.partnerId)?.username || 'Not found'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Partner Email</p>
                                      <p className="text-sm text-black">
                                        {users.find(user => user.id === u.partnerId)?.email || 'Not found'}
                                      </p>
                                    </div>
                                    {u.meetingLocation && (
                                      <div>
                                        <p className="text-xs text-gray-500">Meeting Location</p>
                                        <p className="text-sm text-black font-medium">
                                          {u.meetingLocation.name} (ID: {u.meetingLocation.id})
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Meet your partner here!</p>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Question/Answer Assignment:</p>
                                    {u.questionPart ? (
                                      <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Question Holder</p>
                                        <p className="text-sm text-black">{u.questionPart}</p>
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Answer Holder</p>
                                        <p className="text-sm text-black">{u.answerPart}</p>
                                      </div>
                                    )}
                                  </div>
                                  {u.hints && u.hints.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-500 mb-2">Hints:</p>
                                      <ul className="space-y-1">
                                        {u.hints.map((hint, index) => (
                                          <li key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                            {hint}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-xs text-gray-500">User ID</p>
                                    <p className="text-sm text-black break-all font-mono">{u.id}</p>
                                  </div>
                                  <p className="text-sm text-gray-500">No match yet</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 