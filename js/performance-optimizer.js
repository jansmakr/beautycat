/**
 * Beautyket 성능 최적화 스크립트
 * v2.8.8.1.31 - 2026-01-13
 */

(function() {
    'use strict';

    // 1. 이미지 Lazy Loading
    function initLazyLoading() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // 네이티브 lazy loading 지원 확인
        if ('loading' in HTMLImageElement.prototype) {
            // 브라우저가 지원하면 모든 이미지에 loading="lazy" 추가
            const images = document.querySelectorAll('img:not([loading])');
            images.forEach(img => {
                img.loading = 'lazy';
            });
            if (isDev) console.log('✅ 네이티브 Lazy Loading 활성화:', images.length, '개 이미지');
        } else {
            // Intersection Observer로 폴백
            initIntersectionObserver();
        }
    }

    // 2. Intersection Observer 폴백
    function initIntersectionObserver() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const images = document.querySelectorAll('img[data-src]');
        
        if (images.length === 0) return;

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
        if (isDev) console.log('✅ Intersection Observer Lazy Loading:', images.length, '개 이미지');
    }

    // 3. 폰트 최적화 - Font Display Swap
    function optimizeFonts() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        // CSS에서 이미 font-display: swap 사용 중
        // 추가 최적화: 폰트 프리로드 확인
        const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');
        if (isDev) console.log('✅ 폰트 프리로드:', fontPreloads.length, '개');
    }

    // 4. CSS 최적화 - Critical CSS 체크
    function checkCriticalCSS() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isDev) return;
        
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const preloadStyles = document.querySelectorAll('link[rel="preload"][as="style"]');
        
        console.log('📊 CSS 로딩 현황:');
        console.log('  - Stylesheet:', stylesheets.length, '개');
        console.log('  - Preload:', preloadStyles.length, '개');
    }

    // 5. JavaScript 최적화 체크
    function checkJavaScriptLoading() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isDev) return;
        
        const scripts = document.querySelectorAll('script[src]');
        const deferScripts = document.querySelectorAll('script[defer]');
        const asyncScripts = document.querySelectorAll('script[async]');
        
        console.log('📊 JavaScript 로딩 현황:');
        console.log('  - 전체 스크립트:', scripts.length, '개');
        console.log('  - Defer:', deferScripts.length, '개');
        console.log('  - Async:', asyncScripts.length, '개');
        console.log('  - 블로킹:', scripts.length - deferScripts.length - asyncScripts.length, '개');
    }

    // 6. 이미지 WebP 변환 체크
    function checkWebPSupport() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isDev) return;
        
        const img = new Image();
        img.onload = function() {
            console.log('✅ WebP 지원됨');
        };
        img.onerror = function() {
            console.log('❌ WebP 미지원');
        };
        img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    }

    // 7. 캐싱 상태 체크
    function checkCacheStatus() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isDev) return;
        
        if ('caches' in window) {
            caches.keys().then(keys => {
                console.log('📦 캐시 현황:', keys.length, '개 캐시');
                keys.forEach(key => console.log('  -', key));
            });
        }
    }

    // 8. Performance API로 LCP 측정
    function measureLCP() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isDev) return;
        
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    console.log('📊 LCP (Largest Contentful Paint):');
                    console.log('  - 시간:', lastEntry.renderTime || lastEntry.loadTime, 'ms');
                    console.log('  - 요소:', lastEntry.element);
                    
                    // LCP 경고
                    const lcpTime = lastEntry.renderTime || lastEntry.loadTime;
                    if (lcpTime > 2500) {
                        console.warn('⚠️ LCP가 느립니다! 목표: 2500ms 이하');
                    } else {
                        console.log('✅ LCP가 좋습니다!');
                    }
                });
                
                observer.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (e) {
                // 무시
            }
        }
    }

    // 9. FCP 측정
    function measureFCP() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isDev) return;
        
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        console.log('📊 FCP (First Contentful Paint):', entry.startTime, 'ms');
                        
                        if (entry.startTime > 1800) {
                            console.warn('⚠️ FCP가 느립니다! 목표: 1800ms 이하');
                        } else {
                            console.log('✅ FCP가 좋습니다!');
                        }
                    });
                });
                
                observer.observe({ type: 'paint', buffered: true });
            } catch (e) {
                // 무시
            }
        }
    }

    // 10. CLS 측정
    function measureCLS() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isDev) return;
        
        if ('PerformanceObserver' in window) {
            try {
                let clsValue = 0;
                
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    
                    console.log('📊 CLS (Cumulative Layout Shift):', clsValue);
                    
                    if (clsValue > 0.1) {
                        console.warn('⚠️ CLS가 높습니다! 목표: 0.1 이하');
                    } else {
                        console.log('✅ CLS가 좋습니다!');
                    }
                });
                
                observer.observe({ type: 'layout-shift', buffered: true });
            } catch (e) {
                // 무시
            }
        }
    }

    // 11. 전체 성능 리포트
    function generatePerformanceReport() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isDev) return;
        
        console.log('');
        console.log('='.repeat(50));
        console.log('🚀 Beautyket 성능 리포트');
        console.log('='.repeat(50));
        
        // Navigation Timing
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
            const renderTime = timing.domComplete - timing.domLoading;
            
            console.log('📊 로딩 시간:');
            console.log('  - 페이지 로드:', loadTime, 'ms');
            console.log('  - DOM Ready:', domReadyTime, 'ms');
            console.log('  - 렌더링:', renderTime, 'ms');
        }
        
        console.log('='.repeat(50));
    }

    // 초기화 (✨ v2.8.8.1.37 - 프로덕션 로그 최소화)
    function init() {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isDev) {
            console.log('⚡ 성능 최적화 스크립트 로드됨');
        }
        
        // DOMContentLoaded 이후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initLazyLoading();
                optimizeFonts();
                checkCriticalCSS();
                checkJavaScriptLoading();
                checkWebPSupport();
                checkCacheStatus();
                measureLCP();
                measureFCP();
                measureCLS();
            });
        } else {
            // 이미 로드된 경우
            initLazyLoading();
            optimizeFonts();
            checkCriticalCSS();
            checkJavaScriptLoading();
            checkWebPSupport();
            checkCacheStatus();
            measureLCP();
            measureFCP();
            measureCLS();
        }
        
        // 페이지 완전 로드 후 리포트 (프로덕션에서는 생략)
        if (isDev) {
            window.addEventListener('load', function() {
                setTimeout(generatePerformanceReport, 1000);
            });
        }
    }

    // 실행
    init();

    // 전역 함수로 노출
    window.BeautyketPerformance = {
        measureLCP,
        measureFCP,
        measureCLS,
        generatePerformanceReport,
        checkWebPSupport
    };

})();

// ✨ v2.8.8.1.37 - 프로덕션에서는 로그 최소화
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
if (isDev) {
    console.log('✅ Beautyket 성능 최적화 모듈 로드 완료');
}
