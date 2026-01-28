// 공지사항 게시판 JavaScript

let allAdminAnnouncements = [];
let allShopAnnouncements = [];
let currentAnnouncementForModal = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadAllAnnouncements();
    
    // 모바일에서 업체소식 섹션으로 자동 스크롤
    setTimeout(() => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const shopSection = document.querySelector('.text-2xl.font-bold.text-gray-900 .fa-store')?.closest('section');
            if (shopSection) {
                shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, 500); // 데이터 로드 후 스크롤
});

// 모든 공지사항 로드
async function loadAllAnnouncements() {
    await Promise.all([
        loadAdminAnnouncements(),
        loadShopAnnouncements()
    ]);
}

// 관리자 공지사항 로드
async function loadAdminAnnouncements() {
    try {
        console.log('Loading admin announcements...');
        
        const response = await fetch('tables/announcements?limit=100&sort=-created_at');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const announcements = data.data || [];
        
        console.log('📊 원본 공지사항 데이터:', announcements);
        
        // 모든 공지 표시 (필터링 제거)
        allAdminAnnouncements = announcements;
        
        console.log('✅ 필터링된 공지사항:', allAdminAnnouncements);
        
        // 상단 고정 공지가 먼저 오도록 정렬
        allAdminAnnouncements.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });
        
        console.log(`Loaded ${allAdminAnnouncements.length} admin announcements`);
        
        // 첫 번째 공지사항의 view_count 확인
        if (allAdminAnnouncements.length > 0) {
            console.log('🔍 첫 번째 공지사항 view_count:', allAdminAnnouncements[0].view_count);
        }
        
        displayAdminAnnouncements();
        
    } catch (error) {
        console.error('관리자 공지사항 로드 오류:', error);
        document.getElementById('admin-announcements').innerHTML = `
            <div class="text-center py-8 bg-white rounded-lg shadow">
                <i class="fas fa-exclamation-circle text-red-400 text-4xl mb-3"></i>
                <p class="text-gray-600">공지사항을 불러올 수 없습니다.</p>
                <button onclick="loadAdminAnnouncements()" class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                    다시 시도
                </button>
            </div>
        `;
    }
}

// 업체 공지사항 로드
async function loadShopAnnouncements() {
    try {
        console.log('Loading shop announcements...');
        
        const response = await fetch('tables/shop_announcements?limit=100&sort=-created_at');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        allShopAnnouncements = data.data || [];
        
        console.log('📊 원본 업체 공지 데이터:', allShopAnnouncements);
        
        // 모든 공지 표시 (필터링 제거)
        // allShopAnnouncements는 이미 할당됨
        
        console.log(`Loaded ${allShopAnnouncements.length} shop announcements`);
        
        // 첫 번째 업체 공지의 view_count 확인
        if (allShopAnnouncements.length > 0) {
            console.log('🔍 첫 번째 업체 공지 view_count:', allShopAnnouncements[0].view_count);
        }
        
        displayShopAnnouncements(allShopAnnouncements);
        
    } catch (error) {
        console.error('업체 공지사항 로드 오류:', error);
        
        // 500 에러인 경우 (테이블 없음)
        if (error.message.includes('500')) {
            allShopAnnouncements = [];
            document.getElementById('shop-announcements').innerHTML = `
                <div class="text-center py-8 bg-gray-50 rounded-lg">
                    <i class="fas fa-box-open text-gray-300 text-4xl mb-3"></i>
                    <p class="text-gray-500">아직 등록된 업체 소식이 없습니다.</p>
                    <p class="text-sm text-gray-400 mt-2">업체들이 곧 다양한 소식을 전해드릴 예정입니다.</p>
                </div>
            `;
        } else {
            // 기타 네트워크 에러
            document.getElementById('shop-announcements').innerHTML = `
                <div class="text-center py-8 bg-white rounded-lg shadow">
                    <i class="fas fa-exclamation-circle text-red-400 text-4xl mb-3"></i>
                    <p class="text-gray-600">업체 소식을 불러올 수 없습니다.</p>
                    <button onclick="loadShopAnnouncements()" class="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        다시 시도
                    </button>
                </div>
            `;
        }
    }
}

