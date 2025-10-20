/**
 * beautycat 지역별 견적 매칭 시스템
 * 고객의 시/구 선택 시 해당 지역의 샵들이 견적을 받는 시스템
 */

class RegionalMatching {
    constructor() {
        this.regions = {
            '서울특별시': [
                '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
                '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
                '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
            ],
            '부산광역시': [
                '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구',
                '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'
            ],
            '대구광역시': [
                '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'
            ],
            '인천광역시': [
                '강화군', '계양구', '미추홀구', '남동구', '동구', '부평구', '서구', '연수구', '옹진군', '중구'
            ],
            '광주광역시': [
                '광산구', '남구', '동구', '북구', '서구'
            ],
            '대전광역시': [
                '대덕구', '동구', '서구', '유성구', '중구'
            ],
            '울산광역시': [
                '남구', '동구', '북구', '울주군', '중구'
            ],
            '세종특별자치시': [
                '세종시'
            ],
            '경기도': [
                '가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시',
                '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시',
                '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시',
                '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'
            ],
            '강원도': [
                '강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군',
                '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'
            ],
            '충청북도': [
                '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '진천군', '청주시', '충주시', '증평군'
            ],
            '충청남도': [
                '계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시',
                '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'
            ],
            '전라북도': [
                '고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군',
                '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'
            ],
            '전라남도': [
                '강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시',
                '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군',
                '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'
            ],
            '경상북도': [
                '경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군',
                '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군',
                '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'
            ],
            '경상남도': [
                '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군',
                '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'
            ],
            '제주특별자치도': [
                '서귀포시', '제주시'
            ]
        };
        
        this.init();
    }

    init() {
        console.log('🗺️ 지역별 매칭 시스템 초기화');
        this.setupRegionalSelectors();
        this.bindEvents();
    }

    /**
     * 지역 선택 드롭다운 설정
     */
    setupRegionalSelectors() {
        // 모든 페이지의 시/도 선택 요소들
        const stateSelectors = [
            'stateSelect',        // 메인 페이지 견적 요청 폼
            'shop_state',         // 샵 등록 폼
            'customerState'       // 기타 폼들
        ];

        const districtSelectors = [
            'citySelect',         // 메인 페이지 견적 요청 폼
            'shop_district',      // 샵 등록 폼
            'customerDistrict'    // 기타 폼들
        ];

        // 시/도 옵션 추가
        stateSelectors.forEach(selectorId => {
            const element = document.getElementById(selectorId);
            if (element) {
                this.populateStateOptions(element);
            }
        });

        console.log('✅ 지역 선택 드롭다운 설정 완료');
    }

