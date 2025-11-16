/**
 * BeautyCat 글로벌 API Fetch 오버라이드 v2.3.6.2
 * 모든 fetch('tables/...') 호출을 Cloudflare Workers API로 자동 변환
 * 
 * 🔥 HOTFIX v2.3.6.2: sort=timestamp → sort=created_at 자동 변환
 * 
 * 이 파일은 모든 HTML 파일에서 가장 먼저 로드되어야 합니다.
 * 업데이트: 2024-11-16 v2.3.6.2
 */

console.log('🚀 API Global Override v2.3.6.2 - timestamp 핫픽스 활성화');

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
            if (originalUrl.includes('/tables/') || originalUrl.startsWith('tables/')) {
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
        
        // 🔥 긴급 핫픽스: sort=timestamp → sort=created_at 자동 변환 (최우선 처리)
        let processedUrl = url;
        if (typeof url === 'string' && url.includes('sort=timestamp')) {
            processedUrl = url.replace(/sort=timestamp/g, 'sort=created_at');
            console.log('🔥 HOTFIX: sort=timestamp → sort=created_at 자동 변환');
            console.log(`   Before: ${url}`);
            console.log(`   After:  ${processedUrl}`);
        }
        
        // /tables/ 또는 tables/ 경로가 포함되어 있는지 확인
        if (processedUrl.includes('/tables/') || processedUrl.startsWith('tables/')) {
            try {
                let targetUrl = processedUrl;
                
                // 상대 경로 처리 (tables/users, /tables/users)
                if (processedUrl.startsWith('tables/') || processedUrl.startsWith('/tables/')) {
                    // 앞의 슬래시 제거
                    const cleanPath = processedUrl.replace(/^\//, '');
                    
                    // 🔥 CRITICAL FIX: sort=timestamp를 sort=created_at로 변환
                    const finalPath = cleanPath.replace(/sort=timestamp/g, 'sort=created_at');
                    
                    targetUrl = `${WORKERS_API_BASE}/${finalPath}`;
                    
                    if (DEBUG) {
                        console.log(`🔄 [상대경로 변환] ${processedUrl} → ${targetUrl}`);
                    }
                }
                // 절대 경로 처리 (https://beautycat-v2.pages.dev/tables/users)
                else if (processedUrl.match(/^https?:\/\//)) {
                    const urlObj = new URL(processedUrl);
                    if (urlObj.pathname.startsWith('/tables/')) {
                        const cleanPath = urlObj.pathname.replace(/^\//, '');
                        
                        // 🔥 CRITICAL FIX: search 파라미터에서도 sort=timestamp 변환
                        let finalSearch = urlObj.search.replace(/sort=timestamp/g, 'sort=created_at');
                        
                        targetUrl = `${WORKERS_API_BASE}/${cleanPath}${finalSearch}${urlObj.hash}`;
                        
                        if (DEBUG) {
                            console.log(`🔄 [절대경로 변환] ${processedUrl} → ${targetUrl}`);
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
            { url: 'tables/users?limit=1', desc: '슬래시 없는 상대 경로' },
            { url: '/tables/users?limit=1', desc: '슬래시 있는 상대 경로' },
            { url: 'https://beautycat-v2.pages.dev/tables/users?limit=1', desc: 'Pages 절대 경로' },
            { url: new Request('/tables/users?limit=1', { method: 'POST', body: '{}' }), desc: 'POST Request 객체' }
        ];
        
        for (const testCase of testCases) {
            const testUrl = testCase.url;
            const displayUrl = testUrl instanceof Request ? `Request(${testUrl.url})` : testUrl;
            console.log(`\n📝 테스트: ${testCase.desc}`);
            console.log(`   URL: ${displayUrl}`);
            try {
                const response = await fetch(testUrl);
                console.log(`   ✅ 결과: ${response.status} ${response.statusText}`);
                console.log(`   📍 실제 URL: ${response.url}`);
                if (response.ok) {
                    try {
                        const data = await response.json();
                        console.log(`   📊 데이터: ${data.total || 0}개`);
                    } catch (e) {
                        console.log(`   ⚠️ JSON 파싱 실패`);
                    }
                }
            } catch (error) {
                console.error(`   ❌ 실패: ${error.message}`);
            }
        }
        
        console.log('\n🧪 Fetch 오버라이드 테스트 완료\n');
    };
    
})();
