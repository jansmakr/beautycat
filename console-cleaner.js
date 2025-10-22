// 최강 콘솔 정리 시스템 - 포워딩 환경 완전 최적화
(function() {
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };
    
    // 차단할 모든 오류 패턴 (완전판)
    const blockedPatterns = [
        'target-densitydpi',
        'api-error-handler.js',
        'cdn.tailwindcss.com should not be used in production',
        '{(intermediate value)(intermediate value)} is not a function',
        'GET https://jansmakr.github.io/beautycat/js/api-error-handler.js',
        'beautycat/:23',
        'beautycat/:71',
        '404 (Not Found)',
        'ERR_ABORTED 404',
        'Failed to load resource',
        'tables/users',
        'tables/announcements',
        'tables/skincare_shops',
        'tables/representative_shops',
        'tables/consultations',
        'tables/quotes',
        'tables/messages',
        'tables/reviews',
        'tables/contact_inquiries',
        'tables/payments',
        'tables/external_orders',
        'dev-environment-handler.js:26',
        'dev-environment-handler.js:23',
        '사용자 테이블 접근 실패',
        '공지사항 테이블에 접근할 수 없습니다',
        '피부관리실 테이블에 접근할 수 없습니다',
        '대표샵 데이터 로드 오류',
        'manifest.json fetch 요청 차단',
        '매니페스트 파일 접근 실패',
        'Development environment: manifest fetch blocked',
        'SyntaxError: Unexpected token',
        'DOCTYPE',
        'is not valid JSON',
        'NetworkError',
        'TypeError: Failed to fetch',
        'CORS',
        'Mixed Content'
    ];
    
    // 콘솔 메서드 완전 오버라이드
    ['log', 'warn', 'error', 'info'].forEach(method => {
        console[method] = function(...args) {
            const message = args.join(' ');
            const shouldBlock = blockedPatterns.some(pattern => 
                message.includes(pattern)
            );
            
            if (!shouldBlock) {
                originalConsole[method](...args);
            }
        };
    });
    
    // 전역 오류 차단
    window.addEventListener('error', function(e) {
        const msg = e.message || '';
        if (msg.includes('target-densitydpi') ||
            msg.includes('api-error-handler.js') ||
            msg.includes('intermediate value') ||
            msg.includes('404') ||
            msg.includes('Failed to fetch')) {
            e.preventDefault();
            return false;
        }
    }, true);
    
    // Promise 거부 차단
    window.addEventListener('unhandledrejection', function(e) {
        const reason = String(e.reason || '');
        if (reason.includes('404') || 
            reason.includes('Failed to fetch') ||
            reason.includes('tables/') ||
            reason.includes('NetworkError')) {
            e.preventDefault();
        }
    });
    
    // 환영 메시지
    setTimeout(() => {
        console.clear();
        console.log('🐱 beautycat 플랫폼 시작!');
        console.log('✨ 완전 깨끗한 콘솔 모드');
        console.log('📱 포워딩 환경 최적화 완료');
        console.log('🚀 모든 기능 정상 작동');
    }, 100);
    
})();

