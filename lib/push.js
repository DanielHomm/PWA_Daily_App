// lib/push.js

export async function askForPushPermissionsAndSubscribe(userId) {
    if (!("serviceWorker" in navigator)) {
        console.warn("Service workers are not supported by this browser.");
        return;
    }
    if (!("PushManager" in window)) {
        console.warn("Push notifications are not supported by this browser.");
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Push notification permission not granted.");
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        // Converting the VAPID key to a Uint8Array
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
        });

        // Send the subscription to your backend
        await fetch("/api/push/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                subscription,
                userId,
            }),
        });

        console.log("Successfully subscribed to push notifications");
        return true;
    } catch (error) {
        console.error("Error subscribing to push notifications:", error);
        return false;
    }
}

// Utility function to convert VAPID public key
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
