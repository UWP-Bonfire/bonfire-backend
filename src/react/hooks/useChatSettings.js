import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useAuth } from './useAuth';

const useChatSettings = () => {
    const { user } = useAuth();

    const getChatId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    const toggleLimit = async (friendId, currentStatus) => {
        if (!user) return;
        const chatId = getChatId(user.uid, friendId);
        const chatRef = doc(firestore, 'chats', chatId);

        try {
            const chatSnap = await getDoc(chatRef);
            if (!chatSnap.exists()) {
                await setDoc(chatRef, { 
                    limitNotifications: !currentStatus,
                    users: [user.uid, friendId],
                    consecutiveUnread: { [user.uid]: 0, [friendId]: 0 }
                });
            } else {
                await updateDoc(chatRef, { limitNotifications: !currentStatus });
            }
        } catch (error) {
            console.error("Error toggling notification limit: ", error);
        }
    };

    return { toggleLimit };
};

export default useChatSettings;
