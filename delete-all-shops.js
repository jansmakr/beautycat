/**
 * 모든 샵 데이터 일괄 삭제 스크립트
 * 버전: v2.8.13.6.150
 * 작성일: 2026-01-05
 * 
 * 사용법:
 * node delete-all-shops.js
 */

const API_BASE_URL = 'https://beautycat.pages.dev'; // 실제 URL로 변경

/**
 * 모든 샵 데이터 가져오기
 */
async function getAllShops() {
    console.log('\n🔍 샵 데이터 가져오는 중...\n');
    
    let allShops = [];
    let page = 1;
    const limit = 5000;
    
    try {
        while (true) {
            const url = `${API_BASE_URL}/tables/skincare_shops?page=${page}&limit=${limit}&sort=created_at`;
            console.log(`📄 페이지 ${page} 로딩 중...`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            const shops = data.data || [];
            
            console.log(`   ✅ ${shops.length}개 로드 완료`);
            
            if (shops.length === 0) break;
            
            // 소프트 삭제된 항목 제외
            const activeShops = shops.filter(shop => !shop.deleted);
            allShops = allShops.concat(activeShops);
            
            if (shops.length < limit) break;
            page++;
        }
        
        console.log(`\n✅ 전체 ${allShops.length}개 샵 로드 완료\n`);
        return allShops;
        
    } catch (error) {
        console.error('❌ 샵 데이터 로드 실패:', error.message);
        throw error;
    }
}

/**
 * 샵 삭제 (소프트 삭제)
 */
async function deleteShop(shopId) {
    const url = `${API_BASE_URL}/tables/skincare_shops/${shopId}`;
    
    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return true;
        
    } catch (error) {
        console.error(`   ❌ 삭제 실패 (ID: ${shopId}):`, error.message);
        return false;
    }
}

/**
 * 배치 삭제
 */
async function deleteAllShops(shops) {
    console.log('🗑️  샵 삭제 시작...\n');
    
    const total = shops.length;
    let deleted = 0;
    let failed = 0;
    const BATCH_SIZE = 10; // 10개씩 배치 처리
    
    for (let i = 0; i < shops.length; i += BATCH_SIZE) {
        const batch = shops.slice(i, i + BATCH_SIZE);
        const promises = batch.map(shop => deleteShop(shop.id));
        
        const results = await Promise.all(promises);
        
        results.forEach((success, index) => {
            if (success) {
                deleted++;
                console.log(`   ✅ [${deleted}/${total}] ${batch[index].business_name || batch[index].name || 'Unknown'} 삭제 완료`);
            } else {
                failed++;
            }
        });
        
        // 진행률 표시
        const progress = Math.round((i + BATCH_SIZE) / total * 100);
        console.log(`   📊 진행률: ${progress}% (${deleted}/${total})`);
        
        // API 제한 방지를 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 삭제 완료!');
    console.log(`   전체: ${total}개`);
    console.log(`   삭제: ${deleted}개`);
    console.log(`   실패: ${failed}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * 메인 실행
 */
async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  샵 데이터 일괄 삭제 스크립트');
    console.log('   버전: v2.8.13.6.150');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        // 1) 모든 샵 가져오기
        const shops = await getAllShops();
        
        if (shops.length === 0) {
            console.log('⚠️  삭제할 샵이 없습니다.');
            return;
        }
        
        // 2) 확인 메시지
        console.log(`⚠️  경고: ${shops.length}개의 샵을 삭제하려고 합니다.`);
        console.log('   이 작업은 되돌릴 수 없습니다!\n');
        
        // Node.js 환경에서만 readline 사용
        if (typeof process !== 'undefined' && process.stdin) {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.question('   계속하시겠습니까? (yes/no): ', async (answer) => {
                if (answer.toLowerCase() === 'yes') {
                    // 3) 삭제 실행
                    await deleteAllShops(shops);
                } else {
                    console.log('\n❌ 삭제 취소됨');
                }
                rl.close();
            });
        } else {
            // 브라우저 환경 또는 자동 실행
            console.log('   ⚠️  자동 실행 모드: 5초 후 삭제 시작...\n');
            await new Promise(resolve => setTimeout(resolve, 5000));
            await deleteAllShops(shops);
        }
        
    } catch (error) {
        console.error('\n❌ 오류 발생:', error);
    }
}

// 실행
main();