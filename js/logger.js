// 프로덕션 환경 최적화 로깅 시스템
class Logger {
    constructor() {
        this.isDev = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.hostname.includes('dev');
        this.isProduction = !this.isDev;
    }
    
    // 개발 환경에서만 출력
    dev(...args) {
        if (this.isDev) {
            console.log('[DEV]', ...args);
        }
    }
    
    // 일반 정보 로그
    info(...args) {
        if (this.isDev) {
            console.info('[INFO]', ...args);
        }
    }
    
    // 경고 로그 (프로덕션에서도 출력)
    warn(...args) {
        console.warn('[WARN]', ...args);
    }
    
    // 에러 로그 (항상 출력)
    error(...args) {
        console.error('[ERROR]', ...args);
        
        // 프로덕션에서는 에러 로그를 서버에 전송할 수 있음
        if (this.isProduction) {
            this.sendErrorToServer(...args);
        }
    }
    
    // 성공 로그 (개발 환경에서만)
    success(...args) {
        if (this.isDev) {
            console.log('[SUCCESS] ✅', ...args);
        }
    }
    
    // 디버그 로그 (개발 환경에서만)
    debug(...args) {
        if (this.isDev) {
            console.debug('[DEBUG] 🐛', ...args);
        }
    }
    
    // 성능 측정 시작
    time(label) {
        if (this.isDev) {
            console.time(`[PERF] ${label}`);
        }
    }
    
    // 성능 측정 종료
    timeEnd(label) {
        if (this.isDev) {
            console.timeEnd(`[PERF] ${label}`);
        }
    }
    
    // 프로덕션 환경에서 에러를 서버에 전송 (향후 구현)
    sendErrorToServer(...args) {
        // 향후 에러 추적 서비스 연동
        // 예: Sentry, LogRocket 등
        try {
            // 서버 전송 로직 (현재는 비활성화)
            // fetch('/api/log-error', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         error: args.join(' '),
            //         url: window.location.href,
            //         userAgent: navigator.userAgent,
            //         timestamp: new Date().toISOString()
            //     })
            // });
        } catch (e) {
            // 에러 전송 실패는 조용히 무시
        }
    }
}

// 전역 logger 인스턴스 생성
window.logger = new Logger();

// 전역 에러 핸들러
window.addEventListener('error', (event) => {
    logger.error('Global Error:', event.error?.message || event.message);
});

// Promise rejection 핸들러
window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection:', event.reason);
});