// Client-side caching utility with localStorage and Cache API support

const CACHE_PREFIX = "cx_cache_";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to check if we're in a browser environment
const isBrowser =
    typeof window !== "undefined" && typeof localStorage !== "undefined";

class ClientCache {
    constructor(options = {}) {
        this.ttl = options.ttl || DEFAULT_TTL;
        this.prefix = options.prefix || CACHE_PREFIX;
        this.memoryCache = new Map();
    }

    // Generate a cache key from string or object
    getKey(key) {
        if (typeof key === "object") {
            return this.prefix + JSON.stringify(key);
        }
        return this.prefix + key;
    }

    // Get data from cache (memory first, then localStorage)
    get(key) {
        const cacheKey = this.getKey(key);

        // Check memory cache first
        if (this.memoryCache.has(cacheKey)) {
            const item = this.memoryCache.get(cacheKey);
            if (Date.now() < item.expiresAt) {
                return item.data;
            }
            this.memoryCache.delete(cacheKey);
        }

        // Check localStorage only in browser
        if (isBrowser) {
            try {
                const stored = localStorage.getItem(cacheKey);
                if (stored) {
                    const item = JSON.parse(stored);
                    if (Date.now() < item.expiresAt) {
                        // Restore to memory cache for faster access next time
                        this.memoryCache.set(cacheKey, item);
                        return item.data;
                    }
                    // Remove expired
                    localStorage.removeItem(cacheKey);
                }
            } catch (e) {
                console.warn("Failed to read from localStorage cache:", e);
            }
        }

        return null;
    }

    // Set data to cache
    set(key, data, ttl = this.ttl) {
        const cacheKey = this.getKey(key);
        const item = {
            data,
            expiresAt: Date.now() + ttl,
            cachedAt: Date.now(),
        };

        // Memory cache
        this.memoryCache.set(cacheKey, item);

        // localStorage only in browser
        if (isBrowser) {
            try {
                localStorage.setItem(cacheKey, JSON.stringify(item));
            } catch (e) {
                console.warn("Failed to write to localStorage cache:", e);
            }
        }
    }

    // Delete specific cache entry
    delete(key) {
        const cacheKey = this.getKey(key);
        this.memoryCache.delete(cacheKey);
        if (isBrowser) {
            try {
                localStorage.removeItem(cacheKey);
            } catch (e) {
                console.warn("Failed to delete from localStorage cache:", e);
            }
        }
    }

    // Clear all cache entries for this app
    clear() {
        this.memoryCache.clear();
        if (isBrowser) {
            try {
                Object.keys(localStorage)
                    .filter((k) => k.startsWith(this.prefix))
                    .forEach((k) => localStorage.removeItem(k));
            } catch (e) {
                console.warn("Failed to clear localStorage cache:", e);
            }
        }
    }

    // Invalidate cache by pattern
    invalidate(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];

        // Check memory cache
        for (const key of this.memoryCache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        // Check localStorage only in browser
        if (isBrowser) {
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.prefix) && regex.test(key)) {
                        keysToDelete.push(key);
                    }
                }
            } catch (e) {
                console.warn("Failed to read localStorage keys:", e);
            }
        }

        // Delete
        keysToDelete.forEach((key) => {
            this.memoryCache.delete(key);
            if (isBrowser) {
                try {
                    localStorage.removeItem(key);
                } catch (e) {}
            }
        });
    }
}

// Create a singleton instance
export const clientCache = new ClientCache();

// Helper for fetch with cache
export async function fetchWithCache(url, options = {}) {
    const {
        cacheKey = url,
        ttl = DEFAULT_TTL,
        forceRefresh = false,
        ...fetchOptions
    } = options;

    // Check cache first unless force refresh
    if (!forceRefresh) {
        const cached = clientCache.get(cacheKey);
        if (cached) {
            return cached;
        }
    }

    // Fetch fresh data
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Cache the result
    clientCache.set(cacheKey, data, ttl);

    return data;
}

export default clientCache;
