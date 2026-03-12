import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';

const useVoiceUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadVoiceMessage = async (audioFile) => {
        if (!audioFile) {
            setError('No audio file provided.');
            return;
        }

        setIsUploading(true);
        setError(null);

        const fileId = uuidv4();
        const fileExtension = audioFile.name.split('.').pop();
        const fileName = `${fileId}.${fileExtension}`;
        const storageRef = ref(storage, `Voice_Messages/${fileName}`);

        try {
            const snapshot = await uploadBytes(storageRef, audioFile);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setIsUploading(false);
            return downloadURL;
        } catch (uploadError) {
            console.error("Error uploading audio:", uploadError);
            setError('Failed to upload audio.');
            setIsUploading(false);
            return null;
        }
    };

    return { uploadVoiceMessage, isUploading, error };
};

export default useVoiceUpload;
