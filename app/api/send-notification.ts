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

  const { sensorValue, thresholdMin, thresholdMax, deviceId } = req.body;

  if (!sensorValue || !deviceId || !Array.isArray(sensorValue) || thresholdMin == null || thresholdMax == null) {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    // Fetch users with roles 'farmer' or 'advisor'
    const usersSnapshot = await db
      .collection('users')
      .where('role', 'in', ['farmer', 'advisor'])
      .get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ error: 'No farmers or advisors found' });
    }

    let notificationsSent = 0;
    const notificationPromises: Promise<void>[] = [];

    // Process notifications for each user
    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;
      const deviceToken = user.deviceToken;

      if (!deviceToken) {
        console.warn(`No device token for user ${userId}`);
        continue;
      }

      // Check the last notification for this user and device to avoid duplicates
      const lastNotificationSnapshot = await db
        .collection('notifications')
        .where('userId', '==', userId)
        .where('deviceId', '==', deviceId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      let shouldSend = false;
      let messageBody = '';
      let notificationType = '';

      // Create message for all exceeded sensors
      const exceededSensors = sensorValue.map(sensor => 
        `${sensor.name}: ${sensor.value} (Threshold: ${sensor.min}-${sensor.max})`
      ).join(', ');
      messageBody = `Sensor values for device ${deviceId} exceed thresholds: ${exceededSensors}`;
      notificationType = 'above';
      shouldSend = lastNotificationSnapshot.empty || lastNotificationSnapshot.docs[0].data().type !== 'above';

      if (shouldSend) {
        // Store notification in Firestore
        const storePromise = db.collection('notifications').add({
          userId,
          deviceId,
          title: 'Sensor Alert',
          body: messageBody,
          type: notificationType,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          read: false,
        });

        // Send push notification via FCM
        const sendPromise = messaging.send({
          token: deviceToken,
          notification: {
            title: 'Sensor Alert',
            body: messageBody,
          },
        });

        notificationPromises.push(Promise.all([storePromise, sendPromise]).then(() => {
          notificationsSent++;
        }).catch((error) => {
          console.error(`Error processing notification for user ${userId}:`, error);
        }));
      }
    }

    // Wait for all notifications to be processed
    await Promise.all(notificationPromises);

    if (notificationsSent > 0) {
      return res.status(200).json({ message: `${notificationsSent} notifications sent and stored` });
    } else {
      return res.status(200).json({ message: 'No new notifications needed' });
    }
  } catch (error) {
    console.error('Error sending/storing notifications:', error);
    return res.status(500).json({ error: 'Failed to send/store notifications' });
  }
}