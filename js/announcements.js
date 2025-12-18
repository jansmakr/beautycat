// 공지사항 관리 시스템 (Admin Dashboard 전용)
let adminAnnouncements = [];
let currentAdminAnnouncement = null;

// 공지사항 로드
async function loadAnnouncements(updateTable = true) {
    try {
        const response = await fetch('tables/announcements?limit=100&sort=created_at');
        const data = await response.json();
        adminAnnouncements = data.data || [];
        
        if (updateTable) {
            displayAnnouncements(adminAnnouncements);
        }
    } catch (error) {
        console.error('공지사항 로드 오류:', error);
        
        // 데모 데이터
        adminAnnouncements = [
            {
                id: 'ann_001',
                title: '서비스 오픈 안내',
                content: 'BeautyCat 피부관리 플랫폼이 정식으로 오픈하였습니다!',
                priority: 'important',
                target_audience: 'all',
                is_pinned: true,
                is_published: true,
                publish_date: '2024-11-16T00:00:00Z',
                created_at: '2024-11-16T00:00:00Z'
                // views 필드 제거 (v2.8.13.6.28)
            },
            {
                id: 'ann_002',
                title: '제휴 카페 회원 무료 혜택',
                content: '2026년 3월 31일까지 제휴 카페 회원은 이용료 무료입니다.',
                priority: 'urgent',
                target_audience: 'shops',
                is_pinned: true,
                is_published: true,
                publish_date: '2024-11-16T00:00:00Z',
                created_at: '2024-11-16T00:00:00Z'
                // views 필드 제거 (v2.8.13.6.28)
            }
        ];
        
        if (updateTable) {
            displayAnnouncements(adminAnnouncements);
        }
    }
}

