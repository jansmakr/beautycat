// 전역 변수 (auth.js에서 정의된 currentUser를 사용)
let currentConsultations = [];
let currentQuotes = [];

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeCustomerDashboard();
});

// 고객 대시보드 초기화
function initializeCustomerDashboard() {
    // 인증 확인
    checkAuthentication();
    
    // 사용자 정보 로드
    loadUserInfo();
    
    // 데이터 로드
    loadDashboardData();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 공지사항 로드
    loadAnnouncementAlert();
}

// 인증 확인
function checkAuthentication() {
    // getCurrentUser 함수 사용 (auth.js에서 정의)
    let user = getCurrentUser();
    const userType = localStorage.getItem('user_type');
    const token = localStorage.getItem('session_token');
    
    // 테스트를 위해 사용자가 없으면 데모 고객 자동 로그인
    if (!user || !token || userType !== 'customer') {
        console.log('인증 실패, 데모 고객으로 자동 로그인:', { user: !!user, token: !!token, userType });
        
        // 데모 고객 계정 생성
        const demoCustomer = {
            id: 'demo_customer_1',
            email: 'demo@customer.com',
            name: '데모 고객',
            phone: '010-1111-1111',
            user_type: 'customer',
            is_active: true,
            is_verified: true,
            profile_image: '',
            last_login: new Date().toISOString(),
            shop_id: '',
            permissions: ['customer']
        };
        
        // 세션 저장
        localStorage.setItem('session_token', 'demo_token_' + Date.now());
        localStorage.setItem('user_type', 'customer');
        localStorage.setItem('user_data', JSON.stringify(demoCustomer));
        
        user = demoCustomer;
    }
    
    // 전역 currentUser 변수에 할당
    currentUser = user;
    return true;
}

// 사용자 정보 로드
function loadUserInfo() {
    if (!currentUser) return;
    
    // 사용자 이름 업데이트
    const userNameElements = document.querySelectorAll('#user-name, #sidebar-user-name');
    userNameElements.forEach(el => {
        el.textContent = currentUser.name + '님';
    });
    
    // 프로필 이미지 업데이트
    const profileImageElements = document.querySelectorAll('#profile-image, #sidebar-profile-image, #profile-edit-image');
    profileImageElements.forEach(el => {
        if (currentUser.profile_image) {
            el.src = currentUser.profile_image;
        }
    });
    
    // 프로필 폼 초기화
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        document.getElementById('profile-name').value = currentUser.name || '';
        document.getElementById('profile-phone').value = currentUser.phone || '';
        document.getElementById('profile-email').value = currentUser.email || '';
    }
}

// 대시보드 데이터 로드
async function loadDashboardData() {
    try {
        // 상담 내역 로드
        await loadConsultations();
        
        // 견적서 로드
        await loadQuotes();
        
        // 통계 업데이트
        updateStatistics();
        
        // 최근 활동 표시
        displayRecentActivity();
        
    } catch (error) {
        console.error('대시보드 데이터 로드 오류:', error);
        showNotification('데이터 로드 중 오류가 발생했습니다.', 'error');
    }
}

// 상담 내역 로드
async function loadConsultations() {
    try {
        const response = await fetch('tables/consultations?limit=100&sort=created_at');
        const data = await response.json();
        
        // 현재 사용자의 상담만 필터링
        currentConsultations = data.data.filter(consultation => 
            consultation.customer_email === currentUser.email ||
            consultation.customer_name === currentUser.name
        );
        
        console.log('로드된 상담 내역:', currentConsultations.length);
        
    } catch (error) {
        console.error('상담 내역 로드 오류:', error);
        currentConsultations = [];
    }
}

// 견적서 로드
async function loadQuotes() {
    try {
        const response = await fetch('tables/quotes?limit=100&sort=created_at');
        const data = await response.json();
        
        // 현재 사용자의 상담과 연결된 견적서만 필터링
        const consultationIds = currentConsultations.map(c => c.id);
        currentQuotes = data.data.filter(quote => 
            consultationIds.includes(quote.consultation_id)
        );
        
        console.log('로드된 견적서:', currentQuotes.length);
        
    } catch (error) {
        console.error('견적서 로드 오류:', error);
        currentQuotes = [];
    }
}

