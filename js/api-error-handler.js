/**
 * API 오류 처리 및 개발 환경 감지 유틸리티
 * BeautyCat API 오류 처리 전용 모듈
 */

// 환경 감지
const Environment = {
    isDevelopment() {
        return location.hostname.includes('localhost') || 
               location.hostname.includes('127.0.0.1') || 
               location.hostname.includes('genspark.ai') ||
               location.protocol === 'file:';
    },
    
    isProduction() {
        return !this.isDevelopment();
    },
    
    getEnvironmentName() {
        return this.isProduction() ? 'Production' : 'Development';
    }
};

// API 응답 검증
const ApiValidator = {
    /**
     * API 응답이 유효한 JSON인지 확인
     */
    async validateJsonResponse(response, apiName = 'API') {
        try {
            // HTTP 상태 확인
            if (!response.ok) {
                console.warn(`⚠️ ${apiName} 요청 실패:`, response.status, response.statusText);
                return { isValid: false, error: `HTTP ${response.status}` };
            }
            
            // Content-Type 확인
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn(`⚠️ ${apiName} 응답이 JSON이 아닙니다. Content-Type:`, contentType);
                
                // HTML 응답인 경우 (404 페이지 등)
                if (contentType && contentType.includes('text/html')) {
                    const htmlText = await response.text();
                    if (htmlText.includes('<!DOCTYPE')) {
                        return { 
                            isValid: false, 
                            error: 'HTML 페이지 반환됨 (API 엔드포인트 없음)' 
                        };
                    }
                }
                
                return { isValid: false, error: 'JSON이 아닌 응답' };
            }
            
            return { isValid: true };
            
        } catch (error) {
            console.warn(`⚠️ ${apiName} 응답 검증 오류:`, error.message);
            return { isValid: false, error: error.message };
        }
    },
    
    /**
     * 안전한 JSON 파싱
     */
    async safeJsonParse(response, apiName = 'API') {
        try {
            const validation = await this.validateJsonResponse(response, apiName);
            if (!validation.isValid) {
                return { success: false, error: validation.error, data: null };
            }
            
            const data = await response.json();
            return { success: true, data };
            
        } catch (error) {
            console.warn(`⚠️ ${apiName} JSON 파싱 오류:`, error.message);
            return { success: false, error: error.message, data: null };
        }
    }
};

// API 요청 래퍼
const ApiRequest = {
    /**
     * 안전한 API 요청 (GET)
     */
    async safeGet(url, options = {}) {
        const apiName = options.name || url.split('/').pop();
        
        try {
            console.log(`🔄 ${apiName} API 요청:`, url);
            
            const response = await fetch(url, {
                method: 'GET',
                ...options
            });
            
            const result = await ApiValidator.safeJsonParse(response, apiName);
            
            if (result.success) {
                console.log(`✅ ${apiName} API 성공:`, result.data);
                return result.data;
            } else {
                console.warn(`❌ ${apiName} API 실패:`, result.error);
                return null;
            }
            
        } catch (error) {
            console.warn(`🚫 ${apiName} API 네트워크 오류:`, error.message);
            return null;
        }
    },
    
    /**
     * 안전한 API 요청 (POST)
     */
    async safePost(url, data, options = {}) {
        const apiName = options.name || url.split('/').pop();
        
        try {
            console.log(`🔄 ${apiName} POST 요청:`, url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });
            
            const result = await ApiValidator.safeJsonParse(response, apiName);
            
            if (result.success) {
                console.log(`✅ ${apiName} POST 성공:`, result.data);
                return result.data;
            } else {
                console.warn(`❌ ${apiName} POST 실패:`, result.error);
                return null;
            }
            
        } catch (error) {
            console.warn(`🚫 ${apiName} POST 네트워크 오류:`, error.message);
            return null;
        }
    }
};

// 전역 오류 처리기
const GlobalErrorHandler = {
    initialize() {
        // 전역 fetch 오류 감지
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            try {
                const response = await originalFetch.apply(this, args);
                
                // API 요청인 경우만 체크
                if (args[0] && args[0].includes('tables/')) {
                    const validation = await ApiValidator.validateJsonResponse(
                        response.clone(), 
                        args[0].split('/').pop()
                    );
                    
                    if (!validation.isValid) {
                        console.warn('🚨 API 오류 감지:', args[0], validation.error);
                    }
                }
                
                return response;
            } catch (error) {
                console.error('🚨 Fetch 오류:', error);
                throw error;
            }
        };
        
        console.log('🛡️ API 오류 처리기 활성화됨');
    }
};

// 환경별 설정
const EnvironmentConfig = {
    development: {
        enableApiValidation: true,
        logLevel: 'verbose',
        skipDemoData: false
    },
    
    production: {
        enableApiValidation: true,
        logLevel: 'warn',
        skipDemoData: true
    },
    
    get() {
        return Environment.isProduction() ? this.production : this.development;
    }
};

// 모듈 초기화
if (typeof window !== 'undefined') {
    // 전역 객체로 노출
    window.BeautyCatApi = {
        Environment,
        ApiValidator,
        ApiRequest,
        GlobalErrorHandler,
        EnvironmentConfig
    };
    
    // 자동 초기화
    GlobalErrorHandler.initialize();
    
    console.log(`🌍 Beautyket API 오류 처리기 로드됨 (${Environment.getEnvironmentName()})`);
}

// ES6 모듈로도 사용 가능
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Environment,
        ApiValidator,
        ApiRequest,
        GlobalErrorHandler,
        EnvironmentConfig
    };
}