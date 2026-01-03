// ===== 공공 데이터 관리 함수 (v2.8.13.6.131) =====

/**
 * 공공 데이터 로드
 */
async function loadPublicData(page = 1) {
    try {
        console.log(`📡 공공 데이터 로딩 중... (페이지 ${page})`);
        
        currentPublicPage = page;
        const response = await fetch(`/tables/public_skincare_data?page=${page}&limit=${publicPageSize}&sort=created_at`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        allPublicData = data.data || [];
        
        console.log(`✅ 공공 데이터 로드 완료: ${allPublicData.length}개`);
        console.log(`📊 총 개수: ${data.total}개`);
        
        // UI 업데이트
        displayPublicData(allPublicData);
        updatePublicDataPagination(data.total, page);
        
        // 필터 이벤트 리스너 등록 (한 번만)
        initializePublicDataFilters();
        
    } catch (error) {
        console.error('❌ 공공 데이터 로드 실패:', error);
        showNotification('공공 데이터를 불러오는데 실패했습니다: ' + error.message, 'error');
    }
}

/**
 * 공공 데이터 테이블 표시
 */
function displayPublicData(data) {
    const table = document.getElementById('public-data-table');
    if (!table) return;
    
    if (!data || data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    표시할 데이터가 없습니다
                </td>
            </tr>
        `;
        return;
    }
    
    table.innerHTML = data.map(shop => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">${shop.business_name || '-'}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">${shop.address || '-'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                    ${shop.region || '-'} 
                    ${shop.district ? `<br><span class="text-xs text-gray-500">${shop.district}</span>` : ''}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${shop.phone || '-'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${shop.matched_shop_id 
                    ? `<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">✅ 매칭됨</span>`
                    : `<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">⚪ 미매칭</span>`
                }
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button onclick="viewPublicDataDetail('${shop.id}')" class="text-primary-600 hover:text-primary-900 mr-2" title="상세보기">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editPublicData('${shop.id}')" class="text-blue-600 hover:text-blue-900 mr-2" title="수정">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletePublicData('${shop.id}')" class="text-red-600 hover:text-red-900" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * 페이지네이션 정보 업데이트
 */
function updatePublicDataPagination(total, currentPage) {
    const totalPages = Math.ceil(total / publicPageSize);
    
    // 페이지 정보
    const pageInfo = document.getElementById('public-page-info');
    if (pageInfo) {
        pageInfo.textContent = `${currentPage} / ${totalPages}`;
    }
    
    // 데이터 정보
    const dataInfo = document.getElementById('public-data-info');
    if (dataInfo) {
        const start = (currentPage - 1) * publicPageSize + 1;
        const end = Math.min(currentPage * publicPageSize, total);
        dataInfo.textContent = `총 ${total.toLocaleString()}개 중 ${start.toLocaleString()}-${end.toLocaleString()}개 표시`;
    }
}

/**
 * 페이지 변경
 */
function changePublicDataPage(direction) {
    const newPage = currentPublicPage + direction;
    if (newPage < 1) return;
    
    loadPublicData(newPage);
}

/**
 * 공공 데이터 필터 초기화
 */
function initializePublicDataFilters() {
    const searchInput = document.getElementById('public-search');
    const regionFilter = document.getElementById('public-region-filter');
    const matchedFilter = document.getElementById('public-matched-filter');
    
    // 이미 등록된 경우 스킵
    if (searchInput && searchInput.dataset.listenerAdded) return;
    
    if (searchInput) {
        searchInput.addEventListener('input', filterPublicData);
        searchInput.dataset.listenerAdded = 'true';
    }
    
    if (regionFilter) {
        regionFilter.addEventListener('change', filterPublicData);
        regionFilter.dataset.listenerAdded = 'true';
    }
    
    if (matchedFilter) {
        matchedFilter.addEventListener('change', filterPublicData);
        matchedFilter.dataset.listenerAdded = 'true';
    }
}

/**
 * 공공 데이터 필터링
 */
function filterPublicData() {
    if (!allPublicData || allPublicData.length === 0) return;
    
    let filtered = [...allPublicData];
    
    // 검색어 필터
    const searchTerm = document.getElementById('public-search')?.value?.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(shop => 
            (shop.business_name || '').toLowerCase().includes(searchTerm) ||
            (shop.address || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // 지역 필터
    const region = document.getElementById('public-region-filter')?.value;
    if (region) {
        filtered = filtered.filter(shop => shop.region === region);
    }
    
    // 매칭 상태 필터
    const matchedStatus = document.getElementById('public-matched-filter')?.value;
    if (matchedStatus === 'matched') {
        filtered = filtered.filter(shop => shop.matched_shop_id);
    } else if (matchedStatus === 'unmatched') {
        filtered = filtered.filter(shop => !shop.matched_shop_id);
    }
    
    console.log(`🔍 공공 데이터 필터 결과: ${allPublicData.length}개 → ${filtered.length}개`);
    displayPublicData(filtered);
}

/**
 * 공공 데이터 상세보기
 */
function viewPublicDataDetail(shopId) {
    const shop = allPublicData.find(s => s.id === shopId);
    if (!shop) return;
    
    const detail = `
상호명: ${shop.business_name || '-'}
사업자번호: ${shop.business_id || '-'}
주소: ${shop.address || '-'}
지역: ${shop.region || '-'} ${shop.district || ''} ${shop.town || ''}
전화번호: ${shop.phone || '-'}
영업상태: ${shop.status || '-'}
매칭 상태: ${shop.matched_shop_id ? '✅ 매칭됨 (ID: ' + shop.matched_shop_id + ')' : '⚪ 미매칭'}
데이터 출처: ${shop.data_source || '-'}
생성일: ${shop.created_at ? new Date(shop.created_at).toLocaleString('ko-KR') : '-'}
    `;
    
    alert(detail);
}

/**
 * 공공 데이터 수정
 */
function editPublicData(shopId) {
    const shop = allPublicData.find(s => s.id === shopId);
    if (!shop) return;
    
    // TODO: 수정 모달 구현
    alert('수정 기능은 곧 추가됩니다!');
}

/**
 * 공공 데이터 삭제 (Soft Delete)
 */
async function deletePublicData(shopId) {
    const shop = allPublicData.find(s => s.id === shopId);
    if (!shop) return;
    
    if (!confirm(`'${shop.business_name}'을(를) 삭제하시겠습니까?\n\n※ 소프트 삭제: 데이터는 보관되며 복구 가능합니다.`)) {
        return;
    }
    
    try {
        console.log('🗑️ 공공 데이터 삭제 요청:', shopId);
        
        // Soft Delete
        const updatedShop = {
            ...shop,
            deleted: true,
            updated_at: Date.now()
        };
        
        const response = await fetch(`/tables/public_skincare_data/${shopId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedShop)
        });
        
        if (response.ok) {
            console.log('✅ 공공 데이터 삭제 성공');
            showNotification('공공 데이터가 삭제되었습니다', 'success');
            loadPublicData(currentPublicPage); // 새로고침
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ 공공 데이터 삭제 실패:', error);
        showNotification('삭제에 실패했습니다: ' + error.message, 'error');
    }
}