// 통계 업데이트
function updateStatistics() {
    // 상담 통계
    const totalConsultations = currentConsultations.length;
    const pendingConsultations = currentConsultations.filter(c => 
        c.status === 'pending' || c.status === 'in_progress'
    ).length;
    const completedConsultations = currentConsultations.filter(c => 
        c.status === 'completed'
    ).length;
    
    // 견적서 통계
    const totalQuotes = currentQuotes.length;
    const newQuotes = currentQuotes.filter(q => q.status === 'sent').length;
    const acceptedQuotes = currentQuotes.filter(q => q.status === 'accepted').length;
    
    // DOM 업데이트
    document.getElementById('total-consultations').textContent = totalConsultations;
    document.getElementById('pending-consultations').textContent = pendingConsultations;
    document.getElementById('completed-consultations').textContent = completedConsultations;
    document.getElementById('received-quotes').textContent = totalQuotes;
    
    // 견적서 섹션 통계
    document.getElementById('total-quotes').textContent = totalQuotes;
    document.getElementById('new-quotes').textContent = newQuotes;
    document.getElementById('accepted-quotes').textContent = acceptedQuotes;
    
    // 알림 배지 업데이트
    const notificationBadge = document.getElementById('notification-badge');
    if (newQuotes > 0) {
        notificationBadge.textContent = newQuotes;
        notificationBadge.classList.remove('hidden');
    } else {
        notificationBadge.classList.add('hidden');
    }
}

// 최근 활동 표시
function displayRecentActivity() {
    displayRecentConsultations();
    displayRecentQuotes();
}

