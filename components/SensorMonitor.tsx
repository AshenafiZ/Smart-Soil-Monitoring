import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { onMessageListener, requestNotificationPermission, auth, db } from '../lib/firebase';

const SensorMonitor: React.FC = () => {
  const [sensorValue, setSensorValue] = useState<number | null>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const thresholdMin = 10;
  const thresholdMax = 90;

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    const initializeNotifications = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        setDeviceToken(token);
      } else {
        console.warn("Failed to obtain device token");
      }
    };
    initializeNotifications();

    onMessageListener().then((payload: any) => {
      console.log('Received notification:', payload);
      alert(`${payload.notification.title}: ${payload.notification.body}`);
    }).catch((error) => {
      console.error('Error in message listener:', error);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId || !deviceToken) {
      console.log("User ID or device token missing, skipping sensor monitoring");
      return;
    }

    const q = query(collection(db, 'sensorData'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        const newValue = data.temperature;
        setSensorValue(newValue);

        if (newValue > thresholdMax || newValue < thresholdMin) {
          fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sensorValue: newValue,
              deviceToken,
              thresholdMin,
              thresholdMax,
              userId,
            }),
          })
            .then((response) => response.json())
            .then((data) => console.log(data.message))
            .catch((error) => console.error('Error triggering notification:', error));
        }
      });
    }, (error) => {
      console.error("Error in Firestore snapshot:", error);
    });

    return () => unsubscribe();
  }, [userId, deviceToken, thresholdMin, thresholdMax]);

  return (
    <div>
      <h1>Sensor Monitor</h1>
      <p>Current Sensor Value: {sensorValue?.toFixed(2) ?? 'Loading...'}</p>
      <p>Thresholds: Min {thresholdMin}, Max {thresholdMax}</p>
    </div>
  );
};

export default SensorMonitor;