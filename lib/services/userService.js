import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

export const registerUser = async (userData) => {
  try {
    // Validate if user already exists
    const existingUser = await checkExistingUser(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Add user to the users collection with server timestamp
    const userRef = await addDoc(collection(db, 'users'), {
      ...userData,
      status: 'waiting',
      registeredAt: serverTimestamp(),
      partnerId: null,
      questionPart: null,
      answerPart: null,
      matched: false,
      matchedAt: null,
      lastActive: serverTimestamp(),
      meetingLocation: null
    });

    // Try to find a match
    await findMatch(userRef.id, userData.techStack);
    
    return userRef.id;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

const checkExistingUser = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

const findMatch = async (userId, userTechStack) => {
  try {
    // Check user's current status
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (!userData || userData.status === 'delay_matching') {
      return; // Don't match if user is in delay period
    }

    // Query for unmatched users with similar tech stack
    const q = query(
      collection(db, 'users'),
      where('matched', '==', false),
      where('status', '==', 'waiting'),
      where('techStack', '==', userTechStack)
    );

    const querySnapshot = await getDocs(q);
    const potentialMatches = querySnapshot.docs
      .filter(doc => doc.id !== userId)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    if (potentialMatches.length > 0) {
      // Select a random match
      const match = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
      
      // Generate technical question and answer
      const { question, answer, hints } = generateTechnicalQuestion(match.techStack);
      
      const matchTimestamp = serverTimestamp();

      // Get random meeting location
      const { getRandomLocation } = require('../data/location');
      const meetingLocation = getRandomLocation();

      // Update both users
      await updateDoc(doc(db, 'users', userId), {
        partnerId: match.id,
        questionPart: question,
        hints: hints,
        matched: true,
        status: 'matched',
        matchedAt: matchTimestamp,
        meetingLocation: meetingLocation
      });

      await updateDoc(doc(db, 'users', match.id), {
        partnerId: userId,
        answerPart: answer,
        hints: hints,
        matched: true,
        status: 'matched',
        matchedAt: matchTimestamp,
        meetingLocation: meetingLocation
      });

      // Create a match record
      await addDoc(collection(db, 'matches'), {
        user1Id: userId,
        user2Id: match.id,
        techStack: match.techStack,
        question,
        answer,
        hints,
        createdAt: matchTimestamp,
        status: 'active',
        completed: false,
        meetingLocation: meetingLocation
      });
    }
  } catch (error) {
    console.error('Error finding match:', error);
    throw error;
  }
};

const generateTechnicalQuestion = (techStack) => {
  // Enhanced questions based on tech stack
  const questions = {
    frontend: [
      {
        question: "What is the virtual representation of DOM that React uses for performance optimization?",
        answer: "VirtualDOM",
        hints: ["Think about React's rendering optimization", "It's a concept related to DOM manipulation", "Starts with 'virtual'"]
      },
      {
        question: "Which CSS layout system is specifically designed for one-dimensional content flow?",
        answer: "Flexbox",
        hints: ["Related to CSS layout systems", "Compare two modern layout approaches", "One is 1D, other is 2D"]
      }
    ],
    backend: [
      {
        question: "What database optimization technique improves the speed of data retrieval operations?",
        answer: "Indexing",
        hints: ["Think about database performance", "Similar to a book's index", "Helps in faster data retrieval"]
      },
      {
        question: "What is the technique of breaking a database into smaller, more manageable pieces?",
        answer: "Sharding",
        hints: ["Related to database scaling", "Involves breaking things into pieces", "Helps with large datasets"]
      }
    ],
    fullstack: {
      question: "What authentication mechanism uses encoded tokens for secure client-server communication?",
      answer: "JWT"
    },
    mobile: {
      question: "What methods control the different states of a mobile application's existence?",
      answer: "Lifecycle"
    },
    devops: {
      question: "What technology enables application packaging with all its dependencies in an isolated environment?",
      answer: "Containerization"
    },
    ai: {
      question: "What optimization algorithm helps minimize the loss function in machine learning models?",
      answer: "Gradient"
    }
  };

  const defaultQuestion = {
    question: "What architectural style defines stateless communication between client and server?",
    answer: "REST",
    hints: ["Think about web services", "Involves client-server communication", "Stateless architecture"]
  };

  const techStackQuestions = questions[techStack] || [defaultQuestion];
  return techStackQuestions[Math.floor(Math.random() * techStackQuestions.length)];
}; 