// 최근 상담 내역 표시
function displayRecentConsultations() {
    const container = document.getElementById('recent-consultations');
    const recentConsultations = currentConsultations
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    if (recentConsultations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-comments text-4xl mb-4 opacity-50"></i>
                <p>아직 상담 내역이 없습니다</p>
                <a href="index.html" class="text-pink-600 hover:underline">첫 상담 신청하기</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentConsultations.map(consultation => `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex-1">
                <div class="font-medium text-gray-900">${consultation.region}</div>
                <div class="text-sm text-gray-500">${consultation.treatment_type}</div>
                <div class="text-xs text-gray-400">${formatDate(consultation.created_at)}</div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(consultation.status)}">
                    ${getStatusText(consultation.status)}
                </span>
                <button onclick="openChat('${consultation.id}')" class="text-pink-600 hover:text-pink-700">
                    <i class="fas fa-comments"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 최근 견적서 표시
function displayRecentQuotes() {
    const container = document.getElementById('recent-quotes');
    const recentQuotes = currentQuotes
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    if (recentQuotes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-file-invoice-dollar text-4xl mb-4 opacity-50"></i>
                <p>아직 받은 견적서가 없습니다</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentQuotes.map(quote => `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex-1">
                <div class="font-medium text-gray-900">${quote.treatment_details.substring(0, 30)}...</div>
                <div class="text-sm text-pink-600 font-semibold">${quote.price?.toLocaleString()}원</div>
                <div class="text-xs text-gray-400">${formatDate(quote.created_at)}</div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="px-2 py-1 text-xs rounded-full ${getQuoteStatusBadgeClass(quote.status)}">
                    ${getQuoteStatusText(quote.status)}
                </span>
                <button onclick="showQuoteDetail('${quote.id}')" class="text-blue-600 hover:text-blue-700">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 상담 내역 목록 표시
function displayConsultationsList() {
    const container = document.getElementById('consultations-list');
    
    if (currentConsultations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-comments text-6xl mb-4 opacity-30"></i>
                <h3 class="text-xl font-semibold mb-2">상담 내역이 없습니다</h3>
                <p class="mb-6">아직 신청한 상담이 없습니다. 첫 상담을 신청해보세요!</p>
                <a href="index.html" class="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg inline-block">
                    상담 신청하기
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentConsultations.map(consultation => `
        <div class="p-6">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 mr-3">${consultation.region}</h3>
                        <span class="px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(consultation.status)}">
                            ${getStatusText(consultation.status)}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div><strong>관심 프로그램:</strong> ${consultation.treatment_type}</div>
                        <div><strong>예산:</strong> ${consultation.budget_range || '미설정'}</div>
                        <div><strong>선호 일정:</strong> ${consultation.preferred_schedule || '미설정'}</div>
                        <div><strong>신청일:</strong> ${formatDate(consultation.created_at)}</div>
                    </div>
                    ${consultation.consultation_text ? `
                        <div class="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-4">
                            ${consultation.consultation_text}
                        </div>
                    ` : ''}
                </div>
                <div class="flex space-x-2">
                    <button onclick="openChat('${consultation.id}')" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm">
                        <i class="fas fa-comments mr-1"></i>채팅
                    </button>
                    <button onclick="viewConsultationQuotes('${consultation.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                        <i class="fas fa-file-invoice-dollar mr-1"></i>견적서
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 견적서 목록 표시
function displayQuotesList() {
    const container = document.getElementById('quotes-list');
    
    if (currentQuotes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-file-invoice-dollar text-6xl mb-4 opacity-30"></i>
                <h3 class="text-xl font-semibold mb-2">견적서가 없습니다</h3>
                <p class="mb-6">아직 받은 견적서가 없습니다. 상담을 신청하고 견적을 받아보세요!</p>
                <a href="index.html" class="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg inline-block">
                    상담 신청하기
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentQuotes.map(quote => {
        const consultation = currentConsultations.find(c => c.id === quote.consultation_id);
        return `
            <div class="p-6">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <h3 class="text-lg font-semibold text-gray-900 mr-3">견적서</h3>
                            <span class="px-3 py-1 text-sm rounded-full ${getQuoteStatusBadgeClass(quote.status)}">
                                ${getQuoteStatusText(quote.status)}
                            </span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div><strong>관련 상담:</strong> ${consultation?.region} - ${consultation?.treatment_type}</div>
                            <div><strong>가격:</strong> <span class="text-lg font-semibold text-pink-600">${quote.price?.toLocaleString()}원</span></div>
                            <div><strong>소요시간:</strong> ${quote.duration}</div>
                            <div><strong>받은 날짜:</strong> ${formatDate(quote.created_at)}</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-4">
                            ${quote.treatment_details}
                        </div>
                        ${quote.additional_notes ? `
                            <div class="text-sm text-gray-600">
                                <strong>추가사항:</strong> ${quote.additional_notes}
                            </div>
                        ` : ''}
                    </div>
                    <div class="flex flex-col space-y-2">
                        <button onclick="showQuoteDetail('${quote.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                            <i class="fas fa-eye mr-1"></i>상세보기
                        </button>
                        ${quote.status === 'sent' ? `
                            <button onclick="acceptQuote('${quote.id}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                                <i class="fas fa-check mr-1"></i>수락
                            </button>
                        ` : ''}
                        <button onclick="openChat('${quote.consultation_id}')" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm">
                            <i class="fas fa-comments mr-1"></i>채팅
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 프로필 폼 제출
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // 상담 검색 및 필터
    const searchInput = document.getElementById('search-consultations');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterConsultations();
            }
        });
    }
    
    // 페이지 외부 클릭 시 프로필 메뉴 닫기
    document.addEventListener('click', function(e) {
        const profileDropdown = document.getElementById('profile-dropdown');
        const profileMenu = document.getElementById('profile-menu');
        
        if (profileDropdown && !profileDropdown.contains(e.target)) {
            profileMenu.classList.add('hidden');
        }
    });
}

// 섹션 표시
function showSection(sectionName) {
    // 모든 섹션 숨김
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // 선택된 섹션 표시
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // 사이드바 활성화 상태 업데이트
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // 섹션별 데이터 로드
    switch (sectionName) {
        case 'consultations':
            displayConsultationsList();
            break;
        case 'quotes':
            displayQuotesList();
            break;
        case 'dashboard':
            displayRecentActivity();
            break;
        case 'reviews':
            loadReviewsSection();
            break;
    }
}

// 프로필 메뉴 토글
function toggleProfileMenu() {
    const profileMenu = document.getElementById('profile-menu');
    profileMenu.classList.toggle('hidden');
}

// 프로필 업데이트 처리
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updateData = {
        name: document.getElementById('profile-name').value,
        phone: document.getElementById('profile-phone').value
    };
    
    try {
        // 사용자 정보 업데이트 (실제로는 서버 API 호출)
        // 여기서는 localStorage 업데이트
        const updatedUser = { ...currentUser, ...updateData };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        currentUser = updatedUser;
        
        // UI 업데이트
        loadUserInfo();
        
        showNotification('프로필이 업데이트되었습니다.', 'success');
        
    } catch (error) {
        console.error('프로필 업데이트 오류:', error);
        showNotification('프로필 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

// 상담 내역 필터링
function filterConsultations() {
    const status = document.getElementById('status-filter').value;
    const search = document.getElementById('search-consultations').value.toLowerCase();
    
    let filteredConsultations = [...currentConsultations];
    
    if (status) {
        filteredConsultations = filteredConsultations.filter(c => c.status === status);
    }
    
    if (search) {
        filteredConsultations = filteredConsultations.filter(c => 
            c.region.toLowerCase().includes(search) ||
            c.treatment_type.toLowerCase().includes(search)
        );
    }
    
    // 필터링된 결과로 목록 업데이트
    const container = document.getElementById('consultations-list');
    // displayConsultationsList 함수의 로직을 사용하되 filteredConsultations 사용
    // 간단히 전체 목록을 다시 표시 (실제로는 필터링 로직 적용 필요)
    displayConsultationsList();
}

// 견적서 상세 보기
function showQuoteDetail(quoteId) {
    const quote = currentQuotes.find(q => q.id === quoteId);
    if (!quote) return;
    
    const consultation = currentConsultations.find(c => c.id === quote.consultation_id);
    
    const modal = document.getElementById('quote-detail-modal');
    const content = document.getElementById('quote-detail-content');
    
    content.innerHTML = `
        <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">관련 상담</h4>
                <p class="text-gray-700">${consultation?.region} - ${consultation?.treatment_type}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">관리 내용</h4>
                <p class="text-gray-700">${quote.treatment_details}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">가격</h4>
                    <p class="text-2xl font-bold text-pink-600">${quote.price?.toLocaleString()}원</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">소요시간</h4>
                    <p class="text-gray-700">${quote.duration}</p>
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">예약 가능일</h4>
                <p class="text-gray-700">${quote.available_dates?.join(', ') || '협의'}</p>
            </div>
            ${quote.additional_notes ? `
                <div>
                    <h4 class="font-semibold text-gray-900 mb-2">추가사항</h4>
                    <p class="text-gray-700">${quote.additional_notes}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// 견적서 상세 모달 닫기
function closeQuoteDetailModal() {
    document.getElementById('quote-detail-modal').classList.add('hidden');
}

// 견적서 수락
async function acceptQuote(quoteId) {
    try {
        // 견적서 상태 업데이트
        const response = await fetch(`tables/quotes/${quoteId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'accepted'
            })
        });
        
        if (response.ok) {
            showNotification('견적서를 수락했습니다!', 'success');
            closeQuoteDetailModal();
            await loadQuotes();
            updateStatistics();
            
            // 현재 표시 중인 섹션 새로고침
            const activeSection = document.querySelector('.sidebar-item.active')?.dataset.section;
            if (activeSection === 'quotes') {
                displayQuotesList();
            }
        } else {
            throw new Error('견적서 수락 실패');
        }
        
    } catch (error) {
        console.error('견적서 수락 오류:', error);
        showNotification('견적서 수락 중 오류가 발생했습니다.', 'error');
    }
}

// 상담별 견적서 보기
function viewConsultationQuotes(consultationId) {
    const quotes = currentQuotes.filter(q => q.consultation_id === consultationId);
    
    if (quotes.length === 0) {
        showNotification('해당 상담의 견적서가 없습니다.', 'info');
        return;
    }
    
    // 견적서 섹션으로 이동하고 해당 상담의 견적서만 표시
    showSection('quotes');
    // 필터링 로직 추가 가능
}

// 채팅 열기
function openChat(consultationId) {
    if (consultationId) {
        window.open(`chat.html?consultation_id=${consultationId}&user_type=customer`, '_blank');
    }
}

// 유틸리티 함수들
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': '대기 중',
        'in_progress': '진행 중',
        'matched': '매칭 완료',
        'completed': '완료',
        'cancelled': '취소됨'
    };
    return statusMap[status] || status;
}

function getStatusBadgeClass(status) {
    const classMap = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'matched': 'bg-green-100 text-green-800',
        'completed': 'bg-gray-100 text-gray-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
}

function getQuoteStatusText(status) {
    const statusMap = {
        'sent': '새 견적',
        'viewed': '확인함',
        'accepted': '수락함',
        'rejected': '거절함'
    };
    return statusMap[status] || status;
}

function getQuoteStatusBadgeClass(status) {
    const classMap = {
        'sent': 'bg-green-100 text-green-800',
        'viewed': 'bg-blue-100 text-blue-800',
        'accepted': 'bg-purple-100 text-purple-800',
        'rejected': 'bg-red-100 text-red-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
}

// 전역 함수들
window.showSection = showSection;
window.toggleProfileMenu = toggleProfileMenu;
window.filterConsultations = filterConsultations;
window.showQuoteDetail = showQuoteDetail;
window.closeQuoteDetailModal = closeQuoteDetailModal;
window.acceptQuote = acceptQuote;
window.viewConsultationQuotes = viewConsultationQuotes;
window.openChat = openChat;

// ======= ANNOUNCEMENT ALERT FUNCTIONS =======

// 공지사항 알림 로드
async function loadAnnouncementAlert() {
    try {
        const response = await fetch('tables/announcements?limit=1&sort=created_at');
        const data = await response.json();
        let announcements = data.data || [];
        
        // 게시된 공지사항 중 고객 대상이거나 전체 대상인 것만 필터링
        announcements = announcements.filter(ann => 
            ann.is_published && 
            (ann.target_audience === 'customers' || ann.target_audience === 'all') &&
            (!ann.expire_date || new Date(ann.expire_date) > new Date())
        );
        
        if (announcements.length > 0) {
            showAnnouncementAlert(announcements[0]);
        }
        
    } catch (error) {
        console.error('공지사항 로드 오류:', error);
        
        // API 실패시 데모 공지사항 표시
        const demoAnnouncement = {
            title: '새로운 피부관리 프로그램 출시',
            content: '안티에이징 전문 프로그램이 새롭게 추가되었습니다. 지금 신청해보세요!',
            priority: 'normal'
        };
        showAnnouncementAlert(demoAnnouncement);
    }
}

// 공지사항 알림 표시
function showAnnouncementAlert(announcement) {
    const alertBar = document.getElementById('announcement-alert');
    const alertText = document.getElementById('announcement-alert-text');
    
    if (alertBar && alertText) {
        // 이미 닫았던 공지사항인지 확인 (localStorage 이용)
        const dismissedAnnouncements = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
        if (dismissedAnnouncements.includes(announcement.id)) {
            return; // 이미 닫은 공지사항은 표시하지 않음
        }
        
        alertText.textContent = `${announcement.title}: ${announcement.content}`;
        alertBar.classList.remove('hidden');
    }
}

// 공지사항 알림 닫기
function closeAnnouncementAlert() {
    const alertBar = document.getElementById('announcement-alert');
    if (alertBar) {
        alertBar.classList.add('hidden');
        
        // 닫은 공지사항 ID를 localStorage에 저장 (재표시 방지)
        const currentAnnouncement = alertBar.dataset.announcementId;
        if (currentAnnouncement) {
            const dismissedAnnouncements = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
            dismissedAnnouncements.push(currentAnnouncement);
            localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedAnnouncements));
        }
    }
}

// ======= REVIEW MANAGEMENT FUNCTIONS =======

let selectedConsultation = null;

// 리뷰 관련 함수들을 전역으로 노출
window.showReviewModal = showReviewModal;
window.closeReviewModal = closeReviewModal;

// 리뷰 섹션 로드
function loadReviewsSection() {
    loadPendingReviews();
    loadMyReviews();
    setupStarRating();
}

// 리뷰 작성 대기 목록 로드
async function loadPendingReviews() {
    try {
        // 완료된 상담 중 리뷰를 작성하지 않은 것들
        const completedConsultations = currentConsultations.filter(consultation => 
            consultation.status === 'completed' || consultation.status === 'accepted'
        );
        
        const pendingReviewsContainer = document.getElementById('pending-reviews-list');
        
        if (completedConsultations.length === 0) {
            pendingReviewsContainer.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    <i class="fas fa-clipboard-list text-3xl mb-2"></i>
                    <p>리뷰 작성 가능한 상담이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        pendingReviewsContainer.innerHTML = completedConsultations.map(consultation => `
            <div class="p-6 flex items-center justify-between">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${consultation.shop_name || '샵명 미확인'}</h4>
                    <p class="text-sm text-gray-600 mt-1">${consultation.treatment_type}</p>
                    <p class="text-xs text-gray-500 mt-1">${formatDate(consultation.created_at)}</p>
                </div>
                <button onclick="showReviewModal('${consultation.id}', '${consultation.shop_id}', '${consultation.shop_name}', '${consultation.treatment_type}')" 
                        class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm">
                    리뷰 작성
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('리뷰 대기 목록 로드 오류:', error);
    }
}

// 내가 작성한 리뷰 목록 로드
async function loadMyReviews() {
    try {
        const response = await fetch(`tables/reviews?search=${encodeURIComponent(currentUser.id)}&limit=50`);
        const data = await response.json();
        const reviews = data.data || [];
        
        const myReviewsContainer = document.getElementById('my-reviews-list');
        
        if (reviews.length === 0) {
            myReviewsContainer.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    <i class="fas fa-star text-3xl mb-2"></i>
                    <p>작성한 리뷰가 없습니다.</p>
                </div>
            `;
            return;
        }
        
        myReviewsContainer.innerHTML = reviews.map(review => `
            <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h4 class="font-medium text-gray-900">${review.shop_name || '샵명 미확인'}</h4>
                        <div class="flex items-center mt-1">
                            <div class="flex text-yellow-400 text-sm mr-2">
                                ${generateStarRating(review.rating)}
                            </div>
                            <span class="text-sm text-gray-600">${review.rating}/5.0</span>
                        </div>
                    </div>
                    <span class="text-xs text-gray-500">${formatDate(review.created_at)}</span>
                </div>
                <p class="text-sm text-gray-700 mb-2">${review.treatment_received || '치료 내용 없음'}</p>
                <p class="text-sm text-gray-600">${review.review_text}</p>
                ${review.recommend_yn ? '<div class="mt-2"><span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">추천함</span></div>' : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('리뷰 목록 로드 오류:', error);
    }
}

// 리뷰 작성 모달 열기
function showReviewModal(consultationId, shopId, shopName, treatmentType) {
    selectedConsultation = {
        id: consultationId,
        shop_id: shopId,
        shop_name: shopName,
        treatment_type: treatmentType
    };
    
    document.getElementById('review-consultation-id').value = consultationId;
    document.getElementById('review-shop-id').value = shopId;
    document.getElementById('review-shop-name').textContent = shopName;
    document.getElementById('review-treatment-type').textContent = treatmentType;
    
    // 폼 초기화
    document.getElementById('review-form').reset();
    resetStarRating();
    
    // 리뷰 폼 제출 이벤트 추가
    const reviewForm = document.getElementById('review-form');
    reviewForm.onsubmit = submitReview;
    
    document.getElementById('review-modal').classList.remove('hidden');
}

// 리뷰 작성 모달 닫기
function closeReviewModal() {
    document.getElementById('review-modal').classList.add('hidden');
    selectedConsultation = null;
}

// 별점 시스템 설정
function setupStarRating() {
    const starRating = document.querySelector('.star-rating');
    if (!starRating) return;
    
    const stars = starRating.querySelectorAll('.star');
    const ratingText = document.getElementById('overall-rating-text');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = index + 1;
            starRating.dataset.rating = rating;
            
            // 별점 표시 업데이트
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('text-yellow-400');
                    s.classList.remove('text-gray-300');
                } else {
                    s.classList.add('text-gray-300');
                    s.classList.remove('text-yellow-400');
                }
            });
            
            // 텍스트 업데이트
            const ratingLabels = ['', '매우 불만족', '불만족', '보통', '만족', '매우 만족'];
            ratingText.textContent = `${rating}점 - ${ratingLabels[rating]}`;
        });
    });
}

