import { useState, useEffect } from 'react';

const useFavicon = (initialFaviconUrl) => {
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl);

  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  }, [faviconUrl]);

  const updateFavicon = (notificationCount) => {
    const canvas = document.createElement('canvas');
    const img = document.createElement('img');
    const link = document.querySelector("link[rel*='icon']");
    img.src = initialFaviconUrl; // Always start with the base image
    img.onload = () => {
      canvas.width = 32;
      canvas.height = 32;
      const context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, 32, 32);

      if (notificationCount > 0) {
        // Draw notification bubble
        context.beginPath();
        context.arc(canvas.width - 8, 8, 8, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();

        // Draw notification count
        context.font = 'bold 12px sans-serif';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(notificationCount, canvas.width - 8, 8);
      }
      setFaviconUrl(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
        // In case the image fails to load, we just show the count in a red circle.
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        if (notificationCount > 0) {
            // Draw notification bubble
            context.beginPath();
            context.arc(canvas.width - 8, 8, 16, 0, 2 * Math.PI);
            context.fillStyle = 'red';
            context.fill();

            // Draw notification count
            context.font = 'bold 12px sans-serif';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(notificationCount, canvas.width - 8, 8);
        }
        setFaviconUrl(canvas.toDataURL('image/png'));
    }
  };

  return { updateFavicon };
};

export default useFavicon;
