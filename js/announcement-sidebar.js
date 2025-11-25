// 메인 페이지 공지사항 사이드바
// 우측에 최신 공지 3개 표시

document.addEventListener('DOMContentLoaded', function() {
    loadAnnouncementSidebar();
});

async function loadAnnouncementSidebar() {
    try {
        console.log('[샵 이벤트 사이드바] 로딩 시작...');
        
        // 관리자 공지와 샵 공지를 병렬로 가져오기 (각각 최대 10개씩)
        const [adminResponse, shopResponse] = await Promise.all([
            fetch('/tables/announcements?limit=10&sort=-created_at'),
            fetch('/tables/shop_announcements?limit=10&sort=-created_at')
        ]);
        
        console.log('[샵 이벤트 사이드바] 관리자 공지 응답:', adminResponse.status);
        console.log('[샵 이벤트 사이드바] 샵 공지 응답:', shopResponse.status);
        
        let allAnnouncements = [];
        
        // 관리자 공지 처리
        if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            console.log('[샵 이벤트 사이드바] 관리자 공지 원본 데이터:', adminData.data?.length || 0, '개');
            const adminAnnouncements = (adminData.data || []).filter(ann => 
                ann.is_published && 
                (ann.target_audience === 'customers' || ann.target_audience === 'all')
            );
            
            allAnnouncements = allAnnouncements.concat(adminAnnouncements.map(ann => ({
                ...ann,
                type: 'admin'
            })));
            console.log('[샵 이벤트 사이드바] 필터링 후 관리자 공지:', adminAnnouncements.length, '개');
        }
        
        // 샵 공지 처리
        if (shopResponse.ok) {
            const shopData = await shopResponse.json();
            console.log('[샵 이벤트 사이드바] 샵 공지 원본 데이터:', shopData.data?.length || 0, '개');
            const shopAnnouncements = (shopData.data || []).filter(ann => 
                ann.is_published
            );
            
            allAnnouncements = allAnnouncements.concat(shopAnnouncements.map(ann => ({
                ...ann,
                type: 'shop'
            })));
            console.log('[샵 이벤트 사이드바] 필터링 후 샵 공지:', shopAnnouncements.length, '개');
        }
        
        // 최신순 정렬 (created_at 기준)
        allAnnouncements.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA; // 최신순
        });
        
        // 상위 4개만 선택
        const topAnnouncements = allAnnouncements.slice(0, 4);
        
        console.log('[샵 이벤트 사이드바] 총 공지:', allAnnouncements.length, '개 → 표시:', topAnnouncements.length, '개');
        console.log('[샵 이벤트 사이드바] 표시할 공지 상세:', topAnnouncements.map(ann => ({
            type: ann.type,
            title: ann.title,
            id: ann.id
        })));
        
        if (topAnnouncements.length === 0) {
            console.warn('[샵 이벤트 사이드바] 표시할 공지사항 없음');
            return;
        }
        
        // 사이드바 생성
        const sidebar = createAnnouncementSidebar(topAnnouncements);
        
        // body에 추가
        document.body.appendChild(sidebar);
        console.log('[샵 이벤트 사이드바] 사이드바 표시 완료 (모든 기기에서 표시)');
        
        // 모바일에서 간단한 알림 추가
        if (window.innerWidth < 768) {
            console.log('📱 [샵 이벤트 사이드바] 모바일 최적화 모드');
        }
        
    } catch (error) {
        console.error('[샵 이벤트 사이드바] 로드 오류:', error);
    }
}

