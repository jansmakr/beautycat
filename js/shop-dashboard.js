// 전역 변수 (auth.js에서 정의된 currentUser를 사용)
let currentShop = null;
let currentConsultations = [];
let currentQuotes = [];
let subscriptionData = null;

// 안전한 JSON 파싱 함수
function safeJSONParse(value, fallback = []) {
    if (!value) return fallback;
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') return fallback;
    
    try {
        // JSON 문자열 파싱 시도
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
        // JSON 파싱 실패 시 쉼표로 분리된 문자열로 처리
        if (typeof value === 'string') {
            return value.split(',').map(s => s.trim()).filter(s => s);
        }
        return fallback;
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeShopDashboard();
});

// 피부관리실 대시보드 초기화
function initializeShopDashboard() {
    // 인증 확인
    checkAuthentication();
    
    // 사용자 정보 로드
    loadUserInfo();
    
    // 데이터 로드
    loadDashboardData();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 지역 선택 시스템 초기화
    initializeRegionalSelection();
    
    // 무료 기간 정보 업데이트
    updateFreeServiceInfo();
    
    // 공지사항 로드
    loadAnnouncementAlert();
}

// 인증 확인
function checkAuthentication() {
    // getCurrentUser 함수 사용 (auth.js에서 정의)
    let user = getCurrentUser();
    const userType = localStorage.getItem('user_type');
    const token = localStorage.getItem('session_token');
    
    // 테스트를 위해 사용자가 없으면 데모 업체 자동 로그인
    if (!user || !token || userType !== 'shop') {
        console.log('인증 실패, 데모 업체로 자동 로그인:', { user: !!user, token: !!token, userType });
        
        // 데모 업체 계정 생성 (auth.js와 동일한 ID 사용)
        const demoShop = {
            id: 'demo_shop_seoul_geumcheon',
            email: 'demo@shop.com',
            name: '데모 사장님',
            phone: '02-1234-5678',
            user_type: 'shop',
            is_active: true,
            is_verified: true,
            profile_image: '',
            last_login: new Date().toISOString(),
            shop_id: 'demo_shop_seoul_geumcheon',
            permissions: ['shop']
        };
        
        // 세션 저장
        localStorage.setItem('session_token', 'demo_token_' + Date.now());
        localStorage.setItem('user_type', 'shop');
        localStorage.setItem('user_data', JSON.stringify(demoShop));
        
        user = demoShop;
    }
    
    // 전역 currentUser 변수에 할당
    currentUser = user;
    return true;
}

// 사용자 정보 로드
async function loadUserInfo() {
    if (!currentUser) return;
    
    // 사용자 이름 업데이트
    const userNameElements = document.querySelectorAll('#user-name');
    userNameElements.forEach(el => {
        el.textContent = currentUser.name + '님';
    });
    
    // 프로필 이미지 업데이트
    const profileImageElements = document.querySelectorAll('#profile-image, #sidebar-profile-image');
    profileImageElements.forEach(el => {
        if (currentUser.profile_image) {
            el.src = currentUser.profile_image;
        }
    });
    
    // 피부관리실 정보 로드
    await loadShopInfo();
}

