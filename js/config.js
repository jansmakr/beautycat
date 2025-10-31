// BeautyCat 설정 파일
// 모든 설정을 한 곳에서 관리

const CONFIG = {
    // API 설정
API_BASE_URL: 'https://beautycat-api-v3.jansmakr.workers.dev/api',
    
    // 환경 설정
    ENVIRONMENT: 'production',
    DEBUG: true,
    
    // 로그 설정
    enableConsoleLog: true,
    
    // 세션 설정
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24시간
    
    // 로컬스토리지 키
    STORAGE_KEYS: {
        CURRENT_USER: 'currentUser',
        USER_TYPE: 'user_type',
        SESSION_TOKEN: 'session_token'
    }
};

// 로그 헬퍼 함수
function log(message, data = null) {
    if (CONFIG.enableConsoleLog) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`, data || '');
    }
}

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    log('API 호출:', url);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        log('API 응답:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        log('API 오류:', error.message);
        throw error;
    }
}

// 세션 관리
const Session = {
    set(user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_TYPE, user.user_type);
        localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN, 'token_' + Date.now());
        log('세션 저장됨:', user.email);
    },
    
    get() {
        const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },
    
    clear() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_TYPE);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
        log('세션 삭제됨');
    },
    
    isValid() {
        return !!this.get();
    }
};

log('Config 로드 완료');
