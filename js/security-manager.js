/**
 * Security Manager
 * 보안 관련 기능 관리
 */

(function() {
    'use strict';

    console.log('🔒 Security Manager 로드됨');

    // 전역 보안 설정 객체
    window.securityConfig = {
        // XSS 방지 설정
        xssProtection: true,
        // CSRF 방지 설정
        csrfProtection: false, // 정적 사이트이므로 기본적으로 비활성화
        // 입력 검증 활성화
        inputValidation: true,
        // 세션 타임아웃 (밀리초)
        sessionTimeout: 30 * 60 * 1000, // 30분
        // 최대 로그인 시도 횟수
        maxLoginAttempts: 5,
        // 로그인 시도 차단 시간 (밀리초)
        loginBlockDuration: 15 * 60 * 1000 // 15분
    };

    /**
     * XSS 방지를 위한 HTML 이스케이프
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} - 이스케이프된 텍스트
     */
    window.escapeHtml = function(text) {
        if (!window.securityConfig.xssProtection) {
            return text;
        }

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;'
        };

        return String(text).replace(/[&<>"'/]/g, function(s) {
            return map[s];
        });
    };

    /**
     * 입력 검증
     * @param {string} input - 검증할 입력
     * @param {string} type - 입력 타입 (email, phone, password 등)
     * @returns {boolean} - 유효성 여부
     */
    window.validateInput = function(input, type) {
        if (!window.securityConfig.inputValidation) {
            return true;
        }

        const patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
            password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
            username: /^[a-zA-Z0-9_]{3,20}$/,
            name: /^[가-힣a-zA-Z\s]{2,50}$/,
            businessNumber: /^[0-9]{3}-?[0-9]{2}-?[0-9]{5}$/,
            zipcode: /^[0-9]{5}$/
        };

        if (!patterns[type]) {
            console.warn(`⚠️ 알 수 없는 검증 타입: ${type}`);
            return true;
        }

        return patterns[type].test(input);
    };

    /**
     * SQL Injection 방지를 위한 입력 정제
     * @param {string} input - 정제할 입력
     * @returns {string} - 정제된 입력
     */
    window.sanitizeInput = function(input) {
        if (typeof input !== 'string') {
            return input;
        }

        // 정규표현식 특수문자를 이스케이프하는 함수
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        // 위험한 SQL 키워드 제거
        const sqlKeywords = [
            'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
            'EXEC', 'EXECUTE', 'SCRIPT', 'UNION'
        ];

        // 특수문자는 단순 문자열 replace 사용
        let sanitized = input;
        
        // SQL 키워드 제거 (정규표현식 사용)
        sqlKeywords.forEach(keyword => {
            const regex = new RegExp(escapeRegExp(keyword), 'gi');
            sanitized = sanitized.replace(regex, '');
        });
        
        // 특수문자는 직접 replace (정규표현식 사용하지 않음)
        sanitized = sanitized.replace(/--/g, '');
        sanitized = sanitized.replace(/\/\*/g, '');
        sanitized = sanitized.replace(/\*\//g, '');
        sanitized = sanitized.replace(/;/g, '');

        return sanitized.trim();
    };

    /**
     * 세션 관리
     */
    window.sessionManager = {
        // 세션 시작
        start: function(userId, userType) {
            const session = {
                userId: userId,
                userType: userType,
                startTime: Date.now(),
                lastActivity: Date.now()
            };

            localStorage.setItem('session', JSON.stringify(session));
            this.startActivityMonitor();
            console.log('✅ 세션 시작:', session);
        },

        // 세션 종료
        end: function() {
            localStorage.removeItem('session');
            this.stopActivityMonitor();
            console.log('✅ 세션 종료');
        },

        // 세션 확인
        isActive: function() {
            const session = this.get();
            if (!session) {
                return false;
            }

            const now = Date.now();
            const elapsed = now - session.lastActivity;

            if (elapsed > window.securityConfig.sessionTimeout) {
                console.warn('⚠️ 세션 타임아웃');
                this.end();
                return false;
            }

            return true;
        },

        // 세션 정보 가져오기
        get: function() {
            try {
                const sessionData = localStorage.getItem('session');
                return sessionData ? JSON.parse(sessionData) : null;
            } catch (error) {
                console.error('❌ 세션 데이터 파싱 오류:', error);
                return null;
            }
        },

        // 마지막 활동 시간 업데이트
        updateActivity: function() {
            const session = this.get();
            if (session) {
                session.lastActivity = Date.now();
                localStorage.setItem('session', JSON.stringify(session));
            }
        },

        // 활동 모니터링 시작
        startActivityMonitor: function() {
            // 사용자 활동 감지 이벤트
            const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
            
            this.activityHandler = () => {
                this.updateActivity();
            };

            events.forEach(event => {
                document.addEventListener(event, this.activityHandler);
            });

            // 주기적인 세션 확인 (1분마다)
            this.sessionCheckInterval = setInterval(() => {
                if (!this.isActive()) {
                    console.warn('⚠️ 세션이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = 'login.html';
                }
            }, 60000);
        },

        // 활동 모니터링 중지
        stopActivityMonitor: function() {
            if (this.activityHandler) {
                const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
                events.forEach(event => {
                    document.removeEventListener(event, this.activityHandler);
                });
            }

            if (this.sessionCheckInterval) {
                clearInterval(this.sessionCheckInterval);
            }
        }
    };

    /**
     * 로그인 시도 제한
     */
    window.loginAttemptManager = {
        // 로그인 시도 기록
        record: function(username, success) {
            const attempts = this.getAttempts(username);
            
            if (success) {
                // 성공 시 기록 삭제
                this.clearAttempts(username);
                return true;
            }

            attempts.count++;
            attempts.lastAttempt = Date.now();

            if (attempts.count >= window.securityConfig.maxLoginAttempts) {
                attempts.blocked = true;
                attempts.blockUntil = Date.now() + window.securityConfig.loginBlockDuration;
            }

            localStorage.setItem(`login_attempts_${username}`, JSON.stringify(attempts));
            return !attempts.blocked;
        },

        // 로그인 시도 정보 가져오기
        getAttempts: function(username) {
            try {
                const data = localStorage.getItem(`login_attempts_${username}`);
                return data ? JSON.parse(data) : { count: 0, blocked: false };
            } catch (error) {
                return { count: 0, blocked: false };
            }
        },

        // 로그인 차단 확인
        isBlocked: function(username) {
            const attempts = this.getAttempts(username);
            
            if (!attempts.blocked) {
                return false;
            }

            // 차단 시간이 지났는지 확인
            if (Date.now() > attempts.blockUntil) {
                this.clearAttempts(username);
                return false;
            }

            return true;
        },

        // 남은 차단 시간 (분)
        getRemainingBlockTime: function(username) {
            const attempts = this.getAttempts(username);
            if (!attempts.blocked) {
                return 0;
            }

            const remaining = attempts.blockUntil - Date.now();
            return Math.ceil(remaining / 60000); // 분 단위
        },

        // 시도 기록 삭제
        clearAttempts: function(username) {
            localStorage.removeItem(`login_attempts_${username}`);
        }
    };

    /**
     * 비밀번호 강도 검사
     * @param {string} password - 검사할 비밀번호
     * @returns {object} - 강도 정보 {score, feedback}
     */
    window.checkPasswordStrength = function(password) {
        let score = 0;
        const feedback = [];

        // 길이 검사
        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('최소 8자 이상이어야 합니다');
        }

        if (password.length >= 12) {
            score += 1;
        }

        // 대문자 포함
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('대문자를 포함해야 합니다');
        }

        // 소문자 포함
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('소문자를 포함해야 합니다');
        }

        // 숫자 포함
        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('숫자를 포함해야 합니다');
        }

        // 특수문자 포함
        if (/[@$!%*#?&]/.test(password)) {
            score += 1;
        } else {
            feedback.push('특수문자를 포함하면 더 안전합니다');
        }

        // 강도 레벨 결정
        let level = '매우 약함';
        if (score >= 5) level = '강함';
        else if (score >= 4) level = '보통';
        else if (score >= 2) level = '약함';

        return {
            score: score,
            level: level,
            feedback: feedback
        };
    };

    /**
     * 안전한 랜덤 문자열 생성
     * @param {number} length - 생성할 문자열 길이
     * @returns {string} - 랜덤 문자열
     */
    window.generateSecureToken = function(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            token += chars[randomIndex];
        }
        
        return token;
    };

    /**
     * 보안 매니저 객체 (auth.js 호환성)
     */
    window.securityManager = {
        // 비밀번호 해시화 (간단한 SHA-256 사용)
        hashPassword: async function(password, salt = null) {
            // Salt가 없으면 생성
            if (!salt) {
                salt = generateSecureToken(16);
            }
            
            // 비밀번호 + Salt 조합
            const combined = password + salt;
            
            // SHA-256 해시 (Web Crypto API 사용)
            const encoder = new TextEncoder();
            const data = encoder.encode(combined);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return {
                hash: hash,
                salt: salt
            };
        },

        // 비밀번호 강도 검증
        validatePasswordStrength: function(password) {
            const result = checkPasswordStrength(password);
            return {
                isStrong: result.score >= 4,
                message: result.feedback.join(', '),
                level: result.level
            };
        },

        // 입력 정제
        sanitizeInput: function(input) {
            return sanitizeInput(input);
        },

        // 입력 검증
        validateInput: function(input, type) {
            return validateInput(input, type);
        },

        // 세션 생성
        createSession: async function(user) {
            sessionManager.start(user.id, user.user_type);
            return true;
        },

        // 로그인 시도 확인
        checkLoginAttempts: function(email) {
            if (loginAttemptManager.isBlocked(email)) {
                const remaining = loginAttemptManager.getRemainingBlockTime(email);
                throw new Error(`너무 많은 로그인 시도로 차단되었습니다. ${remaining}분 후 다시 시도하세요.`);
            }
        },

        // 로그인 실패 기록
        recordFailedLogin: function(email) {
            loginAttemptManager.record(email, false);
        },

        // 로그인 성공 시 시도 기록 삭제
        clearLoginAttempts: function(email) {
            loginAttemptManager.clearAttempts(email);
        }
    };

    console.log('✅ Security Manager 설정 완료');
    console.log('🔒 사용 가능한 함수:');
    console.log('  - escapeHtml(text)');
    console.log('  - validateInput(input, type)');
    console.log('  - sanitizeInput(input)');
    console.log('  - sessionManager.start(userId, userType)');
    console.log('  - sessionManager.end()');
    console.log('  - sessionManager.isActive()');
    console.log('  - loginAttemptManager.record(username, success)');
    console.log('  - loginAttemptManager.isBlocked(username)');
    console.log('  - checkPasswordStrength(password)');
    console.log('  - generateSecureToken(length)');

})();
