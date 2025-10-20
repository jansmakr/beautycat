// 보안 강화 모듈
class SecurityManager {
    constructor() {
        this.encryptionKey = this.generateEncryptionKey();
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24시간
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15분
    }

    // 암호화 키 생성
    generateEncryptionKey() {
        return btoa(Date.now().toString() + Math.random().toString(36));
    }

    // 비밀번호 해시화 (클라이언트 사이드 보조 해싱)
    async hashPassword(password, salt = null) {
        if (!salt) {
            salt = this.generateSalt();
        }
        
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return {
            hash: hashHex,
            salt: salt
        };
    }

    // 솔트 생성
    generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array));
    }

    // 보안 토큰 생성 (JWT 유사)
    generateSecureToken(userId, userType) {
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };
        
        const payload = {
            userId: userId,
            userType: userType,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간
        };
        
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        const signature = this.createSignature(encodedHeader + '.' + encodedPayload);
        
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    // 서명 생성
    createSignature(data) {
        // 실제 운영에서는 서버 사이드 비밀키 사용
        return btoa(data + this.encryptionKey).substring(0, 32);
    }

    // 토큰 검증
    verifyToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            const signature = parts[2];

            // 서명 검증
            const expectedSignature = this.createSignature(parts[0] + '.' + parts[1]);
            if (signature !== expectedSignature) {
                return null;
            }

            // 만료 시간 검증
            if (payload.exp < Math.floor(Date.now() / 1000)) {
                return null;
            }

            return payload;
        } catch (error) {
            return null;
        }
    }

    // 로그인 시도 제한 확인
    checkLoginAttempts(email) {
        const key = `login_attempts_${email}`;
        const attempts = JSON.parse(localStorage.getItem(key) || '{"count": 0, "lastAttempt": 0}');
        
        const now = Date.now();
        
        // 락아웃 시간 체크
        if (attempts.count >= this.maxLoginAttempts) {
            if (now - attempts.lastAttempt < this.lockoutDuration) {
                const remainingTime = Math.ceil((this.lockoutDuration - (now - attempts.lastAttempt)) / 60000);
                throw new Error(`너무 많은 로그인 시도로 계정이 잠겼습니다. ${remainingTime}분 후 다시 시도해주세요.`);
            } else {
                // 락아웃 시간이 지나면 카운트 리셋
                attempts.count = 0;
            }
        }
        
        return attempts;
    }

    // 로그인 실패 기록
    recordFailedLogin(email) {
        const key = `login_attempts_${email}`;
        const attempts = this.checkLoginAttempts(email);
        
        attempts.count += 1;
        attempts.lastAttempt = Date.now();
        
        localStorage.setItem(key, JSON.stringify(attempts));
    }

    // 로그인 성공 시 시도 기록 초기화
    clearLoginAttempts(email) {
        const key = `login_attempts_${email}`;
        localStorage.removeItem(key);
    }

    // 세션 생성 및 저장
    async createSession(user) {
        const sessionToken = this.generateSecureToken(user.id, user.user_type);
        const sessionData = {
            user_id: user.id,
            session_token: sessionToken,
            expires_at: new Date(Date.now() + this.sessionTimeout).toISOString(),
            ip_address: await this.getClientIP(),
            user_agent: navigator.userAgent,
            is_active: true
        };

        try {
            // 세션을 데이터베이스에 저장
            const response = await fetch('tables/user_sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (response.ok) {
                const session = await response.json();
                
                // 보안 강화된 로컬 저장
                const encryptedToken = this.encryptData(sessionToken);
                localStorage.setItem('secure_session', encryptedToken);
                localStorage.setItem('session_expires', sessionData.expires_at);
                
                return session;
            }
        } catch (error) {
            console.error('세션 생성 오류:', error);
        }
        
        return null;
    }

    // 클라이언트 IP 주소 가져오기 (근사치)
    async getClientIP() {
        try {
            // 실제 운영에서는 서버에서 처리
            return 'client_ip_placeholder';
        } catch {
            return 'unknown';
        }
    }

    // 데이터 암호화 (간단한 XOR 암호화)
    encryptData(data) {
        let result = '';
        for (let i = 0; i < data.length; i++) {
            result += String.fromCharCode(data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
        }
        return btoa(result);
    }

    // 데이터 복호화
    decryptData(encryptedData) {
        try {
            const data = atob(encryptedData);
            let result = '';
            for (let i = 0; i < data.length; i++) {
                result += String.fromCharCode(data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
            }
            return result;
        } catch {
            return null;
        }
    }

    // 세션 검증
    async validateSession() {
        const encryptedToken = localStorage.getItem('secure_session');
        const expiresAt = localStorage.getItem('session_expires');
        
        if (!encryptedToken || !expiresAt) {
            return null;
        }

        // 만료 시간 체크
        if (new Date() > new Date(expiresAt)) {
            this.clearSession();
            return null;
        }

        const sessionToken = this.decryptData(encryptedToken);
        if (!sessionToken) {
            this.clearSession();
            return null;
        }

        const payload = this.verifyToken(sessionToken);
        if (!payload) {
            this.clearSession();
            return null;
        }

        try {
            // 데이터베이스에서 세션 확인
            const response = await fetch(`tables/user_sessions?search=${encodeURIComponent(sessionToken)}&limit=1`);
            const sessionData = await response.json();
            
            if (sessionData.data && sessionData.data.length > 0) {
                const session = sessionData.data[0];
                if (session.is_active && new Date() < new Date(session.expires_at)) {
                    return {
                        userId: payload.userId,
                        userType: payload.userType,
                        sessionId: session.id
                    };
                }
            }
        } catch (error) {
            console.error('세션 검증 오류:', error);
        }

        this.clearSession();
        return null;
    }

    // 세션 종료
    async clearSession() {
        const encryptedToken = localStorage.getItem('secure_session');
        
        if (encryptedToken) {
            const sessionToken = this.decryptData(encryptedToken);
            if (sessionToken) {
                try {
                    // 데이터베이스에서 세션 비활성화
                    const response = await fetch(`tables/user_sessions?search=${encodeURIComponent(sessionToken)}&limit=1`);
                    const sessionData = await response.json();
                    
                    if (sessionData.data && sessionData.data.length > 0) {
                        const session = sessionData.data[0];
                        await fetch(`tables/user_sessions/${session.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ is_active: false })
                        });
                    }
                } catch (error) {
                    console.error('세션 종료 오류:', error);
                }
            }
        }

        // 로컬 스토리지 정리
        localStorage.removeItem('secure_session');
        localStorage.removeItem('session_expires');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    }

    // 입력값 검증 및 XSS 방지
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    // SQL 인젝션 방지를 위한 입력값 이스케이프
    escapeSQL(input) {
        if (typeof input !== 'string') return input;
        
        return input.replace(/'/g, "''").replace(/;/g, '');
    }

    // 비밀번호 강도 검증
    validatePasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;
        
        return {
            score,
            checks,
            isStrong: score >= 4,
            message: this.getPasswordMessage(score, checks)
        };
    }

    getPasswordMessage(score, checks) {
        if (score < 3) return '약함: 더 복잡한 비밀번호를 사용하세요';
        if (score < 4) return '보통: 특수문자나 대문자를 추가하세요';
        return '강함: 안전한 비밀번호입니다';
    }
}

// 전역 보안 매니저 인스턴스
const securityManager = new SecurityManager();

// 전역 함수로 내보내기
window.securityManager = securityManager;