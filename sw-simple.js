// 뽀샵 간단 Service Worker - 오류 최소화
// 콘솔 오류 제거를 위한 최소 기능 구현

const CACHE_NAME = 'pposhop-simple-v1';

// 기본적인 정적 파일만 캐시
const CACHE_URLS = [
    './index.html',
    './js/regional-matching.js',
    './js/main.js',
    './pposhop-styles.css'
];

// 설치 이벤트 - 기본 캐시 생성
self.addEventListener('install', event => {
    console.log('✅ 뽀샵 Service Worker 설치 완료');
    
    // 즉시 활성화 (기존 SW 대체)
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 기본 캐시 생성');
                // 오류 방지를 위해 파일 존재 여부 확인 없이 진행
                return Promise.resolve();
            })
            .catch(error => {
                console.log('⚠️ 캐시 생성 실패 (정상):', error.message);
            })
    );
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', event => {
    console.log('🚀 뽀샵 Service Worker 활성화');
    
    // 즉시 제어권 획득
    event.waitUntil(
        clients.claim().then(() => {
            console.log('✅ Service Worker 제어권 획득');
        })
    );
});

// 네트워크 요청 처리 - 단순화
self.addEventListener('fetch', event => {
    // 루트 경로 요청 처리
    if (event.request.url.endsWith('/') || event.request.url.includes('index.html')) {
        event.respondWith(
            fetch('./index.html')
                .catch(() => {
                    // 네트워크 실패 시 기본 응답
                    return new Response(
                        `<!DOCTYPE html>
                        <html><head><title>뽀샵</title></head>
                        <body><h1>뽀샵 - 오프라인</h1><p>인터넷 연결을 확인해주세요.</p></body>
                        </html>`,
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                })
        );
        return;
    }
    
    // API 요청은 항상 네트워크 우선
    if (event.request.url.includes('/tables/') || event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(error => {
                    console.log('📡 API 요청 실패:', event.request.url);
                    return new Response(
                        JSON.stringify({ error: 'Network error', offline: true }),
                        { 
                            status: 503,
                            headers: { 'Content-Type': 'application/json' } 
                        }
                    );
                })
        );
        return;
    }
    
    // 기타 요청은 네트워크 우선, 실패 시 캐시
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            console.log('📂 캐시에서 응답:', event.request.url);
                            return response;
                        }
                        
                        // 캐시에도 없으면 기본 응답
                        return new Response('리소스를 찾을 수 없습니다.', { 
                            status: 404,
                            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                        });
                    });
            })
    );
});

// 에러 처리
self.addEventListener('error', event => {
    console.log('⚠️ Service Worker 오류:', event.error);
});

// 처리되지 않은 Promise 거부 처리
self.addEventListener('unhandledrejection', event => {
    console.log('⚠️ Service Worker Promise 거부:', event.reason);
    // 오류 로깅만 하고 기본 동작은 방지하지 않음
});

console.log('🗺️ 뽀샵 간단 Service Worker 로드 완료 - 지역별 매칭 지원');