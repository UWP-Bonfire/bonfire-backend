import { useState, useEffect, useCallback } from 'react';

const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = useCallback(async () => {
    if (Notification.permission === 'default') {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const showNotification = useCallback((title, options) => {
    if (permission === 'granted') {
      new Notification(title, options);
    }
  }, [permission]);

  return { requestPermission, showNotification, permission };
};

export default useNotifications;
