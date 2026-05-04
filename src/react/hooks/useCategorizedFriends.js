import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const useCategorizedFriends = (friends, activeCategory) => {
    const [categorizedFriends, setCategorizedFriends] = useState(friends);

    useEffect(() => {
        if (activeCategory === 'All' || activeCategory === 'Individual') {
            setCategorizedFriends(friends);
            return;
        }

        if (activeCategory === 'Global') {
            setCategorizedFriends([]);
            return;
        }

        const fetchCategorizedFriends = async () => {
            const friendsMap = new Map(friends.map(friend => [friend.id, friend]));
            const chatsRef = collection(firestore, 'chats');

            if (activeCategory === 'Group') {
                const querySnapshot = await getDocs(chatsRef);
                const groupChatFriendIds = new Set();

                querySnapshot.forEach(doc => {
                    const chat = doc.data();
                    if (chat.members && chat.members.length > 2) {
                        chat.members.forEach(memberId => {
                            if (friendsMap.has(memberId)) {
                                groupChatFriendIds.add(memberId);
                            }
                        });
                    }
                });

                const filteredFriends = friends.filter(friend => groupChatFriendIds.has(friend.id));
                setCategorizedFriends(filteredFriends);
                return;
            }

            let q;
            switch (activeCategory) {
                case '18+':
                    q = query(chatsRef, where('is18Plus', '==', true));
                    break;
                case 'Favorites':
                    q = query(chatsRef, where('isFavorited', '==', true));
                    break;
                default:
                    setCategorizedFriends(friends);
                    return;
            }

            const querySnapshot = await getDocs(q);
            const filteredFriendIds = new Set();

            querySnapshot.forEach(doc => {
                const chat = doc.data();
                if (chat.members) {
                    chat.members.forEach(memberId => {
                        if (friendsMap.has(memberId)) {
                            filteredFriendIds.add(memberId);
                        }
                    });
                }
            });

            const filteredFriends = friends.filter(friend => filteredFriendIds.has(friend.id));
            setCategorizedFriends(filteredFriends);
        };

        fetchCategorizedFriends();
    }, [activeCategory, friends]);

    return categorizedFriends;
};

export default useCategorizedFriends;