// 별점 초기화
function resetStarRating() {
    const starRating = document.querySelector('.star-rating');
    if (!starRating) return;
    
    const stars = starRating.querySelectorAll('.star');
    const ratingText = document.getElementById('overall-rating-text');
    
    starRating.dataset.rating = 0;
    stars.forEach(star => {
        star.classList.add('text-gray-300');
        star.classList.remove('text-yellow-400');
    });
    ratingText.textContent = '평점을 선택해주세요';
}

// 리뷰 제출
async function submitReview(event) {
    event.preventDefault();
    
    const rating = parseInt(document.querySelector('.star-rating').dataset.rating);
    const serviceQuality = parseInt(document.getElementById('service-quality').value);
    const priceSatisfaction = parseInt(document.getElementById('price-satisfaction').value);
    const facilityCleanliness = parseInt(document.getElementById('facility-cleanliness').value);
    const staffKindness = parseInt(document.getElementById('staff-kindness').value);
    const treatmentReceived = document.getElementById('treatment-received').value;
    const reviewContent = document.getElementById('review-content').value;
    const recommendShop = document.getElementById('recommend-shop').checked;
    
    // 유효성 검사
    if (rating === 0) {
        showNotification('전체 만족도를 선택해주세요.', 'error');
        return;
    }
    
    if (!reviewContent || reviewContent.length < 20) {
        showNotification('리뷰 내용을 20자 이상 작성해주세요.', 'error');
        return;
    }
    
    try {
        const reviewData = {
            consultation_id: selectedConsultation.id,
            shop_id: selectedConsultation.shop_id,
            customer_id: currentUser.id,
            customer_name: currentUser.name,
            rating: rating,
            review_text: reviewContent,
            treatment_received: treatmentReceived,
            service_quality: serviceQuality || rating,
            price_satisfaction: priceSatisfaction || rating,
            facility_cleanliness: facilityCleanliness || rating,
            staff_kindness: staffKindness || rating,
            recommend_yn: recommendShop,
            is_verified: false,
            created_at: new Date().toISOString()
        };
        
        const response = await fetch('tables/reviews', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(reviewData)
        });
        
        if (response.ok) {
            showNotification('리뷰가 성공적으로 작성되었습니다!', 'success');
            closeReviewModal();
            loadReviewsSection(); // 리뷰 목록 새로고침
        } else {
            throw new Error('리뷰 저장 실패');
        }
        
    } catch (error) {
        console.error('리뷰 작성 오류:', error);
        showNotification('리뷰 작성 중 오류가 발생했습니다.', 'error');
    }
}