// 공지사항 표시
function displayAnnouncements(announcements) {
    const tableBody = document.getElementById('announcements-table');
    
    if (!tableBody) {
        console.error('공지사항 테이블을 찾을 수 없습니다');
        return;
    }
    
    if (announcements.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">등록된 공지사항이 없습니다.</td></tr>';
        return;
    }
    
    const priorityLabels = {
        'urgent': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">긴급</span>',
        'important': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">중요</span>',
        'normal': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">일반</span>',
        'low': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">낮음</span>'
    };
    
    const targetLabels = {
        'all': '전체',
        'customers': '고객',
        'shops': '업체',
        'admins': '관리자'
    };
    
    const statusLabels = {
        'published': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">게시중</span>',
        'draft': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">임시저장</span>',
        'expired': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">만료됨</span>'
    };
    
    tableBody.innerHTML = announcements.map(ann => {
        // 상태 결정
        let status = 'draft';
        if (ann.is_published) {
            const now = new Date();
            const publishDate = new Date(ann.publish_date || ann.created_at);
            const expireDate = ann.expire_date ? new Date(ann.expire_date) : null;
            
            if (now >= publishDate && (!expireDate || now <= expireDate)) {
                status = 'published';
            } else if (expireDate && now > expireDate) {
                status = 'expired';
            }
        }
        
        return `
            <tr class="${ann.is_pinned ? 'bg-yellow-50' : ''}">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        ${ann.is_pinned ? '<i class="fas fa-thumbtack text-yellow-600 mr-2"></i>' : ''}
                        <span class="text-sm font-medium text-gray-900">${ann.title || '-'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${priorityLabels[ann.priority] || priorityLabels['normal']}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${targetLabels[ann.target_audience] || '전체'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${statusLabels[status]}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formatDate(ann.created_at)}
                </td>
                <!-- 조회수 컬럼 제거 (v2.8.13.6.28): DB 컬럼 없음 -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewAnnouncement('${ann.id}')" class="text-blue-600 hover:text-blue-900 mr-2">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editAnnouncement('${ann.id}')" class="text-green-600 hover:text-green-900 mr-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteAnnouncement('${ann.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 공지사항 폼 설정
function setupAnnouncementForm() {
    const form = document.getElementById('announcement-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveAnnouncement();
        });
    }
}

// 공지사항 모달 열기
function showAnnouncementModal(announcementId = null) {
    const modal = document.getElementById('announcement-modal');
    const title = document.getElementById('announcement-modal-title');
    const form = document.getElementById('announcement-form');
    
    if (announcementId) {
        // 수정 모드
        currentAdminAnnouncement = adminAnnouncements.find(a => a.id === announcementId);
        if (!currentAdminAnnouncement) {
            alert('공지사항을 찾을 수 없습니다.');
            return;
        }
        
        title.textContent = '공지사항 수정';
        document.getElementById('announcement-id').value = currentAdminAnnouncement.id;
        document.getElementById('announcement-title').value = currentAdminAnnouncement.title || '';
        document.getElementById('announcement-priority').value = currentAdminAnnouncement.priority || 'normal';
        document.getElementById('announcement-target').value = currentAdminAnnouncement.target_audience || 'all';
        document.getElementById('announcement-pinned').checked = currentAdminAnnouncement.is_pinned || false;
        document.getElementById('announcement-published').checked = currentAdminAnnouncement.is_published || false;
        document.getElementById('announcement-content').value = currentAdminAnnouncement.content || '';
        
        if (currentAdminAnnouncement.publish_date) {
            const publishDate = new Date(currentAdminAnnouncement.publish_date);
            document.getElementById('announcement-publish-date').value = publishDate.toISOString().slice(0, 16);
        }
        
        if (currentAdminAnnouncement.expire_date) {
            const expireDate = new Date(currentAdminAnnouncement.expire_date);
            document.getElementById('announcement-expire-date').value = expireDate.toISOString().slice(0, 16);
        }
        
        document.getElementById('announcement-submit-text').textContent = '수정';
    } else {
        // 새 공지사항 모드
        title.textContent = '새 공지사항 작성';
        form.reset();
        document.getElementById('announcement-id').value = '';
        document.getElementById('announcement-published').checked = true;
        
        // 현재 시간으로 게시 시작일 설정
        const now = new Date();
        document.getElementById('announcement-publish-date').value = now.toISOString().slice(0, 16);
        
        document.getElementById('announcement-submit-text').textContent = '저장';
        currentAdminAnnouncement = null;
    }
    
    modal.classList.remove('hidden');
}

// 공지사항 모달 닫기
function closeAnnouncementModal() {
    const modal = document.getElementById('announcement-modal');
    modal.classList.add('hidden');
    currentAdminAnnouncement = null;
}

// 공지사항 저장
async function saveAnnouncement() {
    const id = document.getElementById('announcement-id').value;
    const title = document.getElementById('announcement-title').value;
    const priority = document.getElementById('announcement-priority').value;
    const target = document.getElementById('announcement-target').value;
    const pinned = document.getElementById('announcement-pinned').checked;
    const published = document.getElementById('announcement-published').checked;
    const publishDate = document.getElementById('announcement-publish-date').value;
    const expireDate = document.getElementById('announcement-expire-date').value;
    const content = document.getElementById('announcement-content').value;
    
    const announcementData = {
        title: title,
        content: content,
        priority: priority,
        target_audience: target,
        is_pinned: pinned,
        is_published: published,
        publish_date: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString(),
        expire_date: expireDate ? new Date(expireDate).toISOString() : null
        // views 필드 제거 (v2.8.13.6.28): DB 컬럼 없음
    };
    
    try {
        let response;
        if (id) {
            // 수정
            response = await fetch(`tables/announcements/${id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(announcementData)
            });
        } else {
            // 새로 생성
            response = await fetch('tables/announcements', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(announcementData)
            });
        }
        
        if (response.ok) {
            alert(id ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.');
            closeAnnouncementModal();
            await loadAnnouncements();
        } else {
            const errorText = await response.text();
            console.error('저장 실패:', errorText);
            alert('저장에 실패했습니다: ' + errorText);
        }
    } catch (error) {
        console.error('저장 오류:', error);
        alert('저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// 공지사항 보기
function viewAnnouncement(announcementId) {
    const announcement = adminAnnouncements.find(a => a.id === announcementId);
    if (!announcement) {
        alert('공지사항을 찾을 수 없습니다.');
        return;
    }
    
    alert(`제목: ${announcement.title}\n\n내용:\n${announcement.content}\n\n우선순위: ${announcement.priority}\n대상: ${announcement.target_audience}`);
}

// 공지사항 수정
function editAnnouncement(announcementId) {
    showAnnouncementModal(announcementId);
}

// 공지사항 삭제
async function deleteAnnouncement(announcementId) {
    if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`tables/announcements/${announcementId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('공지사항이 삭제되었습니다.');
            await loadAnnouncements();
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다: ' + error.message);
    }
}

// 공지사항 필터링
function filterAnnouncements() {
    const filter = document.getElementById('announcement-filter').value;
    let filtered = adminAnnouncements;
    
    if (filter) {
        filtered = adminAnnouncements.filter(ann => {
            if (filter === 'published') {
                return ann.is_published === true;
            } else if (filter === 'draft') {
                return ann.is_published === false;
            } else if (filter === 'expired') {
                return ann.expire_date && new Date(ann.expire_date) < new Date();
            }
            return true;
        });
    }
    
    displayAnnouncements(filtered);
}

// 날짜 포맷 함수 (없을 경우)
if (typeof formatDate === 'undefined') {
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
