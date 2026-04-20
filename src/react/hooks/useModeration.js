import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const useModeration = () => {
  const [isModerating, setIsModerating] = useState(false);

  const moderateMessage = async (message) => {
    setIsModerating(true);
    try {
      const functions = getFunctions();
      const moderateMessage = httpsCallable(functions, 'moderateMessage');
      const result = await moderateMessage({ message });
      const isFlagged = result.data.isFlagged;
      return { isFlagged };
    } catch (error) {
      console.error('Error moderating message:', error);
      return { isFlagged: false };
    } finally {
      setIsModerating(false);
    }
  };

  return { moderateMessage, isModerating };
};

export default useModeration;
