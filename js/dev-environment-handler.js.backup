// beautycat 개발 환경 오류 방지 핸들러
(function() {
    'use strict';

    // 개발 환경 감지
    const isDevelopment = () => {
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' || 
               location.protocol === 'file:' || 
               location.hostname.includes('genspark.ai') ||
               location.hostname.includes('github.io') ||
               location.port !== '';
    };

    // PWA 관련 오류 방지
    const preventPWAErrors = () => {
        if (isDevelopment()) {
            // 매니페스트 및 API fetch 오류 방지
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                const url = args[0];
                
                // 매니페스트 차단
                if (typeof url === 'string' && url.includes('manifest.json')) {
                    console.log('🚧 개발 환경: manifest.json fetch 요청 차단');
                    return Promise.reject(new Error('Development environment: manifest fetch blocked'));
                }
                
                // 🔄 /tables/ API를 Cloudflare API로 리다이렉트  
                if (typeof url === 'string' && url.includes('/tables/')) {
                    console.log('🔄 Dev Handler: API 요청 감지:', url);
                    
                    // Cloudflare API가 이미 로드되어 있으면 위임
                    if (window.cloudflareAPI) {
                        console.log('📡 Cloudflare API 위임:', url);
                        
                        // URL에서 테이블명과 파라미터 추출
                        const urlObj = new URL(url, window.location.origin);
                        const pathParts = urlObj.pathname.split('/');
                        const tableName = pathParts[pathParts.indexOf('tables') + 1];
                        
                        // Query parameters 추출
                        const params = {};
                        urlObj.searchParams.forEach((value, key) => {
                            params[key] = value;
                        });
                        
                        // Cloudflare API 직접 호출
                        return window.cloudflareAPI.getTables(tableName, params)
                            .then(data => new Response(JSON.stringify(data), {
                                status: 200,
                                headers: { 'Content-Type': 'application/json' }
                            }));
                    }
                    
                    // Fallback: 직접 Cloudflare Workers URL 호출
                    let cloudflareUrl = url.replace(
                        /.*\/tables\//, 
                        'https://beautycat-api.jansmakr.workers.dev/api/tables/'
                    );
                    
                    console.log('📡 Fallback: 직접 Cloudflare API 호출:', cloudflareUrl);
                    return originalFetch(cloudflareUrl, args[1]);
                }
                
                return originalFetch.apply(this, args);
            };

            // Service Worker 등록 오류 방지
            if ('serviceWorker' in navigator) {
                const originalRegister = navigator.serviceWorker.register;
                navigator.serviceWorker.register = function(...args) {
                    console.log('🚧 개발 환경: Service Worker 등록 차단');
                    return Promise.reject(new Error('Development environment: SW registration blocked'));
                };
            }
        }
    };

    // 401 오류 캐치 및 무시
    const handleUnauthorizedErrors = () => {
        window.addEventListener('error', function(event) {
            if (event.message && event.message.includes('401')) {
                console.log('🚧 개발 환경: 401 오류 무시됨');
                event.preventDefault();
                return true;
            }
        });

        // Promise 거부 오류 처리
        window.addEventListener('unhandledrejection', function(event) {
            if (event.reason && event.reason.message) {
                const message = event.reason.message.toLowerCase();
                if (message.includes('manifest') || message.includes('401') || message.includes('unauthorized')) {
                    console.log('🚧 개발 환경: Promise 거부 오류 무시됨:', event.reason.message);
                    event.preventDefault();
                    return true;
                }
            }
        });
    };

    // 네트워크 요청 오류 방지
    const preventNetworkErrors = () => {
        if (isDevelopment()) {
            // XMLHttpRequest 오류 방지
            const originalXHR = window.XMLHttpRequest;
            window.XMLHttpRequest = function() {
                const xhr = new originalXHR();
                const originalOpen = xhr.open;
                
                xhr.open = function(method, url, ...args) {
                    if (typeof url === 'string' && url.includes('manifest.json')) {
                        console.log('🚧 개발 환경: XHR manifest 요청 차단');
                        return;
                    }
                    return originalOpen.apply(this, [method, url, ...args]);
                };
                
                return xhr;
            };
        }
    };

    // 초기화
    const init = () => {
        if (isDevelopment()) {
            console.log('🚧 beautycat 개발 환경 핸들러 활성화');
            preventPWAErrors();
            handleUnauthorizedErrors();
            preventNetworkErrors();
        }
    };

    // DOM이 로드되면 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();