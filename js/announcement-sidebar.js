// 메인 페이지 공지사항 사이드바
// 우측에 최신 공지 3개 표시

document.addEventListener('DOMContentLoaded', function() {
    loadAnnouncementSidebar();
});

async function loadAnnouncementSidebar() {
    try {
        console.log('[샵 이벤트 사이드바] 로딩 시작...');
        
        // 관리자 공지 1개 가져오기
        const adminResponse = await fetch('/tables/announcements?limit=1&sort=-created_at');
        
        // 샵 공지 3개 가져오기
        const shopResponse = await fetch('/tables/shop_announcements?limit=3&sort=-created_at');
        
        console.log('[샵 이벤트 사이드바] 관리자 공지 응답:', adminResponse.status);
        console.log('[샵 이벤트 사이드바] 샵 공지 응답:', shopResponse.status);
        
        let allAnnouncements = [];
        
        // 관리자 공지 처리
        if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            const adminAnnouncements = (adminData.data || []).filter(ann => 
                ann.is_published && 
                (ann.target_audience === 'customers' || ann.target_audience === 'all')
            ).slice(0, 1);
            
            allAnnouncements = allAnnouncements.concat(adminAnnouncements.map(ann => ({
                ...ann,
                type: 'admin'
            })));
        }
        
        // 샵 공지 처리
        if (shopResponse.ok) {
            const shopData = await shopResponse.json();
            const shopAnnouncements = (shopData.data || []).filter(ann => 
                ann.is_published
            ).slice(0, 3);
            
            allAnnouncements = allAnnouncements.concat(shopAnnouncements.map(ann => ({
                ...ann,
                type: 'shop'
            })));
        }
        
        console.log('[샵 이벤트 사이드바] 총 공지:', allAnnouncements.length + '개 (관리자: 1개, 샵: 3개)');
        
        if (allAnnouncements.length === 0) {
            console.warn('[샵 이벤트 사이드바] 표시할 공지사항 없음');
            return;
        }
        
        // 사이드바 생성
        const sidebar = createAnnouncementSidebar(allAnnouncements);
        
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
    
    // 인라인 스타일로 강제 적용 (하늘색 배경으로 강조)
    // 모바일에서도 보이도록 수정
    sidebar.style.cssText = `
        position: fixed !important;
        top: 80px !important;
        right: 8px !important;
        width: 280px !important;
        max-width: calc(100vw - 16px) !important;
        max-height: 70vh !important;
        overflow-y: auto !important;
        z-index: 9999 !important;
        background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%) !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 25px -5px rgba(14, 165, 233, 0.3), 0 10px 10px -5px rgba(14, 165, 233, 0.2) !important;
        display: block !important;
        border: 2px solid #38BDF8 !important;
    `;
    
    // 모바일에서는 작게 표시
    if (window.innerWidth < 768) {
        sidebar.style.width = '260px';
        sidebar.style.top = '70px';
        sidebar.style.right = '4px';
    }
    
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
        <div class="p-3 border-b" style="background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%); border-color: #0284C7; border-bottom-width: 2px; border-radius: 14px 14px 0 0;">
            <div class="flex items-center justify-between">
                <h3 class="text-white font-bold" style="font-size: 14px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <i class="fas fa-gift mr-1"></i>샵 이벤트 및 공지
                </h3>
                <a href="announcements.html" class="text-white hover:underline font-semibold" style="font-size: 11px;">
                    전체보기 →
                </a>
            </div>
        </div>
        <div class="p-2.5 space-y-1.5">
            ${announcements.map((ann, index) => {
                const isAdmin = ann.type === 'admin';
                const badge = isAdmin ? 
                    '<span class="px-1.5 py-0.5 rounded" style="font-size: 10px; background: #DC2626; color: white; font-weight: 600;">운영팀</span>' : 
                    '<span class="px-1.5 py-0.5 rounded" style="font-size: 10px; background: #0EA5E9; color: white; font-weight: 600;">샵</span>';
                
                const titlePreview = ann.title.length > 24 ? 
                    ann.title.substring(0, 24) + '...' : 
                    ann.title;
                
                return `
                    <div class="bg-white border border-blue-200 rounded-lg px-2 py-1.5 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all" 
                         onclick="showAnnouncementDetail('${ann.id}', '${ann.type}')"
                         style="background: linear-gradient(to right, #FFFFFF 0%, #F0F9FF 100%);">
                        <div class="flex items-center gap-1.5">
                            ${badge}
                            <h4 class="font-semibold flex-1 truncate" style="font-size: 11px; color: #0C4A6E; line-height: 1.3;">
                                ${escapeHtml(titlePreview)}
                            </h4>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="p-2.5 border-t-2 text-center" style="border-color: #0284C7; background: linear-gradient(to bottom, #F0F9FF 0%, #FFFFFF 100%);">
            <a href="announcements.html" 
               class="font-bold inline-block px-3 py-1.5 rounded-lg transition-all"
               style="font-size: 11px; color: #0369A1; background: #E0F2FE; border: 2px solid #38BDF8;"
               onmouseover="this.style.background='#BAE6FD'; this.style.borderColor='#0EA5E9';"
               onmouseout="this.style.background='#E0F2FE'; this.style.borderColor='#38BDF8';">
                <i class="fas fa-list" style="font-size: 10px;"></i> 모든 공지사항 보기 →
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
