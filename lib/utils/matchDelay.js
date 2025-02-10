import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const MATCH_DELAY = 30 * 60 * 1000; // 30 minutes in milliseconds

export const scheduleDelayedMatch = async (userId, techStack) => {
  try {
    setTimeout(async () => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      // Only proceed if user is still in delay_matching status
      if (userData && userData.status === 'delay_matching') {
        // Update status to waiting
        await updateDoc(doc(db, 'users', userId), {
          status: 'waiting'
        });

        // Import findMatch function and attempt to find a match
        const { findMatch } = require('../services/userService');
        await findMatch(userId, techStack);
      }
    }, MATCH_DELAY);
  } catch (error) {
    console.error('Error in delayed matching:', error);
  }
}; 