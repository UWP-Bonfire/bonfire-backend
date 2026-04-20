import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useAuth } from './useAuth';

const useUserSettings = () => {
  const { user, isUnderage } = useAuth();
  const [settings, setSettings] = useState({ moderationEnabled: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        setIsLoading(true);
        const userSettingsRef = doc(firestore, 'userSettings', user.uid);
        const docSnap = await getDoc(userSettingsRef);

        if (isUnderage) {
          const enforcedSettings = { ...docSnap.data(), moderationEnabled: true };
          setSettings(enforcedSettings);
          // Persist the enforced setting to Firestore
          await setDoc(userSettingsRef, enforcedSettings, { merge: true });
        } else if (docSnap.exists()) {
          setSettings(docSnap.data());
        } 

        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user, isUnderage]);

  const updateSettings = useCallback(async (newSettings) => {
    if (user) {
      // If the user is underage, prevent moderation from being disabled
      if (isUnderage) {
        newSettings.moderationEnabled = true;
      }
      const userSettingsRef = doc(firestore, 'userSettings', user.uid);
      await setDoc(userSettingsRef, newSettings, { merge: true });
      setSettings(newSettings);
    }
  }, [user, isUnderage]);

  return { settings, updateSettings, isLoading, isUnderage };
};

export default useUserSettings;
