import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

const db = admin.firestore();
const messaging = admin.messaging();

export async function POST(request: Request) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': 'https://smart-soil-monitoring.glitch.me',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  try {
    console.log('Received POST request to /api/send-notification');
    const body = await request.json();
    console.log('Request body:', body);

    // Validate payload
    if (!body.deviceId || !Array.isArray(body.sensorValue) || body.sensorValue.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request data', details: 'deviceId and non-empty sensorValue array are required' }),
        { status: 400, headers }
      );
    }

    const { deviceId, sensorValue } = body;

    // Validate sensorValue items
    for (const sensor of sensorValue) {
      if (!sensor.name || typeof sensor.value !== 'number' || typeof sensor.min !== 'number' || typeof sensor.max !== 'number') {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid sensor data', details: 'Each sensor must have name, value, min, and max as numbers' }),
          { status: 400, headers }
        );
      }
    }

    // Construct notification message
    const violationMessages = sensorValue.map((sensor: { name: string; value: number; min: number; max: number }) => {
      const threshold = sensor.value < sensor.min ? `below ${sensor.min}` : `above ${sensor.max}`;
      return `${sensor.name}: ${sensor.value} (Threshold: ${sensor.min}-${sensor.max})`;
    });

    const notificationBody = `Sensor values for device ${deviceId} exceed thresholds: ${violationMessages.join(', ')}`;
    const notificationType = sensorValue.some((sensor: { value: number; min: number }) => sensor.value < sensor.min) ? 'below' : 'above';

    // Fetch users with role: farmer or advisor
    const usersSnapshot = await db.collection('users').where('role', 'in', ['farmer', 'advisor']).get();
    if (usersSnapshot.empty) {
      console.warn('No users found with role farmer or advisor');
      return new NextResponse(
        JSON.stringify({ message: 'No eligible users found for notifications' }),
        { status: 200, headers }
      );
    }

    const deviceTokens: string[] = [];
    const userIds: string[] = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.deviceToken) {
        deviceTokens.push(userData.deviceToken);
        userIds.push(doc.id);
      }
    });

    if (deviceTokens.length === 0) {
      console.warn('No valid device tokens found');
      return new NextResponse(
        JSON.stringify({ message: 'No valid device tokens found for notifications' }),
        { status: 200, headers }
      );
    }

    // Send FCM notifications
    const message = {
      notification: {
        title: 'Sensor Alert',
        body: notificationBody,
      },
      data: {
        deviceId,
        type: notificationType,
        sensorData: JSON.stringify(sensorValue),
      },
      tokens: deviceTokens,
    };

    console.log('Sending FCM notification:', message);

    let response;
    try {
      // Use sendMulticast if available, otherwise fallback to sendToDevice
      if (typeof messaging.sendMulticast === 'function') {
        response = await messaging.sendMulticast(message);
        console.log('FCM sendMulticast response:', response);
      } else {
        // Fallback for older versions
        response = await messaging.sendToDevice(deviceTokens, {
          notification: message.notification,
          data: message.data,
        });
        console.log('FCM sendToDevice response:', response);
        // Normalize response for consistency
        response = {
          successCount: response.successCount || response.results.filter((r: any) => !r.error).length,
          failureCount: response.failureCount || response.results.filter((r: any) => r.error).length,
        };
      }
    } catch (fcmError) {
      console.error('FCM sending error:', fcmError);
      throw fcmError;
    }

    // Store notifications in Firestore
    const batch = db.batch();
    userIds.forEach((userId) => {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, {
        userId,
        deviceId,
        title: 'Sensor Alert',
        body: notificationBody,
        type: notificationType,
        sensorData: sensorValue,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    });

    await batch.commit();
    console.log('Notifications stored in Firestore');

    return new NextResponse(
      JSON.stringify({ message: 'Notifications sent', successCount: response.successCount, failureCount: response.failureCount }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error in POST /api/send-notification:', error.message, error.stack);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers }
    );
  }
}

export async function GET() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': 'https://smart-soil-monitoring.glitch.me',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  try {
    console.log('Received GET request to /api/send-notification');
    const notificationsSnapshot = await db.collection('notifications').orderBy('timestamp', 'desc').limit(50).get();
    
    const notifications = notificationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()?.toISOString() || null,
    }));

    return new NextResponse(
      JSON.stringify({ notifications }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error in GET /api/send-notification:', error.message, error.stack);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': 'https://smart-soil-monitoring.glitch.me',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  return new NextResponse(null, { status: 204, headers });
}