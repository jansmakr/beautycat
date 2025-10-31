/**
 * ============================================
 * BeautyCat - Shop Dashboard (Clean Version)
 * ============================================
 * 
 * ✅ 절대 URL 사용 (상대 경로 제거)
 * ✅ config.js의 설정 활용
 * ✅ 깨끗한 코드 구조
 * ✅ 명확한 에러 처리
 */

// ============================================
// 전역 변수
// ============================================
let currentUser = null;
let shopData = null;

// ============================================
// 초기화
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    log('🚀 Shop Dashboard 초기화 시작');
    
    try {
        // 1. 세션 확인
        if (!Session.isValid()) {
            log('⚠️ 세션 없음 - 로그인 페이지로 이동', null);
            window.location.href = 'login-clean.html';
            return;
        }
        
        // 2. 현재 사용자 가져오기
        currentUser = Session.get();
        log('✅ 현재 사용자:', currentUser);
        
        // 3. Shop 사용자인지 확인
        if (currentUser.user_type !== 'shop') {
            log('❌ Shop 사용자가 아님:', currentUser.user_type);
            alert('업체 계정만 접근할 수 있습니다.');
            Session.clear();
            window.location.href = 'login-clean.html';
            return;
        }
        
        // 4. shop_id 확인
        if (!currentUser.shop_id) {
            currentUser.shop_id = currentUser.id;
            Session.set(currentUser);
        }
        
        // 5. Shop 데이터 로드
        await loadShopData();
        
        // 6. UI 초기화
        initializeUI();
        
        // 7. 대시보드 데이터 로드
        await loadDashboardData();
        
        log('✅ Shop Dashboard 초기화 완료');
        
    } catch (error) {
        log('❌ 초기화 오류:', error);
        alert('페이지 로드 중 오류가 발생했습니다: ' + error.message);
    }
});

