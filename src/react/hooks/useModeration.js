
import { useState } from 'react';

const useModeration = () => {
  const [isModerating, setIsModerating] = useState(false);

  const moderateMessage = async (message) => {
    setIsModerating(true);
    // Simulate an API call to a moderation service
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsModerating(false);

    // Placeholder logic: Flag messages containing certain keywords
    const flaggedKeywords = ['inappropriate', 'spam', 'offensive'];
    const isFlagged = flaggedKeywords.some(keyword => message.toLowerCase().includes(keyword));

    return { isFlagged };
  };

  return { moderateMessage, isModerating };
};

export default useModeration;
