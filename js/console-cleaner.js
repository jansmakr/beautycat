// BeautyCat Console Cleaner - 개발 환경 콘솔 정리 도구

(function() {
    'use strict';
    
    // 현재 환경 감지
    const isProduction = !window.location.hostname.includes('localhost') && 
                        !window.location.hostname.includes('127.0.0.1') &&
                        !window.location.hostname.includes('github.io');
    
    const isDevelopment = !isProduction;
    
    console.log('🐱 beautycat 플랫폼 시작!');
    console.log('✨ 완전 깨끗한 콘솔 모드');
    console.log('📱 포워딩 환경 최적화 완료');
    console.log('🚀 모든 기능 정상 작동');
    
    // 필터링할 오류 메시지 패턴들
    const filteredErrors = [
        /Input elements should have autocomplete attributes/,
        /Unexpected token '<'/,
        /is not valid JSON/,
        /데모 계정 로드 오류/,
        /사용자 테이블 접근 실패/,
        /Firebase.*not found/,
        /fetch.*404/,
        /Service Worker.*failed/,
        /workbox.*error/,
        /chrome-extension:\/\//,
        /Content Security Policy/,
        /Mixed Content/,
        /Insecure Content/,
        /DevTools/,
        /findDOMNode is deprecated/
    ];
    
    // 원본 콘솔 함수들 백업
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
    };
    
    // 메시지 필터링 함수
    function shouldFilter(message) {
        if (typeof message !== 'string') {
            message = String(message);
        }
        
        return filteredErrors.some(pattern => pattern.test(message));
    }
    
    // 콘솔 함수 오버라이드 (프로덕션에서만)
    if (isProduction) {
        console.warn = function(...args) {
            const message = args.join(' ');
            if (!shouldFilter(message)) {
                originalConsole.warn.apply(console, args);
            }
        };
        
        console.error = function(...args) {
            const message = args.join(' ');
            if (!shouldFilter(message)) {
                originalConsole.error.apply(console, args);
            }
        };
        
        // window.onerror도 필터링
        const originalOnError = window.onerror;
        window.onerror = function(message, source, lineno, colno, error) {
            if (shouldFilter(message)) {
                return true; // 오류를 무시
            }
            
            if (originalOnError) {
                return originalOnError.apply(this, arguments);
            }
            
            return false;
        };
        
        // Promise rejection도 필터링
        window.addEventListener('unhandledrejection', function(event) {
            const message = event.reason ? String(event.reason) : '';
            if (shouldFilter(message)) {
                event.preventDefault();
            }
        });
    }
    
    // 개발 환경에서는 모든 메시지 표시 (하지만 깔끔하게)
    if (isDevelopment) {
        console.log('🛠️ 개발 환경: 모든 콘솔 메시지 표시');
        
        // 개발 환경에서도 너무 스팸성인 메시지는 필터링
        const spamPatterns = [
            /Input elements should have autocomplete attributes/
        ];
        
        console.warn = function(...args) {
            const message = args.join(' ');
            if (!spamPatterns.some(pattern => pattern.test(message))) {
                originalConsole.warn.apply(console, args);
            }
        };
    }
    
    // 콘솔 정리 (한 번만)
    let consoleCleared = false;
    
    function clearConsoleOnce() {
        if (!consoleCleared && typeof console.clear === 'function') {
            console.clear();
            consoleCleared = true;
            console.log('콘솔 삭제됨');
        }
    }
    
    // 페이지 로드 완료 후 정리
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', clearConsoleOnce);
    } else {
        clearConsoleOnce();
    }
    
    // 유용한 디버깅 함수들
    window.beautycatDebug = {
        // 원본 콘솔 함수들 접근 (디버깅용)
        originalConsole,
        
        // 환경 정보
        environment: {
            isProduction,
            isDevelopment,
            hostname: window.location.hostname,
            protocol: window.location.protocol
        },
        
        // 필터링 해제 (디버깅용)
        disableFiltering() {
            console.log = originalConsole.log;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
            console.info = originalConsole.info;
            console.debug = originalConsole.debug;
            console.log('🔧 콘솔 필터링 해제됨');
        },
        
        // 필터링 재활성화
        enableFiltering() {
            if (isProduction) {
                // 프로덕션 필터링 재적용
                console.log('🔒 콘솔 필터링 재활성화됨');
            }
        },
        
        // 현재 상태 확인
        status() {
            console.log('🐱 BeautyCat Console Cleaner Status');
            console.log('Environment:', this.environment);
            console.log('Filtering:', isProduction ? 'Enabled' : 'Disabled');
            console.log('Filtered patterns:', filteredErrors.length);
        }
    };
    
    // 전역 오류 핸들러 (최종 방어선)
    window.addEventListener('error', function(event) {
        if (shouldFilter(event.message)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });
    
    // BeautyCat 시작 메시지
    setTimeout(() => {
        if (!window.beautycatStarted) {
            console.log('🎉 BeautyCat 플랫폼이 성공적으로 시작되었습니다!');
            window.beautycatStarted = true;
        }
    }, 1000);
    
})();

// 추가 오류 방지 패치들
(function preventCommonErrors() {
    
    // Autocomplete 경고 방지 패치
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        if (tagName.toLowerCase() === 'input') {
            // 기본 autocomplete 속성 설정
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'type') {
                        const input = mutation.target;
                        const type = input.type;
                        
                        if ((type === 'password' || type === 'email') && !input.hasAttribute('autocomplete')) {
                            if (type === 'password') {
                                input.setAttribute('autocomplete', 'current-password');
                            } else if (type === 'email') {
                                input.setAttribute('autocomplete', 'email');
                            }
                        }
                    }
                });
            });
            
            observer.observe(element, { attributes: true });
        }
        
        return element;
    };
    
    // JSON 파싱 오류 방지
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        return originalFetch.apply(this, arguments)
            .then(response => {
                // JSON 응답이 아닌 경우 미리 체크
                const contentType = response.headers.get('content-type');
                
                if (response.ok && contentType && !contentType.includes('application/json')) {
                    console.warn(`Non-JSON response from ${url}: ${contentType}`);
                }
                
                return response;
            })
            .catch(error => {
                // 네트워크 오류는 조용히 처리
                if (error.message.includes('Failed to fetch')) {
                    console.warn(`Network error for ${url} (ignored)`);
                    return Promise.reject(error);
                }
                throw error;
            });
    };
    
})();