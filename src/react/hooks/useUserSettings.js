import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useAuth } from './useAuth';

const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({ moderationEnabled: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const userSettingsRef = doc(firestore, 'userSettings', user.uid);
        const docSnap = await getDoc(userSettingsRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const updateSettings = async (newSettings) => {
    if (user) {
      const userSettingsRef = doc(firestore, 'userSettings', user.uid);
      await setDoc(userSettingsRef, newSettings, { merge: true });
      setSettings(newSettings);
    }
  };

  return { settings, updateSettings, isLoading };
};

export default useUserSettings;
