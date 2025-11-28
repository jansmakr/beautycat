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
                
                // 🔄 /tables/ API는 api-global-override.js에서 이미 처리됨 - 여기서는 패스
                if (typeof url === 'string' && url.includes('/tables/') && !url.includes('beautycat-api.jansmakr.workers.dev')) {
                    // 상대 경로만 감지, 이미 변환된 절대 경로는 무시
                    console.log('🔄 Dev Handler: 상대 경로 감지:', url, '→ api-global-override.js로 위임');
                    return originalFetch.apply(this, args);
                }
                
                // 이미 변환된 Cloudflare URL은 그대로 통과
                if (typeof url === 'string' && url.includes('beautycat-api.jansmakr.workers.dev')) {
                    return originalFetch.apply(this, args);
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