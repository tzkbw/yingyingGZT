const CACHE_NAME = 'mint-desk-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png'
];

// 安装时缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 拦截请求：网络优先，缓存兜底，确保资源能及时更新
self.addEventListener('fetch', event => {
  const { request } = event;
  // 只处理 GET 请求
  if (request.method !== 'GET') return;
  // 跳过非同源请求
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // 网络成功：缓存新资源后返回
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // 网络失败：回退到缓存
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // 离线且缓存中没有时，返回首页兜底
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
