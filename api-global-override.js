/**
 * BeautyCat Global API Fetch Override - Enhanced Version
 * Automatically converts all fetch('tables/...') calls to Cloudflare Workers API
 * Supports Request objects, absolute paths, and relative paths
 */

(function() {
    'use strict';
    
    const WORKERS_API_BASE = 'https://beautycat-api.jansmakr.workers.dev/api';
    const originalFetch = window.fetch.bind(window);
    const DEBUG = true;
    
    function convertToWorkersAPI(url) {
        if (typeof url !== 'string') {
            return url;
        }
        
        if (!url.includes('/tables/')) {
            return url;
        }
        
        try {
            const urlObj = new URL(url, window.location.origin);
            
            if (urlObj.origin === window.location.origin || 
                urlObj.hostname.includes('beautycat-v2.pages.dev')) {
                
                const pathname = urlObj.pathname;
                const search = urlObj.search;
                const hash = urlObj.hash;
                
                if (pathname.includes('/tables/')) {
                    const tablesIndex = pathname.indexOf('/tables/');
                    const apiPath = pathname.substring(tablesIndex + 1);
                    
                    const newUrl = `${WORKERS_API_BASE}/${apiPath}${search}${hash}`;
                    
                    if (DEBUG) {
                        console.log(`[API Override] ${url} -> ${newUrl}`);
                    }
                    
                    return newUrl;
                }
            }
        } catch (error) {
            console.warn('URL conversion error:', error.message, '- Using original URL:', url);
        }
        
        return url;
    }
    
    window.fetch = function(input, init) {
        try {
            if (input instanceof Request) {
                const originalUrl = input.url;
                const newUrl = convertToWorkersAPI(originalUrl);
                
                if (newUrl !== originalUrl) {
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
            
            if (typeof input === 'string') {
                const newUrl = convertToWorkersAPI(input);
                return originalFetch(newUrl, init);
            }
            
            return originalFetch(input, init);
            
        } catch (error) {
            console.error('Fetch override error:', error);
            return originalFetch(input, init);
        }
    };
    
    Object.setPrototypeOf(window.fetch, originalFetch);
    if (originalFetch.polyfill) {
        window.fetch.polyfill = true;
    }
    
    console.log('Global Fetch Override installed successfully');
    console.log('Workers API Base:', WORKERS_API_BASE);
    console.log('All fetch(\'/tables/...\') calls will be automatically converted');
    
    window.testFetchOverride = async function() {
        console.log('\nFetch Override Test Started...\n');
        
        const testCases = [
            'tables/users?limit=1',
            '/tables/users?limit=1',
            'https://beautycat-v2.pages.dev/tables/users?limit=1',
            new Request('/tables/users?limit=1', { method: 'POST' })
        ];
        
        for (const testUrl of testCases) {
            const displayUrl = testUrl instanceof Request ? `Request(${testUrl.url})` : testUrl;
            console.log(`Testing: ${displayUrl}`);
            try {
                const response = await fetch(testUrl);
                console.log('Success:', response.status, 'URL:', response.url);
            } catch (error) {
                console.error('Failed:', error.message);
            }
            console.log('');
        }
        
        console.log('Fetch Override Test Completed\n');
    };
    
})();
