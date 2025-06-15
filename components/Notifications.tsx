import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Timestamp } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: Timestamp | null; 
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setNotifications([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationList: Notification[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notificationList);
        setError(null);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications. Please try again.');
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return (
    <div>
      <h1>Notifications</h1>
      {userId ? (
        error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : notifications.length > 0 ? (
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id} style={{ color: notification.read ? 'gray' : 'black' }}>
                <strong>{notification.title}</strong>: {notification.body} <br />
                  <small>
                    {notification.timestamp && notification.timestamp.toDate
                      ? notification.timestamp.toDate().toLocaleString()
                      : 'No timestamp available'}
                  </small>              
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications available.</p>
        )
      ) : (
        <p>Please log in to view notifications.</p>
      )}
    </div>
  );
};

export default Notifications;