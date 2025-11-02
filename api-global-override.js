/**
 * BeautyCat 글로벌 API Fetch 오버라이드 - 강화 버전
 * 모든 fetch('tables/...') 호출을 Cloudflare Workers API로 자동 변환
 * Request 객체, 절대 경로, 상대 경로 모두 지원
 */

(function() {
    'use strict';
    
    // Workers API 기본 URL
    const WORKERS_API_BASE = 'https://beautycat-api.jansmakr.workers.dev/api';
    
    // 원본 fetch 함수 백업
    const originalFetch = window.fetch.bind(window);
    
    // 디버그 모드
    const DEBUG = true;
    
    /**
     * URL을 Workers API로 변환
     */
    function convertToWorkersAPI(url) {
        if (typeof url !== 'string') {
            return url;
        }
        
        if (!url.includes('/tables/')) {
            return url;
        }
        
        try {
            // URL 객체 생성 (상대/절대 경로 모두 처리)
            const urlObj = new URL(url, window.location.origin);
            
            // 현재 도메인이거나 beautycat-v2.pages.dev인 경우만 변환
            if (urlObj.origin === window.location.origin || 
                urlObj.hostname.includes('beautycat-v2.pages.dev')) {
                
                const pathname = urlObj.pathname;
                const search = urlObj.search;
                const hash = urlObj.hash;
                
                // /tables/ 경로 추출
                if (pathname.includes('/tables/')) {
                    const tablesIndex = pathname.indexOf('/tables/');
                    const apiPath = pathname.substring(tablesIndex + 1); // "tables/users"
                    
                    const newUrl = `${WORKERS_API_BASE}/${apiPath}${search}${hash}`;
                    
                    if (DEBUG) {
                        console.log(`🔄 [API 변환] ${url} → ${newUrl}`);
                    }
                    
                    return newUrl;
                }
            }
        } catch (error) {
            console.warn('⚠️ URL 변환 오류:', error.message, '- 원본 URL 사용:', url);
        }
        
        return url;
    }
    
    /**
     * 글로벌 fetch 오버라이드
     */
    window.fetch = function(input, init) {
        try {
            // Request 객체인 경우
            if (input instanceof Request) {
                const originalUrl = input.url;
                const newUrl = convertToWorkersAPI(originalUrl);
                
                if (newUrl !== originalUrl) {
                    // 새로운 Request 객체 생성
                    const newRequest = new Request(newUrl, {
                        method: input.method,
                        headers: input.headers,
                        body: input.body,
                        mode: input.mode === 'navigate' ? 'cors' : input.mode,
                        credentials: input.credentials,
                        cache: input.cache,
                        redirect: input.redirect,
                        referrer: input.referrer,
                        referrerPolicy: input.referrerPolicy,
                        integrity: input.integrity,
                        keepalive: input.keepalive,
                        signal: input.signal
                    });
                    
                    return originalFetch(newRequest, init);
                }
                
                return originalFetch(input, init);
            }
            
            // 문자열 URL인 경우
            if (typeof input === 'string') {
                const newUrl = convertToWorkersAPI(input);
                return originalFetch(newUrl, init);
            }
            
            // 기타 경우 (URL 객체 등)
            return originalFetch(input, init);
            
        } catch (error) {
            console.error('❌ Fetch 오버라이드 오류:', error);
            return originalFetch(input, init);
        }
    };
    
    // fetch의 속성 복사 (polyfill 호환성)
    Object.setPrototypeOf(window.fetch, originalFetch);
    if (originalFetch.polyfill) {
        window.fetch.polyfill = true;
    }
    
    console.log('✅ 글로벌 Fetch 오버라이드 설치 완료');
    console.log('📡 Workers API Base:', WORKERS_API_BASE);
    console.log('🔧 모든 fetch(\'/tables/...\') 호출이 자동으로 변환됩니다');
    
    // 테스트 함수
    window.testFetchOverride = async function() {
        console.log('\n🧪 Fetch 오버라이드 테스트 시작...\n');
        
        const testCases = [
            'tables/users?limit=1',
            '/tables/users?limit=1',
            'https://beautycat-v2.pages.dev/tables/users?limit=1',
            new Request('/tables/users?limit=1', { method: 'POST' })
        ];
        
        for (const testUrl of testCases) {
            const displayUrl = testUrl instanceof Request ? `Request(${testUrl.url})` : testUrl;
            console.log(`테스트: ${displayUrl}`);
            try {
                const response = await fetch(testUrl);
                console.log('✅ 성공:', response.status, 'URL:', response.url);
            } catch (error) {
                console.error('❌ 실패:', error.message);
            }
            console.log('');
        }
        
        console.log('🧪 Fetch 오버라이드 테스트 완료\n');
    };
    
})();
