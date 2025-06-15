import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const messaging = admin.messaging();
const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sensorValue, deviceToken, thresholdMin, thresholdMax, userId } = req.body;

  if (!sensorValue || !deviceToken || !userId || thresholdMin == null || thresholdMax == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check the last notification to avoid duplicates
    const lastNotificationSnapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    let shouldSend = false;
    let messageBody = '';
    let notificationType = '';

    if (sensorValue > thresholdMax) {
      messageBody = `Sensor value ${sensorValue} exceeds maximum threshold of ${thresholdMax}!`;
      notificationType = 'above';
      shouldSend = lastNotificationSnapshot.empty || lastNotificationSnapshot.docs[0].data().type !== 'above';
    } else if (sensorValue < thresholdMin) {
      messageBody = `Sensor value ${sensorValue} is below minimum threshold of ${thresholdMin}!`;
      notificationType = 'below';
      shouldSend = lastNotificationSnapshot.empty || lastNotificationSnapshot.docs[0].data().type !== 'below';
    }

    if (shouldSend) {
      // Store notification in Firestore notifications collection
      await db.collection('notifications').add({
        userId,
        title: 'Sensor Alert',
        body: messageBody,
        type: notificationType,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

      // Send push notification via FCM
      const message = {
        token: deviceToken,
        notification: {
          title: 'Sensor Alert',
          body: messageBody,
        },
      };
      await messaging.send(message);

      return res.status(200).json({ message: 'Notification sent and stored' });
    } else {
      return res.status(200).json({ message: 'No new notification needed' });
    }
  } catch (error) {
    console.error('Error sending/storing notification:', error);
    return res.status(500).json({ error: 'Failed to send/store notification' });
  }
}