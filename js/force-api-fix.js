// 강제 API URL 수정 스크립트
console.log('🚨 강제 API URL 수정 스크립트 실행됨');

// 1. 설정 강제 변경
if (window.BEAUTYCAT_CONFIG) {
    window.BEAUTYCAT_CONFIG.API_BASE_URL = 'https://beautycat-api.jansmakr.workers.dev/api';
    console.log('✅ API_BASE_URL 강제 설정 완료');
} else {
    window.BEAUTYCAT_CONFIG = {
        API_BASE_URL: 'https://beautycat-api.jansmakr.workers.dev/api'
    };
    console.log('✅ BEAUTYCAT_CONFIG 새로 생성됨');
}

// 2. fetch 함수 래핑 (상대경로 차단)
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    // 상대경로인 경우 절대경로로 변환
    if (typeof url === 'string' && url.startsWith('tables/')) {
        const correctedUrl = `https://beautycat-api.jansmakr.workers.dev/api/${url}`;
        console.log('🔧 URL 수정:', url, '→', correctedUrl);
        return originalFetch(correctedUrl, options);
    }
    
    // 잘못된 GitHub Pages URL 차단
    if (typeof url === 'string' && url.includes('github.io') && url.includes('tables/')) {
        const correctedUrl = url.replace(/https:\/\/.*github\.io\/.*?\/tables\//, 'https://beautycat-api.jansmakr.workers.dev/api/tables/');
        console.log('🔧 GitHub Pages URL 수정:', url, '→', correctedUrl);
        return originalFetch(correctedUrl, options);
    }
    
    return originalFetch(url, options);
};

// 3. API 테스트 함수
window.testFixedAPI = async function() {
    try {
        console.log('🧪 수정된 API 테스트 중...');
        const response = await fetch('tables/users?limit=5');
        const data = await response.json();
        console.log('✅ API 수정 성공!', data);
        return data;
    } catch (error) {
        console.error('❌ API 수정 실패:', error);
        return error;
    }
};

console.log('🚀 강제 API 수정 완료 - testFixedAPI() 사용 가능');
console.log('🎯 현재 API URL:', window.BEAUTYCAT_CONFIG.API_BASE_URL);