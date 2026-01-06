/**
 * ===== 일괄 삭제 시스템 =====
 * v2.8.13.6.150 - 2026-01-06
 * 
 * 기능:
 * - 모든 샵 데이터 일괄 삭제
 * - 실시간 진행 상황 표시
 * - 배치 처리 (10개씩)
 * - 삭제 성공/실패 통계
 */

// 일괄 삭제 모달 열기
function showBulkDeleteModal() {
    console.log('🗑️ 일괄 삭제 모달 열기');
    
    const modal = document.getElementById('bulk-delete-modal');
    if (!modal) {
        console.error('❌ 모달 없음');
        return;
    }
    
    // 모달 표시
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    // 초기화
    resetBulkDeleteUI();
    
    console.log('✅ 일괄 삭제 모달 열림');
}

// 일괄 삭제 모달 닫기
function closeBulkDeleteModal() {
    console.log('❌ 일괄 삭제 모달 닫기');
    
    const modal = document.getElementById('bulk-delete-modal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    modal.style.display = 'none';
    
    // UI 초기화
    resetBulkDeleteUI();
    
    console.log('✅ 일괄 삭제 모달 닫힘');
}

// UI 초기화
function resetBulkDeleteUI() {
    // 통계 초기화
    document.getElementById('bulk-delete-total').textContent = '0';
    document.getElementById('bulk-delete-deleted').textContent = '0';
    document.getElementById('bulk-delete-failed').textContent = '0';
    
    // 진행률 초기화
    const progressBar = document.getElementById('bulk-delete-progress-bar');
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    
    document.getElementById('bulk-delete-progress-text').textContent = '';
    
    // 로그 초기화
    document.getElementById('bulk-delete-log').innerHTML = '';
    
    // 버튼 활성화
    document.getElementById('bulk-delete-start-btn').disabled = false;
    document.getElementById('bulk-delete-start-btn').classList.remove('opacity-50', 'cursor-not-allowed');
    
    // 통계/진행률 숨기기
    document.getElementById('bulk-delete-stats').classList.add('hidden');
    document.getElementById('bulk-delete-progress').classList.add('hidden');
}

// 로그 추가
function addBulkDeleteLog(message, type = 'info') {
    const logContainer = document.getElementById('bulk-delete-log');
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    
    let icon = 'ℹ️';
    let color = 'text-green-400';
    
    if (type === 'success') {
        icon = '✅';
        color = 'text-green-400';
    } else if (type === 'error') {
        icon = '❌';
        color = 'text-red-400';
    } else if (type === 'warning') {
        icon = '⚠️';
        color = 'text-yellow-400';
    }
    
    const logLine = document.createElement('div');
    logLine.className = color;
    logLine.textContent = `[${timestamp}] ${icon} ${message}`;
    
    logContainer.appendChild(logLine);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// 진행률 업데이트
function updateBulkDeleteProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    
    const progressBar = document.getElementById('bulk-delete-progress-bar');
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
    
    document.getElementById('bulk-delete-progress-text').textContent = 
        `${current.toLocaleString()} / ${total.toLocaleString()}`;
}

// 통계 업데이트
function updateBulkDeleteStats(total, deleted, failed) {
    document.getElementById('bulk-delete-total').textContent = total.toLocaleString();
    document.getElementById('bulk-delete-deleted').textContent = deleted.toLocaleString();
    document.getElementById('bulk-delete-failed').textContent = failed.toLocaleString();
}

// 모든 샵 로드
async function getAllShopsForDelete() {
    addBulkDeleteLog('샵 데이터 로딩 중...', 'info');
    
    let page = 1;
    const limit = 5000; // 한 번에 5000개씩
    let allShops = [];
    
    try {
        while (true) {
            addBulkDeleteLog(`페이지 ${page} 로딩 중... (limit: ${limit})`, 'info');
            
            const response = await fetch(`tables/skincare_shops?page=${page}&limit=${limit}&sort=created_at`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                addBulkDeleteLog(`페이지 ${page}: 데이터 없음 (로딩 종료)`, 'info');
                break;
            }
            
            // 소프트 삭제된 항목 제외
            const activeShops = data.data.filter(shop => !shop.deleted);
            allShops = allShops.concat(activeShops);
            
            addBulkDeleteLog(
                `페이지 ${page}: ${activeShops.length}개 로드 (총 ${allShops.length}개)`,
                'success'
            );
            
            // 다음 페이지가 없으면 종료
            if (data.data.length < limit) {
                addBulkDeleteLog('모든 페이지 로딩 완료', 'success');
                break;
            }
            
            page++;
        }
        
        addBulkDeleteLog(`✅ 전체 ${allShops.length}개 샵 로드 완료`, 'success');
        return allShops;
        
    } catch (error) {
        addBulkDeleteLog(`로딩 실패: ${error.message}`, 'error');
        throw error;
    }
}

// 샵 삭제 (단일)
async function deleteShop(shopId, shopName) {
    try {
        const response = await fetch(`tables/skincare_shops/${shopId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return { success: true, shopId, shopName };
        
    } catch (error) {
        return { success: false, shopId, shopName, error: error.message };
    }
}

// 배치 삭제 (10개씩 병렬 처리)
async function deleteBatch(shops, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < shops.length; i += batchSize) {
        const batch = shops.slice(i, i + batchSize);
        
        const batchPromises = batch.map(shop => 
            deleteShop(shop.id, shop.name || shop.business_name || '이름 없음')
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // API 제한 방지 (100ms 대기)
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
}

// 일괄 삭제 시작
async function startBulkDelete() {
    console.log('🗑️ 일괄 삭제 시작');
    
    // 최종 확인
    const confirmed = confirm(
        '⚠️ 정말로 모든 샵 데이터를 삭제하시겠습니까?\n\n' +
        '이 작업은 되돌릴 수 없습니다!\n\n' +
        '계속하려면 "확인"을 클릭하세요.'
    );
    
    if (!confirmed) {
        addBulkDeleteLog('❌ 사용자가 취소함', 'warning');
        return;
    }
    
    // 버튼 비활성화
    const startBtn = document.getElementById('bulk-delete-start-btn');
    startBtn.disabled = true;
    startBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    // 통계/진행률 표시
    document.getElementById('bulk-delete-stats').classList.remove('hidden');
    document.getElementById('bulk-delete-progress').classList.remove('hidden');
    
    try {
        // 1. 모든 샵 로드
        addBulkDeleteLog('=== 1단계: 샵 데이터 로딩 ===', 'info');
        const allShops = await getAllShopsForDelete();
        
        if (allShops.length === 0) {
            addBulkDeleteLog('삭제할 샵이 없습니다.', 'warning');
            alert('삭제할 샵 데이터가 없습니다.');
            return;
        }
        
        updateBulkDeleteStats(allShops.length, 0, 0);
        
        // 2. 일괄 삭제 실행
        addBulkDeleteLog('', 'info');
        addBulkDeleteLog('=== 2단계: 일괄 삭제 실행 ===', 'info');
        addBulkDeleteLog(`총 ${allShops.length}개 샵 삭제 시작...`, 'info');
        
        let deletedCount = 0;
        let failedCount = 0;
        
        // 배치 처리 (10개씩)
        const batchSize = 10;
        for (let i = 0; i < allShops.length; i += batchSize) {
            const batch = allShops.slice(i, i + batchSize);
            
            const results = await deleteBatch(batch, batchSize);
            
            // 결과 처리
            results.forEach(result => {
                if (result.success) {
                    deletedCount++;
                    addBulkDeleteLog(
                        `${deletedCount}/${allShops.length} ${result.shopName} 삭제 완료`,
                        'success'
                    );
                } else {
                    failedCount++;
                    addBulkDeleteLog(
                        `❌ ${result.shopName} 삭제 실패: ${result.error}`,
                        'error'
                    );
                }
            });
            
            // 진행률 업데이트
            updateBulkDeleteProgress(deletedCount + failedCount, allShops.length);
            updateBulkDeleteStats(allShops.length, deletedCount, failedCount);
        }
        
        // 3. 완료
        addBulkDeleteLog('', 'info');
        addBulkDeleteLog('=== 완료! ===', 'success');
        addBulkDeleteLog(`✅ 전체: ${allShops.length}`, 'success');
        addBulkDeleteLog(`✅ 삭제: ${deletedCount}`, 'success');
        addBulkDeleteLog(`❌ 실패: ${failedCount}`, failedCount > 0 ? 'error' : 'success');
        
        alert(
            `일괄 삭제 완료!\n\n` +
            `전체: ${allShops.length}\n` +
            `삭제: ${deletedCount}\n` +
            `실패: ${failedCount}`
        );
        
        // 샵 목록 새로고침
        if (typeof loadShops === 'function') {
            loadShops();
        }
        
    } catch (error) {
        addBulkDeleteLog(`치명적 오류: ${error.message}`, 'error');
        alert(`오류 발생: ${error.message}`);
        
    } finally {
        // 버튼 재활성화
        startBtn.disabled = false;
        startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// 전역 함수로 export
if (typeof window !== 'undefined') {
    window.showBulkDeleteModal = showBulkDeleteModal;
    window.closeBulkDeleteModal = closeBulkDeleteModal;
    window.startBulkDelete = startBulkDelete;
    
    console.log('✅ 일괄 삭제 시스템 로드됨 (v2.8.13.6.150)');
}
