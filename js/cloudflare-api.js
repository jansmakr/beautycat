/**
 * beautycat.kr Cloudflare API 브릿지
 * 완전한 백엔드 연결
 */

console.log('🚀 Cloudflare API 브릿지 활성화');

// Cloudflare API 설정 (DNS 문제로 Fallback 우선 사용)
const CLOUDFLARE_API = {
    baseUrl: 'https://beautycat-api.jansmakr.workers.dev/api',  // 안정적인 URL 우선
    fallbackUrl: 'https://api.beautycat.kr/api',               // 커스텀 도메인 대기
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
            const response = await fetch(url, { 
                method: 'GET',
                headers: this.headers
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('💚 Cloudflare API 헬스체크 성공:', data);
                return data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            // 조용하게 실패 처리 (콘솔 경고만 표시)
            console.log('ℹ️ API 서버가 아직 배포되지 않았습니다.');
            console.log('ℹ️ Cloudflare Workers API를 배포하면 백엔드 기능이 활성화됩니다.');
            console.log('ℹ️ 배포 가이드: CLOUDFLARE_WORKERS_V3_API_GUIDE.md 참고');
            return null;
        }
    }
}

// 전역 API 인스턴스 생성
const cloudflareAPI = new BeautycatAPI();

// 전역 변수로 등록
window.cloudflareAPI = cloudflareAPI;
window.beautyAPI = cloudflareAPI;

// 초기 헬스체크 (비동기로 조용하게 실행)
cloudflareAPI.healthCheck().catch(() => {
    // 헬스체크 실패는 무시 (API 서버가 없어도 프론트엔드는 작동)
});

console.log('🎉 Cloudflare API 브릿지 준비 완료!');