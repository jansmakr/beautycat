/**
 * BeautyCat 글로벌 API Fetch 오버라이드
 * 모든 fetch('tables/...') 호출을 Cloudflare Workers API로 자동 변환
 * 
 * 이 파일은 모든 HTML 파일에서 가장 먼저 로드되어야 합니다.
 */

(function() {
    'use strict';
    
    // Workers API 기본 URL
    const WORKERS_API_BASE = 'https://beautycat-api.jansmakr.workers.dev/api';
    
    // 원본 fetch 함수 백업
    const originalFetch = window.fetch;
    
    // 디버그 모드 (콘솔 로그 출력)
    const DEBUG = true;
    
    /**
     * 글로벌 fetch 오버라이드
     */
    window.fetch = function(url, options) {
        // Request 객체 처리
        if (url instanceof Request) {
            const originalUrl = url.url;
            if (originalUrl.includes('/tables/')) {
                try {
                    let targetUrl = originalUrl;
                    
                    // 상대 경로 처리
                    if (originalUrl.startsWith('tables/') || originalUrl.startsWith('/tables/')) {
                        const cleanPath = originalUrl.replace(/^\//, '');
                        targetUrl = `${WORKERS_API_BASE}/${cleanPath}`;
                    }
                    // 절대 경로 처리
                    else if (originalUrl.match(/^https?:\/\//)) {
                        const urlObj = new URL(originalUrl);
                        if (urlObj.pathname.startsWith('/tables/')) {
                            const cleanPath = urlObj.pathname.replace(/^\//, '');
                            targetUrl = `${WORKERS_API_BASE}/${cleanPath}${urlObj.search}${urlObj.hash}`;
                        }
                    }
                    
                    if (targetUrl !== originalUrl) {
                        if (DEBUG) {
                            console.log(`🔄 [Request 변환] ${originalUrl} → ${targetUrl}`);
                        }
                        
                        const newRequest = new Request(targetUrl, {
                            method: url.method,
                            headers: url.headers,
                            body: url.body,
                            mode: url.mode === 'navigate' ? 'cors' : url.mode,
                            credentials: url.credentials,
                            cache: url.cache,
                            redirect: url.redirect,
                            referrer: url.referrer,
                            referrerPolicy: url.referrerPolicy,
                            integrity: url.integrity,
                            keepalive: url.keepalive,
                            signal: url.signal
                        });
                        
                        return originalFetch(newRequest, options);
                    }
                } catch (error) {
                    console.error('❌ Request 오버라이드 오류:', error);
                }
            }
            return originalFetch(url, options);
        }
        
        // URL이 문자열인지 확인
        if (typeof url !== 'string') {
            return originalFetch(url, options);
        }
        
        // /tables/ 경로가 포함되어 있는지 확인
        if (url.includes('/tables/')) {
            try {
                let targetUrl = url;
                
                // 상대 경로 처리 (tables/users, /tables/users)
                if (url.startsWith('tables/') || url.startsWith('/tables/')) {
                    // 앞의 슬래시 제거
                    const cleanPath = url.replace(/^\//, '');
                    
                    targetUrl = `${WORKERS_API_BASE}/${cleanPath}`;
                    
                    if (DEBUG) {
                        console.log(`🔄 [상대경로 변환] ${url} → ${targetUrl}`);
                    }
                }
                // 절대 경로 처리 (https://beautycat-v2.pages.dev/tables/users)
                else if (url.match(/^https?:\/\//)) {
                    const urlObj = new URL(url);
                    if (urlObj.pathname.startsWith('/tables/')) {
                        const cleanPath = urlObj.pathname.replace(/^\//, '');
                        targetUrl = `${WORKERS_API_BASE}/${cleanPath}${urlObj.search}${urlObj.hash}`;
                        
                        if (DEBUG) {
                            console.log(`🔄 [절대경로 변환] ${url} → ${targetUrl}`);
                        }
                    }
                }
                
                // 변환된 URL로 fetch 호출
                return originalFetch(targetUrl, options);
                
            } catch (error) {
                console.error('❌ API 오버라이드 오류:', error);
                // 오류 발생 시 원본 fetch 사용
                return originalFetch(url, options);
            }
        }
        
        // /tables/ 경로가 아닌 경우 원본 fetch 사용
        return originalFetch(url, options);
    };
    
    // 오버라이드 설치 확인
    console.log('✅ 글로벌 Fetch 오버라이드 설치 완료');
    console.log('📡 Workers API Base:', WORKERS_API_BASE);
    console.log('🔧 모든 fetch(\'/tables/...\') 호출이 자동으로 변환됩니다');
    
    // 테스트 함수 (개발자 도구에서 사용 가능)
    window.testFetchOverride = async function() {
        console.log('\n🧪 Fetch 오버라이드 테스트 시작...\n');
        
        const testCases = [
            'tables/users?limit=1',
            '/tables/users?limit=1',
            'https://beautycat-v2.pages.dev/tables/users?limit=1'
        ];
        
        for (const testUrl of testCases) {
            console.log(`테스트: ${testUrl}`);
            try {
                const response = await fetch(testUrl);
                const data = await response.json();
                console.log('✅ 성공:', response.status, data);
            } catch (error) {
                console.error('❌ 실패:', error.message);
            }
            console.log('');
        }
        
        console.log('🧪 Fetch 오버라이드 테스트 완료\n');
    };
    
})();
