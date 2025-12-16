// 메인 페이지 공지사항 배너

document.addEventListener('DOMContentLoaded', function() {
    loadAnnouncementBanner();
});

async function loadAnnouncementBanner() {
    try {
        // 최신 긴급/중요 공지 1개만 가져오기
        const response = await fetch('tables/announcements?limit=10&sort=-created_at');
        
        if (!response.ok) return;
        
        const data = await response.json();
        const announcements = data.data || [];
        
        // 게시중이고 고객/전체 대상, 긴급/중요 공지만
        const announcement = announcements.find(ann => 
            ann.is_published && 
            (ann.target_audience === 'customers' || ann.target_audience === 'all') &&
            (ann.priority === 'urgent' || ann.priority === 'important' || ann.is_pinned)
        );
        
        if (!announcement) return;
        
        // 배너 생성
        const banner = createAnnouncementBanner(announcement);
        
        // 헤더 다음에 삽입 (헤더를 가리지 않도록)
        const header = document.querySelector('header');
        if (header && header.nextSibling) {
            document.body.insertBefore(banner, header.nextSibling);
        } else {
            document.body.appendChild(banner);
        }
        
    } catch (error) {
        console.error('공지 배너 로드 오류:', error);
    }
}

function createAnnouncementBanner(announcement) {
    const banner = document.createElement('div');
    banner.id = 'announcement-banner';
    banner.className = 'bg-gradient-to-r from-primary-500 to-pink-500 text-white py-3 px-4 cursor-pointer hover:opacity-90 transition-opacity';
    banner.style.position = 'relative';
    banner.style.zIndex = '10'; // 헤더보다 낮은 z-index
    banner.onclick = () => window.location.href = 'announcements.html';
    
    const priorityIcon = announcement.priority === 'urgent' ? 
        '<i class="fas fa-exclamation-circle mr-2"></i>' : 
        '<i class="fas fa-bullhorn mr-2"></i>';
    
    const preview = announcement.title.length > 60 ? 
        announcement.title.substring(0, 60) + '...' : 
        announcement.title;
    
    banner.innerHTML = `
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center flex-1">
                ${priorityIcon}
                <span class="font-medium">${escapeHtml(preview)}</span>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm opacity-90">자세히 보기 →</span>
                <button onclick="event.stopPropagation(); closeAnnouncementBanner()" 
                        class="hover:bg-white hover:bg-opacity-20 rounded p-1">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    return banner;
}

function closeAnnouncementBanner() {
    const banner = document.getElementById('announcement-banner');
    if (banner) {
        banner.style.display = 'none';
        // 24시간 동안 숨김
        localStorage.setItem('announcement-banner-hidden', Date.now() + 86400000);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