// 별점 HTML 생성 (main.js와 동일)
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

window.closeAnnouncementAlert = closeAnnouncementAlert;

// ======= 모바일 메뉴 함수들 =======

// 모바일 메뉴 토글
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// 모바일 메뉴 닫기
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
}

// 프로필 메뉴 토글
function toggleProfileMenu() {
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        profileMenu.classList.toggle('hidden');
    }
}

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        // 세션 데이터 제거
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_type');
        localStorage.removeItem('user_data');
        localStorage.removeItem('currentUser');
        
        // 홈페이지로 리디렉션
        window.location.href = 'index.html';
    }
}

// 새 상담 신청 처리
function handleNewConsultation() {
    // 로그인 상태 확인
    const user = getCurrentUser();
    const token = localStorage.getItem('session_token');
    
    if (!user || !token) {
        // 비로그인 상태 - 회원 전용 메시지 표시
        showMemberOnlyModal();
        return;
    }
    
    // 로그인된 상태 - 바로 견적 작성 폼으로 이동
    window.location.href = 'index.html#consultation';
}

// 회원 전용 모달 표시
function showMemberOnlyModal() {
    // 모달이 이미 있는지 확인
    let modal = document.getElementById('member-only-modal');
    
    if (!modal) {
        // 모달 생성
        modal = document.createElement('div');
        modal.id = 'member-only-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-check text-primary-500 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">회원 전용 서비스</h3>
                    <p class="text-gray-600 mb-4">견적 신청은 로그인된 회원만 이용 가능합니다.</p>
                    <p class="text-sm text-primary-500 font-medium">로그인하시면 바로 견적서 작성이 가능해요!</p>
                </div>
                
                <div class="space-y-3">
                    <button onclick="goToLogin()" class="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                        <i class="fas fa-sign-in-alt mr-2"></i>로그인하기
                    </button>
                    <button onclick="goToRegister()" class="w-full bg-white border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-500 py-3 px-6 rounded-lg font-medium transition-colors">
                        <i class="fas fa-user-plus mr-2"></i>회원가입하기
                    </button>
                    <button onclick="closeMemberOnlyModal()" class="w-full text-gray-500 hover:text-gray-700 py-2 transition-colors">
                        취소
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // 모달 표시
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// 회원 전용 모달 닫기
function closeMemberOnlyModal() {
    const modal = document.getElementById('member-only-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// 로그인 페이지로 이동
function goToLogin() {
    window.location.href = 'login.html';
}

// 회원가입 페이지로 이동
function goToRegister() {
    window.location.href = 'register.html';
}

// 전역 함수로 등록
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.toggleProfileMenu = toggleProfileMenu;
window.logout = logout;
window.handleNewConsultation = handleNewConsultation;
window.showMemberOnlyModal = showMemberOnlyModal;
window.closeMemberOnlyModal = closeMemberOnlyModal;
window.goToLogin = goToLogin;
window.goToRegister = goToRegister;