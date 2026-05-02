import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

const useUserManagement = (userIds = []) => {
  const [userProfiles, setUserProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userIds.length === 0) {
      setLoading(false);
      return;
    }

    const uniqueUserIds = [...new Set(userIds)].filter(Boolean);
    setLoading(true);

    const profilesToFetch = uniqueUserIds.filter(id => !userProfiles[id]);

    if (profilesToFetch.length === 0) {
      setLoading(false);
      return;
    }

    const fetchProfiles = async () => {
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('__name__', 'in', profilesToFetch));
        const querySnapshot = await getDocs(q);

        const fetchedProfiles = {};
        querySnapshot.forEach(doc => {
          fetchedProfiles[doc.id] = { id: doc.id, ...doc.data() };
        });

        setUserProfiles(prevProfiles => ({ ...prevProfiles, ...fetchedProfiles }));
      } catch (error) {
        console.error("Error fetching user profiles:", error);
      }
    };

    fetchProfiles();

    const unsubscribes = uniqueUserIds.map(id => {
      const docRef = doc(firestore, 'users', id);
      return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          setUserProfiles(prev => ({ ...prev, [id]: { id: doc.id, ...doc.data() } }));
        }
      });
    });

    setLoading(false);

    return () => unsubscribes.forEach(unsub => unsub());
  }, [JSON.stringify(userIds)]);

  return { userProfiles, loading };
};

export default useUserManagement;