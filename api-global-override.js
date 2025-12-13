/**
 * BeautyCat 글로벌 API Fetch ?�버?�이??v2.3.6.2
 * 모든 fetch('tables/...') ?�출??Cloudflare Workers API�??�동 변?? * 
 * ?�� HOTFIX v2.3.6.2: sort=timestamp ??sort=created_at ?�동 변?? * 
 * ???�일?� 모든 HTML ?�일?�서 가??먼�? 로드?�어???�니??
 * ?�데?�트: 2024-11-16 v2.3.6.2
 */

console.log('?? API Global Override v2.3.6.2 - timestamp ?�픽???�성??);

(function() {
    'use strict';
    
    // Workers API 기본 URL
    const WORKERS_API_BASE = 'https://beautycat-api.jansmakr.workers.dev/api';
    
    // ?�본 fetch ?�수 백업
    const originalFetch = window.fetch;
    
    // ?�버�?모드 (콘솔 로그 출력)
    const DEBUG = true;
    
    /**
     * 글로벌 fetch ?�버?�이??     */
    window.fetch = function(url, options) {
        // Request 객체 처리
        if (url instanceof Request) {
            const originalUrl = url.url;
            if (originalUrl.includes('/tables/') || originalUrl.startsWith('tables/')) {
                try {
                    let targetUrl = originalUrl;
                    
                    // ?��? 경로 처리
                    if (originalUrl.startsWith('tables/') || originalUrl.startsWith('/tables/')) {
                        const cleanPath = originalUrl.replace(/^\//, '');
                        targetUrl = `${WORKERS_API_BASE}/${cleanPath}`;
                    }
                    // ?��? 경로 처리
                    else if (originalUrl.match(/^https?:\/\//)) {
                        const urlObj = new URL(originalUrl);
                        if (urlObj.pathname.startsWith('/tables/')) {
                            const cleanPath = urlObj.pathname.replace(/^\//, '');
                            targetUrl = `${WORKERS_API_BASE}/${cleanPath}${urlObj.search}${urlObj.hash}`;
                        }
                    }
                    
                    if (targetUrl !== originalUrl) {
                        if (DEBUG) {
                            console.log(`?�� [Request 변?? ${originalUrl} ??${targetUrl}`);
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
                    console.error('??Request ?�버?�이???�류:', error);
                }
            }
            return originalFetch(url, options);
        }
        
        // URL??문자?�인지 ?�인
        if (typeof url !== 'string') {
            return originalFetch(url, options);
        }
        
        // ?�� 긴급 ?�픽?? sort=timestamp ??sort=created_at ?�동 변??(최우??처리)
        let processedUrl = url;
        if (typeof url === 'string' && url.includes('sort=timestamp')) {
            processedUrl = url.replace(/sort=timestamp/g, 'sort=created_at');
            console.log('?�� HOTFIX: sort=timestamp ??sort=created_at ?�동 변??);
            console.log(`   Before: ${url}`);
            console.log(`   After:  ${processedUrl}`);
        }
        
        // /tables/ ?�는 tables/ 경로가 ?�함?�어 ?�는지 ?�인
        if (processedUrl.includes('/tables/') || processedUrl.startsWith('tables/')) {
            try {
                let targetUrl = processedUrl;
                
                // ?��? 경로 처리 (tables/users, /tables/users)
                if (processedUrl.startsWith('tables/') || processedUrl.startsWith('/tables/')) {
                    // ?�의 ?�래???�거
                    const cleanPath = processedUrl.replace(/^\//, '');
                    
                    // ?�� CRITICAL FIX: sort=timestamp�?sort=created_at�?변??                    const finalPath = cleanPath.replace(/sort=timestamp/g, 'sort=created_at');
                    
                    targetUrl = `${WORKERS_API_BASE}/${finalPath}`;
                    
                    if (DEBUG) {
                        console.log(`?�� [?��?경로 변?? ${processedUrl} ??${targetUrl}`);
                    }
                }
                // ?��? 경로 처리 (https://beautycat-v2.pages.dev/tables/users)
                else if (processedUrl.match(/^https?:\/\//)) {
                    const urlObj = new URL(processedUrl);
                    if (urlObj.pathname.startsWith('/tables/')) {
                        const cleanPath = urlObj.pathname.replace(/^\//, '');
                        
                        // ?�� CRITICAL FIX: search ?�라미터?�서??sort=timestamp 변??                        let finalSearch = urlObj.search.replace(/sort=timestamp/g, 'sort=created_at');
                        
                        targetUrl = `${WORKERS_API_BASE}/${cleanPath}${finalSearch}${urlObj.hash}`;
                        
                        if (DEBUG) {
                            console.log(`?�� [?��?경로 변?? ${processedUrl} ??${targetUrl}`);
                        }
                    }
                }
                
                // 변?�된 URL�?fetch ?�출
                return originalFetch(targetUrl, options);
                
            } catch (error) {
                console.error('??API ?�버?�이???�류:', error);
                // ?�류 발생 ???�본 fetch ?�용
                return originalFetch(url, options);
            }
        }
        
        // /tables/ 경로가 ?�닌 경우 ?�본 fetch ?�용
        return originalFetch(url, options);
    };
    
    // ?�버?�이???�치 ?�인
    console.log('??글로벌 Fetch ?�버?�이???�치 ?�료');
    console.log('?�� Workers API Base:', WORKERS_API_BASE);
    console.log('?�� 모든 fetch(\'/tables/...\') ?�출???�동?�로 변?�됩?�다');
    
    // ?�스???�수 (개발???�구?�서 ?�용 가??
    window.testFetchOverride = async function() {
        console.log('\n?�� Fetch ?�버?�이???�스???�작...\n');
        
        const testCases = [
            { url: 'tables/users?limit=1', desc: '?�래???�는 ?��? 경로' },
            { url: '/tables/users?limit=1', desc: '?�래???�는 ?��? 경로' },
            { url: 'https://beautycat-v2.pages.dev/tables/users?limit=1', desc: 'Pages ?��? 경로' },
            { url: new Request('/tables/users?limit=1', { method: 'POST', body: '{}' }), desc: 'POST Request 객체' }
        ];
        
        for (const testCase of testCases) {
            const testUrl = testCase.url;
            const displayUrl = testUrl instanceof Request ? `Request(${testUrl.url})` : testUrl;
            console.log(`\n?�� ?�스?? ${testCase.desc}`);
            console.log(`   URL: ${displayUrl}`);
            try {
                const response = await fetch(testUrl);
                console.log(`   ??결과: ${response.status} ${response.statusText}`);
                console.log(`   ?�� ?�제 URL: ${response.url}`);
                if (response.ok) {
                    try {
                        const data = await response.json();
                        console.log(`   ?�� ?�이?? ${data.total || 0}�?);
                    } catch (e) {
                        console.log(`   ?�️ JSON ?�싱 ?�패`);
                    }
                }
            } catch (error) {
                console.error(`   ???�패: ${error.message}`);
            }
        }
        
        console.log('\n?�� Fetch ?�버?�이???�스???�료\n');
    };
    
})();
