// 뽀샵 최적화된 Service Worker - Workbox 오류 수정
// 가성비 인증 시스템용 캐시 전략

const CACHE_NAME = 'pposhop-auth-v1';
const STATIC_CACHE_URLS = [
    // 정적 리소스만 캐시 (실제 존재하는 파일들)
    '/cost-effective-auth.html',
    '/js/cost-effective-auth.js',
    '/identity-verification.html',
    '/js/identity-auth.js'
];

// 설치 이벤트
self.addEventListener('install', event => {
    console.log('🔧 Service Worker 설치 중...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 캐시 오픈:', CACHE_NAME);
                
                // 파일 존재 여부 확인 후 캐시
                return Promise.allSettled(
                    STATIC_CACHE_URLS.map(url => 
                        fetch(url)
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                } else {
                                    console.warn('⚠️ 파일 없음:', url);
                                    return Promise.resolve();
                                }
                            })
                            .catch(error => {
                                console.warn('⚠️ 캐시 실패:', url, error);
                                return Promise.resolve();
                            })
                    )
                );
            })
            .then(() => {
                console.log('✅ Service Worker 설치 완료');
                return self.skipWaiting(); // 즉시 활성화
            })
            .catch(error => {
                console.error('❌ Service Worker 설치 실패:', error);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker 활성화');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ 이전 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker 활성화 완료');
            return self.clients.claim(); // 즉시 제어권 확보
        })
    );
});

// Fetch 이벤트 (네트워크 우선 전략)
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 로컬 리소스만 처리
    if (url.origin === location.origin) {
        event.respondWith(
            // 네트워크 우선, 실패시 캐시
            fetch(request)
                .then(response => {
                    // 성공시 캐시 업데이트 (정적 리소스만)
                    if (response.ok && STATIC_CACHE_URLS.includes(url.pathname)) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // 네트워크 실패시 캐시에서 조회
                    return caches.match(request).then(cachedResponse => {
                        if (cachedResponse) {
                            console.log('📦 캐시에서 제공:', request.url);
                            return cachedResponse;
                        }
                        
                        // 캐시에도 없으면 오프라인 페이지 또는 기본 응답
                        if (request.destination === 'document') {
                            return new Response(
                                createOfflinePage(),
                                { 
                                    headers: { 'Content-Type': 'text/html' }
                                }
                            );
                        }
                        
                        return new Response('오프라인 상태입니다.', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
                })
        );
    }
});

// 오프라인 페이지 HTML 생성
function createOfflinePage() {
    return `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>뽀샵 - 오프라인</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: #f5f5f5;
                    text-align: center;
                }
                .container {
                    max-width: 400px;
                    margin: 50px auto;
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #ff2d92;
                    margin-bottom: 20px;
                }
                .message {
                    color: #666;
                    line-height: 1.5;
                    margin-bottom: 20px;
                }
                .retry-btn {
                    background: #ff2d92;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .retry-btn:hover {
                    background: #e6297f;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">뽀샵</div>
                <div class="message">
                    인터넷 연결을 확인해주세요.<br>
                    연결이 복구되면 자동으로 다시 시도합니다.
                </div>
                <button class="retry-btn" onclick="location.reload()">
                    다시 시도
                </button>
            </div>
            
            <script>
                // 네트워크 복구시 자동 새로고침
                window.addEventListener('online', () => {
                    location.reload();
                });
            </script>
        </body>
        </html>
    `;
}

// 메시지 수신 처리
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

console.log('🚀 뽀샵 Service Worker 로드 완료');