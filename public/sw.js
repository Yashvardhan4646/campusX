// sw.js

const CACHE_NAME = "campuszen-v1";

const STATIC_CACHE_PATHS = [
    "/",
    "/manifest.json",
    "/favicon.ico",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSTALL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━

self.addEventListener("install", (event) => {
    console.log("[SW] Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_CACHE_PATHS).catch(() => {
                console.warn("[SW] Some assets could not be precached");
            });
        }),
    );

    self.skipWaiting();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACTIVATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━

self.addEventListener("activate", (event) => {
    console.log("[SW] Activating...");

    event.waitUntil(
        Promise.all([
            caches.keys().then((keys) =>
                Promise.all(
                    keys.map((key) => {
                        if (key !== CACHE_NAME) {
                            return caches.delete(key);
                        }
                    }),
                ),
            ),
            self.clients.claim(),
        ]),
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FETCH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Ignore external requests
    if (url.origin !== self.location.origin) return;

    // Never cache APIs/Auth
    if (
        url.pathname.startsWith("/api") ||
        url.pathname.startsWith("/auth") ||
        url.pathname.includes("/api/")
    ) {
        return;
    }

    // Cache First Strategy
    if (
        url.pathname.startsWith("/_next/static") ||
        url.pathname.startsWith("/icons") ||
        url.pathname === "/manifest.json" ||
        url.pathname === "/favicon.ico"
    ) {
        event.respondWith(
            caches.match(request).then(async (cached) => {
                if (cached) return cached;

                const response = await fetch(request);

                if (response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, response.clone());
                }

                return response;
            }),
        );

        return;
    }

    // Network First Strategy
    event.respondWith(
        fetch(request)
            .then(async (response) => {
                if (response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, response.clone());
                }

                return response;
            })
            .catch(async () => {
                const cached = await caches.match(request);

                if (cached) return cached;

                return new Response("Offline", {
                    status: 503,
                    statusText: "Offline",
                });
            }),
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUSH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━

self.addEventListener("push", (event) => {
    console.log("[SW] Push received");

    const defaults = {
        title: "CampusZen",
        body: "You have a new notification",
        icon: "/icons/notification-icon.png",
        badge: "/icons/badge-icon.png",
        tag: "campuszen",
        data: {
            url: "/notifications",
            notificationId: null,
        },
    };

    let payload = defaults;

    if (event.data) {
        try {
            const parsed = event.data.json();

            payload = {
                ...defaults,
                ...parsed,
                data: {
                    ...defaults.data,
                    ...(parsed.data || {}),
                },
            };
        } catch (err) {
            console.error("[SW] Push parse failed:", err);
        }
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon,
            badge: payload.badge,
            image: payload.image,
            tag: payload.tag,
            renotify: false,

            data: {
                url: payload.data.url,
                notificationId: payload.data.notificationId,
            },

            actions: [
                {
                    action: "view",
                    title: "View",
                },
                {
                    action: "dismiss",
                    title: "Dismiss",
                },
            ],

            vibrate: [100, 50, 100],
            requireInteraction: false,
            timestamp: Date.now(),
        }),
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFICATION CLICK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "dismiss") {
        return;
    }

    let targetPath = "/notifications";

    try {
        const url = event.notification.data?.url;

        if (url) {
            const parsed = new URL(url, self.location.origin);

            if (parsed.origin === self.location.origin) {
                targetPath =
                    parsed.pathname +
                    parsed.search +
                    parsed.hash;
            }
        }
    } catch {
        console.warn("[SW] Invalid notification URL");
    }

    const targetUrl = self.location.origin + targetPath;

    event.waitUntil(
        self.clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then((clients) => {
                for (const client of clients) {
                    if (client.url.startsWith(self.location.origin)) {
                        return client.focus().then(() => {
                            if ("navigate" in client) {
                                return client.navigate(targetUrl);
                            }
                        });
                    }
                }

                return self.clients.openWindow(targetUrl);
            }),
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFICATION CLOSE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━

self.addEventListener("notificationclose", () => {
    console.log("[SW] Notification dismissed");
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBSCRIPTION CHANGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━

self.addEventListener("pushsubscriptionchange", (event) => {
    console.warn("[SW] Push subscription changed");

    event.waitUntil(
        self.clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: "PUSH_SUBSCRIPTION_EXPIRED",
                    });
                });
            }),
    );
});