// 피부관리실 정보 로드
async function loadShopInfo() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃
        
        if (currentUser.shop_id) {
            // 기존 피부관리실 정보 로드
            try {
                const response = await fetch(`tables/skincare_shops/${currentUser.shop_id}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (response.ok) {
                    currentShop = await response.json();
                } else if (response.status === 404) {
                    console.warn('업체 정보를 찾을 수 없습니다. 이메일로 재검색합니다.');
                    // 404인 경우 이메일로 재검색
                    await searchShopByEmail();
                }
            } catch (error) {
                console.warn('업체 정보 로드 실패, 이메일로 재검색:', error.message);
                clearTimeout(timeoutId);
                await searchShopByEmail();
            }
        } else {
            await searchShopByEmail();
        }
        
        async function searchShopByEmail() {
            try {
                // 이메일로 피부관리실 찾기
                const response = await fetch(`tables/skincare_shops?search=${encodeURIComponent(currentUser.email)}`, {
                    signal: controller.signal
                });
                if (response.ok) {
                    const data = await response.json();
                    currentShop = data.data.find(shop => shop.email === currentUser.email);
                }
            } catch (error) {
                console.warn('이메일로 업체 검색 실패:', error.message);
            }
        }
        
        if (currentShop) {
            // 피부관리실 정보 UI 업데이트
            updateSidebarShopInfo();
            updateShopStatus();
            updateShopInfoForm();
            
            // 샵 정보 등록 안내 숨기기
            const registerNotice = document.getElementById('shop-register-notice');
            if (registerNotice) {
                registerNotice.classList.add('hidden');
            }
        } else {
            // 샵 정보가 없으면 등록 안내 표시
            const registerNotice = document.getElementById('shop-register-notice');
            if (registerNotice) {
                registerNotice.classList.remove('hidden');
            }
            console.log('⚠️ 피부관리실 정보가 등록되지 않았습니다. 등록 안내를 표시합니다.');
        }
        
    } catch (error) {
        console.error('피부관리실 정보 로드 오류:', error);
    }
}

// 사이드바 샵 정보 업데이트 (대표 관리 및 가격 포함)
function updateSidebarShopInfo() {
    const sidebarShopName = document.getElementById('sidebar-shop-name');
    
    if (!sidebarShopName || !currentShop) return;
    
    let shopDisplayText = currentShop.shop_name || '피부관리실';
    
    // 대표 관리와 가격 정보 추가
    if (currentShop.representative_service && currentShop.service_price) {
        shopDisplayText += `\n${currentShop.representative_service}`;
        shopDisplayText += `\n${currentShop.service_price}`;
    } else if (currentShop.representative_service) {
        shopDisplayText += `\n${currentShop.representative_service}`;
    }
    
    sidebarShopName.textContent = shopDisplayText;
    
    // 줄바꿈을 위해 whitespace 설정
    sidebarShopName.style.whiteSpace = 'pre-line';
    sidebarShopName.style.lineHeight = '1.3';
}

// 피부관리실 상태 업데이트
function updateShopStatus() {
    const statusCard = document.getElementById('shop-status-card');
    
    if (!currentShop) {
        statusCard.innerHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                    <div>
                        <div class="text-sm font-medium text-yellow-800">업체 정보 미완성</div>
                        <div class="text-xs text-yellow-600">업체 정보를 완성해주세요</div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    let statusClass, statusIcon, statusText, statusSubtext;
    
    if (currentShop.is_active && currentShop.verified) {
        statusClass = 'bg-green-50 border-green-200';
        statusIcon = 'fas fa-check-circle text-green-500';
        statusText = '운영 중';
        statusSubtext = '정상 운영 상태입니다';
    } else if (!currentShop.verified) {
        statusClass = 'bg-yellow-50 border-yellow-200';
        statusIcon = 'fas fa-clock text-yellow-500';
        statusText = '승인 대기';
        statusSubtext = '관리자 승인을 기다리고 있습니다';
    } else {
        statusClass = 'bg-red-50 border-red-200';
        statusIcon = 'fas fa-times-circle text-red-500';
        statusText = '일시 중단';
        statusSubtext = '운영이 중단된 상태입니다';
    }
    
    statusCard.innerHTML = `
        <div class="${statusClass} border rounded-lg p-3">
            <div class="flex items-center">
                <i class="${statusIcon} mr-2"></i>
                <div>
                    <div class="text-sm font-medium text-gray-800">${statusText}</div>
                    <div class="text-xs text-gray-600">${statusSubtext}</div>
                </div>
            </div>
        </div>
    `;
}

// 대시보드 데이터 로드
async function loadDashboardData() {
    try {
        // 상담 요청 로드
        await loadConsultationRequests();
        
        // 견적서 로드
        await loadQuotes();
        
        // 통계 업데이트
        updateStatistics();
        
        // 최근 활동 표시
        displayRecentActivity();
        
        // 대표샵 상태 확인 및 UI 업데이트
        await checkRepresentativeShopStatus();
        
    } catch (error) {
        console.error('대시보드 데이터 로드 오류:', error);
        showNotification('데이터 로드 중 오류가 발생했습니다.', 'error');
    }
}

// 상담 요청 로드
async function loadConsultationRequests() {
    try {
        // 테스트 환경에서는 타임아웃을 짧게 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃
        
        const response = await fetch('tables/consultations?limit=100&sort=created_at', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await response.json();
        
        // 현재 피부관리실 지역과 일치하는 상담 요청 필터링
        if (currentShop) {
            // 업체의 지역 정보 (여러 형태 지원)
            const shopState = currentShop.state || currentShop.shop_state || currentShop.region?.split(' ')[0] || '';
            const shopDistrict = currentShop.district || currentShop.shop_district || currentShop.region?.split(' ')[1] || '';
            
            console.log(`🏪 ${currentShop.shop_name || '데모 피부관리실'} (${shopState} ${shopDistrict}) - 총 ${data.data.length}개 견적 요청 검토 중...`);
            
            currentConsultations = data.data.filter(consultation => {
                // 상담 요청의 지역 정보 (여러 형태 지원)
                const consultState = consultation.state || consultation.province || '';
                const consultDistrict = consultation.district || consultation.city || '';
                
                // 개발 환경에서는 지역 정보 없어도 표시 (테스트용)
                const isProduction = window.location.hostname === 'beautycat.kr' || 
                                    window.location.hostname.includes('beautycat.pages.dev');
                
                // 프로덕션: 지역 정보 필수, 개발: 지역 정보 선택
                if (isProduction && (!consultState || !consultDistrict)) {
                    return false;
                }
                
                // 지역 정보가 없으면 모든 샵에게 표시 (개발 환경)
                if (!consultState || !consultDistrict) {
                    console.log('⚠️ 지역 정보 없는 상담 요청 (테스트 데이터):', consultation.customer_name);
                    return true;
                }
                
                // 지역 매칭 로직 개선
                const stateMatch = shopState === consultState || 
                                  shopState.includes(consultState.replace('특별시', '').replace('광역시', '')) || 
                                  consultState.includes(shopState.replace('특별시', '').replace('광역시', ''));
                const districtMatch = shopDistrict === consultDistrict || 
                                     shopDistrict.includes(consultDistrict) || 
                                     consultDistrict.includes(shopDistrict);
                
                const isMatch = stateMatch && districtMatch;
                
                // v2.8.13.1: 과다한 console.log 제거 (프로덕션 최적화)
                
                if (isMatch) {
                } else {
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log(`❌ 불일치: ${consultState} ${consultDistrict} ↔ ${shopState} ${shopDistrict}`);
                }
                }
                
                return isMatch;
            });
        } else {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('⚠️ currentShop 정보가 없습니다');
        }
            currentConsultations = [];
        }
        
        console.log('로드된 상담 요청:', currentConsultations.length);
        
    } catch (error) {
        console.error('상담 요청 로드 오류:', error);
        currentConsultations = [];
    }
}

// 견적서 로드
async function loadQuotes() {
    try {
        // 테스트 환경에서는 타임아웃을 짧게 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃
        
        const response = await fetch('tables/quotes?limit=100&sort=created_at', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await response.json();
        
        // 현재 피부관리실의 견적서만 필터링
        currentQuotes = data.data.filter(quote => 
            quote.shop_id === currentShop?.id || 
            quote.shop_id === currentUser?.id
        );
        
        console.log('로드된 견적서:', currentQuotes.length);
        
    } catch (error) {
        console.error('견적서 로드 오류:', error);
        currentQuotes = [];
    }
}

// 통계 업데이트
function updateStatistics() {
    // 상담 요청 통계
    const totalConsultations = currentConsultations.length;
    const pendingConsultations = currentConsultations.filter(c => 
        c.status === 'pending' || c.status === 'in_progress'
    ).length;
    
    // 견적서 통계
    const sentQuotes = currentQuotes.length;
    const acceptedQuotes = currentQuotes.filter(q => q.status === 'accepted').length;
    const pendingQuotes = currentQuotes.filter(q => q.status === 'sent').length;
    const rejectedQuotes = currentQuotes.filter(q => q.status === 'rejected').length;
    
    // DOM 업데이트
    document.getElementById('total-consultations').textContent = totalConsultations;
    document.getElementById('pending-consultations').textContent = pendingConsultations;
    document.getElementById('sent-quotes').textContent = sentQuotes;
    document.getElementById('accepted-quotes').textContent = acceptedQuotes;
    
    // 견적서 섹션 통계
    document.getElementById('total-quotes-count').textContent = sentQuotes;
    document.getElementById('pending-quotes-count').textContent = pendingQuotes;
    document.getElementById('accepted-quotes-count').textContent = acceptedQuotes;
    document.getElementById('rejected-quotes-count').textContent = rejectedQuotes;
    
    // 새 상담 요청 배지
    const newConsultationsBadge = document.getElementById('new-consultations-badge');
    if (pendingConsultations > 0) {
        newConsultationsBadge.textContent = pendingConsultations;
        newConsultationsBadge.classList.remove('hidden');
    } else {
        newConsultationsBadge.classList.add('hidden');
    }
    
    // 알림 배지 업데이트
    const notificationBadge = document.getElementById('notification-badge');
    if (pendingConsultations > 0) {
        notificationBadge.textContent = pendingConsultations;
        notificationBadge.classList.remove('hidden');
    } else {
        notificationBadge.classList.add('hidden');
    }
    
    // v2.8.13.6.20: 탭 카운트 업데이트
    updateTabCounts();
}

// 최근 활동 표시
function displayRecentActivity() {
    displayRecentConsultations();
    displayRecentQuotes();
}

// 최근 상담 요청 표시
function displayRecentConsultations() {
    const container = document.getElementById('recent-consultations');
    const recentConsultations = currentConsultations
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    if (recentConsultations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-comments text-4xl mb-4 opacity-50"></i>
                <p>새로운 상담 요청이 없습니다</p>
                <p class="text-sm">고객들의 상담 요청을 기다리고 있습니다</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentConsultations.map(consultation => `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex-1">
                <div class="font-medium text-gray-900">${consultation.customer_name}</div>
                <div class="text-sm text-gray-600">${consultation.treatment_type}</div>
                <div class="text-xs text-gray-400">${formatDate(consultation.created_at)}</div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(consultation.status)}">
                    ${getStatusText(consultation.status)}
                </span>
                ${getQuoteButton(consultation.id)}
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
                <p>작성한 견적서가 없습니다</p>
                <p class="text-sm">상담 요청에 견적서를 작성해보세요</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentQuotes.map(quote => `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex-1">
                <div class="font-medium text-gray-900">${quote.treatment_details.substring(0, 30)}...</div>
                <div class="text-sm text-purple-600 font-semibold">${quote.price?.toLocaleString()}원</div>
                <div class="text-xs text-gray-400">${formatDate(quote.created_at)}</div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="px-2 py-1 text-xs rounded-full ${getQuoteStatusBadgeClass(quote.status)}">
                    ${getQuoteStatusText(quote.status)}
                </span>
                <button onclick="openChat('${quote.consultation_id}')" class="text-blue-600 hover:text-blue-700">
                    <i class="fas fa-comments"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 서비스 정보 표시 포맷팅
function formatServicesDisplay(consultation) {
    const services = [];
    
    // 새로운 형식의 페이스/바디 서비스 처리
    if (consultation.face_services && consultation.face_services.length > 0) {
        services.push(`페이스: ${consultation.face_services.join(', ')}`);
    }
    if (consultation.body_services && consultation.body_services.length > 0) {
        services.push(`바디: ${consultation.body_services.join(', ')}`);
    }
    
    // 기존 형식 호환성 처리
    if (services.length === 0 && consultation.treatment_type) {
        return consultation.treatment_type;
    }
    if (services.length === 0 && consultation.interest_area) {
        return consultation.interest_area;
    }
    
    return services.length > 0 ? services.join(' | ') : '미설정';
}

// 상담 요청 목록 표시
function displayConsultationsList() {
    const container = document.getElementById('consultations-list');
    
    if (currentConsultations.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-comments text-6xl mb-4 opacity-30"></i>
                <h3 class="text-xl font-semibold mb-2">상담 요청이 없습니다</h3>
                <p class="mb-6">아직 해당 지역의 상담 요청이 없습니다. 조금만 기다려주세요!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentConsultations.map(consultation => `
        <div class="p-6">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 mr-3">${consultation.customer_name || 'Unknown'}</h3>
                        <span class="px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(consultation.status)}">
                            ${getStatusText(consultation.status)}
                        </span>
                    </div>
                    <div class="space-y-3 text-sm text-gray-700 mb-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div><strong class="text-gray-900">📍 지역:</strong> ${consultation.state || ''} ${consultation.district || ''}</div>
                            <div><strong class="text-gray-900">🗓️ 선호 일정:</strong> ${consultation.preferred_schedule || '미설정'}</div>
                            <div><strong class="text-gray-900">💰 예산:</strong> ${consultation.budget_range || '미설정'}</div>
                            <div><strong class="text-gray-900">👤 나이대:</strong> ${consultation.age_range || '미설정'}</div>
                            ${consultation.customer_phone ? `<div><strong class="text-gray-900">📞 연락처:</strong> ${consultation.customer_phone}</div>` : ''}
                            ${consultation.customer_email ? `<div><strong class="text-gray-900">📧 이메일:</strong> ${consultation.customer_email}</div>` : ''}
                        </div>
                        ${consultation.treatment_types ? `
                        <div class="bg-purple-50 p-3 rounded-lg">
                            <strong class="text-purple-900">💆 관심 관리:</strong>
                            <span class="text-purple-700">${safeJSONParse(consultation.treatment_types).join(', ')}</span>
                        </div>
                        ` : ''}
                        ${consultation.skin_concerns ? `
                        <div class="bg-pink-50 p-3 rounded-lg">
                            <strong class="text-pink-900">😟 피부 고민:</strong>
                            <span class="text-pink-700">${safeJSONParse(consultation.skin_concerns).join(', ')}</span>
                        </div>
                        ` : ''}
                        ${consultation.skin_condition ? `
                        <div class="bg-orange-50 p-3 rounded-lg">
                            <strong class="text-orange-900">🩺 현재 피부 상태:</strong><br>
                            <span class="text-orange-700">${consultation.skin_condition}</span>
                        </div>
                        ` : ''}
                        ${consultation.skin_photos || consultation.image_urls ? `
                        <div class="bg-green-50 p-3 rounded-lg">
                            <strong class="text-green-900">📸 업로드 사진:</strong><br>
                            <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                ${safeJSONParse(consultation.skin_photos || consultation.image_urls || '[]').map(url => `
                                    <div class="block cursor-pointer" onclick="openImageModal('${url}')">
                                        <img src="${url}" alt="피부 사진" class="w-full h-24 object-cover rounded border border-green-200 hover:border-green-400 hover:scale-105 transition-all">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        ${consultation.additional_notes ? `
                        <div class="bg-blue-50 p-3 rounded-lg">
                            <strong class="text-blue-900">📝 추가 요청사항:</strong><br>
                            <span class="text-blue-700">${consultation.additional_notes}</span>
                        </div>
                        ` : ''}
                        <div class="text-xs text-gray-500">
                            <i class="fas fa-clock mr-1"></i> 신청일: ${formatDate(consultation.created_at)}
                        </div>
                    </div>
                </div>
                <div class="flex flex-col space-y-2">
                    ${getQuoteButtonLarge(consultation.id)}
                    <button onclick="openChat('${consultation.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                        <i class="fas fa-comments mr-1"></i>채팅하기
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
                <h3 class="text-xl font-semibold mb-2">작성한 견적서가 없습니다</h3>
                <p class="mb-6">상담 요청에 견적서를 작성해보세요!</p>
                <button onclick="showSection('consultations')" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg">
                    상담 요청 보기
                </button>
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
                            <div><strong>고객:</strong> ${consultation?.customer_name || '정보 없음'}</div>
                            <div><strong>가격:</strong> <span class="text-lg font-semibold text-purple-600">${quote.price?.toLocaleString()}원</span></div>
                            <div><strong>소요시간:</strong> ${quote.duration}</div>
                            <div><strong>전송일:</strong> ${formatDate(quote.created_at)}</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-4">
                            <strong>관리 내용:</strong><br>
                            ${quote.treatment_details}
                        </div>
                        ${quote.additional_notes ? `
                            <div class="text-sm text-gray-600">
                                <strong>추가사항:</strong> ${quote.additional_notes}
                            </div>
                        ` : ''}
                    </div>
                    <div class="flex flex-col space-y-2">
                        <button onclick="openChat('${quote.consultation_id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                            <i class="fas fa-comments mr-1"></i>채팅
                        </button>
                        ${quote.status !== 'confirmed' && quote.status !== 'cancelled' ? `
                            <button onclick="editQuote('${quote.id}')" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
                                <i class="fas fa-edit mr-1"></i>수정
                            </button>
                        ` : ''}
                        ${quote.status === 'accepted' ? `
                            <button onclick="confirmQuote('${quote.id}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                                <i class="fas fa-check mr-1"></i>확정
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 견적서 작성 폼 제출
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmit);
    }
    
    // 업체 정보 폼 제출
    const shopInfoForm = document.getElementById('shop-info-form');
    if (shopInfoForm) {
        shopInfoForm.addEventListener('submit', handleShopInfoUpdate);
    }
    
    // 상담 검색
    const searchInput = document.getElementById('search-consultations');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterConsultations();
            }
        });
    }
    
    // 프로필 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        const profileDropdown = document.getElementById('profile-dropdown');
        const profileMenu = document.getElementById('profile-menu');
        
        if (profileDropdown && !profileDropdown.contains(e.target)) {
            profileMenu.classList.add('hidden');
        }
    });
}

// 지역 선택 시스템 초기화
function initializeRegionalSelection() {
    try {
        console.log('🗺️ 업체 정보 관리 - 지역 선택 시스템 초기화');
        
        // 지역별 매칭 시스템이 로드되었는지 확인
        if (typeof window.regionalMatching !== 'undefined') {
            // 시/도 옵션 추가
            const stateSelect = document.getElementById('shop-state');
            if (stateSelect) {
                window.regionalMatching.populateStateOptions(stateSelect);
            }
            
            // 시/도 변경 시 구/군 업데이트 이벤트 설정
            const districtSelect = document.getElementById('shop-district');
            if (stateSelect && districtSelect) {
                stateSelect.addEventListener('change', (e) => {
                    window.regionalMatching.updateDistrictOptions(e.target.value, districtSelect);
                });
            }
            
            console.log('✅ 업체 정보 관리 지역 선택 설정 완료');
        } else {
            console.warn('⚠️ 지역별 매칭 시스템이 로드되지 않음');
        }
    } catch (error) {
        console.error('지역 선택 초기화 오류:', error);
    }
}

// 견적서 존재 여부 확인 및 버튼 생성
function getQuoteButton(consultationId) {
    const existingQuote = currentQuotes.find(q => q.consultation_id === consultationId);
    if (existingQuote) {
        return `<button onclick="viewQuote('${existingQuote.id}')" class="text-blue-600 hover:text-blue-700 text-sm">
            견적서 보기
        </button>`;
    }
    return `<button onclick="createQuote('${consultationId}')" class="text-purple-600 hover:text-purple-700 text-sm">
        견적서 작성
    </button>`;
}

function getQuoteButtonLarge(consultationId) {
    const existingQuote = currentQuotes.find(q => q.consultation_id === consultationId);
    if (existingQuote) {
        return `<button onclick="viewQuote('${existingQuote.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            <i class="fas fa-eye mr-1"></i>견적서 보기
        </button>`;
    }
    return `<button onclick="createQuote('${consultationId}')" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">
        <i class="fas fa-file-invoice-dollar mr-1"></i>견적서 작성
    </button>`;
}

// 견적서 보기 모달 열기
function viewQuote(quoteId) {
    const quote = currentQuotes.find(q => q.id === quoteId);
    if (!quote) {
        alert('견적서를 찾을 수 없습니다.');
        return;
    }
    
    // 견적서 보기 모달 내용 설정
    document.getElementById('view-quote-consultation-id').value = quote.consultation_id;
    document.getElementById('view-quote-id').value = quote.id;
    document.getElementById('view-treatment-type').value = quote.treatment_type || '';
    document.getElementById('view-price').value = quote.price || '';
    document.getElementById('view-duration').value = quote.duration || '';
    document.getElementById('view-description').value = quote.description || '';
    
    // 모달 표시
    document.getElementById('view-quote-modal').classList.remove('hidden');
}

// 견적서 보기 모달 닫기
function closeViewQuoteModal() {
    document.getElementById('view-quote-modal').classList.add('hidden');
}

// 견적서 수정 모드로 전환
function editQuote(quoteId) {
    closeViewQuoteModal();
    const quote = currentQuotes.find(q => q.id === quoteId);
    if (!quote) return;
    
    // 견적서 작성 모달에 기존 데이터 채우기
    document.getElementById('quote-consultation-id').value = quote.consultation_id;
    document.getElementById('quote-id').value = quote.id; // 수정 모드 표시
    document.getElementById('treatment-type').value = quote.treatment_type || '';
    document.getElementById('price').value = quote.price || '';
    document.getElementById('duration').value = quote.duration || '';
    document.getElementById('description').value = quote.description || '';
    
    // 모달 표시
    document.getElementById('quote-modal').classList.remove('hidden');
}

// 견적서 작성 모달 열기
function createQuote(consultationId) {
    const modal = document.getElementById('quote-modal');
    const form = document.getElementById('quote-form');
    
    // 폼 초기화
    form.reset();
    document.getElementById('quote-consultation-id').value = consultationId;
    document.getElementById('quote-id').value = ''; // 새 견적서 (수정 모드 아님)
    
    // 폼 초기화
    document.getElementById('quote-form').reset();
    
    // 템플릿 버튼 추가 (v2.8.13.3)
    addTemplateButtons();
    
    // v2.8.13.6: 샵 정보 자동 입력
    autoFillShopInfo();
    
    // 모달 열기
    modal.classList.remove('hidden');
}

// 견적서 미리 작성 (템플릿용, v2.8.13.6.20)
function createQuoteTemplate() {
    const modal = document.getElementById('quote-modal');
    const form = document.getElementById('quote-form');
    
    // 폼 초기화
    form.reset();
    document.getElementById('quote-consultation-id').value = 'template'; // 템플릿 모드 표시
    document.getElementById('quote-id').value = '';
    
    // 템플릿 버튼 추가
    addTemplateButtons();
    
    // 샵 정보 자동 입력
    autoFillShopInfo();
    
    // 안내 메시지 변경
    const infoBox = form.querySelector('.bg-blue-50');
    if (infoBox) {
        infoBox.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                <div class="text-sm text-blue-800">
                    <p class="font-semibold mb-1">📝 견적서 템플릿 작성 안내</p>
                    <ul class="list-disc list-inside space-y-1 text-blue-700">
                        <li>자주 사용하는 견적서 내용을 미리 작성하고 템플릿으로 저장하세요</li>
                        <li>상담 요청이 들어오면 템플릿을 불러와 빠르게 견적서를 전송할 수 있습니다</li>
                        <li>템플릿은 최대 2개까지 저장 가능합니다</li>
                        <li><strong class="text-blue-900">작성 완료 후 반드시 '템플릿 저장' 버튼을 클릭하세요</strong></li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    // 전송 버튼을 템플릿 저장 버튼으로 변경
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>템플릿으로 저장';
        submitBtn.classList.remove('bg-primary-500', 'hover:bg-primary-600');
        submitBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    }
    
    // 모달 열기
    modal.classList.remove('hidden');
}

// 샵 정보 자동 입력 (v2.8.13.6 → v2.8.13.6.20 개선)
function autoFillShopInfo() {
    try {
        // currentShop 또는 currentUser에서 샵 정보 가져오기
        const shopInfo = currentShop || currentUser;
        
        if (!shopInfo) {
            console.log('ℹ️ [견적서] 샵 정보 없음 - 자동 입력 건너뛰기');
            return;
        }
        
        // 1️⃣ 관리 내용 필드에 샵 소개 자동 입력
        const treatmentDetailsField = document.getElementById('treatment-details');
        if (treatmentDetailsField && currentShop?.description) {
            // 기존 값이 없을 때만 자동 입력
            if (!treatmentDetailsField.value || treatmentDetailsField.value.trim() === '') {
                treatmentDetailsField.value = currentShop.description;
                console.log('✅ [견적서] 샵 소개 자동 입력:', currentShop.description.substring(0, 50) + '...');
            }
        }
        
        // 2️⃣ 추가 안내사항 필드에 원장 소개 자동 입력 (v2.8.13.6.20)
        const additionalNotesField = document.getElementById('additional-notes');
        if (additionalNotesField && currentShop) {
            // 기존 값이 없을 때만 자동 입력
            if (!additionalNotesField.value || additionalNotesField.value.trim() === '') {
                let directorInfo = '';
                
                // 원장 프로필
                if (currentShop.director_profile && currentShop.director_profile.trim() !== '') {
                    directorInfo += `👨‍⚕️ 원장 소개: ${currentShop.director_profile}\n`;
                }
                
                // 원장 경력
                if (currentShop.director_experience && currentShop.director_experience.trim() !== '') {
                    directorInfo += `📋 주요 경력: ${currentShop.director_experience}`;
                }
                
                if (directorInfo) {
                    additionalNotesField.value = directorInfo.trim();
                    console.log('✅ [견적서] 원장 소개 자동 입력 완료');
                }
            }
        }
        
        console.log('✅ [견적서] 샵 정보 자동 입력 완료');
    } catch (error) {
        console.error('❌ [견적서] 샵 정보 자동 입력 실패:', error);
    }
}

// 템플릿 버튼 동적 추가 (v2.8.13.3)
function addTemplateButtons() {
    // 이미 버튼이 있으면 추가하지 않음
    if (document.getElementById('template-buttons-container')) {
        return;
    }
    
    const form = document.getElementById('quote-form');
    if (!form) return;
    
    // 버튼 컨테이너 생성
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'template-buttons-container';
    buttonContainer.className = 'flex gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200';
    buttonContainer.innerHTML = `
        <button type="button" onclick="openLoadTemplateDialog()" 
                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <i class="fas fa-file-import mr-1"></i>템플릿 불러오기
        </button>
        <button type="button" onclick="openSaveTemplateDialog()" 
                class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <i class="fas fa-save mr-1"></i>템플릿 저장
        </button>
        <button type="button" onclick="openDeleteTemplateDialog()" 
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <i class="fas fa-trash mr-1"></i>삭제
        </button>
    `;
    
    // 폼 맨 위에 추가
    form.insertBefore(buttonContainer, form.firstChild);
}

// 견적서 작성 모달 닫기
function closeQuoteModal() {
    document.getElementById('quote-modal').classList.add('hidden');
    document.getElementById('quote-form').reset();
    document.getElementById('quote-id').value = ''; // 초기화
}

// 견적서 제출 처리
async function handleQuoteSubmit(e) {
    e.preventDefault();
    
    const quoteId = document.getElementById('quote-id').value; // 수정 모드 확인
    const consultationId = document.getElementById('quote-consultation-id').value;
    const treatmentDetails = document.getElementById('treatment-details').value;
    const price = parseInt(document.getElementById('quote-price').value);
    const duration = document.getElementById('duration').value;
    const availableDates = document.getElementById('available-dates').value;
    const additionalNotes = document.getElementById('additional-notes').value;
    
    // 🔥 v2.8.13.6.20: 템플릿 모드인 경우 템플릿 저장 다이얼로그 열기
    if (consultationId === 'template') {
        openSaveTemplateDialog();
        return;
    }
    
    const isEditMode = !!quoteId; // quoteId가 있으면 수정 모드
    
    try {
        // 견적서 데이터 생성
        const quoteData = {
            consultation_id: consultationId,
            shop_id: currentShop?.id || currentUser.id,
            shop_name: currentShop?.name || currentUser.name || '피부관리실', // 필수 필드
            treatment_details: treatmentDetails,
            price: parseInt(price), // INTEGER 타입
            duration: parseInt(duration) || 60, // INTEGER, 기본값 60분
            available_dates: JSON.stringify([availableDates]), // TEXT (JSON 문자열)
            additional_notes: additionalNotes || '',
            payment_note: '💳 결제 방법: 방문 시 현장에서 결제 (현금/카드/계좌이체)', // v2.8.8.1.48: 결제 안내
            status: 'sent',
            valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: Date.now()  // INTEGER 필수
        };
        
        if (!isEditMode) {
            quoteData.created_at = Date.now(); // 새 견적서만 created_at 추가
        }
        
        console.log(`📤 견적서 ${isEditMode ? '수정' : '전송'} 데이터:`, quoteData);
        
        // 견적서 저장 또는 수정
        const url = isEditMode ? `tables/quotes/${quoteId}` : 'tables/quotes';
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quoteData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ 견적서 ${isEditMode ? '수정' : '저장'} 실패 응답:`, errorText);
            throw new Error(`견적서 ${isEditMode ? '수정' : '저장'} 실패: ${errorText}`);
        }
        
        console.log(`✅ 견적서 ${isEditMode ? '수정' : '저장'} 성공`);
        
        // 채팅 메시지로도 전송
        const messageData = {
            consultation_id: consultationId,
            sender_type: 'shop',
            sender_id: currentShop?.id || currentUser.id,
            receiver_id: 'customer', // TODO: 실제 고객 ID
            message: `[견적서가 전송되었습니다]\n\n관리 내용: ${treatmentDetails}\n가격: ${price.toLocaleString()}원\n소요시간: ${duration}\n예약 가능일: ${availableDates}${additionalNotes ? `\n\n추가사항: ${additionalNotes}` : ''}\n\n💳 결제 방법: 방문 시 현장에서 결제 (현금/카드/계좌이체)`,
            is_read: 0, // INTEGER
            created_at: Date.now(), // INTEGER 필수
            updated_at: Date.now()  // INTEGER 필수
        };
        
        await fetch('tables/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });
        
        showNotification(isEditMode ? '견적서가 성공적으로 수정되었습니다!' : '견적서가 성공적으로 전송되었습니다!', 'success');
        closeQuoteModal();
        
        // 데이터 새로고침
        await loadQuotes();
        updateStatistics();
        
        // 현재 섹션이 견적서면 목록 새로고침
        const activeSection = document.querySelector('.sidebar-item.active')?.dataset.section;
        if (activeSection === 'quotes') {
            displayQuotesList();
        }
        
    } catch (error) {
        console.error('견적서 전송 오류:', error);
        showNotification('견적서 전송 중 오류가 발생했습니다.', 'error');
    }
}

// 업체 정보 폼 업데이트 (기존 정보 + 사용자 정보 자동 입력)
function updateShopInfoForm() {
    console.log('🔄 업체 정보 폼 업데이트:', { currentShop: !!currentShop, currentUser: !!currentUser });
    
    // 필드 요소들 찾기 (안전한 접근)
    const fields = {
        shopName: document.getElementById('shop-name'),
        ownerName: document.getElementById('owner-name'),
        businessNumber: document.getElementById('business-number'),
        businessLicenseNumber: document.getElementById('business-license-number'),
        shopPhone: document.getElementById('shop-phone'),
        shopEmail: document.getElementById('shop-email'),
        shopAddress: document.getElementById('shop-address'),
        businessHours: document.getElementById('business-hours'),
        // 새로운 샵 소개 필드들
        representativeService: document.getElementById('representative-service'),
        servicePrice: document.getElementById('service-price'),
        cosmeticBrands: document.getElementById('cosmetic-brands'),
        beautyEquipment: document.getElementById('beauty-equipment'),
        shopFeatures: document.getElementById('shop-features'),
        shopSize: document.getElementById('shop-size'),
        bedCount: document.getElementById('bed-count'),
        staffCount: document.getElementById('staff-count'),
        // 원장 소개 필드들
        directorProfile: document.getElementById('director-profile'),
        directorExperience: document.getElementById('director-experience'),
        stateSelect: document.getElementById('shop-state'),
        districtSelect: document.getElementById('shop-district')
    };
    
    // 기존 업체 정보가 있으면 사용, 없으면 사용자 기본 정보로 채움
    if (currentShop) {
        // 기본 정보
        if (fields.shopName) fields.shopName.value = currentShop.shop_name || currentShop.name || '';
        if (fields.ownerName) fields.ownerName.value = currentShop.owner_name || currentShop.name || currentUser?.name || '';
        if (fields.businessNumber) fields.businessNumber.value = currentShop.business_number || '';
        if (fields.businessLicenseNumber) fields.businessLicenseNumber.value = currentShop.business_license || '';
        if (fields.shopPhone) fields.shopPhone.value = currentShop.phone || currentUser?.phone || '';
        if (fields.shopEmail) fields.shopEmail.value = currentShop.email || currentUser?.email || '';
        if (fields.shopAddress) fields.shopAddress.value = currentShop.address || currentShop.shop_address || '';
        if (fields.businessHours) fields.businessHours.value = currentShop.operating_hours || '';
        
        // 샵 소개 필드들
        if (fields.representativeService) fields.representativeService.value = currentShop.representative_treatments || '';
        if (fields.servicePrice) fields.servicePrice.value = currentShop.price_range || '';
        if (fields.cosmeticBrands) fields.cosmeticBrands.value = currentShop.cosmetic_brands || '';
        if (fields.beautyEquipment) fields.beautyEquipment.value = currentShop.beauty_equipment || '';
        if (fields.shopFeatures) fields.shopFeatures.value = currentShop.description || '';
        if (fields.shopSize) fields.shopSize.value = currentShop.shop_size || '';
        if (fields.bedCount) fields.bedCount.value = currentShop.bed_count || '';
        if (fields.staffCount) fields.staffCount.value = currentShop.staff_count || '';
        
        // 원장 소개 필드들
        if (fields.directorProfile) fields.directorProfile.value = currentShop.director_profile || '';
        if (fields.directorExperience) fields.directorExperience.value = currentShop.director_experience || '';
        
        console.log('✅ 기존 업체 정보로 폼 채움 완료');
    } else if (currentUser) {
        // 사용자 기본 정보로 새로 채우기
        if (fields.ownerName) fields.ownerName.value = currentUser.name || '';
        if (fields.shopPhone) fields.shopPhone.value = currentUser.phone || '';
        if (fields.shopEmail) fields.shopEmail.value = currentUser.email || '';
        
        console.log('✅ 사용자 기본 정보로 폼 채움 완료');
    }
    
    // 지역 정보 설정
    if (fields.stateSelect && fields.districtSelect) {
        const shopState = currentShop?.state || currentShop?.shop_state || '';
        const shopDistrict = currentShop?.district || currentShop?.shop_district || '';
        
        if (shopState) {
            fields.stateSelect.value = shopState;
            // 지역별 매칭 시스템을 통해 구/군 옵션 업데이트
            if (typeof window.regionalMatching !== 'undefined') {
                window.regionalMatching.updateDistrictOptions(shopState, fields.districtSelect);
                if (shopDistrict) {
                    setTimeout(() => {
                        fields.districtSelect.value = shopDistrict;
                    }, 100);
                }
            }
            console.log(`✅ 지역 정보 설정: ${shopState} ${shopDistrict}`);
        }
    }
    
    // 전문 분야 체크박스 설정
    let specialties = currentShop?.treatment_types || currentShop?.services || currentShop?.specialties || [];
    
    // JSON 문자열인 경우 파싱
    if (typeof specialties === 'string') {
        try {
            specialties = JSON.parse(specialties);
        } catch (e) {
            console.warn('⚠️ specialties 파싱 실패:', e);
            specialties = [];
        }
    }
    
    // 배열이 아닌 경우 빈 배열로 처리
    if (!Array.isArray(specialties)) {
        specialties = [];
    }
    
    document.querySelectorAll('input[name="specialties"]').forEach(checkbox => {
        checkbox.checked = specialties.includes(checkbox.value);
    });
    
    if (specialties.length > 0) {
        console.log(`✅ 전문 분야 설정: ${specialties.join(', ')}`);
    }
}

// 업체 정보 업데이트 처리
async function handleShopInfoUpdate(e) {
    // 폼 기본 동작 강제 차단
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('💾 [Shop Info] 저장 시작...');
    
    // 🔥 1. 지역 정보 필수 검증 (최우선)
    const stateValue = document.getElementById('shop-state')?.value || '';
    const districtValue = document.getElementById('shop-district')?.value || '';
    
    if (!stateValue || !districtValue) {
        showNotification(
            '⚠️ 지역 정보는 필수입니다!\n\n' +
            `시/도: ${stateValue || '미선택'}\n` +
            `구/군: ${districtValue || '미선택'}\n\n` +
            '지역 정보를 입력해야 해당 지역 고객의 견적 요청을 받을 수 있습니다.',
            'error',
            8000
        );
        
        // 지역 선택 필드로 스크롤
        document.getElementById('shop-state')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('shop-state')?.focus();
        return false; // 저장 중단
    }
    
    // 업체 정보 데이터 수집 (getElementById로 직접 수집)
    const updateData = {
        name: document.getElementById('shop-name')?.value || currentShop?.name || '',
        owner_name: document.getElementById('owner-name')?.value || currentUser.name || '',
        business_number: document.getElementById('business-number')?.value || null,
        business_license: document.getElementById('business-license-number')?.value || null,
        phone: document.getElementById('shop-phone')?.value || currentUser.phone || '',
        email: currentUser.email,
        
        // 지역 정보 - 이미 검증 완료
        state: stateValue,
        district: districtValue,
        
        address: document.getElementById('shop-address')?.value || '',
        operating_hours: document.getElementById('business-hours')?.value || null,
        
        // 샵 소개 필드들
        description: document.getElementById('shop-features')?.value || currentShop?.description || '',
        representative_treatments: document.getElementById('representative-service')?.value || null,
        price_range: document.getElementById('service-price')?.value || null,
        
        // 샵 상세 정보 필드들 (v2.8.13.6.18 추가)
        cosmetic_brands: document.getElementById('cosmetic-brands')?.value || null,
        beauty_equipment: document.getElementById('beauty-equipment')?.value || null,
        shop_size: document.getElementById('shop-size')?.value || null,
        bed_count: document.getElementById('bed-count')?.value || null,
        staff_count: document.getElementById('staff-count')?.value || null,
        
        // 원장 소개 필드들 (v2.8.13.6.18 추가)
        director_profile: document.getElementById('director-profile')?.value || null,
        director_experience: document.getElementById('director-experience')?.value || null,
        
        // services 배열 수집
        services: currentShop?.services || [],
        
        // 기본 정보 (기존 데이터 유지)
        status: currentShop?.status || 'active',
        show_payment_info: currentShop?.show_payment_info !== undefined ? currentShop.show_payment_info : 1,
        payment_link: currentShop?.payment_link || null,
        bank_name: currentShop?.bank_name || null,
        account_number: currentShop?.account_number || null,
        account_holder: currentShop?.account_holder || null,
        town: currentShop?.town || null,
        deleted: 0,
        updated_at: Date.now()
    };
    
    console.log('💾 업체 정보 저장 데이터:', updateData);
    
    try {
        let response;
        
        if (currentShop && currentShop.id) {
            // 기존 샵 데이터와 병합 (PUT은 전체 데이터 필요)
            const mergedData = {
                ...currentShop,  // 기존 데이터 유지
                ...updateData,   // 새 데이터로 덮어쓰기
                id: currentShop.id,  // ID는 변경 불가
                created_at: currentShop.created_at  // 생성일 유지
            };
            
            console.log('💾 [병합된 데이터]', mergedData);
            
            // 기존 업체 정보 업데이트 (PUT 사용)
            response = await fetch(`tables/skincare_shops/${currentShop.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mergedData)
            });
        } else {
            // 새 업체 정보 생성
            const newShopData = {
                ...updateData,
                email: currentUser.email,
                region: '', // 나중에 지역 선택 기능 추가 필요
                images: [],
                rating: 0,
                is_active: false,
                verified: false
            };
            
            response = await fetch('tables/skincare_shops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newShopData)
            });
        }
        
        if (response.ok) {
            showNotification(
                `✅ 업체 정보가 저장되었습니다!\n\n` +
                `지역: ${stateValue} ${districtValue}\n` +
                `해당 지역 고객의 견적 요청을 수신합니다.`,
                'success',
                5000
            );
            
            // currentShop 객체 업데이트
            currentShop = { ...currentShop, ...updateData };
            
            // UI 정보 새로고침
            updateSidebarShopInfo();
            await loadShopInfo();
        } else {
            throw new Error('업체 정보 저장 실패');
        }
        
    } catch (error) {
        console.error('업체 정보 업데이트 오류:', error);
        showNotification('업체 정보 저장 중 오류가 발생했습니다.', 'error');
    }
    
    return false; // 폼 제출 차단
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
            // v2.8.13.6.20: 호환성 유지 - consultations 섹션의 견적서 탭으로 리다이렉트
            showSection('consultations');
            setTimeout(() => switchRequestTab('quotes'), 100);
            return;
            break;
        case 'dashboard':
            displayRecentActivity();
            break;
        case 'subscription':
            loadSubscriptionInfo();
            break;
        case 'shop-info':
            updateShopInfoForm();
            break;
        case 'reviews':
            loadShopReviews();
            break;
        case 'representative-application':
            initializeRepresentativeApplication();
            checkRepresentativeShopStatus();
            break;
    }
}

// 프로필 메뉴 토글
function toggleProfileMenu() {
    const profileMenu = document.getElementById('profile-menu');
    profileMenu.classList.toggle('hidden');
}

// 상담 요청 필터링
function filterConsultations() {
    const status = document.getElementById('consultation-filter').value;
    const search = document.getElementById('search-consultations').value.toLowerCase();
    
    let filteredConsultations = [...currentConsultations];
    
    if (status) {
        filteredConsultations = filteredConsultations.filter(c => c.status === status);
    }
    
    if (search) {
        filteredConsultations = filteredConsultations.filter(c => 
            c.customer_name.toLowerCase().includes(search) ||
            c.treatment_type.toLowerCase().includes(search)
        );
    }
    
    // 전체 목록 새로고침 (실제로는 필터링된 결과 표시)
    displayConsultationsList();
}

// 채팅 열기
function openChat(consultationId) {
    if (consultationId) {
        // 🔥 HOTFIX: 캐시 버스팅 타임스탬프 추가
        const timestamp = Date.now();
        window.open(`chat.html?consultation_id=${consultationId}&user_type=shop&_t=${timestamp}`, '_blank');
    }
}

// 견적서 수정 (추후 구현)
function editQuote(quoteId) {
    showNotification('견적서 수정 기능은 준비 중입니다.', 'info');
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
        'sent': '전송됨',
        'viewed': '확인됨',
        'accepted': '수락됨',
        'rejected': '거절됨'
    };
    return statusMap[status] || status;
}

function getQuoteStatusBadgeClass(status) {
    const classMap = {
        'sent': 'bg-blue-100 text-blue-800',
        'viewed': 'bg-yellow-100 text-yellow-800',
        'accepted': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
}

// 알림 메시지 표시
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-transform duration-300 translate-x-full`;
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 
                   type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    notification.className += ` ${bgColor} text-white`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icon} mr-3"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 애니메이션으로 표시
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // 자동 제거
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// 전역 함수들
window.showSection = showSection;
window.toggleProfileMenu = toggleProfileMenu;
window.createQuote = createQuote;
window.viewQuote = viewQuote;
window.closeViewQuoteModal = closeViewQuoteModal;
window.editQuote = editQuote;
window.closeQuoteModal = closeQuoteModal;
window.filterConsultations = filterConsultations;
window.openChat = openChat;
window.editQuote = editQuote;

// ======= ANNOUNCEMENT ALERT FUNCTIONS =======

// 공지사항 알림 로드
async function loadAnnouncementAlert() {
    try {
        const response = await fetch('tables/announcements?limit=1&sort=created_at');
        const data = await response.json();
        let announcements = data.data || [];
        
        // 게시된 공지사항 중 업체 대상이거나 전체 대상인 것만 필터링
        announcements = announcements.filter(ann => 
            ann.is_published && 
            (ann.target_audience === 'shops' || ann.target_audience === 'all') &&
            (!ann.expire_date || new Date(ann.expire_date) > new Date())
        );
        
        if (announcements.length > 0) {
            showAnnouncementAlert(announcements[0]);
        }
        
    } catch (error) {
        console.error('공지사항 로드 오류:', error);
        
        // API 실패시 데모 공지사항 표시
        const demoAnnouncement = {
            title: '서비스 점검 안내',
            content: '시스템 업데이트를 위해 2024년 9월 20일 새벽 2시부터 4시까지 서비스가 일시 중단됩니다.',
            priority: 'important'
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
        
        // 공지사항 ID 저장
        alertBar.dataset.announcementId = announcement.id;
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

// =============================================================================
// 요금제 관리 관련 함수들
// =============================================================================

// 구독 정보 로드
function loadSubscriptionInfo() {
    // 현재 무료 이벤트 기간 설정
    subscriptionData = {
        current_plan: {
            name: "무료 체험",
            type: "free_trial",
            price: 0,
            expires_at: "2026-03-30",
            features: [
                "무제한 상담 요청 수신",
                "견적서 작성 및 전송", 
                "고객 채팅 시스템",
                "예약 관리 도구",
                "매출 분석 리포트"
            ]
        },
        next_plan: {
            name: "스탠다드 플랜",
            type: "standard", 
            price: 11000,
            annual_price: 132000,
            starts_at: "2025-01-01"
        },
        payment_history: [
            {
                date: "2024-01-15",
                service: "입점료",
                amount: 0,
                original_amount: 100000,
                status: "completed",
                invoice_url: "#"
            }
        ],
        auto_payment_enabled: false
    };

    updateSubscriptionUI();
}

// 구독 UI 업데이트
function updateSubscriptionUI() {
    if (!subscriptionData) return;

    // 현재 플랜 정보 업데이트
    const statusBadge = document.getElementById('subscription-status-badge');
    const planName = document.getElementById('current-plan-name');
    const expiresDate = document.getElementById('subscription-expires');
    const nextBilling = document.getElementById('next-billing-amount');

    if (statusBadge) {
        statusBadge.className = 'px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800';
        statusBadge.textContent = '무료 이벤트 중';
    }

    if (planName) planName.textContent = subscriptionData.current_plan.name;
    if (expiresDate) expiresDate.textContent = formatDate(subscriptionData.current_plan.expires_at);
    if (nextBilling) nextBilling.textContent = '₩' + subscriptionData.next_plan.annual_price.toLocaleString();
}

// ========================================
// 🔧 헬퍼 함수들 (v2.8.8.1.47 - 모달 시스템)
// ========================================

// 모달 닫기
window.closeModal = function() {
    const modal = document.getElementById('custom-modal');
    if (modal) {
        modal.remove();
    }
};

// 로딩 스피너 표시
window.showLoadingSpinner = function() {
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]';
    spinner.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span class="text-gray-700 font-medium">처리 중...</span>
        </div>
    `;
    document.body.appendChild(spinner);
};

// 로딩 스피너 숨기기
window.hideLoadingSpinner = function() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
};

// 알림 표시
window.showAlert = function(title, message, type = 'info') {
    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200'
    };
    
    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const alert = document.createElement('div');
    alert.className = 'fixed top-4 right-4 z-[70] max-w-md animate-fade-in';
    alert.innerHTML = `
        <div class="${bgColors[type]} border rounded-lg p-4 shadow-lg">
            <div class="flex items-start">
                <i class="fas ${icons[type]} ${iconColors[type]} mt-1 mr-3"></i>
                <div class="flex-1">
                    <h4 class="font-semibold mb-1">${title}</h4>
                    <p class="text-sm">${message}</p>
                </div>
                <button onclick="this.closest('div.fixed').remove()" class="ml-3 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 3000);
};

// ✅ 모달 생성 헬퍼 함수
window.createModal = function(title, content) {
    // 기존 모달 제거
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 새 모달 생성
    const modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between p-6 border-b">
                <h2 class="text-xl font-bold">${title}</h2>
                <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div>${content}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    return modal;
};

// ========================================
// 📦 구독 관리 함수들
// ========================================

// 자동 결제 설정
window.setupAutoPayment = function() {
    const modal = createModal('자동 결제 설정', `
        <div class="p-6">
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-2">2025년 1월부터 자동 결제</h3>
                <div class="bg-gray-50 p-4 rounded-lg mb-4">
                    <div class="flex justify-between mb-2">
                        <span>스탠다드 플랜 (연간 결제)</span>
                        <span class="font-semibold">₩132,000/년</span>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600">
                        <span>월 환산 금액</span>
                        <span>₩11,000/월 (12% 할인 적용)</span>
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">결제 수단 선택</label>
                <div class="space-y-2">
                    <label class="flex items-center">
                        <input type="radio" name="payment-method" value="card" class="mr-2" checked>
                        <i class="fas fa-credit-card mr-2"></i>신용카드 자동결제
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="payment-method" value="account" class="mr-2">
                        <i class="fas fa-university mr-2"></i>계좌이체 자동결제
                    </label>
                </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg mb-6">
                <div class="flex items-start">
                    <i class="fas fa-info-circle text-blue-500 mt-1 mr-2"></i>
                    <div class="text-sm text-blue-800">
                        <strong>자동 결제 혜택:</strong><br>
                        • 연간 결제 시 12% 할인 (월 1,000원 절약)<br>
                        • 결제 걱정 없이 안정적인 서비스 이용<br>
                        • 언제든지 해지 가능 (위약금 없음)
                    </div>
                </div>
            </div>

            <div class="flex gap-3">
                <button onclick="processAutoPaymentSetup()" class="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600">
                    자동 결제 설정
                </button>
                <button onclick="closeModal()" class="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                    취소
                </button>
            </div>
        </div>
    `);
};

// 자동 결제 설정 처리
window.processAutoPaymentSetup = function() {
    showLoadingSpinner();
    
    // 실제로는 결제 API 호출
    setTimeout(() => {
        hideLoadingSpinner();
        closeModal();
        
        showAlert('자동 결제가 설정되었습니다!', `
            2025년 1월 1일부터 연간 132,000원이 자동으로 결제됩니다.<br>
            결제일 7일 전에 미리 안내 메일을 보내드립니다.
        `, 'success');
        
        // 구독 데이터 업데이트
        if (subscriptionData) {
            subscriptionData.auto_payment_enabled = true;
        }
    }, 2000);
};

// 결제 연기 신청
window.postponePayment = function() {
    const modal = createModal('결제 연기 신청', `
        <div class="p-6">
            <div class="mb-6">
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div class="flex items-start">
                        <i class="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-2"></i>
                        <div class="text-sm text-yellow-800">
                            결제 연기는 최대 3개월까지 가능하며, 연기 기간 중에는 일부 기능이 제한됩니다.
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">연기 기간</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="1">1개월 연기 (2025년 2월까지)</option>
                    <option value="2">2개월 연기 (2025년 3월까지)</option>
                    <option value="3">3개월 연기 (2025년 4월까지)</option>
                </select>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">연기 사유</label>
                <textarea class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3" 
                         placeholder="연기가 필요한 사유를 간단히 적어주세요"></textarea>
            </div>

            <div class="flex gap-3">
                <button onclick="processPaymentPostpone()" class="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600">
                    연기 신청
                </button>
                <button onclick="closeModal()" class="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                    취소
                </button>
            </div>
        </div>
    `);
};

// 구독 해지
window.cancelSubscription = function() {
    const modal = createModal('구독 해지', `
        <div class="p-6">
            <div class="mb-6">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div class="flex items-start">
                        <i class="fas fa-exclamation-circle text-red-500 mt-1 mr-2"></i>
                        <div class="text-sm text-red-800">
                            <strong>구독 해지 시 주의사항:</strong><br>
                            • 2025년 1월부터는 beautycat 서비스 이용이 중단됩니다<br>
                            • 기존 고객 데이터는 90일 간 보관 후 삭제됩니다<br>
                            • 해지 후 재가입 시 입점료가 다시 부과될 수 있습니다
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">해지 사유</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3">
                    <option value="">사유를 선택해주세요</option>
                    <option value="price">가격 부담</option>
                    <option value="feature">기능 부족</option>
                    <option value="business">사업 중단/변경</option>
                    <option value="competitor">경쟁 서비스 이용</option>
                    <option value="other">기타</option>
                </select>
                <textarea class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="2" 
                         placeholder="추가 의견이 있으시면 자유롭게 작성해주세요"></textarea>
            </div>

            <div class="flex gap-3">
                <button onclick="processCancellation()" class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600">
                    해지 신청
                </button>
                <button onclick="closeModal()" class="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                    취소
                </button>
            </div>
        </div>
    `);
};

// 결제 연기 처리
window.processPaymentPostpone = function() {
    showLoadingSpinner();
    
    setTimeout(() => {
        hideLoadingSpinner();
        closeModal();
        
        showAlert('결제 연기 신청 완료', '결제 연기 신청이 접수되었습니다. 영업일 기준 1~2일 내로 처리됩니다.', 'success');
    }, 2000);
};

// 구독 해지 처리
window.processCancellation = function() {
    if (!confirm('정말로 구독을 해지하시겠습니까?\n\n해지 후에는 모든 서비스 이용이 중단됩니다.')) {
        return;
    }
    
    showLoadingSpinner();
    
    setTimeout(() => {
        hideLoadingSpinner();
        closeModal();
        
        showAlert('해지 신청 완료', '구독 해지 신청이 접수되었습니다.\n고객센터에서 확인 후 처리됩니다.', 'warning');
    }, 2000);
};

// 세금계산서 다운로드
window.downloadInvoices = function() {
    showLoadingSpinner();
    
    setTimeout(() => {
        hideLoadingSpinner();
        showAlert('세금계산서 준비 완료', '2024년 beautycat 이용 내역서가 다운로드됩니다.', 'success');
        
        // 실제로는 PDF 파일 다운로드 로직
        console.log('세금계산서 다운로드 시작');
    }, 1500);
}

// 날짜 포맷팅 유틸리티
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 전역 함수로 등록
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.closeAnnouncementAlert = closeAnnouncementAlert;
window.loadSubscriptionInfo = loadSubscriptionInfo;

// v2.8.8.1.47: 구독 관리 함수들도 전역 노출
console.log('✅ [v2.8.8.1.47] Shop Dashboard JS 로드 완료 - 모달 시스템 개선');
window.setupAutoPayment = setupAutoPayment;
window.processAutoPaymentSetup = processAutoPaymentSetup;
window.postponePayment = postponePayment;
window.cancelSubscription = cancelSubscription;
window.downloadInvoices = downloadInvoices;

// ======= 무료 기간 관리 =======

// 무료 서비스 정보 업데이트
function updateFreeServiceInfo() {
    if (typeof window.PPOSHOP_CONFIG === 'undefined') {
        console.warn('⚠️ PPOSHOP_CONFIG가 로드되지 않았습니다.');
        return;
    }
    
    // 남은 일수 계산
    const remainingDays = window.getFreeServiceRemainingDays();
    const endDate = window.formatDate(window.PPOSHOP_CONFIG.FREE_PERIOD.END_DATE, 'KR');
    
    console.log(`🎁 무료 서비스 정보 업데이트: ${remainingDays}일 남음 (${endDate}까지)`);
    
    // 서비스 이용 현황 업데이트
    const subscriptionExpiresElement = document.getElementById('subscription-expires');
    if (subscriptionExpiresElement) {
        subscriptionExpiresElement.textContent = endDate;
    }
    
    const remainingDaysElement = document.getElementById('remaining-days');
    if (remainingDaysElement) {
        remainingDaysElement.textContent = `${remainingDays}일`;
    }
    
    // 현재 플랜명 업데이트
    const currentPlanNameElement = document.getElementById('current-plan-name');
    if (currentPlanNameElement) {
        currentPlanNameElement.textContent = '런칭 기념 무료';
    }
    
    // 상태 배지 업데이트
    const statusBadge = document.getElementById('subscription-status-badge');
    if (statusBadge) {
        if (remainingDays > 30) {
            statusBadge.className = 'px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold';
            statusBadge.textContent = '🎉 무료 이용 중';
        } else if (remainingDays > 7) {
            statusBadge.className = 'px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold';
            statusBadge.textContent = '⏰ 무료 기간 종료 예정';
        } else if (remainingDays > 0) {
            statusBadge.className = 'px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold';
            statusBadge.textContent = '🚨 무료 기간 곧 종료';
        } else {
            statusBadge.className = 'px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold';
            statusBadge.textContent = '❌ 무료 기간 종료';
        }
    }
    
    // 하단 예정 요금제 정보도 업데이트
    updateFuturePlanInfo(remainingDays);
}

// 미래 요금제 정보 업데이트  
function updateFuturePlanInfo(remainingDays) {
    // 무료 기간 종료 후 안내 텍스트 동적 업데이트
    const futurePlanSection = document.querySelector('.bg-gray-50.p-6.rounded-lg.border');
    if (futurePlanSection) {
        const title = futurePlanSection.querySelector('h3');
        if (title) {
            if (remainingDays > 0) {
                title.innerHTML = `
                    <i class="fas fa-calendar-alt mr-2 text-blue-500"></i>
                    무료 기간 종료까지 ${remainingDays}일 (2026년 6월 이후 서비스 안내)
                `;
            } else {
                title.innerHTML = `
                    <i class="fas fa-calendar-alt mr-2 text-red-500"></i>
                    무료 기간 종료 - 유료 서비스 안내
                `;
            }
        }
    }
}

// 전역 함수로 등록
window.updateFreeServiceInfo = updateFreeServiceInfo;

// =============================================================================
// 리뷰 관리 관련 함수들
// =============================================================================

let allShopReviews = [];

// 샵 리뷰 데이터 로드
async function loadShopReviews() {
    try {
        // 현재 샵 ID로 리뷰 검색
        const currentShopId = currentUser.shop_id || 'demo_shop_seoul_geumcheon';
        const response = await fetch(`tables/reviews?limit=1000&search=${encodeURIComponent(currentShopId)}&sort=created_at`);
        const data = await response.json();
        allShopReviews = data.data || [];
        
        // 리뷰 통계 업데이트
        updateReviewStatistics();
        
        // 리뷰 목록 표시
        displayReviewsList(allShopReviews);
        
    } catch (error) {
        console.error('리뷰 로드 오류:', error);
        
        // API 실패시 데모 리뷰 데이터 사용
        allShopReviews = [
            {
                id: 'review_001',
                customer_name: '김○○',
                rating: 5,
                review_text: '정말 만족스러운 관리였습니다! 직원분들도 친절하시고 시설도 깔끔해요. 여드름이 많이 좋아졌어요.',
                treatment_received: '여드름 관리, 수분 관리',
                service_quality: 5,
                price_satisfaction: 4,
                facility_cleanliness: 5,
                staff_kindness: 5,
                recommend_yn: true,
                created_at: '2024-09-25T14:30:00Z'
            },
            {
                id: 'review_002',
                customer_name: '이○○',
                rating: 4,
                review_text: '전반적으로 만족합니다. 가격도 합리적이고 효과도 좋았어요. 다음에 또 방문할 예정입니다.',
                treatment_received: '미백 관리',
                service_quality: 4,
                price_satisfaction: 5,
                facility_cleanliness: 4,
                staff_kindness: 4,
                recommend_yn: true,
                created_at: '2024-09-23T10:15:00Z'
            },
            {
                id: 'review_003', 
                customer_name: '박○○',
                rating: 3,
                review_text: '괜찮았습니다. 효과는 있었지만 기대했던 것보다는 조금 아쉬웠어요.',
                treatment_received: '모공 관리',
                service_quality: 3,
                price_satisfaction: 3,
                facility_cleanliness: 4,
                staff_kindness: 3,
                recommend_yn: false,
                created_at: '2024-09-20T16:45:00Z'
            }
        ];
        
        updateReviewStatistics();
        displayReviewsList(allShopReviews);
    }
}

// 리뷰 통계 업데이트
function updateReviewStatistics() {
    const totalReviews = allShopReviews.length;
    const averageRating = totalReviews > 0 ? 
        (allShopReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1) : 0;
    const recommendCount = allShopReviews.filter(review => review.recommend_yn).length;
    const recommendationRate = totalReviews > 0 ? Math.round((recommendCount / totalReviews) * 100) : 0;
    
    // 이번 달 리뷰 수 계산
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyReviews = allShopReviews.filter(review => {
        const reviewDate = new Date(review.created_at);
        return reviewDate.getMonth() === currentMonth && reviewDate.getFullYear() === currentYear;
    }).length;
    
    // UI 업데이트
    const averageRatingElement = document.getElementById('average-rating');
    if (averageRatingElement) {
        averageRatingElement.textContent = `${averageRating} / 5.0`;
    }
    
    const totalReviewsElement = document.getElementById('total-reviews');
    if (totalReviewsElement) {
        totalReviewsElement.textContent = `${totalReviews}개`;
    }
    
    const recommendationRateElement = document.getElementById('recommendation-rate');
    if (recommendationRateElement) {
        recommendationRateElement.textContent = `${recommendationRate}%`;
    }
    
    const monthlyReviewsElement = document.getElementById('monthly-reviews');
    if (monthlyReviewsElement) {
        monthlyReviewsElement.textContent = `${monthlyReviews}개`;
    }
}

// 리뷰 목록 표시
function displayReviewsList(reviews) {
    const reviewsListElement = document.getElementById('reviews-list');
    const noReviewsElement = document.getElementById('no-reviews');
    
    if (!reviewsListElement || !noReviewsElement) return;
    
    if (reviews.length === 0) {
        reviewsListElement.classList.add('hidden');
        noReviewsElement.classList.remove('hidden');
        return;
    }
    
    reviewsListElement.classList.remove('hidden');
    noReviewsElement.classList.add('hidden');
    
    reviewsListElement.innerHTML = reviews.map(review => `
        <div class="unni-card p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <h4 class="font-semibold text-gray-900 mr-3">${review.customer_name}</h4>
                        <div class="flex items-center mr-3">
                            ${generateStarRating(review.rating)}
                            <span class="ml-2 text-sm font-medium text-gray-700">${review.rating}/5</span>
                        </div>
                        ${review.recommend_yn ? 
                            '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">추천</span>' : 
                            '<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">비추천</span>'
                        }
                    </div>
                    <p class="text-sm text-gray-600 mb-2">${review.treatment_received || '치료 내용 미기재'}</p>
                </div>
                <span class="text-xs text-gray-500">${formatDate(review.created_at)}</span>
            </div>
            
            <div class="mb-4">
                <p class="text-gray-700 leading-relaxed">${review.review_text}</p>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div class="flex justify-between">
                    <span class="text-gray-500">서비스 품질:</span>
                    <span class="font-medium">${review.service_quality || review.rating}/5</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">가격 만족도:</span>
                    <span class="font-medium">${review.price_satisfaction || review.rating}/5</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">시설 청결도:</span>
                    <span class="font-medium">${review.facility_cleanliness || review.rating}/5</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">직원 친절도:</span>
                    <span class="font-medium">${review.staff_kindness || review.rating}/5</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 리뷰 필터링
function filterReviews() {
    const ratingFilter = document.getElementById('review-rating-filter').value;
    const sortFilter = document.getElementById('review-sort-filter').value;
    
    let filteredReviews = [...allShopReviews];
    
    // 평점 필터
    if (ratingFilter) {
        filteredReviews = filteredReviews.filter(review => review.rating === parseInt(ratingFilter));
    }
    
    // 정렬
    switch (sortFilter) {
        case 'newest':
            filteredReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredReviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'highest':
            filteredReviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            filteredReviews.sort((a, b) => a.rating - b.rating);
            break;
    }
    
    displayReviewsList(filteredReviews);
}

// 별점 HTML 생성 (customer-dashboard.js와 동일)
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star text-yellow-400"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star text-gray-300"></i>';
    }
    
    return stars;
}

// 리뷰 관련 전역 함수 등록
window.loadShopReviews = loadShopReviews;
window.filterReviews = filterReviews;

// ===== 대표샵 신청 관련 함수들 =====

// 대표샵 신청 상태 확인 및 UI 업데이트
async function checkRepresentativeShopStatus() {
    if (!currentShop) return;
    
    try {
        // shop_name 또는 name 필드 사용 (둘 다 체크)
        const shopName = currentShop.shop_name || currentShop.name || '';
        const state = currentShop.state || '';
        const district = currentShop.district || '';
        
        // 필수 정보가 없으면 조회하지 않음
        if (!shopName || !state || !district) {
            console.warn('대표샵 조회 실패: 필수 정보 누락', { shopName, state, district });
            updateRepresentativeStatusUI(null);
            return;
        }
        
        // 현재 샵의 대표샵 신청 상태 확인
        const response = await fetch(`tables/representative_shops?shop_name=${encodeURIComponent(shopName)}&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
        const data = await response.json();
        
        const application = data.data && data.data[0];
        updateRepresentativeStatusUI(application);
        
    } catch (error) {
        console.error('대표샵 상태 확인 오류:', error);
        updateRepresentativeStatusUI(null);
    }
}

// 대표샵 상태 UI 업데이트
function updateRepresentativeStatusUI(application) {
    const statusCard = document.getElementById('rep-status-card');
    const statusBadge = document.getElementById('rep-shop-status-badge');
    const formContainer = document.getElementById('rep-application-form-container');
    
    if (!application) {
        // 신청하지 않은 상태
        statusCard.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center">
                    <i class="fas fa-info-circle text-blue-500 mr-3"></i>
                    <div>
                        <h4 class="font-medium text-blue-900">대표샵 신청 가능</h4>
                        <p class="text-sm text-blue-700">우리 동네 대표 피부관리실로 신청해보세요!</p>
                    </div>
                </div>
            </div>
        `;
        statusBadge.textContent = '신청가능';
        statusBadge.className = 'ml-auto text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700';
        statusBadge.classList.remove('hidden');
        
        if (formContainer) formContainer.style.display = 'block';
        
    } else {
        // 신청한 상태
        const status = application.status || (application.approved ? 'approved' : 'pending');
        
        let statusInfo = {};
        switch (status) {
            case 'approved':
                statusInfo = {
                    color: 'green',
                    icon: 'fas fa-check-circle',
                    title: '대표샵 승인 완료! 🎉',
                    message: '축하합니다! 지역 대표 피부관리실로 지정되었습니다.',
                    badge: '승인됨'
                };
                break;
            case 'rejected':
                statusInfo = {
                    color: 'red',
                    icon: 'fas fa-times-circle',
                    title: '대표샵 신청 거부됨',
                    message: application.rejection_reason || '관리자 검토 결과 승인되지 않았습니다.',
                    badge: '거부됨'
                };
                break;
            default: // pending
                statusInfo = {
                    color: 'yellow',
                    icon: 'fas fa-clock',
                    title: '대표샵 신청 심사 중',
                    message: '관리자 검토가 진행 중입니다. 곧 결과를 안내드릴게요!',
                    badge: '심사중'
                };
        }
        
        statusCard.innerHTML = `
            <div class="bg-${statusInfo.color}-50 border border-${statusInfo.color}-200 rounded-lg p-4">
                <div class="flex items-start">
                    <i class="${statusInfo.icon} text-${statusInfo.color}-500 mr-3 mt-1"></i>
                    <div class="flex-1">
                        <h4 class="font-medium text-${statusInfo.color}-900">${statusInfo.title}</h4>
                        <p class="text-sm text-${statusInfo.color}-700 mt-1">${statusInfo.message}</p>
                        <div class="mt-3 text-xs text-${statusInfo.color}-600">
                            신청일: ${formatDate(application.application_date || application.created_at)}
                            ${application.approved_at ? ` | 승인일: ${formatDate(application.approved_at)}` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        statusBadge.textContent = statusInfo.badge;
        statusBadge.className = `ml-auto text-xs px-2 py-1 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-700`;
        statusBadge.classList.remove('hidden');
        
        // 승인됨이거나 심사중인 경우 폼 숨기기
        if (formContainer && (status === 'approved' || status === 'pending')) {
            formContainer.style.display = 'none';
        }
    }
}

// 대표샵 신청 폼 초기화
function initializeRepresentativeApplicationForm() {
    if (!currentShop) return;
    
    // 기본 정보 표시
    document.getElementById('rep-shop-name').textContent = currentShop.shop_name || '-';
    document.getElementById('rep-shop-location').textContent = `${currentShop.state || ''} ${currentShop.district || ''}` || '-';
    document.getElementById('rep-shop-phone').textContent = currentShop.phone || '-';
    document.getElementById('rep-shop-owner').textContent = currentShop.owner_name || currentShop.name || '-';
    
    // 폼 이벤트 리스너
    const form = document.getElementById('representative-application-form');
    if (form) {
        form.addEventListener('submit', handleRepresentativeApplication);
    }
    
    // 체크박스 선택 제한 (최대 3개)
    const checkboxes = document.querySelectorAll('input[name="representative_treatments"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkedBoxes = document.querySelectorAll('input[name="representative_treatments"]:checked');
            if (checkedBoxes.length > 3) {
                this.checked = false;
                showNotification('대표 관리 프로그램은 최대 3개까지만 선택 가능합니다.', 'warning');
            }
        });
    });
    
    console.log('🏪 대표샵 신청 폼 초기화 완료');
}

// 대표샵 신청 처리
async function handleRepresentativeApplication(e) {
    e.preventDefault();
    
    const submitButton = document.getElementById('rep-submit-button');
    const originalText = submitButton.innerHTML;
    
    try {
        // 폼 데이터 수집
        const selectedTreatments = Array.from(document.querySelectorAll('input[name="representative_treatments"]:checked'))
            .map(cb => cb.value);
        
        if (selectedTreatments.length === 0) {
            showNotification('대표 관리 프로그램을 최소 1개 이상 선택해주세요.', 'warning');
            return;
        }
        
        const applicationReason = document.getElementById('application-reason').value.trim();
        const termsService = document.getElementById('rep-terms-service').checked;
        const termsResponsibility = document.getElementById('rep-terms-responsibility').checked;
        
        if (!termsService || !termsResponsibility) {
            showNotification('필수 약관에 동의해주세요.', 'warning');
            return;
        }
        
        // 신청 데이터 준비
        const applicationData = {
            shop_name: currentShop.shop_name,
            state: currentShop.state,
            district: currentShop.district,
            phone: currentShop.phone,
            owner_name: currentShop.owner_name || currentShop.name,
            business_number: currentShop.business_number,
            address: `${currentShop.state} ${currentShop.district} ${currentShop.address || ''}`.trim(),
            representative_treatments: selectedTreatments,
            application_reason: applicationReason,
            approved: false,
            status: 'pending',
            application_date: new Date().toISOString()
        };
        
        // 버튼 상태 변경
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>신청 중...';
        
        // API 요청
        const response = await fetch('tables/representative_shops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(applicationData)
        });
        
        if (response.ok) {
            showNotification('대표샵 신청이 성공적으로 제출되었습니다! 관리자 검토 후 결과를 안내드리겠습니다.', 'success', 5000);
            
            // 폼 초기화
            document.getElementById('representative-application-form').reset();
            
            // 상태 업데이트
            setTimeout(() => {
                checkRepresentativeShopStatus();
            }, 1000);
            
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('대표샵 신청 오류:', error);
        showNotification('신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
        // 버튼 상태 복원
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// 대표샵 신청 섹션 초기화 (showSection에서 호출)
function initializeRepresentativeApplication() {
    checkRepresentativeShopStatus();
    initializeRepresentativeApplicationForm();
}

// 대표샵 관련 섹션 표시 시 초기화
function showRepresentativeApplicationSection() {
    checkRepresentativeShopStatus();
    initializeRepresentativeApplicationForm();
}

// 대표샵 관련 전역 함수 등록
window.checkRepresentativeShopStatus = checkRepresentativeShopStatus;
window.initializeRepresentativeApplication = initializeRepresentativeApplication;
window.handleRepresentativeApplication = handleRepresentativeApplication;

// 날짜 포맷팅 함수
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ======= 공지사항 관리 시스템 (Shop) =======

let allShopAnnouncements = [];
let currentAnnouncementForModal = null;

// 공지사항 로드 (업체/전체 대상만)
async function loadShopAnnouncements() {
    try {
        console.log('Loading shop announcements...');
        
        const response = await fetch('tables/announcements?limit=100&sort=-created_at');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const announcements = data.data || [];
        
        // 업체 대상 또는 전체 대상 공지만 필터링
        allShopAnnouncements = announcements.filter(ann => {
            return ann.is_published && 
                   (ann.target_audience === 'shops' || ann.target_audience === 'all');
        });
        
        console.log(`Loaded ${allShopAnnouncements.length} announcements for shops`);
        
        // 공지사항 표시
        displayShopAnnouncements(allShopAnnouncements);
        
        // 배지 업데이트 (최근 7일 이내 공지)
        updateAnnouncementBadge();
        
    } catch (error) {
        console.error('공지사항 로드 오류:', error);
        
        // 에러 메시지 표시
        const container = document.getElementById('shop-announcements-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-circle text-6xl text-red-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">공지사항을 불러올 수 없습니다.</p>
                    <button onclick="loadShopAnnouncements()" class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                        다시 시도
                    </button>
                </div>
            `;
        }
    }
}

// 공지사항 표시
function displayShopAnnouncements(announcements) {
    const container = document.getElementById('shop-announcements-list');
    const emptyState = document.getElementById('announcements-empty-state');
    
    if (!container) return;
    
    if (announcements.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    const priorityLabels = {
        'urgent': { text: '긴급', color: 'bg-red-100 text-red-800' },
        'important': { text: '중요', color: 'bg-orange-100 text-orange-800' },
        'normal': { text: '일반', color: 'bg-blue-100 text-blue-800' },
        'low': { text: '낮음', color: 'bg-gray-100 text-gray-800' }
    };
    
    container.innerHTML = announcements.map(ann => {
        const priority = priorityLabels[ann.priority] || priorityLabels['normal'];
        const isPinned = ann.is_pinned;
        const createdDate = formatDate(ann.created_at || ann.publish_date);
        
        return `
            <div class="unni-card p-6 cursor-pointer hover:shadow-lg transition-shadow ${isPinned ? 'border-2 border-yellow-400 bg-yellow-50' : ''}" 
                 onclick="viewShopAnnouncement('${ann.id}')">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            ${isPinned ? '<i class="fas fa-thumbtack text-yellow-600"></i>' : ''}
                            <h3 class="text-lg font-semibold text-gray-900">${escapeHtml(ann.title)}</h3>
                        </div>
                        <p class="text-gray-600 mb-3 line-clamp-2">${escapeHtml(ann.content).substring(0, 150)}${ann.content.length > 150 ? '...' : ''}</p>
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

// 공지사항 상세보기
async function viewShopAnnouncement(announcementId) {
    const announcement = allShopAnnouncements.find(a => a.id === announcementId);
    
    if (!announcement) {
        alert('공지사항을 찾을 수 없습니다.');
        return;
    }
    
    currentAnnouncementForModal = announcement;
    
    // 모달 내용 업데이트
    document.getElementById('modal-announcement-title').textContent = announcement.title;
    document.getElementById('modal-announcement-content').textContent = announcement.content;
    document.getElementById('modal-announcement-date').textContent = formatDate(announcement.created_at || announcement.publish_date);
    document.getElementById('modal-announcement-views').textContent = announcement.views || 0;
    
    // 우선순위 배지
    const priorityLabels = {
        'urgent': { text: '긴급', color: 'bg-red-100 text-red-800' },
        'important': { text: '중요', color: 'bg-orange-100 text-orange-800' },
        'normal': { text: '일반', color: 'bg-blue-100 text-blue-800' },
        'low': { text: '낮음', color: 'bg-gray-100 text-gray-800' }
    };
    const priority = priorityLabels[announcement.priority] || priorityLabels['normal'];
    const priorityBadge = document.getElementById('modal-announcement-priority');
    priorityBadge.textContent = priority.text;
    priorityBadge.className = `px-3 py-1 text-sm font-semibold rounded-full ${priority.color}`;
    
    // 모달 표시
    const modal = document.getElementById('announcement-detail-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    // 조회수 증가 (비동기)
    incrementAnnouncementViews(announcementId);
}

// 공지사항 상세보기 모달 닫기
function closeAnnouncementDetailModal() {
    const modal = document.getElementById('announcement-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentAnnouncementForModal = null;
}

// 조회수 증가
async function incrementAnnouncementViews(announcementId) {
    try {
        const announcement = allShopAnnouncements.find(a => a.id === announcementId);
        if (!announcement) return;
        
        const newViews = (announcement.views || 0) + 1;
        
        // API 호출 (에러가 나도 무시)
        await fetch(`tables/announcements/${announcementId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ views: newViews })
        });
        
        // 로컬 데이터 업데이트
        announcement.views = newViews;
        
        // 모달이 열려있으면 조회수 업데이트
        if (currentAnnouncementForModal && currentAnnouncementForModal.id === announcementId) {
            document.getElementById('modal-announcement-views').textContent = newViews;
        }
        
        console.log(`Announcement ${announcementId} views updated to ${newViews}`);
    } catch (error) {
        console.error('조회수 증가 오류:', error);
        // 에러 무시 (중요하지 않음)
    }
}

// 공지사항 필터링
function filterShopAnnouncements() {
    const searchTerm = document.getElementById('announcement-search')?.value.toLowerCase() || '';
    const priorityFilter = document.getElementById('announcement-priority-filter')?.value || '';
    
    let filtered = allShopAnnouncements;
    
    // 검색어 필터
    if (searchTerm) {
        filtered = filtered.filter(ann => 
            ann.title.toLowerCase().includes(searchTerm) || 
            ann.content.toLowerCase().includes(searchTerm)
        );
    }
    
    // 우선순위 필터
    if (priorityFilter) {
        filtered = filtered.filter(ann => ann.priority === priorityFilter);
    }
    
    displayShopAnnouncements(filtered);
}

// 새 공지사항 배지 업데이트
function updateAnnouncementBadge() {
    const badge = document.getElementById('new-announcements-badge');
    if (!badge) return;
    
    // 최근 7일 이내 공지 개수
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCount = allShopAnnouncements.filter(ann => {
        const createdDate = new Date(ann.created_at || ann.publish_date);
        return createdDate >= sevenDaysAgo;
    }).length;
    
    if (recentCount > 0) {
        badge.textContent = recentCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// showSection 함수 확장 (v2.8.8.1.47 - 공지사항 + 설정 통합)
(function() {
    const originalShowSection = typeof window.showSection !== 'undefined' ? window.showSection : null;
    
    window.showSection = function(sectionName) {
        // 기존 함수 실행
        if (originalShowSection) {
            originalShowSection(sectionName);
        }
        
        // 공지사항 섹션 표시 시 로드
        if (sectionName === 'announcements') {
            loadShopAnnouncements();
        }
        
        // 설정 섹션 표시 시 정보 로드
        if (sectionName === 'settings') {
            if (typeof loadSettingsInfo === 'function') {
                loadSettingsInfo();
            }
        }
    };
})();

// 전역 함수 등록
window.loadShopAnnouncements = loadShopAnnouncements;
window.viewShopAnnouncement = viewShopAnnouncement;
window.closeAnnouncementDetailModal = closeAnnouncementDetailModal;
window.filterShopAnnouncements = filterShopAnnouncements;

// ========================================
// 📋 견적서 템플릿 관리 시스템 (v2.8.13.3)
// ========================================

const QuoteTemplateManager = {
    STORAGE_KEY: 'beautycat_quote_templates',
    
    // 템플릿 저장 (v2.8.13.6.20: 2개 제한)
    saveTemplate(name, data) {
        try {
            const templates = this.getAllTemplates();
            
            // 🔥 템플릿 개수 제한 (최대 2개)
            if (templates.length >= 2) {
                alert('⚠️ 템플릿은 최대 2개까지만 저장할 수 있습니다.\n\n기존 템플릿을 삭제한 후 다시 시도해주세요.');
                return null;
            }
            
            const template = {
                id: Date.now().toString(),
                name: name,
                treatmentDetails: data.treatmentDetails || '',
                price: data.price || '',
                duration: data.duration || '',
                availableDates: data.availableDates || '',
                additionalNotes: data.additionalNotes || '',
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            templates.push(template);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
            console.log('✅ 템플릿 저장 완료:', name, `(${templates.length}/2)`);
            return template;
        } catch (error) {
            console.error('❌ 템플릿 저장 실패:', error);
            return null;
        }
    },
    
    // 모든 템플릿 가져오기
    getAllTemplates() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('❌ 템플릿 로드 실패:', error);
            return [];
        }
    },
    
    // 템플릿 삭제
    deleteTemplate(templateId) {
        try {
            const templates = this.getAllTemplates();
            const filtered = templates.filter(t => t.id !== templateId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
            console.log('✅ 템플릿 삭제 완료:', templateId);
            return true;
        } catch (error) {
            console.error('❌ 템플릿 삭제 실패:', error);
            return false;
        }
    },
    
    // 템플릿 불러오기 (폼에 자동 입력)
    loadTemplate(templateId) {
        try {
            const templates = this.getAllTemplates();
            const template = templates.find(t => t.id === templateId);
            
            if (!template) {
                alert('템플릿을 찾을 수 없습니다.');
                return false;
            }
            
            // 폼 필드에 자동 입력
            document.getElementById('treatment-details').value = template.treatmentDetails || '';
            document.getElementById('quote-price').value = template.price || '';
            document.getElementById('duration').value = template.duration || '';
            document.getElementById('available-dates').value = template.availableDates || '';
            document.getElementById('additional-notes').value = template.additionalNotes || '';
            
            console.log('✅ 템플릿 불러오기 완료:', template.name);
            return true;
        } catch (error) {
            console.error('❌ 템플릿 불러오기 실패:', error);
            return false;
        }
    }
};

// 템플릿 저장 다이얼로그 열기
function openSaveTemplateDialog() {
    const templateName = prompt('템플릿 이름을 입력하세요:', '기본 견적서');
    
    if (!templateName || templateName.trim() === '') {
        return;
    }
    
    const templateData = {
        treatmentDetails: document.getElementById('treatment-details').value,
        price: document.getElementById('quote-price').value,
        duration: document.getElementById('duration').value,
        availableDates: document.getElementById('available-dates').value,
        additionalNotes: document.getElementById('additional-notes').value
    };
    
    const template = QuoteTemplateManager.saveTemplate(templateName.trim(), templateData);
    
    if (template) {
        alert(`✅ 템플릿 "${templateName}"이(가) 저장되었습니다!`);
        updateTemplateList();
    } else {
        alert('❌ 템플릿 저장에 실패했습니다.');
    }
}

// 템플릿 불러오기 다이얼로그 열기
function openLoadTemplateDialog() {
    const templates = QuoteTemplateManager.getAllTemplates();
    
    if (templates.length === 0) {
        alert('저장된 템플릿이 없습니다.');
        return;
    }
    
    // 템플릿 선택 리스트 생성
    let message = '불러올 템플릿을 선택하세요:\n\n';
    templates.forEach((template, index) => {
        message += `${index + 1}. ${template.name}\n`;
    });
    
    const choice = prompt(message + '\n번호를 입력하세요:');
    
    if (!choice) return;
    
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < templates.length) {
        const template = templates[index];
        QuoteTemplateManager.loadTemplate(template.id);
        alert(`✅ 템플릿 "${template.name}"을(를) 불러왔습니다!`);
    } else {
        alert('❌ 잘못된 번호입니다.');
    }
}

// 템플릿 삭제 다이얼로그 열기
function openDeleteTemplateDialog() {
    const templates = QuoteTemplateManager.getAllTemplates();
    
    if (templates.length === 0) {
        alert('저장된 템플릿이 없습니다.');
        return;
    }
    
    // 템플릿 선택 리스트 생성
    let message = '삭제할 템플릿을 선택하세요:\n\n';
    templates.forEach((template, index) => {
        message += `${index + 1}. ${template.name}\n`;
    });
    
    const choice = prompt(message + '\n번호를 입력하세요:');
    
    if (!choice) return;
    
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < templates.length) {
        const template = templates[index];
        if (confirm(`"${template.name}" 템플릿을 삭제하시겠습니까?`)) {
            QuoteTemplateManager.deleteTemplate(template.id);
            alert(`✅ 템플릿 "${template.name}"이(가) 삭제되었습니다.`);
            updateTemplateList();
        }
    } else {
        alert('❌ 잘못된 번호입니다.');
    }
}

// 템플릿 리스트 업데이트
function updateTemplateList() {
    const templates = QuoteTemplateManager.getAllTemplates();
    console.log(`📋 저장된 템플릿 개수: ${templates.length}`);
}

// 전역 함수 등록
window.QuoteTemplateManager = QuoteTemplateManager;
window.openSaveTemplateDialog = openSaveTemplateDialog;
window.openLoadTemplateDialog = openLoadTemplateDialog;
window.openDeleteTemplateDialog = openDeleteTemplateDialog;

console.log('✅ 견적서 템플릿 관리 시스템 로드 완료 (v2.8.13.3)');

// ========================================
// 🖼️ 이미지 확대 모달 시스템 (v2.8.13.3)
// ========================================

// 이미지 모달 열기
function openImageModal(imageUrl) {
    // 기존 모달 제거
    const existingModal = document.getElementById('image-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 새 모달 생성
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4';
    modal.onclick = closeImageModal;
    
    modal.innerHTML = `
        <div class="relative max-w-7xl max-h-screen" onclick="event.stopPropagation()">
            <!-- 닫기 버튼 -->
            <button onclick="closeImageModal()" 
                    class="absolute -top-12 right-0 text-white hover:text-red-500 text-3xl font-bold transition-colors z-10">
                <i class="fas fa-times-circle"></i>
            </button>
            
            <!-- 이미지 -->
            <img src="${imageUrl}" 
                 alt="피부 사진 확대" 
                 class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                 onclick="event.stopPropagation()">
            
            <!-- 하단 버튼 -->
            <div class="absolute -bottom-16 left-0 right-0 flex justify-center gap-4">
                <a href="${imageUrl}" download target="_blank" 
                   class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-download mr-2"></i>다운로드
                </a>
                <button onclick="closeImageModal()" 
                        class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
                    <i class="fas fa-times mr-2"></i>닫기
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // 스크롤 방지
}

// 이미지 모달 닫기
function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = ''; // 스크롤 복원
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

// 전역 함수 등록
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

console.log('✅ 이미지 확대 모달 시스템 로드 완료 (v2.8.13.3)');

// ========================================
// 📑 견적 요청 관리 탭 전환 시스템 (v2.8.13.6.20)
// ========================================

function switchRequestTab(tabName) {
    // 탭 버튼 활성화 상태 변경
    const consultationsTab = document.getElementById('tab-consultations');
    const quotesTab = document.getElementById('tab-quotes');
    
    // 탭 컨텐츠 표시/숨김
    const consultationsContent = document.getElementById('tab-content-consultations');
    const quotesContent = document.getElementById('tab-content-quotes');
    
    if (tabName === 'consultations') {
        // 상담 요청 탭 활성화
        consultationsTab.className = 'px-6 py-3 font-medium text-primary-500 border-b-2 border-primary-500 transition-colors';
        quotesTab.className = 'px-6 py-3 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent transition-colors';
        
        consultationsContent.classList.remove('hidden');
        quotesContent.classList.add('hidden');
        
        console.log('✅ 상담 요청 탭 활성화');
    } else if (tabName === 'quotes') {
        // 견적서 탭 활성화
        consultationsTab.className = 'px-6 py-3 font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent transition-colors';
        quotesTab.className = 'px-6 py-3 font-medium text-primary-500 border-b-2 border-primary-500 transition-colors';
        
        consultationsContent.classList.add('hidden');
        quotesContent.classList.remove('hidden');
        
        // 견적서 목록 로드
        displayQuotesList();
        
        console.log('✅ 견적서 탭 활성화');
    }
}

// 탭 카운트 업데이트
function updateTabCounts() {
    const consultationsCount = document.getElementById('tab-consultations-count');
    const quotesCount = document.getElementById('tab-quotes-count');
    
    if (consultationsCount) {
        consultationsCount.textContent = currentConsultations.length;
    }
    if (quotesCount) {
        quotesCount.textContent = currentQuotes.length;
    }
}

// 전역 함수 등록
window.switchRequestTab = switchRequestTab;

console.log('✅ 견적 요청 관리 탭 시스템 로드 완료 (v2.8.13.6.20)');

// 초기 로드 시 공지사항 배지 업데이트 (대시보드 진입 시)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            loadShopAnnouncements();
        }, 1000);
    });
} else {
    setTimeout(() => {
        loadShopAnnouncements();
    }, 1000);
}

// ======= 업체 공지사항 작성 시스템 =======

let myShopAnnouncements = [];

// 공지사항 탭 전환
function switchAnnouncementTab(tab) {
    // 탭 버튼 스타일 변경
    document.querySelectorAll('.announcement-tab').forEach(btn => {
        btn.classList.remove('border-primary-500', 'text-primary-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeTab = document.getElementById(`announcement-tab-${tab}`);
    if (activeTab) {
        activeTab.classList.remove('border-transparent', 'text-gray-500');
        activeTab.classList.add('border-primary-500', 'text-primary-600');
    }
    
    // 탭 컨텐츠 전환
    document.querySelectorAll('.announcement-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`announcement-${tab}-tab`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
    
    // 탭별 데이터 로드
    if (tab === 'my') {
        loadMyAnnouncements();
    }
}

// 업체 공지사항 작성 폼 제출
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('shop-announcement-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 버튼 참조를 먼저 가져오기 (catch 블록에서도 사용)
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            try {
                const title = document.getElementById('new-announcement-title').value.trim();
                const content = document.getElementById('new-announcement-content').value.trim();
                const isPublished = document.getElementById('new-announcement-published').checked;
                const category = document.getElementById('new-announcement-category').value;
                
                if (!title || !content) {
                    alert('제목과 내용을 모두 입력해주세요.');
                    return;
                }
                
                if (content.length > 1000) {
                    alert('내용은 최대 1,000자까지 입력 가능합니다.');
                    return;
                }

                // 빈자리 알림인 경우 추가 정보 수집 및 검증
                let slotsInfo = '';
                let eventType = 'normal';
                let discountRate = 0;
                
                if (category === '빈자리알림') {
                    const slotDate = document.getElementById('slot-date').value;
                    const slotTime = document.getElementById('slot-time').value.trim();
                    eventType = document.getElementById('event-type').value;
                    const slotDiscount = document.getElementById('slot-discount').value.trim();
                    
                    if (!slotDate || !slotTime) {
                        alert('빈자리 알림은 날짜와 시간대를 입력해주세요.');
                        return;
                    }
                    
                    // slots_info: 날짜와 시간 정보를 텍스트로 저장
                    slotsInfo = `${slotDate} ${slotTime}`;
                    if (slotDiscount) {
                        slotsInfo += ` (${slotDiscount})`;
                    }
                    
                    // discount_rate: 숫자형 할인율 추출 (예: "20%" -> 20)
                    const discountMatch = slotDiscount.match(/(\d+)/);
                    if (discountMatch) {
                        discountRate = parseInt(discountMatch[1]);
                    }
                }
                
                // 버튼 비활성화
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>등록 중...';
                
                // 업체 정보 가져오기
                const shopId = currentShop?.id || currentUser?.shop_id;
                const shopName = currentShop?.name || currentShop?.shop_name || '우리 업체';
                const state = currentShop?.state || '';
                const district = currentShop?.district || '';
                
                // 공지사항 데이터 준비 (스키마에 맞춰 정확히 전송)
                const announcementData = {
                    shop_id: shopId || 'demo_shop',
                    shop_name: shopName,
                    title: title,
                    content: content,
                    priority: 'normal', // 우선순위 (urgent, important, normal)
                    is_published: isPublished ? 1 : 0, // INTEGER로 변환
                    view_count: 0
                    // state, district 필드 제거 (D1 스키마에 없음)
                    // category, event_type, slots_info, discount_rate 제거 (D1 스키마에 없음)
                }
                
                console.log('Sending announcement data:', announcementData);
                
                // API 호출
                const response = await fetch('tables/shop_announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(announcementData)
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API 에러 응답:', errorText);
                    throw new Error(`공지사항 등록 실패 (${response.status}): ${errorText}`);
                }
                
                const result = await response.json();
                console.log('Shop announcement created:', result);
                
                // 성공 메시지
                alert(isPublished ? 
                    '고객 소식이 등록되었습니다!\n메인 페이지와 공지사항 게시판에서 확인하실 수 있습니다.' : 
                    '임시저장되었습니다. 나중에 게시할 수 있습니다.'
                );
                
                // 폼 초기화
                form.reset();
                document.getElementById('new-announcement-published').checked = true;
                
                // 내가 작성한 소식 탭으로 이동
                switchAnnouncementTab('my');
                
                // 버튼 복원
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
            } catch (error) {
                console.error('공지사항 작성 오류:', error);
                alert('공지사항 작성 중 오류가 발생했습니다: ' + error.message);
                
                // 버튼 복원
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText || '<i class="fas fa-paper-plane mr-2"></i>작성 완료';
                }
            }
        });
    }
});

// 내가 작성한 공지사항 로드
async function loadMyAnnouncements() {
    try {
        console.log('Loading my announcements...');
        
        const shopId = currentShop?.id || currentUser?.shop_id;
        
        if (!shopId) {
            throw new Error('업체 정보를 찾을 수 없습니다.');
        }
        
        const response = await fetch(`/tables/shop_announcements?limit=100&sort=-created_at`);
        
        if (!response.ok) {
            throw new Error('Failed to load announcements');
        }
        
        const data = await response.json();
        const all = data.data || [];
        
        // 내가 작성한 공지만 필터링
        myShopAnnouncements = all.filter(ann => ann.shop_id === shopId);
        
        console.log(`Loaded ${myShopAnnouncements.length} my announcements`);
        
        displayMyAnnouncements();
        
    } catch (error) {
        console.error('내 공지사항 로드 오류:', error);
        document.getElementById('my-announcements-list').innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-circle text-red-400 text-5xl mb-3"></i>
                <p class="text-gray-600">공지사항을 불러올 수 없습니다.</p>
                <button onclick="loadMyAnnouncements()" class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">
                    다시 시도
                </button>
            </div>
        `;
    }
}

// 내가 작성한 공지사항 표시
function displayMyAnnouncements() {
    const container = document.getElementById('my-announcements-list');
    
    if (myShopAnnouncements.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-lg shadow">
                <i class="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500 text-lg mb-4">작성한 소식이 없습니다.</p>
                <button onclick="switchAnnouncementTab('write')" 
                        class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                    <i class="fas fa-pencil-alt mr-2"></i>첫 소식 작성하기
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = myShopAnnouncements.map(ann => {
        const createdDate = formatDate(ann.created_at);
        const statusBadge = ann.is_published ? 
            '<span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">게시중</span>' :
            '<span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">임시저장</span>';
        
        return `
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="text-lg font-semibold text-gray-900">${escapeHtml(ann.title)}</h3>
                            ${statusBadge}
                        </div>
                        <p class="text-gray-600 mb-3">${escapeHtml(ann.content).substring(0, 100)}${ann.content.length > 100 ? '...' : ''}</p>
                        <div class="flex items-center text-sm text-gray-500 gap-4">
                            <span>
                                <i class="far fa-calendar mr-1"></i>${createdDate}
                            </span>
                            <span>
                                <i class="far fa-eye mr-1"></i>조회 ${ann.views || 0}회
                            </span>
                        </div>
                    </div>
                    <div class="ml-4 flex flex-col gap-2">
                        <button onclick="editMyAnnouncement('${ann.id}')" 
                                class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                            <i class="fas fa-edit mr-1"></i>수정
                        </button>
                        <button onclick="deleteMyAnnouncement('${ann.id}')" 
                                class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                            <i class="fas fa-trash mr-1"></i>삭제
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 공지사항 수정
function editMyAnnouncement(announcementId) {
    const ann = myShopAnnouncements.find(a => a.id === announcementId);
    if (!ann) {
        alert('공지사항을 찾을 수 없습니다.');
        return;
    }
    
    // 작성 탭으로 전환하고 데이터 채우기
    switchAnnouncementTab('write');
    document.getElementById('new-announcement-title').value = ann.title;
    document.getElementById('new-announcement-content').value = ann.content;
    document.getElementById('new-announcement-published').checked = ann.is_published;
    
    // 폼에 ID 저장 (수정 모드)
    document.getElementById('shop-announcement-form').dataset.editId = announcementId;
}

// 공지사항 삭제
async function deleteMyAnnouncement(announcementId) {
    if (!confirm('정말로 이 소식을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`/tables/shop_announcements/${announcementId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('삭제 실패');
        }
        
        alert('소식이 삭제되었습니다.');
        loadMyAnnouncements();
        
    } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다: ' + error.message);
    }
}

// 전역 함수 등록
window.switchAnnouncementTab = switchAnnouncementTab;
window.editMyAnnouncement = editMyAnnouncement;
window.deleteMyAnnouncement = deleteMyAnnouncement;