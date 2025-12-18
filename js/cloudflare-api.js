/**
 * beautycat.kr Cloudflare API 브릿지
 * 완전한 백엔드 연결
 */

console.log('🚀 Cloudflare API 브릿지 활성화');

// Cloudflare API 설정 (v2.8.13.6.35: 올바른 도메인으로 수정)
const CLOUDFLARE_API = {
    baseUrl: 'https://api.beautycat.kr/api',                      // 실제 API URL (Primary)
    fallbackUrl: 'https://api.beautycat.kr/api',                  // Fallback (동일)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

/**
 * 통합 API 호출 함수
 */
class BeautycatAPI {
    constructor() {
        this.baseUrl = CLOUDFLARE_API.baseUrl;
        this.fallbackUrl = CLOUDFLARE_API.fallbackUrl;
        this.headers = CLOUDFLARE_API.headers;
    }

    // GET - 테이블 데이터 조회
    async getTables(tableName, params = {}) {
        const queryParams = new URLSearchParams(params);
        const url = `${this.baseUrl}/tables/${tableName}?${queryParams}`;
        
        console.log(`📡 Cloudflare API 요청: ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Cloudflare API 응답:`, data);
            return data;
            
        } catch (error) {
            console.warn('⚠️ Primary API 실패, Fallback 시도:', error.message);
            
            // Fallback URL로 재시도
            try {
                const fallbackUrlFull = url.replace(this.baseUrl, this.fallbackUrl);
                console.log(`🔄 Fallback API 시도: ${fallbackUrlFull}`);
                
                const fallbackResponse = await fetch(fallbackUrlFull, {
                    method: 'GET',
                    headers: this.headers
                });
                
                if (!fallbackResponse.ok) {
                    throw new Error(`Fallback API Error: ${fallbackResponse.status}`);
                }
                
                const fallbackData = await fallbackResponse.json();
                console.log(`✅ Fallback API 성공:`, fallbackData);
                return fallbackData;
                
            } catch (fallbackError) {
                console.error('❌ 모든 API 실패:', fallbackError);
                throw error; // 원본 에러 반환
            }
        }
    }

    // GET - 단일 레코드 조회
    async getRecord(tableName, recordId) {
        const url = `${this.baseUrl}/tables/${tableName}/${recordId}`;
        
        console.log(`📡 Cloudflare API 단일 조회: ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('❌ Cloudflare API 단일 조회 오류:', error);
            throw error;
        }
    }

    // POST - 새 레코드 생성
    async createRecord(tableName, data) {
        const url = `${this.baseUrl}/tables/${tableName}`;
        
        console.log(`📡 Cloudflare API 생성: ${url}`, data);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`✅ Cloudflare API 생성 완료:`, result);
            return result;
            
        } catch (error) {
            console.error('❌ Cloudflare API 생성 오류:', error);
            throw error;
        }
    }

    // PUT - 레코드 업데이트
    async updateRecord(tableName, recordId, data) {
        const url = `${this.baseUrl}/tables/${tableName}/${recordId}`;
        
        console.log(`📡 Cloudflare API 업데이트: ${url}`, data);
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('❌ Cloudflare API 업데이트 오류:', error);
            throw error;
        }
    }

    // DELETE - 레코드 삭제
    async deleteRecord(tableName, recordId) {
        const url = `${this.baseUrl}/tables/${tableName}/${recordId}`;
        
        console.log(`📡 Cloudflare API 삭제: ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            console.log(`✅ Cloudflare API 삭제 완료`);
            return true;
            
        } catch (error) {
            console.error('❌ Cloudflare API 삭제 오류:', error);
            throw error;
        }
    }

    // 헬스체크 (Fallback 지원)
    async healthCheck() {
        // 1순위: 커스텀 도메인
        try {
            const url = `${this.baseUrl}/health`;
            const response = await fetch(url, { timeout: 3000 });
            const data = await response.json();
            console.log('💚 Cloudflare API 헬스체크 (커스텀 도메인):', data);
            return data;
        } catch (error) {
            console.warn('⚠️ 커스텀 도메인 실패, Fallback 시도:', error.message);
            
            // 2순위: Fallback URL
            try {
                const fallbackUrl = `${this.fallbackUrl}/health`;
                const response = await fetch(fallbackUrl);
                const data = await response.json();
                console.log('💚 Cloudflare API 헬스체크 (Fallback):', data);
                return data;
            } catch (fallbackError) {
                console.error('❌ 모든 API 헬스체크 실패:', fallbackError);
                return null;
            }
        }
    }
}

// 전역 API 인스턴스 생성
const cloudflareAPI = new BeautycatAPI();

// 전역 변수로 등록
window.cloudflareAPI = cloudflareAPI;
window.beautyAPI = cloudflareAPI;

// 초기 헬스체크
cloudflareAPI.healthCheck();

console.log('🎉 Cloudflare API 브릿지 준비 완료!');