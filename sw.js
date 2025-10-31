// BeautyCat Service Worker - 리다이렉트 오류 완전 해결 버전
const CACHE_NAME = 'beautycat-v2.3.0';

console.log('🐱 BeautyCat Service Worker 시작 - 리다이렉트 안전 모드');

// Service Worker 설치
self.addEventListener('install', event => {
  console.log('🔧 Service Worker 설치 중...');
  self.skipWaiting(); // 즉시 활성화
});

// Service Worker 활성화
self.addEventListener('activate', event => {
  console.log('✅ Service Worker 활성화됨');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 구 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch 이벤트 - 리다이렉트 문제 완전 우회
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  console.log('🔍 Fetch 요청:', request.method, url.href);
  
  // 🚨 리다이렉트가 발생할 수 있는 모든 요청을 Service Worker에서 완전히 제외
  const shouldBypass = (
    // 1. 메인 도메인 및 루트 경로 (리다이렉트 위험)
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '' ||
    
    // 2. 네비게이션 요청 (브라우저가 처리해야 함)
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    
    // 3. 다른 도메인 요청
    url.origin !== self.location.origin ||
    
    // 4. API 요청
    request.url.includes('/tables/') ||
    request.url.includes('/api/') ||
    
    // 5. POST, PUT 등 비-GET 요청
    request.method !== 'GET' ||
    
    // 6. 외부 리소스
    url.hostname !== self.location.hostname
  );
  
  if (shouldBypass) {
    console.log('🚫 Service Worker 우회:', url.href);
    // Service Worker가 개입하지 않음 - 브라우저가 직접 처리
    return;
  }
  
  // 오직 안전한 정적 리소스만 처리 (JS, CSS, 이미지, 폰트)
  const isSafeStaticResource = (
    request.destination === 'script' || 
    request.destination === 'style' || 
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf')
  );
  
  if (isSafeStaticResource) {
    console.log('📦 정적 리소스 캐시 처리:', url.pathname);
    
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('💾 캐시에서 반환:', url.pathname);
            return cachedResponse;
          }
          
          // 캐시에 없으면 네트워크에서 가져오기 (리다이렉트 안전 설정)
          return fetch(request.clone(), {
            method: 'GET',
            mode: 'cors',
            credentials: 'same-origin',
            redirect: 'follow', // 리다이렉트 허용
            cache: 'default'
          }).then(response => {
            console.log('🌐 네트워크에서 가져옴:', url.pathname, 'Status:', response.status);
            
            // 성공적인 응답만 캐시에 저장
            if (response && response.status === 200 && response.type !== 'opaque') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
                console.log('💾 캐시에 저장:', url.pathname);
              }).catch(err => {
                console.log('⚠️ 캐시 저장 실패:', err.message);
              });
            }
            
            return response;
          }).catch(error => {
            console.log('❌ 네트워크 요청 실패:', url.pathname, error.message);
            
            // 네트워크 실패 시 기본 응답
            if (request.destination === 'image') {
              return new Response('', { 
                status: 404,
                statusText: 'Image not found' 
              });
            }
            
            if (request.destination === 'script') {
              return new Response('// Script unavailable offline', { 
                status: 200,
                headers: { 'Content-Type': 'text/javascript' }
              });
            }
            
            if (request.destination === 'style') {
              return new Response('/* Style unavailable offline */', { 
                status: 200,
                headers: { 'Content-Type': 'text/css' }
              });
            }
            
            return new Response('Resource unavailable', { status: 503 });
          });
        })
        .catch(error => {
          console.log('❌ 캐시 조회 실패:', error.message);
          return new Response('Cache error', { status: 500 });
        })
    );
  } else {
    console.log('🚫 처리하지 않는 리소스:', url.href);
    // 처리하지 않는 리소스는 브라우저가 직접 처리
    return;
  }
});

// 메시지 처리
self.addEventListener('message', event => {
  console.log('📨 메시지 수신:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ skipWaiting 실행');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 오류 처리
self.addEventListener('error', event => {
  console.log('❌ Service Worker 오류:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.log('❌ Service Worker Promise 거부:', event.reason);
});

console.log('🎉 BeautyCat Service Worker 로드 완료 - 리다이렉트 안전 모드');