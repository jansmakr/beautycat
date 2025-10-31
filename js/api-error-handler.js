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
                
                return { isValid: false, error: 'Invalid Content-Type' };
            }
            
            return { isValid: true };
            
        } catch (error) {
            console.error('❌ API 응답 검증 오류:', error);
            return { isValid: false, error: error.message };
        }
    },
    
    /**
     * JSON 파싱 안전하게 수행
     */
    async safeJsonParse(response, apiName = 'API') {
        try {
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.warn(`⚠️ ${apiName} JSON 파싱 실패:`, error.message);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * 안전한 GET 요청 (오류 처리 포함)
     */
    async safeGet(url, apiName = 'API') {
        try {
            const response = await fetch(url);
            const validation = await this.validateJsonResponse(response.clone(), apiName);
            
            if (!validation.isValid) {
                console.warn(`❌ ${apiName} API 실패:`, validation.error);
                return null;
            }
            
            const result = await this.safeJsonParse(response, apiName);
            if (result.success) {
                return result.data;
            } else {
                console.warn(`❌ ${apiName} 데이터 파싱 실패:`, result.error);
                return null;
            }
            
        } catch (error) {
            console.warn(`🚫 ${apiName} 네트워크 오류:`, error.message);
            return null;
        }
    },
    
    /**
     * 안전한 POST 요청 (오류 처리 포함)
     */
    async safePost(url, data, apiName = 'API') {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const validation = await this.validateJsonResponse(response.clone(), apiName);
            
            if (!validation.isValid) {
                console.warn(`❌ ${apiName} POST 실패:`, validation.error);
                return null;
            }
            
            const result = await this.safeJsonParse(response, apiName);
            if (result.success) {
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
                // 🚨 강제 API URL 변환: beautycat-api → beautycat-api-v3
                if (args[0] && typeof args[0] === 'string') {
                    if (args[0].includes('beautycat-api.jansmakr.workers.dev')) {
                        const oldUrl = args[0];
                        args[0] = args[0].replace(
                            'beautycat-api.jansmakr.workers.dev',
                            'beautycat-api-v3.jansmakr.workers.dev'
                        );
                        console.log('🔄 API URL 자동 변환:', oldUrl, '→', args[0]);
                    }
                }
                
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
        
        console.log('✅ 전역 API 오류 핸들러 초기화 완료');
    }
};

// 초기화
if (typeof window !== 'undefined') {
    GlobalErrorHandler.initialize();
    console.log(`🌍 환경: ${Environment.getEnvironmentName()}`);
}

// 전역 노출
window.Environment = Environment;
window.ApiValidator = ApiValidator;
