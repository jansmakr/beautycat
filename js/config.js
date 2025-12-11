// beautycat 시스템 설정 파일
// 현재 날짜: 2025년 12월 11일

window.PPOSHOP_CONFIG = {
    // 현재 날짜 설정
    CURRENT_DATE: new Date('2025-12-11'),
    
    // 무료 서비스 기간
    FREE_PERIOD: {
        START_DATE: new Date('2024-01-01'), // 서비스 시작일
        END_DATE: new Date('2026-05-30'),   // 무료 기간 종료일 (2026년 5월 30일)
        IS_FREE_PERIOD: true
    },
    
    // 버전 정보
    VERSION: '1.0.0',
    
    // 서비스 정보
    SERVICE_INFO: {
        NAME: 'beautycat (뷰티+에티켓) - 피부관리실 견적 플랫폼',
        DESCRIPTION: '피부관리실과 고객을 연결하는 지역 기반 스마트 매칭 플랫폼',
        CONTACT_EMAIL: 'utuber@kakao.com',
        NAVER_CAFE_URL: 'https://cafe.naver.com/cosmetickr'
    },
    
    // 무료 기간 관련 메시지
    FREE_PERIOD_MESSAGES: {
        HEADER: '🎉 런칭 기념 무료 서비스',
        DESCRIPTION: '2026년 5월 30일까지 모든 기능을 무료로 이용하세요!',
        REMAINING_DAYS_TEXT: '무료 기간 남은 일수',
        DAYS_LEFT_SUFFIX: '일',
        EXPIRED_MESSAGE: '무료 기간이 종료되었습니다.'
    }
};

// 무료 기간 확인 함수
window.isFreeServicePeriod = function() {
    const currentDate = window.PPOSHOP_CONFIG.CURRENT_DATE;
    const endDate = window.PPOSHOP_CONFIG.FREE_PERIOD.END_DATE;
    return currentDate <= endDate;
};

// 무료 기간 남은 일수 계산
window.getFreeServiceRemainingDays = function() {
    const currentDate = window.PPOSHOP_CONFIG.CURRENT_DATE;
    const endDate = window.PPOSHOP_CONFIG.FREE_PERIOD.END_DATE;
    
    if (currentDate > endDate) {
        return 0; // 무료 기간 종료
    }
    
    const timeDiff = endDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
};

// 날짜 포맷팅 함수
window.formatDate = function(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    switch(format) {
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'YYYY.MM.DD':
            return `${year}.${month}.${day}`;
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
        case 'KR':
            return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
        default:
            return `${year}-${month}-${day}`;
    }
};

// 콘솔 로그 출력
console.log('🎯 beautycat 시스템 설정 로드 완료');
console.log(`📅 현재 날짜: ${window.formatDate(window.PPOSHOP_CONFIG.CURRENT_DATE, 'KR')}`);
console.log(`🎁 무료 기간: ${window.formatDate(window.PPOSHOP_CONFIG.FREE_PERIOD.END_DATE, 'KR')}까지`);
console.log(`⏰ 무료 기간 남은 일수: ${window.getFreeServiceRemainingDays()}일`);