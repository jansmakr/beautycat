/**
 * BeautyCat ê¸€ë¡œë²Œ API Fetch ?¤ë²„?¼ì´??v2.3.6.2
 * ëª¨ë“  fetch('tables/...') ?¸ì¶œ??Cloudflare Workers APIë¡??ë™ ë³€?? * 
 * ?”¥ HOTFIX v2.3.6.2: sort=timestamp ??sort=created_at ?ë™ ë³€?? * 
 * ???Œì¼?€ ëª¨ë“  HTML ?Œì¼?ì„œ ê°€??ë¨¼ì? ë¡œë“œ?˜ì–´???©ë‹ˆ??
 * ?…ë°?´íŠ¸: 2024-11-16 v2.3.6.2
 */

console.log('?? API Global Override v2.3.6.2 - timestamp ?«í”½???œì„±??);

(function() {
    'use strict';
    
    // Workers API ê¸°ë³¸ URL
    const WORKERS_API_BASE = 'https://beautycat-api.jansmakr.workers.dev/api';
    
    // ?ë³¸ fetch ?¨ìˆ˜ ë°±ì—…
    const originalFetch = window.fetch;
    
    // ?”ë²„ê·?ëª¨ë“œ (ì½˜ì†” ë¡œê·¸ ì¶œë ¥)
    const DEBUG = true;
    
    /**
     * ê¸€ë¡œë²Œ fetch ?¤ë²„?¼ì´??     */
    window.fetch = function(url, options) {
        // Request ê°ì²´ ì²˜ë¦¬
        if (url instanceof Request) {
            const originalUrl = url.url;
            if (originalUrl.includes('/tables/') || originalUrl.startsWith('tables/')) {
                try {
                    let targetUrl = originalUrl;
                    
                    // ?ë? ê²½ë¡œ ì²˜ë¦¬
                    if (originalUrl.startsWith('tables/') || originalUrl.startsWith('/tables/')) {
                        const cleanPath = originalUrl.replace(/^\//, '');
                        targetUrl = `${WORKERS_API_BASE}/${cleanPath}`;
                    }
                    // ?ˆë? ê²½ë¡œ ì²˜ë¦¬
                    else if (originalUrl.match(/^https?:\/\//)) {
                        const urlObj = new URL(originalUrl);
                        if (urlObj.pathname.startsWith('/tables/')) {
                            const cleanPath = urlObj.pathname.replace(/^\//, '');
                            targetUrl = `${WORKERS_API_BASE}/${cleanPath}${urlObj.search}${urlObj.hash}`;
                        }
                    }
                    
                    if (targetUrl !== originalUrl) {
                        if (DEBUG) {
                            console.log(`?”„ [Request ë³€?? ${originalUrl} ??${targetUrl}`);
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
                    console.error('??Request ?¤ë²„?¼ì´???¤ë¥˜:', error);
                }
            }
            return originalFetch(url, options);
        }
        
        // URL??ë¬¸ì?´ì¸ì§€ ?•ì¸
        if (typeof url !== 'string') {
            return originalFetch(url, options);
        }
        
        // ?”¥ ê¸´ê¸‰ ?«í”½?? sort=timestamp ??sort=created_at ?ë™ ë³€??(ìµœìš°??ì²˜ë¦¬)
        let processedUrl = url;
        if (typeof url === 'string' && url.includes('sort=timestamp')) {
            processedUrl = url.replace(/sort=timestamp/g, 'sort=created_at');
            console.log('?”¥ HOTFIX: sort=timestamp ??sort=created_at ?ë™ ë³€??);
            console.log(`   Before: ${url}`);
            console.log(`   After:  ${processedUrl}`);
        }
        
        // /tables/ ?ëŠ” tables/ ê²½ë¡œê°€ ?¬í•¨?˜ì–´ ?ˆëŠ”ì§€ ?•ì¸
        if (processedUrl.includes('/tables/') || processedUrl.startsWith('tables/')) {
            try {
                let targetUrl = processedUrl;
                
                // ?ë? ê²½ë¡œ ì²˜ë¦¬ (tables/users, /tables/users)
                if (processedUrl.startsWith('tables/') || processedUrl.startsWith('/tables/')) {
                    // ?ì˜ ?¬ë˜???œê±°
                    const cleanPath = processedUrl.replace(/^\//, '');
                    
                    // ?”¥ CRITICAL FIX: sort=timestampë¥?sort=created_atë¡?ë³€??                    const finalPath = cleanPath.replace(/sort=timestamp/g, 'sort=created_at');
                    
                    targetUrl = `${WORKERS_API_BASE}/${finalPath}`;
                    
                    if (DEBUG) {
                        console.log(`?”„ [?ë?ê²½ë¡œ ë³€?? ${processedUrl} ??${targetUrl}`);
                    }
                }
                // ?ˆë? ê²½ë¡œ ì²˜ë¦¬ (https://beautycat-v2.pages.dev/tables/users)
                else if (processedUrl.match(/^https?:\/\//)) {
                    const urlObj = new URL(processedUrl);
                    if (urlObj.pathname.startsWith('/tables/')) {
                        const cleanPath = urlObj.pathname.replace(/^\//, '');
                        
                        // ?”¥ CRITICAL FIX: search ?Œë¼ë¯¸í„°?ì„œ??sort=timestamp ë³€??                        let finalSearch = urlObj.search.replace(/sort=timestamp/g, 'sort=created_at');
                        
                        targetUrl = `${WORKERS_API_BASE}/${cleanPath}${finalSearch}${urlObj.hash}`;
                        
                        if (DEBUG) {
                            console.log(`?”„ [?ˆë?ê²½ë¡œ ë³€?? ${processedUrl} ??${targetUrl}`);
                        }
                    }
                }
                
                // ë³€?˜ëœ URLë¡?fetch ?¸ì¶œ
                return originalFetch(targetUrl, options);
                
            } catch (error) {
                console.error('??API ?¤ë²„?¼ì´???¤ë¥˜:', error);
                // ?¤ë¥˜ ë°œìƒ ???ë³¸ fetch ?¬ìš©
                return originalFetch(url, options);
            }
        }
        
        // /tables/ ê²½ë¡œê°€ ?„ë‹Œ ê²½ìš° ?ë³¸ fetch ?¬ìš©
        return originalFetch(url, options);
    };
    
    // ?¤ë²„?¼ì´???¤ì¹˜ ?•ì¸
    console.log('??ê¸€ë¡œë²Œ Fetch ?¤ë²„?¼ì´???¤ì¹˜ ?„ë£Œ');
    console.log('?“¡ Workers API Base:', WORKERS_API_BASE);
    console.log('?”§ ëª¨ë“  fetch(\'/tables/...\') ?¸ì¶œ???ë™?¼ë¡œ ë³€?˜ë©?ˆë‹¤');
    
    // ?ŒìŠ¤???¨ìˆ˜ (ê°œë°œ???„êµ¬?ì„œ ?¬ìš© ê°€??
    window.testFetchOverride = async function() {
        console.log('\n?§ª Fetch ?¤ë²„?¼ì´???ŒìŠ¤???œì‘...\n');
        
        const testCases = [
            { url: 'tables/users?limit=1', desc: '?¬ë˜???†ëŠ” ?ë? ê²½ë¡œ' },
            { url: '/tables/users?limit=1', desc: '?¬ë˜???ˆëŠ” ?ë? ê²½ë¡œ' },
            { url: 'https://beautycat-v2.pages.dev/tables/users?limit=1', desc: 'Pages ?ˆë? ê²½ë¡œ' },
            { url: new Request('/tables/users?limit=1', { method: 'POST', body: '{}' }), desc: 'POST Request ê°ì²´' }
        ];
        
        for (const testCase of testCases) {
            const testUrl = testCase.url;
            const displayUrl = testUrl instanceof Request ? `Request(${testUrl.url})` : testUrl;
            console.log(`\n?“ ?ŒìŠ¤?? ${testCase.desc}`);
            console.log(`   URL: ${displayUrl}`);
            try {
                const response = await fetch(testUrl);
                console.log(`   ??ê²°ê³¼: ${response.status} ${response.statusText}`);
                console.log(`   ?“ ?¤ì œ URL: ${response.url}`);
                if (response.ok) {
                    try {
                        const data = await response.json();
                        console.log(`   ?“Š ?°ì´?? ${data.total || 0}ê°?);
                    } catch (e) {
                        console.log(`   ? ï¸ JSON ?Œì‹± ?¤íŒ¨`);
                    }
                }
            } catch (error) {
                console.error(`   ???¤íŒ¨: ${error.message}`);
            }
        }
        
        console.log('\n?§ª Fetch ?¤ë²„?¼ì´???ŒìŠ¤???„ë£Œ\n');
    };
    
})();
