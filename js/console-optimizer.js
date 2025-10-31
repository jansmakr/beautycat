/**
 * 뽀샵 콘솔 오류 최적화 도구
 * 불필요한 오류 메시지를 필터링하고 개발자 친화적인 로깅 제공
 */

class ConsoleOptimizer {
    constructor() {
        this.originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
        };
        
        this.errorFilters = [
            // Service Worker 관련 일반적인 오류들 (무시해도 되는 것들)
            /Failed to load resource.*403/,
            /Failed to load resource.*401/,
            /challenges\.cloudflare\.com/,
            /WebGPU is experimental/,
            /Failed to create WebGPU Context/,
            
            // 브라우저 보안 관련
            /Private Access Token/,
            /net::ERR_BLOCKED_BY_ORB/,
            /net::ERR_NAME_NOT_RESOLVED/,
            
            // 개발 환경에서 정상적인 오류들
            /preloaded using link preload but not used/
        ];
        
        this.init();
    }

    init() {
        this.setupConsoleFiltering();
        this.setupGlobalErrorHandling();
        console.log('🧹 뽀샵 콘솔 최적화 활성화');
    }

    // 콘솔 메시지 필터링
    setupConsoleFiltering() {
        // 에러 메시지 필터링
        console.error = (...args) => {
            const message = args.join(' ');
            
            // 필터링할 오류인지 확인
            const shouldFilter = this.errorFilters.some(filter => 
                filter.test(message)
            );
            
            if (!shouldFilter) {
                // 실제 개발에 필요한 오류만 출력
                this.originalConsole.error('🚨 뽀샵 오류:', ...args);
            } else {
                // 필터링된 오류는 조용히 처리
                this.originalConsole.log('🔇 필터링된 오류:', message.substring(0, 50) + '...');
            }
        };

        // 경고 메시지 최적화
        console.warn = (...args) => {
            const message = args.join(' ');
            
            if (message.includes('tailwindcss.com should not be used in production')) {
                // Tailwind 프로덕션 경고는 한 번만 표시
                if (!this.shownWarnings?.tailwindProduction) {
                    this.shownWarnings = this.shownWarnings || {};
                    this.shownWarnings.tailwindProduction = true;
                    this.originalConsole.warn('⚠️ 뽀샵 알림: Tailwind CSS는 pposhop-styles.css로 대체 사용 중');
                }
                return;
            }
            
            this.originalConsole.warn('⚠️ 뽀샵 경고:', ...args);
        };
    }

    // 전역 에러 처리
    setupGlobalErrorHandling() {
        // 처리되지 않은 Promise 거부
        window.addEventListener('unhandledrejection', (event) => {
            const message = event.reason?.message || event.reason;
            
            // 일반적인 네트워크 오류는 조용히 처리
            if (typeof message === 'string' && 
                (message.includes('Failed to fetch') || 
                 message.includes('NetworkError') ||
                 message.includes('Load failed'))) {
                
                console.log('🌐 네트워크 연결 확인 중...');
                event.preventDefault(); // 브라우저 기본 오류 표시 방지
                return;
            }
            
            // 중요한 Promise 거부만 표시
            this.originalConsole.error('🚨 뽀샵 Promise 오류:', message);
        });

        // 일반적인 JavaScript 오류
        window.addEventListener('error', (event) => {
            const message = event.message;
            
            // 리소스 로딩 오류 필터링
            if (event.target && event.target !== window) {
                const resourceType = event.target.tagName?.toLowerCase();
                const resourceSrc = event.target.src || event.target.href;
                
                console.log(`📁 리소스 로딩 이슈 (${resourceType}):`, resourceSrc);
                return;
            }
            
            // 스크립트 오류만 중요하게 처리
            this.originalConsole.error('🚨 뽀샵 스크립트 오류:', message, 'at', event.filename, ':', event.lineno);
        });
    }

    // 개발자 친화적인 로깅 메서드
    static success(message, data = null) {
        console.log(`✅ 뽀샵 성공: ${message}`, data || '');
    }

    static info(message, data = null) {
        console.log(`ℹ️ 뽀샵 정보: ${message}`, data || '');
    }

    static debug(message, data = null) {
        if (this.isDebugMode()) {
            console.log(`🐛 뽀샵 디버그: ${message}`, data || '');
        }
    }

    static system(message, data = null) {
        console.log(`⚙️ 뽀샵 시스템: ${message}`, data || '');
    }

    // 디버그 모드 확인
    static isDebugMode() {
        return localStorage.getItem('pposhop_debug') === 'true' || 
               window.location.hostname === 'localhost' ||
               window.location.search.includes('debug=true');
    }

    // 콘솔 정리
    static clearConsole() {
        console.clear();
        console.log('🧹 뽀샵 콘솔 정리 완료');
        console.log('🗺️ 지역별 매칭 시스템 활성화');
        
        // 현재 시스템 상태 표시
        if (typeof window.regionalMatching !== 'undefined') {
            console.log('✅ 지역별 매칭 엔진 로드됨');
        }
        
        if ('serviceWorker' in navigator) {
            console.log('✅ Service Worker 지원');
        }
    }

    // 성능 모니터링
    static measurePerformance(label, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`⚡ 뽀샵 성능 [${label}]: ${(end - start).toFixed(2)}ms`);
        
        return result;
    }

    // 시스템 상태 체크
    static checkSystemHealth() {
        const health = {
            regionalMatching: typeof window.regionalMatching !== 'undefined',
            serviceWorker: 'serviceWorker' in navigator,
            localStorage: typeof Storage !== 'undefined',
            fetch: typeof fetch !== 'undefined',
            promises: typeof Promise !== 'undefined'
        };
        
        console.group('🏥 뽀샵 시스템 상태');
        Object.entries(health).forEach(([key, status]) => {
            console.log(`${status ? '✅' : '❌'} ${key}: ${status ? 'OK' : 'NOT AVAILABLE'}`);
        });
        console.groupEnd();
        
        return health;
    }
}

// 전역 인스턴스 생성
window.consoleOptimizer = new ConsoleOptimizer();

// 전역 유틸리티 함수들
window.pplog = {
    success: ConsoleOptimizer.success,
    info: ConsoleOptimizer.info,
    debug: ConsoleOptimizer.debug,
    system: ConsoleOptimizer.system,
    clear: ConsoleOptimizer.clearConsole,
    measure: ConsoleOptimizer.measurePerformance,
    health: ConsoleOptimizer.checkSystemHealth
};

// 개발자 도구 단축키
window.addEventListener('keydown', (e) => {
    // Ctrl+Shift+C: 콘솔 정리
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
        ConsoleOptimizer.clearConsole();
    }
    
    // Ctrl+Shift+H: 시스템 상태 체크
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyH') {
        ConsoleOptimizer.checkSystemHealth();
    }
});

console.log('🧹 뽀샵 콘솔 최적화 로드 완료');
console.log('💡 사용법: pplog.success("메시지"), pplog.health(), Ctrl+Shift+C (정리)');