// 관리자 공지사항 표시
function displayAdminAnnouncements() {
    const container = document.getElementById('admin-announcements');
    
    if (allAdminAnnouncements.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-lg shadow">
                <i class="fas fa-inbox text-gray-300 text-5xl mb-3"></i>
                <p class="text-gray-500">등록된 운영진 공지가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    const priorityLabels = {
        'urgent': { text: '긴급', color: 'bg-red-100 text-red-800' },
        'important': { text: '중요', color: 'bg-orange-100 text-orange-800' },
        'normal': { text: '일반', color: 'bg-blue-100 text-blue-800' },
        'low': { text: '낮음', color: 'bg-gray-100 text-gray-800' }
    };
    
    // v2.8.13.6.59: 개선된 카드 디자인 (핑크 배경 + 좌측 테두리)
    container.innerHTML = allAdminAnnouncements.map(ann => {
        const priority = priorityLabels[ann.priority] || priorityLabels['normal'];
        const isPinned = ann.is_pinned;
        const createdDate = formatDate(ann.created_at || ann.publish_date);
        const preview = escapeHtml(ann.content).substring(0, 100);
        
        return `
            <div class="announcement-card admin-announcement shadow-md p-4 sm:p-6 cursor-pointer ${isPinned ? 'ring-2 ring-yellow-400' : ''}" 
                 onclick="viewAnnouncement('admin', '${ann.id}')">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                            ${isPinned ? '<i class="fas fa-thumbtack text-yellow-600 text-sm"></i>' : ''}
                            <span class="text-2xl">👑</span>
                            <h3 class="text-base sm:text-lg font-semibold text-gray-900 break-words">${escapeHtml(ann.title)}</h3>
                        </div>
                        <p class="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">${preview}${ann.content.length > 100 ? '...' : ''}</p>
                        <div class="flex items-center text-xs sm:text-sm text-gray-500 gap-3 sm:gap-4 flex-wrap">
                            <span>
                                <i class="far fa-calendar mr-1"></i>${createdDate}
                            </span>
                            <span>
                                <i class="far fa-eye mr-1"></i>조회 ${formatViewCount(ann.view_count || 0)}회
                            </span>
                        </div>
                    </div>
                    <span class="px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${priority.color} whitespace-nowrap flex-shrink-0">
                        ${priority.text}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// 업체 공지사항 표시
function displayShopAnnouncements(announcements) {
    const container = document.getElementById('shop-announcements');
    
    if (announcements.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-lg shadow">
                <i class="fas fa-inbox text-gray-300 text-5xl mb-3"></i>
                <p class="text-gray-500">등록된 업체 소식이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    // v2.8.13.6.59: 개선된 카드 디자인 (그린 배경 + 좌측 테두리)
    container.innerHTML = announcements.map(ann => {
        const createdDate = formatDate(ann.created_at);
        const preview = escapeHtml(ann.content).substring(0, 80);
        const location = `${ann.state || ''} ${ann.district || ''}`.trim();
        
        return `
            <div class="announcement-card shop-announcement shadow-md p-4 sm:p-6 cursor-pointer" 
                 onclick="viewAnnouncement('shop', '${ann.id}')">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                            <span class="text-2xl">🏪</span>
                            <h3 class="text-base sm:text-lg font-semibold text-gray-900 break-words">${escapeHtml(ann.title)}</h3>
                            ${location ? `<span class="text-xs px-2 py-1 bg-white text-green-700 rounded-full font-medium">${location}</span>` : ''}
                        </div>
                        <p class="text-xs sm:text-sm text-gray-600 mb-2">
                            <i class="fas fa-building mr-1"></i>${escapeHtml(ann.shop_name || '업체명')}
                        </p>
                        <p class="text-sm sm:text-base text-gray-700 mb-3 line-clamp-2">${preview}${ann.content.length > 80 ? '...' : ''}</p>
                        <div class="flex items-center text-xs sm:text-sm text-gray-500 gap-3 sm:gap-4 flex-wrap">
                            <span>
                                <i class="far fa-calendar mr-1"></i>${createdDate}
                            </span>
                            <span>
                                <i class="far fa-eye mr-1"></i>조회 ${formatViewCount(ann.view_count || 0)}회
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 공지사항 상세보기
async function viewAnnouncement(type, announcementId) {
    let announcement;
    
    if (type === 'admin') {
        announcement = allAdminAnnouncements.find(a => a.id === announcementId);
    } else {
        announcement = allShopAnnouncements.find(a => a.id === announcementId);
    }
    
    if (!announcement) {
        alert('공지사항을 찾을 수 없습니다.');
        return;
    }
    
    currentAnnouncementForModal = { type, ...announcement };
    
    // 모달 내용 업데이트
    document.getElementById('modal-title').textContent = announcement.title;
    document.getElementById('modal-content').textContent = announcement.content;
    document.getElementById('modal-date').textContent = formatDate(announcement.created_at || announcement.publish_date);
    document.getElementById('modal-views').textContent = formatViewCount(announcement.view_count || 0);
    
    // 관리자 공지인 경우 우선순위 배지
    if (type === 'admin') {
        const priorityLabels = {
            'urgent': { text: '긴급', color: 'bg-red-100 text-red-800' },
            'important': { text: '중요', color: 'bg-orange-100 text-orange-800' },
            'normal': { text: '일반', color: 'bg-blue-100 text-blue-800' },
            'low': { text: '낮음', color: 'bg-gray-100 text-gray-800' }
        };
        const priority = priorityLabels[announcement.priority] || priorityLabels['normal'];
        const badge = document.getElementById('modal-badge');
        badge.textContent = priority.text;
        badge.className = `px-3 py-1 text-sm font-semibold rounded-full ${priority.color}`;
        badge.classList.remove('hidden');
        document.getElementById('modal-shop-info').classList.add('hidden');
    } else {
        // 업체 공지인 경우 업체 정보
        document.getElementById('modal-badge').classList.add('hidden');
        const shopInfo = document.getElementById('modal-shop-info');
        document.getElementById('modal-shop-name').textContent = announcement.shop_name || '업체명';
        document.getElementById('modal-location').textContent = `${announcement.state || ''} ${announcement.district || ''}`.trim();
        shopInfo.classList.remove('hidden');
        
        // v2.8.13.6.63: 카카오톡/전화 상담 버튼 표시
        showContactButtons(announcement);
    }
    
    // v2.8.13.6.60: 관리자 확인 및 삭제 버튼 표시
    const deleteBtn = document.getElementById('delete-announcement-btn');
    if (deleteBtn) {
        if (isAdmin()) {
            deleteBtn.classList.remove('hidden');
        } else {
            deleteBtn.classList.add('hidden');
        }
    }
    
    // 모달 표시
    document.getElementById('detail-modal').classList.remove('hidden');
    
    // 조회수 증가
    incrementViews(type, announcementId);
}

// v2.8.13.6.63: 카카오톡/전화 상담 버튼 표시
function showContactButtons(announcement) {
    // 기존 버튼 컨테이너가 있으면 제거
    const existingContainer = document.getElementById('contact-buttons-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // 버튼 컨테이너 생성
    const container = document.createElement('div');
    container.id = 'contact-buttons-container';
    container.className = 'mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3';
    
    // 카카오톡 버튼 (URL이 있는 경우만)
    if (announcement.kakao_channel_url) {
        const kakaoBtn = document.createElement('a');
        kakaoBtn.href = announcement.kakao_channel_url;
        kakaoBtn.target = '_blank';
        kakaoBtn.className = 'flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-all shadow-md';
        kakaoBtn.innerHTML = `
            <span style="font-size: 20px;">💬</span>
            <span>카카오톡 상담</span>
        `;
        container.appendChild(kakaoBtn);
    }
    
    // 전화 버튼 (전화번호가 있는 경우만)
    if (announcement.shop_phone) {
        const phoneBtn = document.createElement('a');
        phoneBtn.href = `tel:${announcement.shop_phone}`;
        phoneBtn.className = 'flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all shadow-md';
        phoneBtn.innerHTML = `
            <span style="font-size: 20px;">📞</span>
            <span>전화 상담</span>
        `;
        container.appendChild(phoneBtn);
    }
    
    // 버튼이 하나라도 있으면 모달 컨텐츠에 추가
    if (container.children.length > 0) {
        const modalContent = document.getElementById('modal-content');
        modalContent.parentElement.insertBefore(container, modalContent.nextSibling);
    }
}

// 모달 닫기
function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    currentAnnouncementForModal = null;
    
    // v2.8.13.6.63: 상담 버튼 제거
    const contactButtons = document.getElementById('contact-buttons-container');
    if (contactButtons) {
        contactButtons.remove();
    }
    
    // v2.8.13.6.60: 삭제 버튼 숨기기
    const deleteBtn = document.getElementById('delete-announcement-btn');
    if (deleteBtn) {
        deleteBtn.classList.add('hidden');
    }
}

// 조회수 증가 (v2.8.13.6.61)
async function incrementViews(type, announcementId) {
    try {
        // 중복 조회 방지: localStorage 확인
        const viewKey = `viewed_${type}_${announcementId}`;
        const alreadyViewed = localStorage.getItem(viewKey);
        
        if (alreadyViewed) {
            console.log(`ℹ️ [조회수] 이미 조회한 공지: ${announcementId}`);
            return; // 이미 조회한 공지는 증가 안 함
        }
        
        console.log(`💡 [조회수] ${type} 공지 조회수 증가 시도: ${announcementId}`);
        
        // 테이블 이름 결정
        const tableName = type === 'admin' ? 'announcements' : 'shop_announcements';
        
        // 1. 현재 공지사항 정보 가져오기
        const getResponse = await fetch(`tables/${tableName}/${announcementId}`);
        
        if (!getResponse.ok) {
            console.warn(`⚠️ [조회수] 공지 정보 가져오기 실패: ${getResponse.status}`);
            return;
        }
        
        const announcement = await getResponse.json();
        const currentViews = announcement.view_count || 0;
        const newViews = currentViews + 1;
        
        // 2. 조회수 업데이트 (PATCH 방식 - 부분 업데이트)
        const updateResponse = await fetch(`tables/${tableName}/${announcementId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                view_count: newViews
            })
        });
        
        if (updateResponse.ok) {
            console.log(`✅ [조회수] 증가 성공: ${currentViews} → ${newViews}`);
            
            // 로컬 배열 업데이트
            if (type === 'admin') {
                const index = allAdminAnnouncements.findIndex(a => a.id === announcementId);
                if (index !== -1) {
                    allAdminAnnouncements[index].view_count = newViews;
                }
            } else {
                const index = allShopAnnouncements.findIndex(a => a.id === announcementId);
                if (index !== -1) {
                    allShopAnnouncements[index].view_count = newViews;
                }
            }
            
            // 중복 방지 마킹 (7일 유효)
            const expirationTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            localStorage.setItem(viewKey, expirationTime.toISOString());
            
        } else {
            console.warn(`⚠️ [조회수] 증가 실패: ${updateResponse.status}`);
        }
        
    } catch (error) {
        console.error('❌ [조회수] 증가 오류:', error);
    }
}

// 업체 공지사항 필터링
function filterShopAnnouncements() {
    const searchTerm = document.getElementById('shop-search')?.value.toLowerCase() || '';
    const regionFilter = document.getElementById('region-filter')?.value || '';
    
    let filtered = allShopAnnouncements;
    
    // 검색어 필터
    if (searchTerm) {
        filtered = filtered.filter(ann => 
            ann.title.toLowerCase().includes(searchTerm) || 
            ann.content.toLowerCase().includes(searchTerm) ||
            (ann.shop_name && ann.shop_name.toLowerCase().includes(searchTerm))
        );
    }
    
    // 지역 필터
    if (regionFilter) {
        filtered = filtered.filter(ann => ann.state === regionFilter);
    }
    
    displayShopAnnouncements(filtered);
}

// 날짜 포맷
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 조회수 포맷 (v2.8.8.1.77 - 천 단위 구분)
function formatViewCount(count) {
    if (!count) return '0';
    return count.toLocaleString('ko-KR');
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDetailModal();
    }
});

// 모달 외부 클릭으로 닫기
document.getElementById('detail-modal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeDetailModal();
    }
});

// ========================================
// 🗑️ 관리자 삭제 기능 (v2.8.13.6.60)
// ========================================

// 관리자 확인 함수
function isAdmin() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role === 'admin';
    } catch (error) {
        console.error('사용자 정보 확인 오류:', error);
        return false;
    }
}

// 현재 모달의 공지사항 삭제
async function deleteCurrentAnnouncement() {
    if (!currentAnnouncementForModal) {
        alert('삭제할 공지사항을 찾을 수 없습니다.');
        return;
    }
    
    // 관리자 확인
    if (!isAdmin()) {
        alert('⛔ 관리자만 삭제할 수 있습니다.');
        return;
    }
    
    // 확인 다이얼로그
    const confirmMessage = `정말로 이 공지사항을 삭제하시겠습니까?\n\n제목: ${currentAnnouncementForModal.title}\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    const { type, id } = currentAnnouncementForModal;
    
    try {
        // 삭제 버튼 비활성화
        const deleteBtn = document.getElementById('delete-announcement-btn');
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>삭제 중...';
        }
        
        await deleteAnnouncement(type, id);
        
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('❌ 삭제 중 오류가 발생했습니다.');
        
        // 버튼 복구
        const deleteBtn = document.getElementById('delete-announcement-btn');
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<i class="fas fa-trash mr-2"></i>삭제';
        }
    }
}

// 공지사항 삭제 API 호출
async function deleteAnnouncement(type, announcementId) {
    try {
        const tableName = type === 'admin' ? 'announcements' : 'shop_announcements';
        
        console.log(`🗑️ 삭제 시도: ${tableName}/${announcementId}`);
        
        const response = await fetch(`tables/${tableName}/${announcementId}`, {
            method: 'DELETE'
        });
        
        if (response.ok || response.status === 204) {
            console.log('✅ 삭제 성공');
            
            // 모달 닫기
            closeDetailModal();
            
            // UI에서 해당 카드 부드럽게 제거
            removeAnnouncementFromUI(type, announcementId);
            
            // 성공 메시지
            showSuccessMessage('✅ 공지사항이 삭제되었습니다.');
            
            // 로컬 배열에서도 제거
            if (type === 'admin') {
                allAdminAnnouncements = allAdminAnnouncements.filter(a => a.id !== announcementId);
            } else {
                allShopAnnouncements = allShopAnnouncements.filter(a => a.id !== announcementId);
            }
            
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('삭제 API 오류:', error);
        throw error;
    }
}

// UI에서 공지사항 카드 제거 (애니메이션)
function removeAnnouncementFromUI(type, announcementId) {
    // 카드 찾기
    const cards = document.querySelectorAll('.announcement-card');
    
    for (const card of cards) {
        if (card.onclick && card.onclick.toString().includes(announcementId)) {
            // 페이드아웃 애니메이션
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            
            // 애니메이션 후 제거
            setTimeout(() => {
                card.remove();
                
                // 카드가 없으면 빈 상태 표시
                checkEmptyState(type);
            }, 300);
            
            break;
        }
    }
}

// 빈 상태 확인
function checkEmptyState(type) {
    const container = type === 'admin' 
        ? document.getElementById('admin-announcements')
        : document.getElementById('shop-announcements');
    
    const cards = container.querySelectorAll('.announcement-card');
    
    if (cards.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-lg shadow">
                <i class="fas fa-inbox text-gray-300 text-5xl mb-3"></i>
                <p class="text-gray-500">등록된 ${type === 'admin' ? '운영진 공지' : '업체 소식'}가 없습니다.</p>
            </div>
        `;
    }
}

// 성공 메시지 토스트
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-fadeIn';
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}
