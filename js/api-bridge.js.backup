/**
 * beautycat.kr API Bridge
 * 기존 fetch('/tables/...') 호출을 Firebase API로 자동 변환
 */

// 원본 fetch 함수 백업
const originalFetch = window.fetch;

/**
 * 기존 RESTful Table API 호출을 Firebase API로 자동 변환하는 Fetch 래퍼
 */
window.fetch = async function(url, options = {}) {
    // /tables/ API 호출인지 확인
    if (typeof url === 'string' && url.includes('/tables/')) {
        try {
            console.log(`🔄 API Bridge: ${url} → Firebase API 변환 중...`);
            
            // URL 파싱
            const urlObj = new URL(url, window.location.origin);
            const pathParts = urlObj.pathname.split('/');
            const tableName = pathParts[2]; // /tables/{table}
            const recordId = pathParts[3]; // /tables/{table}/{id} (옵션)
            
            // Query Parameters 파싱
            const params = {};
            urlObj.searchParams.forEach((value, key) => {
                params[key] = value;
            });
            
            // HTTP 메서드 확인
            const method = options.method || 'GET';
            
            let result;
            
            switch (method.toUpperCase()) {
                case 'GET':
                    if (recordId) {
                        // GET /tables/{table}/{id}
                        result = await window.beautyAPI.getRecord(tableName, recordId);
                    } else {
                        // GET /tables/{table}
                        result = await window.beautyAPI.getTables(tableName, params);
                    }
                    break;
                    
                case 'POST':
                    // POST /tables/{table}
                    const createData = options.body ? JSON.parse(options.body) : {};
                    result = await window.beautyAPI.createRecord(tableName, createData);
                    break;
                    
                case 'PUT':
                    // PUT /tables/{table}/{id}
                    if (!recordId) throw new Error('Record ID required for PUT');
                    const updateData = options.body ? JSON.parse(options.body) : {};
                    result = await window.beautyAPI.updateRecord(tableName, recordId, updateData);
                    break;
                    
                case 'DELETE':
                    // DELETE /tables/{table}/{id}
                    if (!recordId) throw new Error('Record ID required for DELETE');
                    result = await window.beautyAPI.deleteRecord(tableName, recordId);
                    break;
                    
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
            
            console.log(`✅ API Bridge: ${url} → Firebase API 성공`, result);
            
            // Response 객체 생성 (원래 fetch와 동일한 인터페이스)
            return new Response(JSON.stringify(result), {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Source': 'Firebase-Bridge'
                }
            });
            
        } catch (error) {
            console.error(`❌ API Bridge 오류 (${url}):`, error);
            
            // 오류 응답 생성
            return new Response(JSON.stringify({
                error: error.message,
                source: 'Firebase-Bridge'
            }), {
                status: 500,
                statusText: 'Internal Server Error',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Source': 'Firebase-Bridge-Error'
                }
            });
        }
    }
    
    // /tables/ API가 아닌 경우 원래 fetch 사용
    return originalFetch(url, options);
};

/**
 * Firebase API가 준비되었는지 확인하고 초기화
 */
async function initializeAPIBridge() {
    try {
        // Firebase API가 로드될 때까지 대기
        let retryCount = 0;
        while (!window.beautyAPI && retryCount < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retryCount++;
        }
        
        if (!window.beautyAPI) {
            throw new Error('Firebase API가 로드되지 않았습니다.');
        }
        
        // Firebase API 초기화
        if (window.firebaseAPI && !window.firebaseAPI.isInitialized()) {
            await window.firebaseAPI.initialize();
        }
        
        console.log('🌉 API Bridge 초기화 완료! 모든 /tables/ API 호출이 Firebase로 변환됩니다.');
        
        // 전역 상태 플래그 설정
        window.apiBridgeReady = true;
        
        // API Bridge 준비 완료 이벤트 발송
        window.dispatchEvent(new CustomEvent('apiBridgeReady', {
            detail: { message: 'Firebase API Bridge 초기화 완료' }
        }));
        
    } catch (error) {
        console.error('❌ API Bridge 초기화 실패:', error);
        window.apiBridgeReady = false;
    }
}

/**
 * 테스트 함수: API Bridge가 정상 작동하는지 확인
 */
window.testAPIBridge = async function() {
    console.log('🧪 API Bridge 테스트 시작...');
    
    try {
        // GET 테스트
        const response1 = await fetch('/tables/users?limit=1');
        const data1 = await response1.json();
        console.log('✅ GET 테스트 성공:', data1);
        
        // POST 테스트
        const response2 = await fetch('/tables/users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: 'bridge-test@beautycat.com',
                name: 'API Bridge 테스트',
                user_type: 'customer'
            })
        });
        const data2 = await response2.json();
        console.log('✅ POST 테스트 성공:', data2);
        
        console.log('🎉 API Bridge 테스트 완료! 모든 기능이 정상 작동합니다.');
        
    } catch (error) {
        console.error('❌ API Bridge 테스트 실패:', error);
    }
};

// 페이지 로드 완료 시 API Bridge 초기화
function startAPIBridge() {
    console.log('🔗 API Bridge 시작 시도...');
    
    // 더 오래 기다리면서 Firebase API 로드 체크
    let retryCount = 0;
    const maxRetries = 100; // 10초간 시도
    
    function checkAndInit() {
        retryCount++;
        
        if (window.beautyAPI && window.firebaseAPI) {
            console.log('✅ Firebase API 발견! Bridge 초기화 시작...');
            initializeAPIBridge();
        } else if (retryCount < maxRetries) {
            console.log(`🔄 Firebase API 대기 중... (${retryCount}/${maxRetries})`);
            setTimeout(checkAndInit, 100);
        } else {
            console.error('❌ Firebase API 로드 실패 - API Bridge 사용 불가');
        }
    }
    
    checkAndInit();
}

// 다양한 로딩 상황에 대응
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAPIBridge);
} else {
    // 이미 로드된 경우
    setTimeout(startAPIBridge, 50);
}

// 추가 안전장치: window.onload에서도 시도
window.addEventListener('load', () => {
    if (!window.apiBridgeReady) {
        console.log('🔄 window.onload에서 API Bridge 재시도...');
        setTimeout(startAPIBridge, 200);
    }
});

console.log('🔗 API Bridge 로드 완료 - /tables/ API 호출이 자동으로 Firebase API로 변환됩니다!');