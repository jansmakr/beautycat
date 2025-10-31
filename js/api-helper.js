/**
 * BeautyCat API Helper
 * Cloudflare D1 데이터베이스 연동 헬퍼
 */

const API = {
    // Cloudflare Workers API 기본 URL
    BASE_URL: 'https://beautycat-api.jansmakr.workers.dev/api',
    
    // 공통 헤더
    headers: {
        'Content-Type': 'application/json'
    },
    
    /**
     * 에러 처리
     */
    handleError(error, context) {
        console.error(`API Error (${context}):`, error);
        return {
            success: false,
            error: error.message || '알 수 없는 오류가 발생했습니다.'
        };
    },
    
    /**
     * GET 요청 - 데이터 조회
     */
    async get(endpoint, params = {}) {
        try {
            const url = new URL(`${this.BASE_URL}/tables/${endpoint}`);
            Object.keys(params).forEach(key => 
                url.searchParams.append(key, params[key])
            );
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
            
        } catch (error) {
            return this.handleError(error, `GET ${endpoint}`);
        }
    },
    
    /**
     * POST 요청 - 데이터 생성
     */
    async create(endpoint, data) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/${endpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    ...data,
                    created_at: Date.now(),
                    updated_at: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return { success: true, data: result };
            
        } catch (error) {
            return this.handleError(error, `POST ${endpoint}`);
        }
    },
    
    /**
     * PUT 요청 - 데이터 수정
     */
    async update(endpoint, id, data) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/${endpoint}/${id}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify({
                    ...data,
                    updated_at: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return { success: true, data: result };
            
        } catch (error) {
            return this.handleError(error, `PUT ${endpoint}/${id}`);
        }
    },
    
    /**
     * DELETE 요청 - 데이터 삭제 (소프트 삭제)
     */
    async delete(endpoint, id) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: this.headers
            });
            
            if (!response.ok && response.status !== 204) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return { success: true };
            
        } catch (error) {
            return this.handleError(error, `DELETE ${endpoint}/${id}`);
        }
    },
    
    /**
     * Health Check - API 상태 확인
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.BASE_URL}/health`);
            if (!response.ok) {
                throw new Error('API is not healthy');
            }
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return this.handleError(error, 'Health Check');
        }
    },
    
    /**
     * 특정 ID로 레코드 조회
     */
    async getById(endpoint, id) {
        try {
            const response = await fetch(`${this.BASE_URL}/tables/${endpoint}/${id}`, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { success: true, data };
            
        } catch (error) {
            return this.handleError(error, `GET ${endpoint}/${id}`);
        }
    }
};

// 유틸리티 함수들

/**
 * 비밀번호 해싱 (SHA-256)
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 이메일 유효성 검증
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * 전화번호 유효성 검증 (010-1234-5678 형식)
 */
function validatePhone(phone) {
    const re = /^010-\d{4}-\d{4}$/;
    return re.test(phone);
}

/**
 * XSS 방지를 위한 입력값 새니타이징
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * 세션 ID 생성
 */
function generateSessionId() {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    return sessionId;
}

/**
 * 현재 로그인한 사용자 가져오기
 */
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('getCurrentUser error:', error);
        return null;
    }
}

/**
 * 로그인 상태 확인
 */
function isLoggedIn() {
    return getCurrentUser() !== null;
}

/**
 * 로그아웃
 */
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

/**
 * 통화 통계 기록
 */
async function logCallStatistics(data) {
    const currentUser = getCurrentUser() || {};
    
    const statData = {
        action: data.action || 'phone_call',
        shop_id: data.shop_id || null,
        shop_name: data.shop_name || null,
        phone_number: data.phone_number || null,
        customer_region: data.customer_region || null,
        user_agent: navigator.userAgent,
        user_id: currentUser.id || null,
        session_id: localStorage.getItem('sessionId') || generateSessionId(),
        success: 1
    };
    
    try {
        await API.create('call_statistics', statData);
    } catch (error) {
        console.error('통화 통계 기록 실패:', error);
    }
}

/**
 * 날짜 포맷팅 (timestamp → 읽기 쉬운 형식)
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 상태 텍스트 변환
 */
function getStatusText(status) {
    const statusMap = {
        'pending': '대기 중',
        'in_progress': '진행 중',
        'matched': '매칭 완료',
        'completed': '완료',
        'cancelled': '취소',
        'active': '활성',
        'inactive': '비활성',
        'approved': '승인됨',
        'rejected': '거부됨'
    };
    return statusMap[status] || status;
}

/**
 * 로딩 표시
 */
function showLoading(message = '로딩 중...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'apiLoading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    loadingDiv.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #ff2d92; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
            <p style="color: #333; font-size: 16px;">${message}</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

/**
 * 로딩 숨기기
 */
function hideLoading() {
    const loadingDiv = document.getElementById('apiLoading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// 전역 사용을 위해 window 객체에 추가
if (typeof window !== 'undefined') {
    window.API = API;
    window.hashPassword = hashPassword;
    window.validateEmail = validateEmail;
    window.validatePhone = validatePhone;
    window.sanitizeInput = sanitizeInput;
    window.generateSessionId = generateSessionId;
    window.getCurrentUser = getCurrentUser;
    window.isLoggedIn = isLoggedIn;
    window.logout = logout;
    window.logCallStatistics = logCallStatistics;
    window.formatDate = formatDate;
    window.getStatusText = getStatusText;
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
}

// 스피너 애니메이션 CSS 추가
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ BeautyCat API Helper 로드 완료');
console.log('📡 API Base URL:', API.BASE_URL);
