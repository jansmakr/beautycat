/**
 * fix-shop-data.js
 * 기존 skincare_shops 데이터의 state와 district를 수정하는 스크립트
 * 
 * 실행 방법:
 * node fix-shop-data.js
 */

const API_BASE = 'https://beautycat.kr';

// 시/도 정규화 매핑
const stateMap = {
    '서울': '서울특별시',
    '부산': '부산광역시',
    '대구': '대구광역시',
    '인천': '인천광역시',
    '광주': '광주광역시',
    '대전': '대전광역시',
    '울산': '울산광역시',
    '세종': '세종특별자치시',
    '경기': '경기도',
    '강원': '강원특별자치도',
    '충북': '충청북도',
    '충남': '충청남도',
    '전북': '전북특별자치도',
    '전남': '전라남도',
    '경북': '경상북도',
    '경남': '경상남도',
    '제주': '제주특별자치도'
};

// 주소에서 district 추출
function extractDistrict(address) {
    if (!address) return '';
    
    // 패턴 1: 시/도 + 구/군 + 읍/면/동
    let match = address.match(/^([가-힣]+특별시|[가-힣]+광역시|[가-힣]+특별자치시|[가-힣]+도)\s+([가-힣]+구|[가-힣]+군|[가-힣]+시)\s+([가-힣]+동|[가-힣]+읍|[가-힣]+면)/);
    
    if (match) {
        return match[2];  // 구/군
    }
    
    // 패턴 2: 시/도 + 구/군 (읍/면/동 없음)
    match = address.match(/^([가-힣]+특별시|[가-힣]+광역시|[가-힣]+특별자치시|[가-힣]+도)\s+([가-힣]+구|[가-힣]+군|[가-힣]+시)/);
    
    if (match) {
        return match[2];  // 구/군
    }
    
    return '';
}

// 샵 데이터 가져오기
async function fetchAllShops() {
    console.log('📡 샵 데이터 로딩 중...');
    const limit = 5000;
    let page = 1;
    let allShops = [];
    
    while (true) {
        const url = `${API_BASE}/tables/skincare_shops?limit=${limit}&page=${page}&sort=created_at`;
        console.log(`📄 페이지 ${page} 로딩...`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const shops = data.data.filter(s => !s.deleted);
        
        console.log(`✅ ${shops.length}개 로딩 완료`);
        allShops = allShops.concat(shops);
        
        if (shops.length < limit) break;  // 마지막 페이지
        page++;
    }
    
    console.log(`📊 전체 샵 수: ${allShops.length}개`);
    return allShops;
}

// 샵 데이터 수정
async function fixShopData(shop) {
    let needsUpdate = false;
    const updates = {};
    
    // 1) state 정규화
    if (shop.state && stateMap[shop.state]) {
        updates.state = stateMap[shop.state];
        needsUpdate = true;
        console.log(`🗺️ [${shop.id}] state: "${shop.state}" → "${updates.state}"`);
    }
    
    // 2) district 추출 (비어있는 경우만)
    if (!shop.district && shop.address) {
        const extractedDistrict = extractDistrict(shop.address);
        if (extractedDistrict) {
            updates.district = extractedDistrict;
            needsUpdate = true;
            console.log(`📍 [${shop.id}] district 추출: "${extractedDistrict}" (from: ${shop.address.substring(0, 50)}...)`);
        }
    }
    
    // 3) 업데이트 실행
    if (needsUpdate) {
        const url = `${API_BASE}/tables/skincare_shops/${shop.id}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
            console.error(`❌ [${shop.id}] 업데이트 실패:`, response.status);
            return false;
        }
        
        console.log(`✅ [${shop.id}] 업데이트 완료`);
        return true;
    }
    
    return false;
}

// 메인 실행
async function main() {
    console.log('🚀 샵 데이터 수정 시작...\n');
    
    try {
        // 1) 모든 샵 데이터 가져오기
        const shops = await fetchAllShops();
        
        console.log('\n🔧 데이터 수정 시작...\n');
        
        let updatedCount = 0;
        let errorCount = 0;
        
        // 2) 각 샵 데이터 수정 (배치 처리)
        const BATCH_SIZE = 10;
        for (let i = 0; i < shops.length; i += BATCH_SIZE) {
            const batch = shops.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(
                batch.map(shop => fixShopData(shop).catch(err => {
                    console.error(`❌ [${shop.id}] 에러:`, err.message);
                    return false;
                }))
            );
            
            updatedCount += results.filter(r => r === true).length;
            errorCount += results.filter(r => r === false).length;
            
            console.log(`\n📊 진행 상황: ${Math.min(i + BATCH_SIZE, shops.length)}/${shops.length}`);
            console.log(`✅ 업데이트: ${updatedCount}개 | ⏭️ 건너뛰기: ${shops.length - updatedCount - errorCount}개 | ❌ 에러: ${errorCount}개\n`);
            
            // API 부하 방지를 위한 대기
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\n🎉 완료!');
        console.log(`📊 최종 결과:`);
        console.log(`   - 전체: ${shops.length}개`);
        console.log(`   - 업데이트: ${updatedCount}개`);
        console.log(`   - 건너뛰기: ${shops.length - updatedCount - errorCount}개`);
        console.log(`   - 에러: ${errorCount}개`);
        
    } catch (error) {
        console.error('❌ 에러 발생:', error);
        process.exit(1);
    }
}

// 실행
main();
