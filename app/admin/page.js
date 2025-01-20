'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { useDatabase } from '../../lib/context/DatabaseContext';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminPanel() {
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answer: '',
    hints: ['', '', '']
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'users'
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
            hints: []
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
          hints: []
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
          verified: false
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
          verified: false
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
          completed: false
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center">Admin Panel</h1>

          {error && (
            <div className="bg-red-800 text-white p-3 md:p-4 rounded-lg mb-4 text-sm md:text-base">
              {error}
            </div>
          )}

          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-3 md:py-4 text-sm md:text-base font-medium transition-colors ${
                  activeTab === 'questions'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 md:py-4 text-sm md:text-base font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Users
              </button>
            </div>

            <div className="p-4 md:p-6">
              {activeTab === 'questions' ? (
                <div className="space-y-4 md:space-y-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-4">Add New Question</h2>
                  <div>
                    <label className="block text-sm md:text-base font-medium mb-1.5">Question</label>
                    <input
                      type="text"
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      className="w-full p-3 md:p-3.5 rounded bg-gray-700 border border-gray-600 text-sm md:text-base"
                      placeholder="Enter the question"
                    />
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium mb-1.5">Answer</label>
                    <input
                      type="text"
                      value={newQuestion.answer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                      className="w-full p-3 md:p-3.5 rounded bg-gray-700 border border-gray-600 text-sm md:text-base"
                      placeholder="Enter the answer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium mb-1.5">Hints</label>
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
                        className="w-full p-3 md:p-3.5 rounded bg-gray-700 border border-gray-600 mb-2 text-sm md:text-base"
                        placeholder={`Hint ${index + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full md:w-auto px-6 py-3 md:py-3.5 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors text-sm md:text-base"
                  >
                    Add Question
                  </button>

                  <div className="mt-8">
                    <h2 className="text-xl md:text-2xl font-bold mb-4">Existing Questions</h2>
                    <div className="space-y-4">
                      {questions?.map((q, index) => (
                        <div key={q.id} className="bg-gray-700 p-3 md:p-4 rounded">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-sm md:text-base"><strong>Q:</strong> {q.question}</p>
                              <p className="text-sm md:text-base mt-1"><strong>A:</strong> {q.answer}</p>
                              {q.hints && (
                                <div className="mt-2">
                                  <p className="text-xs md:text-sm text-gray-400">Hints:</p>
                                  <ul className="list-disc list-inside">
                                    {q.hints.map((hint, i) => (
                                      <li key={i} className="text-xs md:text-sm text-gray-300">{hint}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-red-400 hover:text-red-300 transition-colors text-sm md:text-base"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold">Users</h2>
                    <div className="w-full md:w-auto flex gap-4 items-center">
                      <div className="relative flex-1 md:min-w-[300px]">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search users by name, email, or status..."
                          className="w-full p-2 md:p-3 pr-10 rounded bg-gray-700 border border-gray-600 text-sm md:text-base placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          🔍
                        </span>
                      </div>
                      {selectedUsers.length === 2 && (
                        <button
                          onClick={handleManualMatch}
                          className="px-4 py-2 md:px-6 md:py-3 bg-green-600 hover:bg-green-700 rounded font-semibold transition-colors text-sm md:text-base whitespace-nowrap"
                        >
                          Match Selected Users
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {filteredUsers.map((u) => (
                      <div 
                        key={u.id} 
                        className={`bg-gray-800 rounded-lg shadow p-4 md:p-6 ${
                          selectedUsers.includes(u.id) ? 'border-2 border-blue-500' : 'border border-gray-700'
                        }`}
                      >
                        {/* Header with basic info and actions */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(u.id)}
                                onChange={() => handleUserSelect(u.id)}
                                disabled={u.matched || (selectedUsers.length === 2 && !selectedUsers.includes(u.id))}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <div>
                                <p className="font-semibold text-base md:text-lg">{u.username || 'No username'}</p>
                                <p className="text-gray-400 text-sm">{u.email}</p>
                                <p className="text-xs text-gray-500">ID: {u.id}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <button
                              onClick={() => handleResetMatch(u.id)}
                              disabled={!u.matched}
                              className="flex-1 md:flex-none px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-xs md:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reset Match
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="flex-1 md:flex-none px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs md:text-sm transition-colors"
                            >
                              Delete User
                            </button>
                          </div>
                        </div>

                        {/* Detailed user information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 pt-4 border-t border-gray-700">
                          {/* Left column - Status and Timestamps */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2 text-blue-400 text-sm md:text-base">Status Information</h3>
                              <div className="space-y-2 text-sm">
                                <p className="text-gray-400">Status: 
                                  <span className={`ml-2 px-2 py-1 rounded text-xs md:text-sm ${
                                    u.status === 'waiting' ? 'bg-yellow-600' :
                                    u.status === 'matched' && !u.verified ? 'bg-blue-600' :
                                    u.status === 'matched' && u.verified ? 'bg-green-600' :
                                    'bg-gray-600'
                                  }`}>
                                    {u.status === 'waiting' ? 'Waiting' :
                                     u.status === 'matched' && !u.verified ? 'Matched (Unverified)' :
                                     u.status === 'matched' && u.verified ? 'Matched & Verified' :
                                     u.status}
                                  </span>
                                </p>
                                <p className="text-gray-400">Matched: <span className="text-white">{u.matched ? 'Yes' : 'No'}</span></p>
                                <p className="text-gray-400">Verified: <span className="text-white">{u.verified ? 'Yes' : 'No'}</span></p>
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold mb-2 text-blue-400 text-sm md:text-base">Timestamps</h3>
                              <div className="space-y-2 text-xs md:text-sm">
                                <p className="text-gray-400">Registered: <span className="text-white">{u.registeredAt?.toDate().toLocaleString() || 'N/A'}</span></p>
                                <p className="text-gray-400">Last Active: <span className="text-white">{u.lastActive?.toDate().toLocaleString() || 'N/A'}</span></p>
                                {u.matchedAt && (
                                  <p className="text-gray-400">Matched At: <span className="text-white">{u.matchedAt.toDate().toLocaleString()}</span></p>
                                )}
                                {u.verifiedAt && (
                                  <p className="text-gray-400">Verified At: <span className="text-white">{u.verifiedAt.toDate().toLocaleString()}</span></p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right column - Match Information */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2 text-blue-400 text-sm md:text-base">Match Information</h3>
                              <div className="space-y-2 text-sm">
                                {u.matched ? (
                                  <>
                                    <p className="text-gray-400">Partner ID: <span className="text-white break-all">{u.partnerId}</span></p>
                                    <div className="mt-2">
                                      <p className="text-gray-400 font-semibold text-xs md:text-sm">Question/Answer Assignment:</p>
                                      {u.questionPart ? (
                                        <div className="bg-gray-700 p-2 md:p-3 rounded mt-1">
                                          <p className="text-xs md:text-sm text-gray-400">Question Holder</p>
                                          <p className="text-white text-sm md:text-base">{u.questionPart}</p>
                                        </div>
                                      ) : (
                                        <div className="bg-gray-700 p-2 md:p-3 rounded mt-1">
                                          <p className="text-xs md:text-sm text-gray-400">Answer Holder</p>
                                          <p className="text-white text-sm md:text-base">{u.answerPart}</p>
                                        </div>
                                      )}
                                    </div>
                                    {u.hints && u.hints.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-gray-400 font-semibold text-xs md:text-sm">Hints:</p>
                                        <ul className="list-disc list-inside">
                                          {u.hints.map((hint, index) => (
                                            <li key={index} className="text-white text-xs md:text-sm">{hint}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-gray-400">No match yet</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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