/**
 * fix-shop-data-test.js
 * 처음 10개만 테스트하는 버전
 */

const API_BASE = 'https://beautycat.kr';

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

function extractDistrict(address) {
    if (!address) return '';
    
    let match = address.match(/^([가-힣]+특별시|[가-힣]+광역시|[가-힣]+특별자치시|[가-힣]+도)\s+([가-힣]+구|[가-힣]+군|[가-힣]+시)\s+([가-힣]+동|[가-힣]+읍|[가-힣]+면)/);
    if (match) return match[2];
    
    match = address.match(/^([가-힣]+특별시|[가-힣]+광역시|[가-힣]+특별자치시|[가-힣]+도)\s+([가-힣]+구|[가-힣]+군|[가-힣]+시)/);
    if (match) return match[2];
    
    return '';
}

async function main() {
    console.log('🧪 테스트 모드: 처음 10개만 수정\n');
    
    try {
        // 1) 처음 10개만 가져오기
        const url = `${API_BASE}/tables/skincare_shops?limit=10&sort=created_at`;
        const response = await fetch(url);
        const data = await response.json();
        const shops = data.data.filter(s => !s.deleted);
        
        console.log(`📊 테스트 샵 수: ${shops.length}개\n`);
        
        let updatedCount = 0;
        
        for (const shop of shops) {
            console.log(`\n🔍 [${shop.id}] ${shop.name}`);
            console.log(`   현재: state="${shop.state}", district="${shop.district}"`);
            console.log(`   주소: ${shop.address}`);
            
            let needsUpdate = false;
            const updates = {};
            
            // state 정규화
            if (shop.state && stateMap[shop.state]) {
                updates.state = stateMap[shop.state];
                needsUpdate = true;
                console.log(`   ✏️ state: "${shop.state}" → "${updates.state}"`);
            }
            
            // district 추출
            if (!shop.district && shop.address) {
                const extractedDistrict = extractDistrict(shop.address);
                if (extractedDistrict) {
                    updates.district = extractedDistrict;
                    needsUpdate = true;
                    console.log(`   ✏️ district: 추출됨 → "${extractedDistrict}"`);
                }
            }
            
            if (needsUpdate) {
                console.log(`   📝 업데이트 내용:`, updates);
                
                // ⚠️ 실제 업데이트 주석 처리 (테스트)
                /*
                const updateUrl = `${API_BASE}/tables/skincare_shops/${shop.id}`;
                const updateResponse = await fetch(updateUrl, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
                
                if (updateResponse.ok) {
                    console.log(`   ✅ 업데이트 완료`);
                    updatedCount++;
                } else {
                    console.log(`   ❌ 업데이트 실패: ${updateResponse.status}`);
                }
                */
                
                console.log(`   ⚠️ [테스트 모드] 실제 업데이트 안 함`);
                updatedCount++;
            } else {
                console.log(`   ⏭️ 업데이트 불필요`);
            }
        }
        
        console.log(`\n📊 테스트 결과:`);
        console.log(`   - 대상: ${shops.length}개`);
        console.log(`   - 업데이트 필요: ${updatedCount}개`);
        console.log(`\n💡 실제 업데이트하려면 주석을 해제하세요 (라인 72-83)`);
        
    } catch (error) {
        console.error('❌ 에러:', error);
    }
}

main();
