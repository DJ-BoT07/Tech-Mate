'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from '../firebase';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get random question from questions collection
  const getRandomQuestion = async () => {
    const questionsRef = collection(db, 'questions');
    const querySnapshot = await getDocs(questionsRef);
    const questions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return questions[Math.floor(Math.random() * questions.length)];
  };

  // Find a match for a user
  const findMatch = async (userId) => {
    try {
      // Query for any unmatched user
      const q = query(
        collection(db, 'users'),
        where('matched', '==', false),
        where('status', '==', 'waiting')
      );

      const querySnapshot = await getDocs(q);
      const potentialMatches = querySnapshot.docs
        .filter(doc => doc.id !== userId)
        .map(doc => ({ id: doc.id, ...doc.data() }));

      if (potentialMatches.length > 0) {
        // Select a random match
        const match = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
        const questionData = await getRandomQuestion();
        const matchTimestamp = serverTimestamp();

        // Randomly decide who gets question and who gets answer
        const isQuestionHolder = Math.random() < 0.5;

        // Update both users
        await updateDoc(doc(db, 'users', userId), {
          partnerId: match.id,
          questionPart: isQuestionHolder ? questionData.question : null,
          answerPart: isQuestionHolder ? null : questionData.answer,
          hints: questionData.hints,
          matched: true,
          status: 'matched',
          matchedAt: matchTimestamp
        });

        await updateDoc(doc(db, 'users', match.id), {
          partnerId: userId,
          questionPart: isQuestionHolder ? null : questionData.question,
          answerPart: isQuestionHolder ? questionData.answer : null,
          hints: questionData.hints,
          matched: true,
          status: 'matched',
          matchedAt: matchTimestamp
        });

        // Create match record
        await setDoc(doc(collection(db, 'matches')), {
          user1Id: userId,
          user2Id: match.id,
          questionId: questionData.id,
          createdAt: matchTimestamp,
          status: 'active',
          completed: false
        });
      }
    } catch (error) {
      console.error('Error finding match:', error);
      throw error;
    }
  };

  const signup = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        username,
        uid: userCredential.user.uid,
        status: 'waiting',
        registeredAt: serverTimestamp(),
        partnerId: null,
        questionPart: null,
        answerPart: null,
        matched: false,
        matchedAt: null,
        lastActive: serverTimestamp(),
        hints: []
      });

      // Try to find a match immediately after registration
      await findMatch(userCredential.user.uid);

      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 