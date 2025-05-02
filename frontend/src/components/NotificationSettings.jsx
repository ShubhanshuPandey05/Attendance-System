import { useState, useEffect } from 'react';
import { requestNotificationPermission, subscribeToNotifications, unsubscribeFromNotifications } from '../services/notificationService';

const NotificationSettings = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    const checkSubscriptionStatus = async () => {
        try {
            const register = await navigator.serviceWorker.getRegistration();
            if (!register) return;

            const subscription = await register.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    };

    const toggleSubscription = async () => {
        setIsLoading(true);
        try {
            if (isSubscribed) {
                const success = await unsubscribeFromNotifications();
                if (success) setIsSubscribed(false);
            } else {
                const permissionGranted = await requestNotificationPermission();
                if (!permissionGranted) throw new Error('Permission denied');
                const success = await subscribeToNotifications();
                if (success) setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Notification toggle error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button onClick={toggleSubscription} disabled={isLoading} className="notification-toggle">
            <span className={`status-dot ${isSubscribed ? 'on' : 'off'}`}></span>
            Notification: {isSubscribed ? 'on' : 'off'}

            <style jsx>{`
        .notification-toggle {
          color:black;
          padding: 8px 16px;
          border: none;
          border-radius: 20px;
          background-color: #fff;
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.on {
          background-color: #28a745;
        }

        .status-dot.off {
          background-color: #dc3545;
        }

        .notification-toggle:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
        </button>
    );
};

export default NotificationSettings;