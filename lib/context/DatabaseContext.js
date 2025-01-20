'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { initialQuestions } from '../data/questions';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp,
  onSnapshot,
  getDoc,
  setDoc
} from 'firebase/firestore';

const DatabaseContext = createContext({});

export function DatabaseProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize questions collection if it doesn't exist
  useEffect(() => {
    const initializeQuestions = async () => {
      const questionsRef = collection(db, 'questions');
      const querySnapshot = await getDocs(questionsRef);
      
      if (querySnapshot.empty) {
        // Add initial questions to the database
        const allQuestions = Object.values(initialQuestions).flat();
        for (const question of allQuestions) {
          await addDoc(questionsRef, {
            ...question,
            createdAt: serverTimestamp(),
            active: true
          });
        }
      }

      // Subscribe to questions collection
      const unsubscribe = onSnapshot(questionsRef, (snapshot) => {
        const questionsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuestions(questionsList);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    initializeQuestions();
  }, []);

  // Register a new user
  const registerUser = async (userData) => {
    try {
      // Check for existing user
      const existingUser = await checkExistingUser(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Check for existing username
      const usernameQuery = query(collection(db, 'users'), where('username', '==', userData.username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) {
        throw new Error('Username already taken');
      }

      // Add user to the users collection
      const userRef = await addDoc(collection(db, 'users'), {
        ...userData,
        username: userData.username,
        status: 'waiting',
        registeredAt: serverTimestamp(),
        partnerId: null,
        questionPart: null,
        answerPart: null,
        matched: false,
        matchedAt: null,
        lastActive: serverTimestamp()
      });

      // Try to find a match
      await findMatch(userRef.id);
      
      return userRef.id;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  // Check if user exists
  const checkExistingUser = async (email) => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  // Get random question
  const getRandomQuestion = () => {
    const activeQuestions = questions.filter(q => q.active);
    if (activeQuestions.length === 0) {
      return {
        question: "What architectural style defines stateless communication between client and server?",
        answer: "REST",
        hints: ["Think about web services", "Involves client-server communication", "Stateless architecture"]
      };
    }
    return activeQuestions[Math.floor(Math.random() * activeQuestions.length)];
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
        const questionData = getRandomQuestion();
        const matchTimestamp = serverTimestamp();

        // Randomly decide who gets question and who gets answer
        const isQuestionHolder = Math.random() < 0.5;

        // Update both users
        await updateDoc(doc(db, 'users', userId), {
          partnerId: match.id,
          questionPart: isQuestionHolder ? questionData.question : null,
          answerPart: isQuestionHolder ? null : questionData.answer,
          hints: questionData.hints,
          matched: false,  // Initially set to false until verified
          status: 'pending_verification',  // New status to indicate waiting for verification
          matchedAt: matchTimestamp,
          verified: false
        });

        await updateDoc(doc(db, 'users', match.id), {
          partnerId: userId,
          questionPart: isQuestionHolder ? null : questionData.question,
          answerPart: isQuestionHolder ? questionData.answer : null,
          hints: questionData.hints,
          matched: false,  // Initially set to false until verified
          status: 'pending_verification',  // New status to indicate waiting for verification
          matchedAt: matchTimestamp,
          verified: false
        });

        // Create match record
        await addDoc(collection(db, 'matches'), {
          user1Id: userId,
          user2Id: match.id,
          questionId: questionData.id,
          createdAt: matchTimestamp,
          status: 'pending_verification',
          completed: false
        });
      }
    } catch (error) {
      console.error('Error finding match:', error);
      throw error;
    }
  };

  // Add new question
  const addQuestion = async (questionData) => {
    try {
      const questionsRef = collection(db, 'questions');
      await addDoc(questionsRef, {
        ...questionData,
        createdAt: serverTimestamp(),
        active: true
      });
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  };

  // Get user's match status
  const getUserMatchStatus = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        // If user doesn't exist in Firestore, create their document
        const newUserData = {
          uid: userId,
          status: 'waiting',
          registeredAt: serverTimestamp(),
          partnerId: null,
          questionPart: null,
          answerPart: null,
          matched: false,
          matchedAt: null,
          lastActive: serverTimestamp()
        };

        await setDoc(userDocRef, newUserData);
        
        // Try to find a match for the new user
        await findMatch(userId);
        
        // Return the initial user data
        return newUserData;
      }
      
      const userData = userSnapshot.data();
      
      // If user is matched and verified, get partner's username
      if (userData.matched && userData.partnerId && userData.verified) {
        const partnerDocRef = doc(db, 'users', userData.partnerId);
        const partnerSnapshot = await getDoc(partnerDocRef);
        if (partnerSnapshot.exists()) {
          const partnerData = partnerSnapshot.data();
          return {
            ...userData,
            partnerName: partnerData.username
          };
        }
      }
      
      return userData;
    } catch (error) {
      console.error('Error getting user match status:', error);
      throw error;
    }
  };

  // Verify match between two users
  const verifyMatch = async (userId, partnerCode) => {
    try {
      // Get current user's data
      const userDocRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDocRef);
      const userData = userSnapshot.data();

      if (!userData) {
        throw new Error('User not found');
      }

      if (userData.verified) {
        throw new Error('Match already verified');
      }

      if (!userData.partnerId) {
        throw new Error('No match found yet');
      }

      // Verify that the partner code matches the assigned partner
      if (userData.partnerId !== partnerCode) {
        throw new Error('Invalid verification code');
      }

      // Get partner's data
      const partnerDocRef = doc(db, 'users', partnerCode);
      const partnerSnapshot = await getDoc(partnerDocRef);
      const partnerData = partnerSnapshot.data();

      if (!partnerData) {
        throw new Error('Partner not found');
      }

      // Update both users as verified and matched
      await updateDoc(userDocRef, {
        verified: true,
        verifiedAt: serverTimestamp(),
        matched: true,
        status: 'matched'
      });

      await updateDoc(partnerDocRef, {
        verified: true,
        verifiedAt: serverTimestamp(),
        matched: true,
        status: 'matched'
      });

      // Update match record
      const matchQuery = query(
        collection(db, 'matches'),
        where('user1Id', 'in', [userId, partnerCode]),
        where('user2Id', 'in', [userId, partnerCode])
      );

      const matchSnapshot = await getDocs(matchQuery);
      if (!matchSnapshot.empty) {
        const matchDoc = matchSnapshot.docs[0];
        await updateDoc(doc(db, 'matches', matchDoc.id), {
          completed: true,
          completedAt: serverTimestamp(),
          status: 'matched'
        });
      }

      return true;
    } catch (error) {
      console.error('Error verifying match:', error);
      throw error;
    }
  };

  const value = {
    registerUser,
    addQuestion,
    getUserMatchStatus,
    verifyMatch,
    questions,
    loading
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}; 