try {
  importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

  const firebaseConfig = {
    apiKey: "AIzaSyCk1lEqh3LsBVczdW_BRWop2tB1IWBE9Bg",
    authDomain: "smart-soil-monitoring-24a20.firebaseapp.com",
    projectId: "smart-soil-monitoring-24a20",
    storageBucket: "smart-soil-monitoring-24a20.firebasestorage.app",
    messagingSenderId: "715608769710",
    appId: "1:715608769710:web:74b6ba46cb40d8e4d9193f",
  };


  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/firebase-logo.png',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.error('[firebase-messaging-sw.js] Service worker error:', error);
}