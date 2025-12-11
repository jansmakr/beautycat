/**
 * BeautyCat - 빈자리 정보 섹션 토글 모듈
 * v2.6.4.9 - Phase 1: 빈자리 알림 기능
 * 
 * 샵 공지사항 작성 시 '빈자리알림' 카테고리 선택 시
 * 날짜/시간/긴급도/할인율 입력 섹션을 표시/숨김
 */

// 빈자리 정보 섹션 토글 함수
function toggleSlotsInfoSection() {
    const categorySelect = document.getElementById('new-announcement-category');
    const slotsSection = document.getElementById('slots-info-section');
    
    if (!categorySelect || !slotsSection) {
        console.warn('Required elements not found for slots info toggle');
        return;
    }
    
    const selectedCategory = categorySelect.value;
    
    if (selectedCategory === '빈자리알림') {
        // 빈자리알림 선택 시 섹션 표시
        slotsSection.classList.remove('hidden');
        
        // 날짜 필드를 오늘 날짜로 기본 설정
        const slotDateInput = document.getElementById('slot-date');
        if (slotDateInput && !slotDateInput.value) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            slotDateInput.value = formattedDate;
        }
    } else {
        // 다른 카테고리 선택 시 섹션 숨김
        slotsSection.classList.add('hidden');
        
        // 필드 초기화 (선택사항)
        const slotDateInput = document.getElementById('slot-date');
        const slotTimeInput = document.getElementById('slot-time');
        const eventTypeSelect = document.getElementById('event-type');
        const slotDiscountInput = document.getElementById('slot-discount');
        
        if (slotDateInput) slotDateInput.value = '';
        if (slotTimeInput) slotTimeInput.value = '';
        if (eventTypeSelect) eventTypeSelect.value = 'normal';
        if (slotDiscountInput) slotDiscountInput.value = '';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Slots info toggle module loaded');
    
    // 카테고리 변경 이벤트 리스너 추가
    const categorySelect = document.getElementById('new-announcement-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', toggleSlotsInfoSection);
        
        // 초기 상태 설정 (페이지 로드 시)
        toggleSlotsInfoSection();
    }
});

// 전역 함수로 내보내기 (HTML에서 직접 호출 가능)
if (typeof window !== 'undefined') {
    window.toggleSlotsInfoSection = toggleSlotsInfoSection;
}