    /**
     * 시/도 옵션 추가
     */
    populateStateOptions(selectElement) {
        // 기존 옵션 유지하고 지역 옵션 추가
        Object.keys(this.regions).forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            selectElement.appendChild(option);
        });
    }

    /**
     * 시/도 선택 시 구/군 옵션 업데이트
     */
    updateDistrictOptions(state, districtSelectElement) {
        // 구/군 선택 초기화
        districtSelectElement.innerHTML = '<option value="">구/군을 선택해주세요</option>';
        
        if (state && this.regions[state]) {
            // 선택된 시/도의 구/군 목록 추가
            this.regions[state].forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtSelectElement.appendChild(option);
            });
            
            districtSelectElement.disabled = false;
        } else {
            districtSelectElement.disabled = true;
        }
    }

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 메인 페이지 견적 요청 폼
        const stateSelect = document.getElementById('stateSelect');
        const citySelect = document.getElementById('citySelect');
        
        if (stateSelect && citySelect) {
            stateSelect.addEventListener('change', (e) => {
                this.updateDistrictOptions(e.target.value, citySelect);
            });
        }

        // 샵 등록 폼
        const shopStateSelect = document.getElementById('shop_state');
        const shopDistrictSelect = document.getElementById('shop_district');
        
        if (shopStateSelect && shopDistrictSelect) {
            shopStateSelect.addEventListener('change', (e) => {
                this.updateDistrictOptions(e.target.value, shopDistrictSelect);
            });
        }

        console.log('✅ 지역 선택 이벤트 바인딩 완료');
    }

    /**
     * 견적 요청 시 해당 지역의 샵들 찾기
     */
    async findShopsInRegion(state, district) {
        try {
            console.log(`🔍 지역별 샵 검색: ${state} ${district}`);
            
            // API를 통해 해당 지역의 승인된 샵들 조회
            const response = await fetch(`tables/skincare_shops?search=${state}&limit=100`);
            if (!response.ok) {
                throw new Error('샵 조회 실패');
            }
            
            const data = await response.json();
            
            // 지역 필터링 (state와 district 모두 일치, shop_state/shop_district도 확인)
            const regionalShops = data.data.filter(shop => 
                ((shop.state === state && shop.district === district) ||
                 (shop.shop_state === state && shop.shop_district === district)) && 
                shop.status === 'approved'
            );
            
            console.log(`📍 ${state} ${district} 지역 샵 ${regionalShops.length}개 발견`);
            
            return regionalShops;
        } catch (error) {
            console.error('지역별 샵 검색 오류:', error);
            return [];
        }
    }

    /**
     * 견적 요청을 해당 지역 샵들에게 배포
     */
    async distributeQuoteRequest(consultationData) {
        try {
            const { state, district } = consultationData;
            
            // 해당 지역 샵들 찾기
            const regionalShops = await this.findShopsInRegion(state, district);
            
            if (regionalShops.length === 0) {
                console.warn(`⚠️ ${state} ${district} 지역에 등록된 샵이 없습니다`);
                return {
                    success: false,
                    message: '해당 지역에 등록된 피부관리실이 없습니다. 인근 지역으로 확장하여 검색해보시겠어요?',
                    shopsCount: 0
                };
            }

            // 상담 요청 저장
            const consultationResponse = await fetch('tables/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...consultationData,
                    status: 'pending',
                    submission_date: new Date().toISOString()
                })
            });

            if (!consultationResponse.ok) {
                throw new Error('상담 요청 저장 실패');
            }

            const savedConsultation = await consultationResponse.json();

            // 각 샵에게 알림 보내기 (실제 구현에서는 이메일/SMS 발송)
            const notifications = await Promise.all(
                regionalShops.map(shop => this.notifyShop(shop, savedConsultation))
            );

            const successfulNotifications = notifications.filter(n => n.success).length;

            console.log(`✅ 견적 요청 배포 완료: ${successfulNotifications}/${regionalShops.length}개 샵`);

            return {
                success: true,
                message: `${state} ${district} 지역의 ${regionalShops.length}개 피부관리실에 견적 요청이 전송되었습니다. 24시간 내에 연락드릴 예정입니다.`,
                shopsCount: regionalShops.length,
                consultationId: savedConsultation.id,
                shops: regionalShops.map(shop => ({
                    name: shop.shop_name,
                    phone: shop.phone
                }))
            };

        } catch (error) {
            console.error('견적 요청 배포 오류:', error);
            return {
                success: false,
                message: '견적 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                shopsCount: 0
            };
        }
    }

    /**
     * 개별 샵에게 알림 보내기
     */
    async notifyShop(shop, consultation) {
        try {
            // 실제 환경에서는 이메일/SMS API 호출
            console.log(`📧 ${shop.shop_name}에게 견적 요청 알림 발송`);
            
            // 알림 데이터 예시
            const notificationData = {
                shopId: shop.id,
                consultationId: consultation.id,
                customerName: consultation.customer_name,
                treatmentTypes: consultation.treatment_types,
                region: `${consultation.state} ${consultation.district}`,
                timestamp: new Date().toISOString()
            };

            // 여기서 실제 이메일/SMS 발송 로직 구현
            // await sendEmail(shop.email, notificationTemplate);
            // await sendSMS(shop.phone, smsTemplate);

            return { success: true, shopId: shop.id };

        } catch (error) {
            console.error(`샵 알림 발송 오류 (${shop.shop_name}):`, error);
            return { success: false, shopId: shop.id, error: error.message };
        }
    }

    /**
     * 지역 통계 조회
     */
    async getRegionalStats() {
        try {
            const response = await fetch('tables/skincare_shops?limit=1000');
            if (!response.ok) {
                throw new Error('샵 데이터 조회 실패');
            }

            const data = await response.json();
            const shops = data.data.filter(shop => shop.status === 'approved');

            // 지역별 샵 수 통계
            const regionalStats = {};
            
            shops.forEach(shop => {
                const region = `${shop.state} ${shop.district}`;
                if (!regionalStats[region]) {
                    regionalStats[region] = {
                        count: 0,
                        shops: []
                    };
                }
                regionalStats[region].count++;
                regionalStats[region].shops.push({
                    name: shop.shop_name,
                    treatmentTypes: shop.treatment_types
                });
            });

            console.log('📊 지역별 샵 통계:', regionalStats);
            return regionalStats;

        } catch (error) {
            console.error('지역 통계 조회 오류:', error);
            return {};
        }
    }

    /**
     * 인근 지역 추천
     */
    getAdjacentRegions(state, district) {
        // 서울 특별시의 인근 구 매핑 (예시)
        const seoulAdjacent = {
            '강남구': ['서초구', '송파구', '광진구'],
            '강북구': ['성북구', '도봉구', '노원구'],
            '마포구': ['서대문구', '은평구', '용산구'],
            // ... 더 많은 매핑 추가
        };

        // 경기도의 인근 시 매핑 (예시)
        const gyeonggiAdjacent = {
            '수원시': ['용인시', '화성시', '안양시'],
            '성남시': ['용인시', '광주시', '하남시'],
            // ... 더 많은 매핑 추가
        };

        if (state === '서울특별시' && seoulAdjacent[district]) {
            return seoulAdjacent[district].map(d => ({ state, district: d }));
        }

        if (state === '경기도' && gyeonggiAdjacent[district]) {
            return gyeonggiAdjacent[district].map(d => ({ state, district: d }));
        }

        return [];
    }

    /**
     * 확장 검색 (인근 지역 포함)
     */
    async expandedSearch(state, district) {
        try {
            console.log(`🔍 확장 검색 시작: ${state} ${district}`);
            
            // 원래 지역 검색
            let allShops = await this.findShopsInRegion(state, district);
            
            // 인근 지역 검색
            const adjacentRegions = this.getAdjacentRegions(state, district);
            
            for (const region of adjacentRegions) {
                const nearbyShops = await this.findShopsInRegion(region.state, region.district);
                allShops = [...allShops, ...nearbyShops];
            }
            
            // 중복 제거
            const uniqueShops = allShops.filter((shop, index, self) => 
                index === self.findIndex(s => s.id === shop.id)
            );
            
            console.log(`📍 확장 검색 결과: ${uniqueShops.length}개 샵`);
            return uniqueShops;

        } catch (error) {
            console.error('확장 검색 오류:', error);
            return [];
        }
    }
}

// 전역 인스턴스 생성
window.regionalMatching = new RegionalMatching();

// 내보내기 (ES6 모듈 환경에서 사용 시)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegionalMatching;
}

console.log('🗺️ beautycat 지역별 매칭 시스템 로드 완료!');
console.log('📍 사용법: regionalMatching.distributeQuoteRequest(consultationData)');
console.log('📊 통계: regionalMatching.getRegionalStats()');