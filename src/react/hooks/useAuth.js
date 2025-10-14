import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserProfile(null);

      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const unsubProfile = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                setUserProfile(doc.data());
            }
            setLoading(false);
        });
        return () => unsubProfile();

      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { user, userProfile, loading };
};
