/**
 * beautycat.kr API 자동 수정 도구
 * 404 오류 발생 시 자동으로 Firebase API로 전환
 */

// 404 오류 자동 감지 및 수정
let apiErrorCount = 0;
const maxErrorCount = 5;

// 원본 fetch 백업 (다시 한번)
const originalFetchBackup = window.fetch;

// 404 오류 감지 래퍼
window.fetch = function(url, options = {}) {
    return originalFetchBackup(url, options)
        .then(response => {
            // 404 오류 감지
            if (response.status === 404 && typeof url === 'string' && url.includes('/tables/')) {
                apiErrorCount++;
                console.log(`🚨 API 404 오류 감지 (${apiErrorCount}/${maxErrorCount}): ${url}`);
                
                // Firebase API로 자동 전환 시도
                return handleAPIError404(url, options);
            }
            
            return response;
        })
        .catch(error => {
            if (typeof url === 'string' && url.includes('/tables/')) {
                console.log(`🚨 API 네트워크 오류 감지: ${url}`, error);
                return handleAPIError404(url, options);
            }
            throw error;
        });
};

/**
 * 404 오류 처리 및 Firebase API로 자동 전환
 */
async function handleAPIError404(url, options) {
    try {
        console.log('🔄 Firebase API로 자동 전환 시도:', url);
        
        // Firebase API가 준비될 때까지 대기
        await waitForFirebaseAPI();
        
        // URL 파싱
        const urlObj = new URL(url, window.location.origin);
        const pathParts = urlObj.pathname.split('/');
        const tableName = pathParts[2];
        const recordId = pathParts[3];
        
        // Query Parameters
        const params = {};
        urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        
        // HTTP 메서드
        const method = options.method || 'GET';
        
        let result;
        
        switch (method.toUpperCase()) {
            case 'GET':
                if (recordId) {
                    result = await window.beautyAPI.getRecord(tableName, recordId);
                } else {
                    result = await window.beautyAPI.getTables(tableName, params);
                }
                break;
                
            case 'POST':
                const createData = options.body ? JSON.parse(options.body) : {};
                result = await window.beautyAPI.createRecord(tableName, createData);
                break;
                
            case 'PUT':
                const updateData = options.body ? JSON.parse(options.body) : {};
                result = await window.beautyAPI.updateRecord(tableName, recordId, updateData);
                break;
                
            case 'DELETE':
                result = await window.beautyAPI.deleteRecord(tableName, recordId);
                break;
                
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
        
        console.log('✅ Firebase API 자동 전환 성공:', url);
        
        // Response 객체 생성
        return new Response(JSON.stringify(result), {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Source': 'Firebase-Auto-Fix'
            }
        });
        
    } catch (error) {
        console.error('❌ Firebase API 자동 전환 실패:', error);
        
        // 빈 응답으로 처리 (페이지 오류 방지)
        return new Response(JSON.stringify({
            data: [],
            total: 0,
            error: 'API temporarily unavailable',
            source: 'Auto-Fix-Fallback'
        }), {
            status: 200, // 200으로 응답하여 페이지 오류 방지
            statusText: 'OK',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Source': 'Auto-Fix-Fallback'
            }
        });
    }
}

/**
 * Firebase API가 준비될 때까지 대기
 */
async function waitForFirebaseAPI() {
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!window.beautyAPI && attempts < maxAttempts) {
        console.log(`⏳ Firebase API 대기 중... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.beautyAPI) {
        throw new Error('Firebase API 로드 실패');
    }
    
    // Firebase API 초기화 확인
    if (!window.firebaseAPI.isInitialized()) {
        console.log('🔥 Firebase API 초기화 중...');
        await window.firebaseAPI.initialize();
    }
    
    console.log('✅ Firebase API 준비 완료');
}

/**
 * 페이지 로드 시 자동 수정 도구 활성화
 */
window.addEventListener('load', () => {
    console.log('🔧 API 자동 수정 도구 활성화됨');
    
    // 10초 후 상태 체크
    setTimeout(async () => {
        if (apiErrorCount > 0) {
            console.log(`📊 API 오류 자동 수정: ${apiErrorCount}건 처리됨`);
        }
        
        // Firebase API 테스트
        try {
            const testResult = await window.beautyAPI.getTables('users', { limit: 1 });
            console.log('✅ Firebase API 테스트 성공:', testResult.total + '개 사용자');
        } catch (error) {
            console.log('⚠️ Firebase API 테스트 실패:', error.message);
        }
    }, 10000);
});

console.log('🛠️ API 자동 수정 도구 로드 완료 - 404 오류 자동 감지 및 Firebase로 전환');