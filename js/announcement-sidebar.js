// 메인 페이지 공지사항 사이드바
// 우측에 최신 공지 3개 표시

document.addEventListener('DOMContentLoaded', function() {
    loadAnnouncementSidebar();
});

async function loadAnnouncementSidebar() {
    try {
        // 최신 공지 3개 가져오기
        const response = await fetch('/tables/announcements?limit=3&sort=-created_at');
        
        if (!response.ok) return;
        
        const data = await response.json();
        const announcements = (data.data || []).filter(ann => 
            ann.is_published && 
            (ann.target_audience === 'customers' || ann.target_audience === 'all')
        );
        
        if (announcements.length === 0) return;
        
        // 사이드바 생성
        const sidebar = createAnnouncementSidebar(announcements);
        
        // body에 추가
        document.body.appendChild(sidebar);
        
    } catch (error) {
        console.error('공지 사이드바 로드 오류:', error);
    }
}

function createAnnouncementSidebar(announcements) {
    const sidebar = document.createElement('div');
    sidebar.id = 'announcement-sidebar';
    sidebar.className = 'fixed top-20 right-4 w-80 bg-white rounded-2xl shadow-2xl z-40 hidden lg:block';
    sidebar.style.maxHeight = '500px';
    sidebar.style.overflowY = 'auto';
    
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
        <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-500 to-pink-500 rounded-t-2xl">
            <div class="flex items-center justify-between">
                <h3 class="text-white font-bold text-lg">
                    <i class="fas fa-bell mr-2"></i>공지사항
                </h3>
                <a href="announcements.html" class="text-white text-sm hover:underline">
                    전체보기 →
                </a>
            </div>
        </div>
        <div class="p-4 space-y-3">
            ${announcements.map(ann => {
                const priority = ann.priority || 'normal';
                const colorClass = priorityColors[priority] || priorityColors['normal'];
                const icon = priorityIcons[priority] || priorityIcons['normal'];
                
                const titlePreview = ann.title.length > 30 ? 
                    ann.title.substring(0, 30) + '...' : 
                    ann.title;
                
                const contentPreview = ann.content.length > 50 ? 
                    ann.content.substring(0, 50) + '...' : 
                    ann.content;
                
                const date = formatDate(ann.created_at);
                
                return `
                    <div class="border ${colorClass} rounded-xl p-3 cursor-pointer hover:shadow-md transition-all" 
                         onclick="showAnnouncementDetail('${ann.id}')">
                        <div class="flex items-start gap-2 mb-2">
                            ${icon}
                            <h4 class="font-semibold text-sm flex-1" style="color: #1f2937;">
                                ${escapeHtml(titlePreview)}
                            </h4>
                        </div>
                        <p class="text-xs mb-2 line-clamp-2" style="color: #4b5563;">
                            ${escapeHtml(contentPreview)}
                        </p>
                        <div class="flex items-center justify-between text-xs" style="color: #6b7280;">
                            <span>${date}</span>
                            <span class="text-primary-600 hover:underline">자세히 →</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="p-3 border-t border-gray-100 text-center">
            <a href="announcements.html" 
               class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                모든 공지사항 보기 →
            </a>
        </div>
    `;
    
    return sidebar;
}

// 공지사항 상세 모달
async function showAnnouncementDetail(announcementId) {
    try {
        const response = await fetch(`/tables/announcements/${announcementId}`);
        if (!response.ok) {
            window.location.href = 'announcements.html';
            return;
        }
        
        const announcement = await response.json();
        
        // 조회수 증가
        try {
            await fetch(`/tables/announcements/${announcementId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    views: (announcement.views || 0) + 1
                })
            });
        } catch (e) {
            console.log('조회수 업데이트 실패:', e);
        }
        
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