// ============================================
// Shop 데이터 로드
// ============================================
async function loadShopData() {
    log('📥 Shop 데이터 로드 시작:', currentUser.shop_id);
    
    try {
        // API 호출 (절대 URL 사용)
        const data = await apiCall(`/tables/skincare_shops/${currentUser.shop_id}`);
        
        if (data) {
            shopData = data;
            log('✅ Shop 데이터 로드 성공:', shopData);
        } else {
            throw new Error('Shop 데이터를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        log('❌ Shop 데이터 로드 실패:', error);
        
        // 모든 Shop 목록에서 이메일로 검색 시도
        try {
            log('🔍 이메일로 Shop 재검색:', currentUser.email);
            const shopsData = await apiCall('/tables/skincare_shops');
            const shop = shopsData.data.find(s => s.email === currentUser.email);
            
            if (shop) {
                shopData = shop;
                currentUser.shop_id = shop.id;
                Session.set(currentUser);
                log('✅ 이메일로 Shop 찾기 성공:', shopData);
            } else {
                throw new Error('해당 이메일의 Shop을 찾을 수 없습니다.');
            }
        } catch (retryError) {
            log('❌ 재검색 실패:', retryError);
            throw new Error('Shop 정보를 불러올 수 없습니다.');
        }
    }
}

// ============================================
// UI 초기화
// ============================================
function initializeUI() {
    log('🎨 UI 초기화 시작');
    
    // 사용자 이름 표시
    const userName = document.getElementById('user-name');
    if (userName) {
        userName.textContent = shopData?.shop_name || currentUser.name || '업체님';
    }
    
    // 사이드바 Shop 이름 표시
    const sidebarShopName = document.getElementById('sidebar-shop-name');
    if (sidebarShopName) {
        sidebarShopName.textContent = shopData?.shop_name || '피부관리실';
    }
    
    // Shop 상태 카드
    updateShopStatusCard();
    
    log('✅ UI 초기화 완료');
}

// ============================================
// Shop 상태 카드 업데이트
// ============================================
function updateShopStatusCard() {
    const statusCard = document.getElementById('shop-status-card');
    if (!statusCard || !shopData) return;
    
    const rating = shopData.rating || 0;
    const isActive = shopData.status === 'active';
    
    statusCard.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-gray-600">업체 상태</span>
            <span class="px-2 py-1 text-xs rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
                ${isActive ? '활성' : '비활성'}
            </span>
        </div>
        <div class="flex items-center">
            <div class="text-yellow-500 mr-2">
                ${Array(5).fill(0).map((_, i) => 
                    `<i class="fas fa-star${i < Math.floor(rating) ? '' : '-o'}"></i>`
                ).join('')}
            </div>
            <span class="text-sm font-semibold text-gray-900">${rating.toFixed(1)}</span>
        </div>
    `;
}

// ============================================
// 대시보드 데이터 로드
// ============================================
async function loadDashboardData() {
    log('📊 대시보드 데이터 로드 시작');
    
    try {
        // 상담 요청 로드
        await loadConsultationRequests();
        
        // 견적서 로드
        await loadQuotes();
        
        // 통계 업데이트
        updateDashboardStats();
        
        log('✅ 대시보드 데이터 로드 완료');
        
    } catch (error) {
        log('❌ 대시보드 데이터 로드 실패:', error);
    }
}

// ============================================
// 상담 요청 로드
// ============================================
async function loadConsultationRequests() {
    log('📥 상담 요청 로드 시작');
    
    try {
        // shop_id로 필터링하여 API 호출
        const data = await apiCall(`/tables/consultations?shop_id=${currentUser.shop_id}`);
        
        const consultations = data.data || [];
        
        log(`✅ 상담 요청 ${consultations.length}개 로드됨`);
        
        // UI 업데이트
        displayRecentConsultations(consultations.slice(0, 5));
        displayConsultationsList(consultations);
        
        // 통계 업데이트
        updateConsultationStats(consultations);
        
        return consultations;
        
    } catch (error) {
        log('❌ 상담 요청 로드 실패:', error);
        displayRecentConsultations([]);
        displayConsultationsList([]);
        return [];
    }
}

// ============================================
// 최근 상담 요청 표시
// ============================================
function displayRecentConsultations(consultations) {
    const container = document.getElementById('recent-consultations');
    if (!container) return;
    
    if (consultations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-inbox text-3xl mb-2"></i>
                <p>새로운 상담 요청이 없습니다</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = consultations.map(consultation => `
        <div class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${consultation.customer_name || '고객'}</h4>
                    <p class="text-sm text-gray-600">${consultation.treatment_type || '일반 상담'}</p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(consultation.status)}">
                    ${getStatusText(consultation.status)}
                </span>
            </div>
            <p class="text-xs text-gray-500 mb-3">${formatDate(consultation.created_at)}</p>
            <button onclick="viewConsultationDetail('${consultation.id}')" 
                    class="w-full px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors">
                상세보기
            </button>
        </div>
    `).join('');
}

// ============================================
// 상담 요청 목록 표시
// ============================================
function displayConsultationsList(consultations) {
    const container = document.getElementById('consultations-list');
    if (!container) return;
    
    if (consultations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-clipboard-list text-4xl mb-3"></i>
                <h3 class="text-lg font-semibold mb-2">상담 요청이 없습니다</h3>
                <p class="text-sm">새로운 상담 요청을 기다려주세요</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = consultations.map(consultation => `
        <div class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-semibold text-gray-900">${consultation.customer_name || '고객'}</h3>
                        <span class="px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(consultation.status)}">
                            ${getStatusText(consultation.status)}
                        </span>
                    </div>
                    <p class="text-gray-600 mb-2">${consultation.treatment_type || '일반 상담'}</p>
                    <p class="text-sm text-gray-500">${consultation.description || ''}</p>
                    <div class="mt-3 text-xs text-gray-500">
                        <i class="fas fa-clock mr-1"></i>${formatDate(consultation.created_at)}
                    </div>
                </div>
                <button onclick="viewConsultationDetail('${consultation.id}')" 
                        class="ml-4 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors">
                    상세보기
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// 견적서 로드
// ============================================
async function loadQuotes() {
    log('📥 견적서 로드 시작');
    
    try {
        // shop_id로 필터링하여 API 호출
        const data = await apiCall(`/tables/quotes?shop_id=${currentUser.shop_id}`);
        
        const quotes = data.data || [];
        
        log(`✅ 견적서 ${quotes.length}개 로드됨`);
        
        // 전역 변수에 저장
        window.quotesData = quotes;
        
        // UI 업데이트
        displayRecentQuotes(quotes.slice(0, 5));
        displayQuotesList(quotes);
        updateQuotesStats(quotes);
        
        return quotes;
        
    } catch (error) {
        log('❌ 견적서 로드 실패:', error);
        displayRecentQuotes([]);
        displayQuotesList([]);
        return [];
    }
}

// ============================================
// 최근 견적 현황 표시
// ============================================
function displayRecentQuotes(quotes) {
    const container = document.getElementById('recent-quotes');
    if (!container) return;
    
    if (quotes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-file-invoice text-3xl mb-2"></i>
                <p>작성한 견적서가 없습니다</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = quotes.map(quote => `
        <div class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${quote.customer_name || '고객'}</h4>
                    <p class="text-sm text-gray-600">${formatPrice(quote.price)}</p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${getQuoteStatusBadgeClass(quote.status)}">
                    ${getQuoteStatusText(quote.status)}
                </span>
            </div>
            <p class="text-xs text-gray-500">${formatDate(quote.created_at)}</p>
        </div>
    `).join('');
}

// ============================================
// 견적서 목록 표시
// ============================================
function displayQuotesList(quotes) {
    const container = document.getElementById('quotes-list');
    if (!container) return;
    
    if (quotes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-file-invoice-dollar text-4xl mb-3"></i>
                <h3 class="text-lg font-semibold mb-2">견적서가 없습니다</h3>
                <p class="text-sm">상담 요청에 대한 견적서를 작성해주세요</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = quotes.map(quote => `
        <div class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-semibold text-gray-900">${quote.customer_name || '고객'}</h3>
                        <span class="px-3 py-1 text-xs font-medium rounded-full ${getQuoteStatusBadgeClass(quote.status)}">
                            ${getQuoteStatusText(quote.status)}
                        </span>
                    </div>
                    <p class="text-xl font-bold text-primary-600 mb-2">${formatPrice(quote.price)}</p>
                    <p class="text-sm text-gray-600">${quote.description || ''}</p>
                    <div class="mt-3 text-xs text-gray-500">
                        <i class="fas fa-clock mr-1"></i>${formatDate(quote.created_at)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// 견적서 통계 업데이트
// ============================================
function updateQuotesStats(quotes) {
    const total = quotes.length;
    const pending = quotes.filter(q => q.status === 'pending').length;
    const accepted = quotes.filter(q => q.status === 'accepted').length;
    const rejected = quotes.filter(q => q.status === 'rejected').length;
    
    setElementText('total-quotes-count', total);
    setElementText('pending-quotes-count', pending);
    setElementText('accepted-quotes-count', accepted);
    setElementText('rejected-quotes-count', rejected);
}

// ============================================
// 상담 요청 통계 업데이트
// ============================================
function updateConsultationStats(consultations) {
    const total = consultations.length;
    const pending = consultations.filter(c => c.status === 'pending').length;
    const inProgress = consultations.filter(c => c.status === 'in_progress').length;
    const completed = consultations.filter(c => c.status === 'completed').length;
    
    // 배지 업데이트
    const badge = document.getElementById('new-consultations-badge');
    if (badge && pending > 0) {
        badge.textContent = pending;
        badge.classList.remove('hidden');
    }
    
    log('📊 상담 통계:', { total, pending, inProgress, completed });
}

// ============================================
// 대시보드 통계 업데이트
// ============================================
async function updateDashboardStats() {
    try {
        // 상담 요청 데이터
        const consultData = await apiCall(`/tables/consultations?shop_id=${currentUser.shop_id}`);
        const consultations = consultData.data || [];
        
        // 견적서 데이터
        const quotesData = await apiCall(`/tables/quotes?shop_id=${currentUser.shop_id}`);
        const quotes = quotesData.data || [];
        
        // 상담 요청 통계
        const totalConsultations = consultations.length;
        const pendingConsultations = consultations.filter(c => c.status === 'pending').length;
        
        // 견적서 통계
        const sentQuotes = quotes.length;
        const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
        
        // UI 업데이트
        setElementText('total-consultations', totalConsultations);
        setElementText('pending-consultations', pendingConsultations);
        setElementText('sent-quotes', sentQuotes);
        setElementText('accepted-quotes', acceptedQuotes);
        
        log('✅ 대시보드 통계 업데이트 완료', {
            totalConsultations,
            pendingConsultations,
            sentQuotes,
            acceptedQuotes
        });
        
    } catch (error) {
        log('❌ 통계 업데이트 실패:', error);
        // 기본값 표시
        setElementText('total-consultations', '0');
        setElementText('pending-consultations', '0');
        setElementText('sent-quotes', '0');
        setElementText('accepted-quotes', '0');
    }
}

// ============================================
// Shop 정보 표시
// ============================================
function displayShopInfo() {
    const container = document.getElementById('shop-info-display');
    if (!container || !shopData) return;
    
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">기본 정보</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm text-gray-600">피부관리실명</label>
                        <p class="font-medium text-gray-900">${shopData.shop_name || '-'}</p>
                    </div>
                    <div>
                        <label class="text-sm text-gray-600">이메일</label>
                        <p class="font-medium text-gray-900">${shopData.email || '-'}</p>
                    </div>
                    <div>
                        <label class="text-sm text-gray-600">전화번호</label>
                        <p class="font-medium text-gray-900">${shopData.phone || '-'}</p>
                    </div>
                    <div>
                        <label class="text-sm text-gray-600">주소</label>
                        <p class="font-medium text-gray-900">${shopData.address || '-'}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">운영 정보</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-sm text-gray-600">평점</label>
                        <p class="font-medium text-gray-900">${shopData.rating || '0'} / 5.0</p>
                    </div>
                    <div>
                        <label class="text-sm text-gray-600">상태</label>
                        <p class="font-medium text-gray-900">${shopData.status === 'active' ? '활성' : '비활성'}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">서비스</h3>
                <div class="flex flex-wrap gap-2">
                    ${(shopData.services || []).map(service => `
                        <span class="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm">
                            ${service}
                        </span>
                    `).join('') || '<p class="text-gray-500 text-sm">등록된 서비스가 없습니다</p>'}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// 섹션 전환
// ============================================
function showSection(sectionName) {
    log('🔄 섹션 전환:', sectionName);
    
    // 모든 섹션 숨기기
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // 선택한 섹션 표시
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // 사이드바 활성화 상태 업데이트
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });
    
    // 섹션별 데이터 로드
    if (sectionName === 'shop-info') {
        displayShopInfo();
    }
}

// ============================================
// 상담 상세보기
// ============================================
function viewConsultationDetail(consultationId) {
    log('📋 상담 상세보기:', consultationId);
    alert('상담 상세보기 기능은 준비 중입니다.');
}

// ============================================
// UI 유틸리티 함수
// ============================================
function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.add('hidden');
    }
}

// ============================================
// 로그아웃
// ============================================
function logout() {
    log('👋 로그아웃');
    Session.clear();
    window.location.href = 'login-clean.html';
}

// ============================================
// 헬퍼 함수
// ============================================
function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatPrice(price) {
    if (!price) return '₩0';
    return `₩${parseInt(price).toLocaleString('ko-KR')}`;
}

function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        'pending': '대기 중',
        'in_progress': '진행 중',
        'completed': '완료',
        'cancelled': '취소됨'
    };
    return texts[status] || status;
}

function getQuoteStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'accepted': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getQuoteStatusText(status) {
    const texts = {
        'pending': '검토 중',
        'accepted': '수락됨',
        'rejected': '거절됨'
    };
    return texts[status] || status;
}

// ============================================
// 전역 함수 노출 (HTML에서 사용)
// ============================================
window.showSection = showSection;
window.viewConsultationDetail = viewConsultationDetail;
window.toggleProfileMenu = toggleProfileMenu;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.logout = logout;