function createAnnouncementSidebar(announcements) {
    const sidebar = document.createElement('div');
    sidebar.id = 'announcement-sidebar';
    
    // 상단 배너 스타일로 변경
    sidebar.style.cssText = `
        position: fixed !important;
        top: 60px !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        z-index: 9998 !important;
        background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%) !important;
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2) !important;
        display: block !important;
        border-bottom: 2px solid #FF6B35 !important;
        animation: slideDown 0.3s ease-out !important;
    `;
    
    // 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        #announcement-sidebar-content {
            display: flex;
            align-items: center;
            overflow-x: auto;
            overflow-y: hidden;
            white-space: nowrap;
            padding: 8px 16px;
            gap: 12px;
            max-width: 1200px;
            margin: 0 auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        #announcement-sidebar-content::-webkit-scrollbar {
            display: none;
        }
        .announcement-banner-item {
            display: inline-flex;
            align-items: center;
            background: white;
            border-radius: 8px;
            padding: 6px 12px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid #FF6B35;
            flex-shrink: 0;
        }
        .announcement-banner-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
        }
    `;
    document.head.appendChild(style);
    
    const priorityColors = {
        'urgent': 'bg-red-50 border-red-200 text-red-900',
        'important': 'bg-orange-50 border-orange-200 text-orange-900',
        'normal': 'bg-blue-50 border-blue-200 text-blue-900'
    };
    
    const priorityIcons = {
        'urgent': '<i class="fas fa-exclamation-circle text-red-600"></i>',
        'important': '<i class="fas fa-star text-orange-600"></i>',
        'normal': '<i class="fas fa-bullhorn text-blue-600"></i>'
    };
    
    sidebar.innerHTML = `
        <div id="announcement-sidebar-content">
            <div style="display: inline-flex; align-items: center; flex-shrink: 0;">
                <i class="fas fa-bullhorn" style="color: #FF6B35; font-size: 16px; margin-right: 8px;"></i>
                <span style="font-weight: 600; color: #92400E; font-size: 13px;">샵 공지</span>
            </div>
            ${announcements.map((ann, index) => {
                const isAdmin = ann.type === 'admin';
                const badge = isAdmin ? 
                    '<span style="font-size: 10px; background: #DC2626; color: white; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-right: 6px; white-space: nowrap;">운영팀</span>' : 
                    '<span style="font-size: 10px; background: #FF6B35; color: white; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-right: 6px; white-space: nowrap;">뷰티샵</span>';
                
                const titlePreview = ann.title.length > 30 ? 
                    ann.title.substring(0, 30) + '...' : 
                    ann.title;
                
                return `
                    <div class="announcement-banner-item" 
                         onclick="showAnnouncementDetail('${ann.id}', '${ann.type}')">
                        ${badge}
                        <span style="font-size: 12px; color: #92400E; font-weight: 500; white-space: nowrap;">
                            ${escapeHtml(titlePreview)}
                        </span>
                    </div>
                `;
            }).join('')}
            <a href="announcements.html" 
               style="display: inline-flex; align-items: center; background: #FF6B35; color: white; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; flex-shrink: 0; border: 1px solid #EA580C; white-space: nowrap;"
               onmouseover="this.style.background='#EA580C'"
               onmouseout="this.style.background='#FF6B35'">
                전체보기 <i class="fas fa-chevron-right" style="margin-left: 4px; font-size: 10px;"></i>
            </a>
        </div>
    `;
    
    return sidebar;
}

// 공지사항 상세 모달
async function showAnnouncementDetail(announcementId, type = 'admin') {
    try {
        const apiUrl = type === 'shop' ? 
            `/tables/shop_announcements/${announcementId}` : 
            `/tables/announcements/${announcementId}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            window.location.href = 'announcements.html';
            return;
        }
        
        const announcement = await response.json();
        
        // 조회수 증가 기능은 서버 측에서 구현 예정
        // (현재 CORS 제약으로 PATCH 요청 비활성화)
        
        // 모달 생성
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        const priorityLabels = {
            'urgent': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">긴급</span>',
            'important': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">중요</span>',
            'normal': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">일반</span>'
        };
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="p-6 border-b border-gray-100">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            ${priorityLabels[announcement.priority] || priorityLabels['normal']}
                        </div>
                        <button onclick="this.closest('.fixed').remove()" 
                                class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">
                        ${escapeHtml(announcement.title)}
                    </h2>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                        <span><i class="far fa-calendar mr-1"></i>${formatDate(announcement.created_at)}</span>
                        <span><i class="far fa-eye mr-1"></i>${announcement.views || 0}회</span>
                    </div>
                </div>
                <div class="p-6">
                    <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        ${escapeHtml(announcement.content)}
                    </div>
                </div>
                <div class="p-6 border-t border-gray-100 flex gap-3">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        닫기
                    </button>
                    <a href="announcements.html" 
                       class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-center">
                        전체 공지사항 보기
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('공지사항 상세 로드 오류:', error);
        window.location.href = 'announcements.html';
    }
}

// 날짜 포맷
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
