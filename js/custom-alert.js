/**
 * ============================================
 * Custom Alert - 검정색 텍스트 알림
 * ============================================
 */

function customAlert(message, type = 'info') {
    // 기존 알림이 있으면 제거
    const existing = document.getElementById('custom-alert');
    if (existing) {
        existing.remove();
    }
    
    // 알림 컨테이너 생성
    const alertDiv = document.createElement('div');
    alertDiv.id = 'custom-alert';
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        width: 90%;
        max-width: 400px;
    `;
    
    // 배경색 설정
    const bgColors = {
        success: 'bg-green-50 border-green-400',
        error: 'bg-red-50 border-red-400',
        warning: 'bg-yellow-50 border-yellow-400',
        info: 'bg-blue-50 border-blue-400'
    };
    
    // 아이콘 설정
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    // HTML 생성 - 검정색 텍스트 강제 적용
    alertDiv.innerHTML = `
        <div class="backdrop" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: -1;
        "></div>
        <div class="${bgColors[type]} border-2 rounded-xl shadow-2xl p-6 bg-white">
            <div class="text-center">
                <div class="text-4xl mb-3">${icons[type]}</div>
                <p style="color: #000000 !important; font-size: 18px; font-weight: 600; margin-bottom: 16px; line-height: 1.5;">
                    ${message}
                </p>
                <button onclick="closeCustomAlert()" 
                        class="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        style="color: #ffffff !important; cursor: pointer;">
                    확인
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 배경 클릭시 닫기
    alertDiv.querySelector('.backdrop').addEventListener('click', closeCustomAlert);
}

function closeCustomAlert() {
    const alertDiv = document.getElementById('custom-alert');
    if (alertDiv) {
        alertDiv.remove();
    }
}

// alert 함수 오버라이드
window.alert = function(message) {
    const type = message.includes('❌') || message.includes('실패') || message.includes('오류') ? 'error' :
                 message.includes('✅') || message.includes('성공') ? 'success' :
                 message.includes('⚠️') || message.includes('주의') ? 'warning' : 'info';
    customAlert(message, type);
};
