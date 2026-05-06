import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const useUserSettings = () => {
  const [settings, setSettings] = useState({ moderationEnabled: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isUnderage, setIsUnderage] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setSettings({ moderationEnabled: userData.moderationEnabled || false });

          if (userData.dob) {
            const dob = userData.dob.toDate();
            const age = new Date().getFullYear() - dob.getFullYear();
            setIsUnderage(age < 18);
          }
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const updateSettings = async (newSettings) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, newSettings);
    }
  };

  return { settings, updateSettings, isLoading, isUnderage };
};

export default useUserSettings;
