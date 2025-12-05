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
        
        const response = await fetch('/tables/announcements?limit=100&sort=-created_at');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const announcements = data.data || [];
        
        // 게시중이고, 고객/전체 대상 공지만 필터링
        allAdminAnnouncements = announcements.filter(ann => {
            return ann.is_published && 
                   (ann.target_audience === 'customers' || ann.target_audience === 'all');
        });
        
        // 상단 고정 공지가 먼저 오도록 정렬
        allAdminAnnouncements.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });
        
        console.log(`Loaded ${allAdminAnnouncements.length} admin announcements`);
        
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
        
        const response = await fetch('/tables/shop_announcements?limit=100&sort=-created_at');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        allShopAnnouncements = data.data || [];
        
        // 게시중인 것만 필터링
        allShopAnnouncements = allShopAnnouncements.filter(ann => ann.is_published);
        
        console.log(`Loaded ${allShopAnnouncements.length} shop announcements`);
        
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
    
    container.innerHTML = allAdminAnnouncements.map(ann => {
        const priority = priorityLabels[ann.priority] || priorityLabels['normal'];
        const isPinned = ann.is_pinned;
        const createdDate = formatDate(ann.created_at || ann.publish_date);
        const preview = escapeHtml(ann.content).substring(0, 100);
        
        return `
            <div class="announcement-card bg-white rounded-lg shadow p-6 cursor-pointer ${isPinned ? 'border-2 border-yellow-400' : ''}" 
                 onclick="viewAnnouncement('admin', '${ann.id}')">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            ${isPinned ? '<i class="fas fa-thumbtack text-yellow-600"></i>' : ''}
                            <h3 class="text-lg font-semibold text-gray-900">${escapeHtml(ann.title)}</h3>
                        </div>
                        <p class="text-gray-600 mb-3">${preview}${ann.content.length > 100 ? '...' : ''}</p>
                        <div class="flex items-center text-sm text-gray-500 gap-4">
                            <span>
                                <i class="far fa-calendar mr-1"></i>${createdDate}
                            </span>
                            <span>
                                <i class="far fa-eye mr-1"></i>조회 ${ann.views || 0}회
                            </span>
                        </div>
                    </div>
                    <span class="ml-4 px-3 py-1 text-xs font-semibold rounded-full ${priority.color} whitespace-nowrap">
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
    
    container.innerHTML = announcements.map(ann => {
        const createdDate = formatDate(ann.created_at);
        const preview = escapeHtml(ann.content).substring(0, 80);
        const location = `${ann.state || ''} ${ann.district || ''}`.trim();
        
        return `
            <div class="announcement-card bg-white rounded-lg shadow p-6 cursor-pointer hover:border-green-300 border border-transparent" 
                 onclick="viewAnnouncement('shop', '${ann.id}')">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-store text-green-500"></i>
                            <h3 class="text-lg font-semibold text-gray-900">${escapeHtml(ann.title)}</h3>
                            ${location ? `<span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">${location}</span>` : ''}
                        </div>
                        <p class="text-sm text-gray-500 mb-2">
                            <i class="fas fa-building mr-1"></i>${escapeHtml(ann.shop_name || '업체명')}
                        </p>
                        <p class="text-gray-600 mb-3">${preview}${ann.content.length > 80 ? '...' : ''}</p>
                        <div class="flex items-center text-sm text-gray-500 gap-4">
                            <span>
                                <i class="far fa-calendar mr-1"></i>${createdDate}
                            </span>
                            <span>
                                <i class="far fa-eye mr-1"></i>조회 ${ann.views || 0}회
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
    document.getElementById('modal-views').textContent = announcement.views || 0;
    
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
    }
    
    // 모달 표시
    document.getElementById('detail-modal').classList.remove('hidden');
    
    // 조회수 증가
    incrementViews(type, announcementId);
}

// 모달 닫기
function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    currentAnnouncementForModal = null;
}

// 조회수 증가
async function incrementViews(type, announcementId) {
    try {
        // 조회수 증가 기능은 서버 측에서 구현 예정
        // (현재 CORS 제약으로 PATCH 요청 비활성화)
        console.log(`💡 [공지사항] ${type} 공지 조회: ${announcementId}`);
    } catch (error) {
        console.error('조회수 증가 오류:', error);
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
