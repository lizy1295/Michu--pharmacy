// Michu Pharmacy PWA Service Worker (Advanced Offline & Symptom Guide Cache)
const STATIC_CACHE = 'michu-pwa-static-v3';
const SYMPTOMS_CACHE = 'michu-pwa-symptoms-v3';
const DYNAMIC_CACHE = 'michu-pwa-dynamic-v3';

// Core shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/symptoms',
  '/branches',
  '/faq',
  '/manifest.json',
  '/favicon.ico',
];

// Sensitive routes that MUST NOT be cached (authentication, payment, booking, uploads)
const NETWORK_ONLY_PATTERNS = [
  /\/api\/auth/,
  /\/api\/orders/,
  /\/api\/payments/,
  /\/api\/consultations/,
  /\/api\/prescriptions/,
  /\/login/,
  /\/admin/,
  /\/cart/,
  /\/account/,
  /action=consult/,
  /action=upload/,
];

// 1. Install Event: Pre-cache core shell & Symptom Guide
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Core precache warning:', err);
        });
      }),
      caches.open(SYMPTOMS_CACHE).then((cache) => {
        // Cache symptom guide specifically
        return fetch('/symptoms')
          .then((res) => {
            if (res.status === 200) {
              return cache.put('/symptoms', res);
            }
          })
          .catch((err) => {
            console.warn('[SW] Symptom guide initial cache warning:', err);
          });
      }),
    ])
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, SYMPTOMS_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event Routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST, PUT, DELETE mutations)
  if (request.method !== 'GET') {
    return;
  }

  // A. Network-Only Routes: DO NOT CACHE (Auth, Payment, Booking, Uploads, Admin)
  const isNetworkOnly = NETWORK_ONLY_PATTERNS.some((pattern) => pattern.test(url.pathname + url.search));
  if (isNetworkOnly) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return structured offline error for API calls or offline fallback
        if (request.headers.get('accept')?.includes('application/json') || url.pathname.startsWith('/api')) {
          return new Response(
            JSON.stringify({
              error: 'OFFLINE_MODE',
              message: 'This live action (payment, booking, upload, auth) requires an active internet connection.',
            }),
            {
              status: 503,
              statusText: 'Service Unavailable Offline',
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        // Return offline HTML notice for page navigations
        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <title>Offline - Internet Connection Required | Michu Pharmacy</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
              .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 32px; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
              .icon { font-size: 48px; margin-bottom: 16px; }
              h1 { font-size: 20px; font-weight: 800; margin: 0 0 12px; color: #fff; }
              p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px; }
              .btn { display: inline-block; background: #059669; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; font-size: 14px; }
              .btn:hover { background: #10b981; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">⚡</div>
              <h1>Internet Connection Required</h1>
              <p>Authentication, checkout, prescription uploads, and doctor consultations cannot be performed offline.</p>
              <a href="/symptoms" class="btn">Browse Symptom Guide Offline &rarr;</a>
            </div>
          </body>
          </html>`,
          {
            status: 503,
            headers: { 'Content-Type': 'text/html' },
          }
        );
      })
    );
    return;
  }

  // B. Cache-First Strategy: Symptom Guide content & Static Next.js Bundles
  const isSymptomRoute = url.pathname === '/symptoms' || url.pathname.startsWith('/symptoms/');
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2');

  if (isSymptomRoute || isStaticAsset) {
    const targetCache = isSymptomRoute ? SYMPTOMS_CACHE : STATIC_CACHE;
    event.respondWith(
      caches.open(targetCache).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Stale-While-Revalidate: Return cached response immediately, update cache in background
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // C. Network-First with Dynamic Cache Fallback for general browsing (/products, /branches, /faq)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If requesting an HTML page and offline, fall back to cached /symptoms or /
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/symptoms') || caches.match('/');
          }
          return new Response('Network offline and no cached asset available', { status: 503 });
        });
      })
  );
});
