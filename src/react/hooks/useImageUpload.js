
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';

const useImageUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadImage = async (imageFile) => {
        if (!imageFile) {
            setError('No image file provided.');
            return;
        }

        setIsUploading(true);
        setError(null);

        const fileId = uuidv4();
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${fileId}.${fileExtension}`;
        const storageRef = ref(storage, `Chat_Media/${fileName}`);

        try {
            const snapshot = await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setIsUploading(false);
            return downloadURL;
        } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
            setError('Failed to upload image.');
            setIsUploading(false);
            return null;
        }
    };

    return { uploadImage, isUploading, error };
};

export default useImageUpload;
