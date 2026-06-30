const CACHE_NAME = "campuszen-v1";

// Install event
self.addEventListener("install", (event) => {
    console.log("[SW] Installing...");
    self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
    console.log("[SW] Activating...");
    event.waitUntil(clients.claim());
});

// Push event listener
self.addEventListener("push", (event) => {
    console.log("[SW] Push received:", event.data);
    const data = event.data?.json() || {
        title: "New Message",
        body: "You have a new message",
    };

    // Default options
    const options = {
        body: data.body,
        icon: data.icon || "/android-chrome-192x192.png",
        badge: data.badge || "/android-chrome-192x192.png",
        data: data.data,
        vibrate: data.vibrate || [200, 100, 200],
        actions: data.actions || [],
        tag: data.tag,
        requireInteraction: data.requireInteraction || false,
        renotify: data.renotify || true,
        silent: data.silent || false,
        priority: data.priority || "high",
    };

    // Show notification
    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
    console.log("[SW] Notification clicked:", event.notification);
    event.notification.close();

    // Try to open the app
    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                // If a client exists, focus it
                for (let client of clientList) {
                    if (client.url === "/" || client.url.startsWith("/")) {
                        return client.focus();
                    }
                }
                // Otherwise, open a new tab
                if (clients.openWindow) {
                    return clients.openWindow(
                        event.notification.data?.url || "/",
                    );
                }
            }),
    );
});

// Handle notification close event
self.addEventListener("notificationclose", (event) => {
    console.log("[SW] Notification closed");
});
