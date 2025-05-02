const publicVapidKey = 'BK7eSDZfcj5GAhqK3G6jYIb-2F2AmdfxtNxlQvbNrzuvO6AJlWbDNJVDKzYXn6_ZnPG_jEEokX95pZCYf3PVt5w';

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const subscribeToNotifications = async () => {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    // Register service worker
    const register = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    // Subscribe to push notifications
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    // Send subscription to server
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ subscription })
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to notifications');
    }

    return true;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return false;
  }
};

export const unsubscribeFromNotifications = async () => {
  try {
    const register = await navigator.serviceWorker.getRegistration();
    if (!register) return false;

    const subscription = await register.pushManager.getSubscription();
    if (!subscription) return false;

    await subscription.unsubscribe();
    
    // Remove subscription from server
    await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });

    return true;
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    return false;
  }
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 