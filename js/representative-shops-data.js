/**
 * BeautyCat 지역별 대표샵 데이터
 * v2.5.4 - 전화상담 신청 기능용
 * 
 * 형식:
 * - 지역명 (시/도 + 구/군)
 * - 대표샵 상호
 * - 주소 (도로명부터)
 * - 전화번호
 * - 샵 소개 영상 링크 (YouTube)
 */

const representativeShopsData = [
    // 서울특별시
    {
        id: 'rep_seoul_gangnam_001',
        state: '서울특별시',
        district: '강남구',
        shopName: '강남 프리미엄 스킨케어',
        address: '테헤란로 123길 45, 강남타워 3층',
        phone: '02-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_GANGNAM',
        description: '강남 최고급 피부관리 전문샵. 20년 경력의 원장님이 직접 관리합니다.',
        representativeTreatments: ['보톡스', '필러', '레이저 토닝', '피부 재생'],
        businessNumber: '123-45-67890',
        ownerName: '김미영',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_seoul_songpa_001',
        state: '서울특별시',
        district: '송파구',
        shopName: '송파 에스테틱 센터',
        address: '올림픽로 456, 롯데월드타워몰 5층',
        phone: '02-2345-6789',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_SONGPA',
        description: '송파구 대표 에스테틱. 최신 장비와 프리미엄 관리로 고객 만족도 1위.',
        representativeTreatments: ['안티에이징', '모공 관리', '여드름 케어', '수분 관리'],
        businessNumber: '234-56-78901',
        ownerName: '이수정',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_seoul_mapo_001',
        state: '서울특별시',
        district: '마포구',
        shopName: '홍대 뷰티 클리닉',
        address: '양화로 789, 홍대입구역 2번출구 앞',
        phone: '02-3456-7890',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_MAPO',
        description: '젊은 층에게 인기 있는 트렌디한 피부관리샵. 합리적인 가격과 효과적인 관리.',
        representativeTreatments: ['클렌징', '리프팅', '아쿠아필', '피부 진정'],
        businessNumber: '345-67-89012',
        ownerName: '박현주',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_seoul_jongno_001',
        state: '서울특별시',
        district: '종로구',
        shopName: '종로 한방 스킨케어',
        address: '종로 101, 광화문역 6번출구',
        phone: '02-4567-8901',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_JONGNO',
        description: '한방 피부관리 전문. 천연 한방 재료를 사용한 순수 피부 케어.',
        representativeTreatments: ['한방팩', '경락 마사지', '독소 배출', '피부 톤업'],
        businessNumber: '456-78-90123',
        ownerName: '최은영',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_seoul_seocho_001',
        state: '서울특별시',
        district: '서초구',
        shopName: '서초 명품 에스테틱',
        address: '서초대로 234, 강남역 12번출구',
        phone: '02-5678-9012',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_SEOCHO',
        description: '서초구 프리미엄 에스테틱. VIP 고객 전용 관리 프로그램 운영.',
        representativeTreatments: ['골드 테라피', '콜라겐 관리', '스킨부스터', '프락셀'],
        businessNumber: '567-89-01234',
        ownerName: '정민서',
        approved: 1,
        status: 'approved'
    },

    // 경기도
    {
        id: 'rep_gyeonggi_suwon_001',
        state: '경기도',
        district: '수원시',
        shopName: '수원 퀸즈 스킨케어',
        address: '권선로 567, 수원역 광장',
        phone: '031-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_SUWON',
        description: '수원 1호점 피부관리실. 30년 전통의 신뢰받는 피부 전문샵.',
        representativeTreatments: ['기미 관리', '주름 개선', '탄력 관리', '색소 침착 관리'],
        businessNumber: '678-90-12345',
        ownerName: '강지현',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_gyeonggi_seongnam_001',
        state: '경기도',
        district: '성남시',
        shopName: '분당 뷰티 라운지',
        address: '판교역로 890, 판교테크노밸리 A동',
        phone: '031-2345-6789',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_SEONGNAM',
        description: '분당 신도시 대표 뷰티 라운지. 직장인들을 위한 점심시간 특별 케어.',
        representativeTreatments: ['스트레스 케어', '눈가 관리', '목 주름 관리', '힐링 관리'],
        businessNumber: '789-01-23456',
        ownerName: '송혜교',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_gyeonggi_goyang_001',
        state: '경기도',
        district: '고양시',
        shopName: '일산 프레쉬 스킨',
        address: '중앙로 1111, 일산서구청 맞은편',
        phone: '031-3456-7890',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_GOYANG',
        description: '일산 지역 베스트 피부샵. 여성 전용 공간으로 프라이버시 보장.',
        representativeTreatments: ['홈 케어 교육', '계절 관리', '민감 피부 케어', '수분 충전'],
        businessNumber: '890-12-34567',
        ownerName: '윤서연',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_gyeonggi_yongin_001',
        state: '경기도',
        district: '용인시',
        shopName: '용인 뷰티 스파',
        address: '기흥로 1234, 기흥역 앞 메디컬빌딩 2층',
        phone: '031-4567-8901',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_YONGIN',
        description: '용인 수지/기흥 지역 최대 규모 스파. 프리미엄 관리부터 기본 케어까지.',
        representativeTreatments: ['바디 케어', '슬리밍', '셀룰라이트 제거', '림프 순환'],
        businessNumber: '901-23-45678',
        ownerName: '임나영',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_gyeonggi_bucheon_001',
        state: '경기도',
        district: '부천시',
        shopName: '부천 스킨 앤 바디',
        address: '부천로 2222, 부천시청역 7번출구',
        phone: '032-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_BUCHEON',
        description: '부천시 대표 복합 뷰티 센터. 피부관리와 체형관리를 동시에.',
        representativeTreatments: ['복합 관리', '전신 케어', '웨딩 관리', 'VIP 패키지'],
        businessNumber: '012-34-56789',
        ownerName: '한예슬',
        approved: 1,
        status: 'approved'
    },

    // 인천광역시
    {
        id: 'rep_incheon_namdong_001',
        state: '인천광역시',
        district: '남동구',
        shopName: '인천 골든 스킨',
        address: '구월로 3333, 구월동 로데오거리',
        phone: '032-2345-6789',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_INCHEON',
        description: '인천 남동구 1위 피부관리실. 피부 타입별 맞춤 프로그램 운영.',
        representativeTreatments: ['지성 피부 관리', '건성 피부 관리', '복합성 관리', '민감성 관리'],
        businessNumber: '123-45-67891',
        ownerName: '조민지',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_incheon_yeonsu_001',
        state: '인천광역시',
        district: '연수구',
        shopName: '송도 럭셔리 케어',
        address: '송도국제대로 456, 센트럴파크 타워 3층',
        phone: '032-3456-7890',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_YEONSU',
        description: '송도 신도시 럭셔리 에스테틱. 해외 유명 브랜드 제품 사용.',
        representativeTreatments: ['프리미엄 케어', '해외 명품 관리', '셀러브리티 관리', 'VIP 전용'],
        businessNumber: '234-56-78902',
        ownerName: '서지혜',
        approved: 1,
        status: 'approved'
    },

    // 부산광역시
    {
        id: 'rep_busan_haeundae_001',
        state: '부산광역시',
        district: '해운대구',
        shopName: '해운대 씨사이드 스킨',
        address: '해운대해변로 789, 해운대역 3번출구',
        phone: '051-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_HAEUNDAE',
        description: '해운대 대표 피부샵. 바다를 보며 받는 힐링 케어가 특징.',
        representativeTreatments: ['해양 테라피', '미네랄 관리', '시원한 진정 케어', '휴가 특별 관리'],
        representativeTreatments: ['해양 테라피', '미네랄 관리', '시원한 진정 케어', '휴가 특별 관리'],
        businessNumber: '345-67-89013',
        ownerName: '김해림',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_busan_busanjin_001',
        state: '부산광역시',
        district: '부산진구',
        shopName: '서면 에이스 스킨케어',
        address: '중앙대로 1010, 서면역 5번출구',
        phone: '051-2345-6789',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_BUSANJIN',
        description: '부산 서면 중심가 피부관리 명가. 20대부터 50대까지 모든 연령층 환영.',
        representativeTreatments: ['연령별 케어', '피부 타입별 관리', '계절 맞춤 관리', '신속 관리'],
        businessNumber: '456-78-90124',
        ownerName: '최유진',
        approved: 1,
        status: 'approved'
    },

    // 대구광역시
    {
        id: 'rep_daegu_suseong_001',
        state: '대구광역시',
        district: '수성구',
        shopName: '대구 엘레강스 뷰티',
        address: '달구벌대로 2020, 수성못 근처',
        phone: '053-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_DAEGU',
        description: '대구 수성구 프리미엄 뷰티샵. 고급 인테리어와 최상의 서비스.',
        representativeTreatments: ['프리미엄 관리', '여성 전용 관리', '럭셔리 패키지', 'VIP 관리'],
        businessNumber: '567-89-01235',
        ownerName: '배수지',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_daegu_jung_001',
        state: '대구광역시',
        district: '중구',
        shopName: '동성로 스킨 스튜디오',
        address: '동성로 303, 중앙로역 2번출구',
        phone: '053-2345-6789',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_DAEGU_JUNG',
        description: '대구 동성로 핫플레이스 피부샵. 젊은 감각과 합리적 가격.',
        representativeTreatments: ['트러블 케어', '모공 축소', '미백 관리', '즉시 효과 관리'],
        businessNumber: '678-90-12346',
        ownerName: '이채영',
        approved: 1,
        status: 'approved'
    },

    // 광주광역시
    {
        id: 'rep_gwangju_donggu_001',
        state: '광주광역시',
        district: '동구',
        shopName: '광주 퓨어 스킨',
        address: '금남로 404, 충장로역 1번출구',
        phone: '062-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_GWANGJU',
        description: '광주 동구 청결 1위 피부샵. 위생과 안전을 최우선으로.',
        representativeTreatments: ['청결 관리', '자극 없는 케어', '진정 관리', '아로마 테라피'],
        businessNumber: '789-01-23457',
        ownerName: '박보영',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_gwangju_seogu_001',
        state: '광주광역시',
        district: '서구',
        shopName: '상무지구 뷰티 센터',
        address: '상무대로 505, 상무역 3번출구',
        phone: '062-2345-6789',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_GWANGJU_SEOGU',
        description: '광주 상무지구 대표샵. 직장인과 주부들에게 인기.',
        representativeTreatments: ['피로 회복 관리', '스트레스 완화', '눈가 집중 케어', '데일리 케어'],
        businessNumber: '890-12-34568',
        ownerName: '김태리',
        approved: 1,
        status: 'approved'
    },

    // 대전광역시
    {
        id: 'rep_daejeon_seogu_001',
        state: '대전광역시',
        district: '서구',
        shopName: '대전 힐링 스파',
        address: '둔산로 606, 둔산역 4번출구',
        phone: '042-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_DAEJEON',
        description: '대전 둔산동 대표 힐링 스파. 몸과 마음의 휴식.',
        representativeTreatments: ['힐링 관리', '아로마 마사지', '스파 테라피', '전신 릴렉스'],
        businessNumber: '901-23-45679',
        ownerName: '정유미',
        approved: 1,
        status: 'approved'
    },
    {
        id: 'rep_daejeon_junggu_001',
        state: '대전광역시',
        district: '중구',
        shopName: '은행동 클래식 스킨',
        address: '대종로 707, 대전역 2번출구',
        phone: '042-2345-6789',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_DAEJEON_JUNG',
        description: '대전 중구 클래식한 분위기의 피부샵. 전통과 현대의 조화.',
        representativeTreatments: ['클래식 케어', '전통 관리법', '현대 피부 과학', '맞춤형 프로그램'],
        businessNumber: '012-34-56780',
        ownerName: '한지민',
        approved: 1,
        status: 'approved'
    },

    // 울산광역시
    {
        id: 'rep_ulsan_namgu_001',
        state: '울산광역시',
        district: '남구',
        shopName: '울산 프레쉬 케어',
        address: '삼산로 808, 삼산역 1번출구',
        phone: '052-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_ULSAN',
        description: '울산 남구 신규 오픈 프리미엄 케어센터. 최신 장비 완비.',
        representativeTreatments: ['최신 기술 관리', 'LED 테라피', '고주파 관리', '초음파 관리'],
        businessNumber: '123-45-67892',
        ownerName: '전지현',
        approved: 1,
        status: 'approved'
    },

    // 세종특별자치시
    {
        id: 'rep_sejong_001',
        state: '세종특별자치시',
        district: '세종시',
        shopName: '세종 로얄 스킨케어',
        address: '한누리대로 909, 시청역 5번출구',
        phone: '044-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_SEJONG',
        description: '세종시 유일 프리미엄 피부관리실. 공무원 할인 혜택.',
        representativeTreatments: ['공직자 전용 관리', '스트레스 완화', '피로 해소', '직장인 특별 케어'],
        businessNumber: '234-56-78903',
        ownerName: '손예진',
        approved: 1,
        status: 'approved'
    },

    // 강원도
    {
        id: 'rep_gangwon_chuncheon_001',
        state: '강원도',
        district: '춘천시',
        shopName: '춘천 네이처 스킨',
        address: '중앙로 1000, 춘천역 앞',
        phone: '033-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_CHUNCHEON',
        description: '춘천 자연주의 피부관리. 천연 재료를 활용한 순수 케어.',
        representativeTreatments: ['자연주의 관리', '천연 팩', '유기농 제품', '친환경 케어'],
        businessNumber: '345-67-89014',
        ownerName: '공효진',
        approved: 1,
        status: 'approved'
    },

    // 충청북도
    {
        id: 'rep_chungbuk_cheongju_001',
        state: '충청북도',
        district: '청주시',
        shopName: '청주 엘리트 뷰티',
        address: '상당로 1111, 청주시청 근처',
        phone: '043-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_CHEONGJU',
        description: '청주 상당구 최고급 뷰티샵. 개인별 맞춤 프로그램.',
        representativeTreatments: ['개인 맞춤 관리', '피부 진단', '정밀 케어', '장기 프로그램'],
        businessNumber: '456-78-90125',
        ownerName: '이보영',
        approved: 1,
        status: 'approved'
    },

    // 충청남도
    {
        id: 'rep_chungnam_cheonan_001',
        state: '충청남도',
        district: '천안시',
        shopName: '천안 스타 스킨케어',
        address: '불당대로 1212, 천안역 3번출구',
        phone: '041-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_CHEONAN',
        description: '천안 불당/신부동 지역 대표 피부샵. 합리적 가격의 고품질 관리.',
        representativeTreatments: ['합리적 가격 관리', '기본 케어', '주기적 관리', '학생 할인'],
        businessNumber: '567-89-01236',
        ownerName: '심은경',
        approved: 1,
        status: 'approved'
    },

    // 전라북도
    {
        id: 'rep_jeonbuk_jeonju_001',
        state: '전라북도',
        district: '전주시',
        shopName: '전주 한옥 스킨케어',
        address: '태조로 1313, 전주한옥마을 입구',
        phone: '063-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_JEONJU',
        description: '전주 한옥마을 전통 피부관리. 한방과 현대 과학의 만남.',
        representativeTreatments: ['한방 전통 관리', '한옥 힐링', '전통 재료 사용', '문화 체험'],
        businessNumber: '678-90-12347',
        ownerName: '김고은',
        approved: 1,
        status: 'approved'
    },

    // 전라남도
    {
        id: 'rep_jeonnam_mokpo_001',
        state: '전라남도',
        district: '목포시',
        shopName: '목포 오션 뷰티',
        address: '평화로 1414, 목포역 광장',
        phone: '061-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_MOKPO',
        description: '목포 해안가 뷰티샵. 바다를 느끼며 받는 특별한 케어.',
        representativeTreatments: ['해양 성분 관리', '미네랄 케어', '시원한 관리', '휴양지 특별 관리'],
        businessNumber: '789-01-23458',
        ownerName: '이영애',
        approved: 1,
        status: 'approved'
    },

    // 경상북도
    {
        id: 'rep_gyeongbuk_pohang_001',
        state: '경상북도',
        district: '포항시',
        shopName: '포항 실버 스킨',
        address: '포스코대로 1515, 포항역 1번출구',
        phone: '054-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_POHANG',
        description: '포항 최대 규모 피부관리실. 전 연령층 맞춤 관리.',
        representativeTreatments: ['전 연령 케어', '시니어 관리', '청소년 관리', '가족 패키지'],
        businessNumber: '890-12-34569',
        ownerName: '송혜교',
        approved: 1,
        status: 'approved'
    },

    // 경상남도
    {
        id: 'rep_gyeongnam_changwon_001',
        state: '경상남도',
        district: '창원시',
        shopName: '창원 퓨어 뷰티',
        address: '용지로 1616, 창원중앙역 4번출구',
        phone: '055-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_CHANGWON',
        description: '창원 성산/용지 지역 대표 뷰티센터. 청결과 위생 최우선.',
        representativeTreatments: ['위생 관리', '청결 케어', '안전한 관리', '감염 예방'],
        businessNumber: '901-23-45670',
        ownerName: '전지현',
        approved: 1,
        status: 'approved'
    },

    // 제주특별자치도
    {
        id: 'rep_jeju_jejusi_001',
        state: '제주특별자치도',
        district: '제주시',
        shopName: '제주 아일랜드 스파',
        address: '연동 1717, 제주공항 근처',
        phone: '064-1234-5678',
        videoUrl: 'https://www.youtube.com/watch?v=PLACEHOLDER_JEJU',
        description: '제주도 천연 재료를 활용한 특별 관리. 관광객 환영.',
        representativeTreatments: ['제주 천연 재료', '화산송이 팩', '감귤 비타민 케어', '제주 돌하르방 마사지'],
        businessNumber: '012-34-56781',
        ownerName: '수지',
        approved: 1,
        status: 'approved'
    }
];

// 지역별 검색 함수
function getRepresentativeShopByRegion(state, district) {
    return representativeShopsData.find(
        shop => shop.state === state && shop.district === district && shop.status === 'approved'
    );
}

// 시/도별 대표샵 목록 가져오기
function getRepresentativeShopsByState(state) {
    return representativeShopsData.filter(
        shop => shop.state === state && shop.status === 'approved'
    );
}

// 전체 대표샵 목록 가져오기
function getAllRepresentativeShops() {
    return representativeShopsData.filter(shop => shop.status === 'approved');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        representativeShopsData,
        getRepresentativeShopByRegion,
        getRepresentativeShopsByState,
        getAllRepresentativeShops
    };
}
