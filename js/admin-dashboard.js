// Admin Dashboard JavaScript (auth.js에서 정의된 currentUser를 사용)
let currentSection = 'dashboard';
let allUsers = [];
let allShops = [];
let allConsultations = [];
let selectedUser = null;

// v2.8.13.6.131: 공공 데이터 관리
let allPublicData = [];
let currentPublicPage = 1;
let publicPageSize = 100;

// ===== 공공 데이터 자동 매칭 시스템 =====
/**
 * 공공 데이터와 등록 샵 자동 매칭 함수
 * @param {Object} newShop - 등록된 샵 정보
 * @returns {Object|null} - 매칭된 공공 데이터 샵 또는 null
 */
// v2.8.13.6.137: 자동 매칭 비활성화 (public_skincare_data 삭제됨)
/*
async function autoMatchPublicData(newShop) {
    const { name, address, phone } = newShop;
    
    try {
        console.log('🔍 공공 데이터 검색:', { name, address, phone });
        
        // 입력 검증
        if (!name || !newShop.id) {
            console.error('❌ 필수 정보 누락:', { name, id: newShop.id });
            return null;
        }
        
        // 1. 유사도 검색
        const publicShopsResponse = await fetch(
            `tables/public_skincare_data?search=${encodeURIComponent(name)}&limit=10`
        );
        
        if (!publicShopsResponse.ok) {
            console.error('❌ 공공 데이터 조회 실패:', publicShopsResponse.status);
            return null;
        }
        
        const publicShops = await publicShopsResponse.json();
        
        console.log('📊 검색 결과:', publicShops.data?.length || 0, '개');
        
        if (!publicShops.data || publicShops.data.length === 0) {
            console.log('ℹ️ 검색 결과 없음');
            return null;
        }
        
        // 2. 이미 매칭된 샵 제외
        const unmatchedShops = publicShops.data.filter(shop => !shop.matched_shop_id);
        
        if (unmatchedShops.length === 0) {
            console.log('ℹ️ 모든 검색 결과가 이미 매칭됨');
            return null;
        }
        
        // 3. 각 샵의 유사도 점수 계산
        const scoredShops = unmatchedShops.map(shop => {
            const nameSimilarity = calculateSimilarity(name, shop.business_name);
            const addressSimilarity = address && shop.address ? calculateSimilarity(address, shop.address) : 0;
            const phoneMatch = phone && shop.phone && phone.replace(/[^0-9]/g, '') === shop.phone.replace(/[^0-9]/g, '');
            
            // 점수 계산: 이름 60%, 주소 30%, 전화번호 10% (일치 시 +50점)
            let score = (nameSimilarity * 0.6) + (addressSimilarity * 0.3);
            if (phoneMatch) score += 0.5;
            
            console.log('🔎 매칭 검사:', {
                shop: shop.business_name,
                nameSimilarity: nameSimilarity.toFixed(2),
                addressSimilarity: addressSimilarity.toFixed(2),
                phoneMatch,
                totalScore: score.toFixed(2)
            });
            
            return { shop, score, nameSimilarity, addressSimilarity, phoneMatch };
        });
        
        // 4. 점수 순 정렬
        scoredShops.sort((a, b) => b.score - a.score);
        
        // 5. 최고 점수 샵 선택 (임계값 확인)
        const bestMatch = scoredShops[0];
        const isValidMatch = (bestMatch.nameSimilarity > 0.8 && bestMatch.addressSimilarity > 0.6) || 
                             bestMatch.phoneMatch;
        
        if (!isValidMatch) {
            console.log('ℹ️ 임계값 미달:', {
                bestScore: bestMatch.score.toFixed(2),
                name: bestMatch.nameSimilarity.toFixed(2),
                address: bestMatch.addressSimilarity.toFixed(2)
            });
            return null;
        }
        
        // 6. 매칭 업데이트
        console.log('✅ 매칭 발견:', {
            business_name: bestMatch.shop.business_name,
            score: bestMatch.score.toFixed(2)
        });
        
        // PUT 사용 (Cloudflare Workers는 PATCH 미지원)
        const updatedData = {
            ...bestMatch.shop,
            matched_shop_id: newShop.id,
            phone: phone || bestMatch.shop.phone
        };
        
        const updateResponse = await fetch(`tables/public_skincare_data/${bestMatch.shop.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        
        if (!updateResponse.ok) {
            console.error('❌ 매칭 업데이트 실패:', updateResponse.status);
            return null;
        }
        
        console.log('✅ 매칭 업데이트 완료');
        return bestMatch.shop;
        
    } catch (error) {
        console.error('❌ 자동 매칭 실패:', error);
        return null;
    }
}
*/

/**
 * 두 문자열 간의 유사도 계산 (Levenshtein Distance)
 */
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein Distance 알고리즘
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // 치환
                    matrix[i][j - 1] + 1,     // 삽입
                    matrix[i - 1][j] + 1      // 삭제
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}
// ===== 공공 데이터 자동 매칭 시스템 끝 =====

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard loaded');
    checkAdminAuth();
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show dashboard section by default
    showSection('dashboard');
    
    // Setup announcement form
    setupAnnouncementForm();
    
    // Setup shop filters
    setupShopFilters();
});

// Check admin authentication (v2.8.13.6.130 - 간소화된 권한 확인)
function checkAdminAuth() {
    console.log('🔓 admin-dashboard.js - 관리자 권한 체크');
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('user_type');
    const adminAccess = localStorage.getItem('adminAccess') === 'true';
    const sessionToken = localStorage.getItem('session_token');
    const userEmail = localStorage.getItem('user_email');
    
    // 관리자 권한 체크 (단순화)
    const hasAdminAuth = (isLoggedIn && userType === 'admin') || 
                         adminAccess || 
                         (sessionToken && sessionToken.startsWith('admin_')) ||
                         (userEmail === 'admin@beautycat.kr');
    
    if (hasAdminAuth) {
        console.log('✅ 관리자 권한 확인됨');
        // 관리자 정보 설정
        currentUser = {
            id: localStorage.getItem('user_id') || 'admin_001',
            email: userEmail || 'admin@beautycat.kr',
            name: localStorage.getItem('user_name') || '관리자',
            type: 'admin'
        };
        
        // Display admin name
        const adminNameElement = document.getElementById('admin-name');
        if (adminNameElement) {
            adminNameElement.textContent = currentUser.name;
        }
        
        return true;
    }
    
    console.warn('⚠️ 관리자 권한 없음 - 로그인 페이지로 리다이렉트');
    window.location.href = 'login.html?returnUrl=' + encodeURIComponent(window.location.href);
    return false;
}

// Set up event listeners
function setupEventListeners() {
    // User filter
    document.getElementById('user-filter').addEventListener('change', filterUsers);
    
    // Consultation filter
    document.getElementById('consultation-filter').addEventListener('change', filterConsultations);
    
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    
    // Settings toggles
    document.getElementById('allow-registration').addEventListener('change', updateSettings);
    document.getElementById('auto-matching').addEventListener('change', updateSettings);
}

// Show section
function showSection(sectionName) {
    console.log('🔄 섹션 전환 시작:', sectionName);
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    console.log('📦 전체 섹션 수:', sections.length);
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show selected section - try both with and without '-section' suffix
    let targetSection = document.getElementById(sectionName + '-section');
    if (!targetSection) {
        targetSection = document.getElementById(sectionName);
    }
    
    if (targetSection) {
        console.log('✅ 대상 섹션 발견:', targetSection.id);
        targetSection.classList.remove('hidden');
        currentSection = sectionName;
    } else {
        console.error('❌ 섹션을 찾을 수 없습니다:', sectionName);
        console.log('🔍 시도한 ID:', sectionName + '-section', 'and', sectionName);
    }
    
    // Load section-specific data
    console.log('📊 섹션 데이터 로딩:', sectionName);
    switch(sectionName) {
        case 'users':
            loadUsers();
            break;
        case 'shops':
            console.log('🏪 loadShops() 호출');
            loadShops();
            break;
        case 'public-data':
            console.log('📍 loadPublicData() 호출');
            loadPublicData(1);
            break;
        case 'consultations':
            loadConsultations();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'test':
            // Test section doesn't need data loading
            break;
        default:
            console.warn('⚠️ 알 수 없는 섹션:', sectionName);
    }
    console.log('✅ showSection 완료:', sectionName);
}

// Toggle user menu
function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    menu.classList.toggle('hidden');
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!e.target.closest('#user-menu') && !e.target.closest('button')) {
            menu.classList.add('hidden');
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load all data for statistics
        await Promise.all([
            loadUsers(false),
            loadShops(false),
            loadConsultations(false),
            loadQuotes(),
            loadAnnouncements(false),
            loadRepresentativeShops(false)
        ]);
        
        // Update statistics
        updateDashboardStats();
        loadRecentActivities();
        
        // Load recent members for dashboard
        loadRecentMembers();
        
    } catch (error) {
        console.error('Dashboard data loading error:', error);
        showNotification('대시보드 데이터를 불러오는데 실패했습니다.', 'error');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('total-users').textContent = allUsers.length;
    document.getElementById('total-shops').textContent = allShops.length;
    document.getElementById('total-consultations').textContent = allConsultations.length;
    
    // Count quotes from consultations with quotes
    const totalQuotes = allConsultations.reduce((count, consultation) => {
        return count + (consultation.quotes ? consultation.quotes.length : 0);
    }, 0);
    document.getElementById('total-quotes').textContent = totalQuotes;
}

// Load recent activities
function loadRecentActivities() {
    const activitiesContainer = document.getElementById('recent-activities');
    const activities = [];
    
    // Get recent consultations (last 5)
    const recentConsultations = allConsultations
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    recentConsultations.forEach(consultation => {
        activities.push({
            type: 'consultation',
            message: `${consultation.name}님이 상담을 요청했습니다. (${consultation.region})`,
            time: formatDate(consultation.created_at),
            icon: 'fas fa-comments text-blue-600'
        });
    });
    
    // Get recent shop registrations (last 3)
    const recentShops = allShops
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
    
    recentShops.forEach(shop => {
        activities.push({
            type: 'shop',
            message: `${shop.business_name}이 업체로 등록했습니다.`,
            time: formatDate(shop.created_at),
            icon: 'fas fa-store text-green-600'
        });
    });
    
    // Sort all activities by time and limit to 8
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, 8);
    
    if (limitedActivities.length === 0) {
        activitiesContainer.innerHTML = '<p class="text-gray-500">최근 활동이 없습니다.</p>';
        return;
    }
    
    activitiesContainer.innerHTML = limitedActivities.map(activity => `
        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <i class="${activity.icon}"></i>
            <div class="flex-1">
                <p class="text-sm text-gray-900">${activity.message}</p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

// Load users
async function loadUsers(updateTable = true) {
    try {
        console.log('👥 사용자 데이터 로딩 중...');
        const response = await fetch('tables/users?limit=1000&sort=created_at');
        console.log('📡 응답 상태:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📊 전체 데이터:', data);
        console.log('👥 사용자 수:', data.total, '명');
        
        // v2.8.13.6.131.1: 삭제된 사용자 제외
        allUsers = (data.data || []).filter(user => !user.deleted);
        console.log('✅ allUsers 배열:', allUsers.length, '명 (삭제된 사용자 제외)');
        
        if (updateTable) {
            console.log('🔄 테이블 업데이트 시작');
            displayUsers(allUsers);
        }
    } catch (error) {
        console.error('❌ Users loading error:', error);
        
        // API 실패시 데모 데이터 사용
        allUsers = [
            {
                id: 'demo_customer_1',
                email: 'demo@customer.com',
                name: '데모 고객',
                phone: '010-1111-1111',
                user_type: 'customer',
                status: 'active',
                is_verified: true,
                created_at: '2024-09-18T03:00:00Z'
            },
            {
                id: 'demo_shop_1',
                email: 'demo@shop.com',
                name: '데모 상점',
                phone: '010-2222-2222',
                user_type: 'shop',
                status: 'active',
                is_verified: true,
                created_at: '2024-09-18T03:00:00Z'
            },
            {
                id: 'demo_admin_1',
                email: 'admin@demo.com',
                name: '관리자',
                phone: '010-0000-0000',
                user_type: 'admin',
                status: 'active',
                is_verified: true,
                created_at: '2024-09-18T03:00:00Z'
            }
        ];
        
        if (updateTable) {
            displayUsers(allUsers);
        }
    }
}

// Display users in table
function displayUsers(users) {
    console.log('🖼️ displayUsers 호출됨, 사용자 수:', users.length);
    
    const tableBody = document.getElementById('users-table');
    
    if (!tableBody) {
        console.error('❌ users-table 요소를 찾을 수 없습니다!');
        return;
    }
    
    console.log('✅ users-table 요소 찾음');
    
    if (users.length === 0) {
        console.log('⚠️ 표시할 사용자가 없습니다');
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">등록된 사용자가 없습니다.</td></tr>';
        return;
    }
    
    console.log('🔨 테이블 HTML 생성 중...');
    tableBody.innerHTML = users.map(user => {
        const userTypeLabels = {
            'customer': '고객',
            'shop': '업체',
            'admin': '관리자'
        };
        
        const statusColors = {
            'active': 'text-green-600 bg-green-100',
            'inactive': 'text-red-600 bg-red-100',
            'pending': 'text-yellow-600 bg-yellow-100'
        };
        
        const status = user.status || 'active';
        
        // 비밀번호 표시 (해시된 경우 일부만, 평문인 경우 전체)
        let passwordDisplay = '';
        // password에 :가 포함되어 있으면 해시된 비밀번호 (hash:salt 형식)
        if (user.password && user.password.includes(':')) {
            // 해시된 비밀번호 - 일부만 표시
            const [hash] = user.password.split(':');
            passwordDisplay = `
                <span class="text-gray-400 text-xs" title="해시된 비밀번호 (hash:salt)">
                    ${hash.substring(0, 12)}...
                </span>
                <button onclick="copyPassword('${user.id}')" class="ml-2 text-blue-600 hover:text-blue-900 text-xs" title="전체 해시 복사">
                    <i class="fas fa-copy"></i>
                </button>
            `;
        } else {
            // 평문 비밀번호 - 전체 표시
            passwordDisplay = `
                <span class="font-mono text-sm" id="password-${user.id}">${user.password || '-'}</span>
                <button onclick="copyPassword('${user.id}')" class="ml-2 text-blue-600 hover:text-blue-900" title="비밀번호 복사">
                    <i class="fas fa-copy"></i>
                </button>
            `;
        }
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <i class="fas fa-user text-gray-600"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.name}</div>
                            <div class="text-sm text-gray-500">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${userTypeLabels[user.user_type] || user.user_type}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${passwordDisplay}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formatDate(user.created_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}">
                        ${status === 'active' ? '활성' : status === 'inactive' ? '비활성' : '대기'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewUser('${user.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
                        보기
                    </button>
                    <button onclick="editUser('${user.id}')" class="text-green-600 hover:text-green-900 mr-2">
                        수정
                    </button>
                    <button onclick="deleteUser('${user.id}')" class="text-red-600 hover:text-red-900" title="사용자 삭제">
                        삭제
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter users
function filterUsers() {
    const filter = document.getElementById('user-filter').value;
    let filteredUsers = allUsers;
    
    if (filter) {
        filteredUsers = allUsers.filter(user => user.user_type === filter);
    }
    
    displayUsers(filteredUsers);
}

// Refresh users
function refreshUsers() {
    loadUsers();
}

// Copy password to clipboard
function copyPassword(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user || !user.password) {
        alert('비밀번호를 찾을 수 없습니다.');
        return;
    }
    
    // 클립보드에 복사
    navigator.clipboard.writeText(user.password).then(() => {
        // 성공 알림
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>비밀번호가 클립보드에 복사되었습니다</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }).catch(err => {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다.');
    });
}

// v2.8.13.6.129.7: 샵 필터 이벤트 리스너 초기화 함수 (강제 초기화 추가)
function initializeShopFilters() {
    const shopTypeFilter = document.getElementById('shop-type-filter');
    const shopSearchInput = document.getElementById('shop-search');
    const shopRegionFilter = document.getElementById('shop-region-filter');
    const shopStatusFilter = document.getElementById('shop-status-filter');
    
    // 🔥 CRITICAL: 이벤트 리스너 등록 전에 다시 한 번 강제 초기화!
    if (shopTypeFilter) {
        shopTypeFilter.value = '';
        // 브라우저가 값을 복원하지 못하도록 selectedIndex도 초기화
        shopTypeFilter.selectedIndex = 0;
    }
    if (shopSearchInput) shopSearchInput.value = '';
    if (shopRegionFilter) {
        shopRegionFilter.value = '';
        shopRegionFilter.selectedIndex = 0;
    }
    if (shopStatusFilter) {
        shopStatusFilter.value = '';
        shopStatusFilter.selectedIndex = 0;
    }
    
    console.log('🔒 필터 강제 초기화 완료 (selectedIndex 포함)');
    
    // 이벤트 리스너 등록 (이미 등록되었을 수 있으므로 중복 방지)
    if (shopTypeFilter && !shopTypeFilter.dataset.listenerAdded) {
        shopTypeFilter.addEventListener('change', function() {
            console.log('📊 샵 타입 필터 변경:', this.value);
            filterShops();
        });
        shopTypeFilter.dataset.listenerAdded = 'true';
    }
    
    // v2.8.13.6.130.2: 이벤트 리스너 등록 후 강제 초기화 (브라우저 autocomplete 완전 차단)
    setTimeout(() => {
        if (shopTypeFilter) {
            shopTypeFilter.value = '';
            shopTypeFilter.selectedIndex = 0;
            console.log('🔥 최종 초기화 (이벤트 후): shop-type-filter =', shopTypeFilter.value);
        }
    }, 150);
    
    if (shopSearchInput && !shopSearchInput.dataset.listenerAdded) {
        shopSearchInput.addEventListener('input', filterShops);
        shopSearchInput.dataset.listenerAdded = 'true';
    }
    
    if (shopRegionFilter && !shopRegionFilter.dataset.listenerAdded) {
        shopRegionFilter.addEventListener('change', filterShops);
        shopRegionFilter.dataset.listenerAdded = 'true';
    }
    
    if (shopStatusFilter && !shopStatusFilter.dataset.listenerAdded) {
        shopStatusFilter.addEventListener('change', filterShops);
        shopStatusFilter.dataset.listenerAdded = 'true';
    }
}

// ===== CSV 업로드 함수 =====
/**
 * CSV 파일 업로드 및 처리
 * v2.8.13.6.129.12: CSV 파일로 샵 정보 일괄 업로드
 */
async function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📤 CSV 업로드 시작:', file.name);
    
    // 진행 상황 표시
    const progressDiv = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressPercentage = document.getElementById('upload-percentage');
    const statusText = document.getElementById('upload-status');
    
    progressDiv.style.display = 'block';
    statusText.textContent = 'CSV 파일 읽는 중...';
    
    try {
        // CSV 파일 읽기
        const text = await file.text();
        const lines = text.trim().split('\n');
        
        if (lines.length < 2) {
            throw new Error('CSV 파일이 비어있거나 헤더만 있습니다.');
        }
        
        // 헤더 파싱
        const headers = lines[0].split(',').map(h => h.trim());
        console.log('📋 CSV 헤더:', headers);
        
        // v2.8.13.6.132: 필수 필드 확인 (유연한 헤더 지원)
        const requiredFields = ['business_name', 'address'];
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
            throw new Error(`필수 필드 누락: ${missingFields.join(', ')}`);
        }
        
        console.log('✅ 필수 필드 확인 완료');
        
        // v2.8.13.6.132: 데이터 파싱 및 정제
        const shops = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // 빈 줄 스킵
            
            const values = lines[i].split(',').map(v => v.trim());
            const rawShop = {};
            
            headers.forEach((header, index) => {
                rawShop[header] = values[index] || '';
            });
            
            // 데이터 정제 및 변환
            const cleanedShop = cleanShopData(rawShop);
            if (cleanedShop) {
                shops.push(cleanedShop);
            }
        }
        
        // 정제 함수 (인라인 정의)
        function cleanShopData(raw) {
            try {
                // v2.8.13.6.145: CSV 헤더에 맞춰 직접 매핑
                let state = '';
                let district = '';
                let town = '';
                
                // 1) state 필드가 있으면 사용
                if (raw.state) {
                    state = raw.state;
                    district = raw.district || '';
                    town = raw.town || '';
                } 
                // 2) region 필드가 있으면 state로 매핑
                else if (raw.region) {
                    state = raw.region;
                    district = raw.district || '';
                    town = raw.town || '';
                }
                // 3) 이전 형식 ("전라남1여수시") 지원
                else if (raw.district && (raw.district.includes('1') || raw.district.includes('도') || raw.district.includes('시'))) {
                    // 지역명 매핑
                    const regionMap = {
                        '서울': '서울특별시', '부산': '부산광역시', '대구': '대구광역시', '인천': '인천광역시',
                        '광주': '광주광역시', '대전': '대전광역시', '울산': '울산광역시', '세종': '세종특별자치시',
                        '경기': '경기도', '강원': '강원특별자치도', '충북': '충청북도', '충남': '충청남도',
                        '전북': '전북특별자치도', '전남': '전라남도', '경북': '경상북도', '경남': '경상남도', '제주': '제주특별자치도',
                        '전라북': '전북특별자치도', '전라남': '전라남도', '경상북': '경상북도', '경상남': '경상남도',
                        '충청북': '충청북도', '충청남': '충청남도'
                    };
                    
                    // 지역 추출
                    for (const [key, value] of Object.entries(regionMap)) {
                        if (raw.district.startsWith(key)) {
                            state = value;
                            // district 추출 (숫자 뒤 부분)
                            const match = raw.district.match(/\d+(.+)/);
                            if (match) {
                                district = match[1];
                            }
                            break;
                        }
                    }
                }
                
                // 4) 주소에서 자동 추출 (fallback)
                if (!state && raw.address) {
                    const addressMatch = raw.address.match(/^([가-힣]+특별시|[가-힣]+광역시|[가-힣]+특별자치시|[가-힣]+도)\s+([가-힣]+구|[가-힣]+군|[가-힣]+시)\s+([가-힣]+동|[가-힣]+읍|[가-힣]+면)/);
                    if (addressMatch) {
                        state = addressMatch[1];
                        district = addressMatch[2];
                        town = addressMatch[3];
                        console.log('📍 주소에서 추출:', { state, district, town, address: raw.address });
                    }
                }
                
                console.log('🗺️ 지역 매핑:', { 
                    raw_state: raw.state, 
                    raw_region: raw.region, 
                    raw_district: raw.district, 
                    raw_town: raw.town,
                    result_state: state, 
                    result_district: district,
                    result_town: town
                });
                
                // phone 처리 ("미등록" -> 빈 값)
                let phone = raw.phone_region || raw.phone || '';
                if (phone === '미등록' || phone === '미등' || phone === '-') {
                    phone = '';
                }
                
                // status 변환 (active -> 영업중)
                let status = raw.open_d_status || raw.status || '영업중';
                if (status === 'active') {
                    status = '영업중';
                } else if (status === 'inactive' || status === 'closed') {
                    status = '폐업';
                }
                
                return {
                    name: raw.business_name || raw.name,
                    owner_name: raw.owner_name || '정보 없음',
                    address: raw.address,
                    phone: phone,
                    state: state,
                    district: district,
                    town: town,
                    status: status,
                    email: raw.email || ''
                };
            } catch (error) {
                console.warn('⚠️ 데이터 정제 실패:', raw, error);
                return null;
            }
        }
        
        console.log('✅ 파싱된 샵 수:', shops.length);
        statusText.textContent = `${shops.length}개 샵 정보 파싱 완료. 업로드 중...`;
        
        // v2.8.13.6.129.12: 배치 업로드 (10개씩 묶어서 동시 업로드)
        let successCount = 0;
        let errorCount = 0;
        const BATCH_SIZE = 10; // 동시에 10개씩 업로드
        
        for (let i = 0; i < shops.length; i += BATCH_SIZE) {
            const batch = shops.slice(i, i + BATCH_SIZE);
            const progress = Math.round((i + batch.length) / shops.length * 100);
            
            progressBar.style.width = progress + '%';
            progressPercentage.textContent = progress + '%';
            statusText.textContent = `업로드 중... (${i + batch.length}/${shops.length})`;
            
            // 배치 내 모든 샵을 동시에 업로드
            const uploadPromises = batch.map(async (shop, index) => {
                try {
                    // v2.8.13.6.132: skincare_shops 테이블로 업로드
                    const response = await fetch('/tables/skincare_shops', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(shop)
                    });
                    
                    if (response.ok) {
                        successCount++;
                        const globalIndex = i + index + 1;
                        // 매 100건마다만 로그 출력
                        if (globalIndex % 100 === 0 || globalIndex === shops.length) {
                            console.log(`✅ ${globalIndex}/${shops.length} 업로드 완료`);
                        }
                        return { success: true, shop };
                    } else {
                        errorCount++;
                        const globalIndex = i + index + 1;
                        const errorText = await response.text();
                        // 오류는 항상 로그
                        console.error(`❌ ${globalIndex}/${shops.length}: ${shop.name}`, errorText);
                        return { success: false, shop, error: errorText };
                    }
                } catch (error) {
                    errorCount++;
                    const globalIndex = i + index + 1;
                    console.error(`❌ ${globalIndex}/${shops.length}: ${shop.name}`, error);
                    return { success: false, shop, error: error.message };
                }
            });
            
            // 배치 완료 대기
            await Promise.all(uploadPromises);
            
            // API 부하 방지 (배치당 50ms 대기)
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // 완료
        progressBar.style.width = '100%';
        progressPercentage.textContent = '100%';
        statusText.textContent = `✅ 업로드 완료! 성공: ${successCount}개, 실패: ${errorCount}개`;
        
        showNotification(`CSV 업로드 완료: ${successCount}개 성공, ${errorCount}개 실패`, successCount > 0 ? 'success' : 'error');
        
        // 3초 후 진행 상황 숨기기
        setTimeout(() => {
            progressDiv.style.display = 'none';
            progressBar.style.width = '0%';
        }, 3000);
        
        // 샵 목록 새로고침
        if (successCount > 0) {
            await loadShops();
        }
        
    } catch (error) {
        console.error('❌ CSV 업로드 오류:', error);
        statusText.textContent = '❌ 오류: ' + error.message;
        showNotification('CSV 업로드 실패: ' + error.message, 'error');
    }
    
    // 파일 입력 초기화
    event.target.value = '';
}

// Load shops
async function loadShops(updateTable = true) {
    try {
        console.log('🏪 업체 목록 로딩 시작...');
        // 필터 값 가져오기 (서버 사이드 필터)
        const searchTerm = document.getElementById('shop-search')?.value || '';
        const regionFilter = document.getElementById('shop-region-filter')?.value || '';
        const statusFilter = document.getElementById('shop-status-filter')?.value || '';
        
        // API 쿼리 파라미터 구성 (v2.8.13.6.144: limit 5000으로 최적화)
        let queryParams = 'limit=5000&sort=created_at';
        if (searchTerm) queryParams += `&search=${encodeURIComponent(searchTerm)}`;
        if (regionFilter) queryParams += `&state=${encodeURIComponent(regionFilter)}`;
        if (statusFilter) queryParams += `&status=${encodeURIComponent(statusFilter)}`;
        
        console.log('🔍 서버 필터 적용:', { searchTerm, regionFilter, statusFilter });
        
        const response = await fetch(`tables/skincare_shops?${queryParams}`);
        const data = await response.json();
        
        // 삭제된 샵 제외 (Soft Delete 필터링)
        allShops = (data.data || []).filter(shop => !shop.deleted);
        
        console.log('📊 서버에서 로딩된 업체 수:', allShops.length, '(삭제된 샵 제외)');
        
        // v2.8.13.6.140: 클라이언트 사이드 필터 적용 (샵 타입)
        const shopTypeFilter = document.getElementById('shop-type-filter')?.value || '';
        let filteredShops = [...allShops];
        
        if (shopTypeFilter === 'verified') {
            // 인증샵만: status = 'active' AND email이 정상
            filteredShops = filteredShops.filter(shop => {
                return shop.status === 'active' && shop.email && !shop.email.includes('@example.com');
            });
            console.log('🔍 클라이언트 필터: 인증샵만 -', filteredShops.length, '개');
        } else if (shopTypeFilter === 'public') {
            // 공공데이터만: email이 없거나 @example.com
            filteredShops = filteredShops.filter(shop => {
                return !shop.email || shop.email.includes('@example.com');
            });
            console.log('🔍 클라이언트 필터: 공공데이터만 -', filteredShops.length, '개');
        } else if (shopTypeFilter === 'registered') {
            // 신규등록만: email이 있고 정상적인 이메일
            filteredShops = filteredShops.filter(shop => {
                return shop.email && !shop.email.includes('@example.com');
            });
            console.log('🔍 클라이언트 필터: 신규등록만 -', filteredShops.length, '개');
        }
        
        console.log('📋 최종 필터링된 업체 수:', filteredShops.length);
        
        // v2.8.13.6.139: 업체 수 업데이트 (전체 데이터 기준)
        updateShopCounts(allShops);
        
        if (updateTable) {
            console.log('🖼️ 테이블 렌더링 시작...');
            
            displayShops(filteredShops);
            console.log('✅ 테이블 렌더링 완료');
            
            // v2.8.13.6.129.6: 테이블 렌더링 후 이벤트 리스너 등록 (초기 필터링 방지)
            setTimeout(() => {
                initializeShopFilters();
                console.log('✅ 필터 이벤트 리스너 등록 완료');
            }, 100);
        }
    } catch (error) {
        console.error('❌ Shops loading error:', error);
        
        // API 실패시 데모 데이터 사용
        allShops = [
            {
                id: 'shop_001',
                shop_name: '뷰티스킨 클리닉',
                owner_name: '김미영',
                phone: '02-123-4567',
                email: 'beautyskin@example.com',
                region: '서울특별시 강남구',
                status: 'active',
                is_active: true,
                verified: true,
                created_at: '2024-09-18T03:00:00Z'
            },
            {
                id: 'shop_002',
                shop_name: '글로우 스킨케어',
                owner_name: '박지은',
                phone: '02-987-6543',
                email: 'glow@example.com',
                region: '서울특별시 서초구',
                status: 'active',
                is_active: true,
                verified: false,
                created_at: '2024-09-18T03:00:00Z'
            }
        ];
        
        if (updateTable) {
            displayShops(allShops);
        }
    }
}

// 페이지네이션 변수
let currentPage = 1;
const itemsPerPage = 100;
let displayedShops = [];
let allFilteredShops = []; // 필터링된 전체 데이터

// v2.8.13.6.139: 업체 수 업데이트 함수
function updateShopCounts(shops) {
    if (!shops) return;
    
    // 전체 업체 수
    const totalCount = shops.length;
    
    // 인증 업체 수 (status = 'active' AND email이 있고 @example.com이 아님)
    const verifiedCount = shops.filter(shop => 
        shop.status === 'active' && 
        shop.email && 
        !shop.email.includes('@example.com')
    ).length;
    
    // 신규 등록 업체 수 (email이 있고 @example.com이 아님)
    const registeredCount = shops.filter(shop => 
        shop.email && 
        !shop.email.includes('@example.com')
    ).length;
    
    // HTML 업데이트
    const totalCountEl = document.getElementById('total-shops-count');
    const verifiedCountEl = document.getElementById('verified-shops-count');
    const registeredCountEl = document.getElementById('registered-shops-count');
    
    if (totalCountEl) totalCountEl.textContent = totalCount.toLocaleString();
    if (verifiedCountEl) verifiedCountEl.textContent = verifiedCount.toLocaleString();
    if (registeredCountEl) registeredCountEl.textContent = registeredCount.toLocaleString();
    
    console.log('📊 업체 수 업데이트:', {
        total: totalCount,
        verified: verifiedCount,
        registered: registeredCount
    });
}

// Display shops in table
function displayShops(shops, append = false) {
    console.log('📊 displayShops 호출됨, 업체 수:', shops.length, 'append:', append);
    console.log('📋 shops 데이터:', shops);
    
    const tableBody = document.getElementById('shops-table');
    
    if (!tableBody) {
        console.error('❌ shops-table 요소를 찾을 수 없습니다!');
        console.log('🔍 DOM 확인:', document.body.innerHTML.substring(0, 500));
        return;
    }
    
    console.log('✅ shops-table 요소 발견:', tableBody);
    
    if (shops.length === 0) {
        console.log('⚠️ 표시할 업체가 없습니다');
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">등록된 업체가 없습니다.</td></tr>';
        updateLoadMoreButton(0, 0);
        return;
    }
    
    console.log('✅ 업체 테이블 렌더링 중...');
    console.log('🔍 첫 번째 업체:', shops[0]);
    
    // 전체 필터링된 데이터 저장
    allFilteredShops = shops;
    
    // append가 false면 초기화
    if (!append) {
        displayedShops = [];
        currentPage = 1;
    }
    
    // 현재 페이지에 표시할 데이터 추가
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const newShops = shops.slice(startIdx, endIdx);
    displayedShops = displayedShops.concat(newShops);
    
    console.log(`📄 페이지 ${currentPage}: ${startIdx}~${endIdx} (${newShops.length}개 추가)`);
    console.log(`📊 현재 표시 중: ${displayedShops.length}개 / 전체: ${shops.length}개`);
    
    const shopsHtml = displayedShops.map(shop => {
        const status = shop.status || 'active';
        const statusColors = {
            'active': 'text-green-600 bg-green-100',
            'inactive': 'text-red-600 bg-red-100',
            'pending': 'text-yellow-600 bg-yellow-100'
        };
        
        // 대표샵 상태 확인
        const isRepresentative = shop.is_representative === true || shop.is_representative === 'true';
        const repStatus = shop.representative_status || 'none';
        
        // 대표샵 상태 표시
        let repStatusHtml = '';
        if (isRepresentative && repStatus === 'approved') {
            repStatusHtml = `
                <div class="flex items-center">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        <i class="fas fa-star mr-1"></i>대표샵
                    </span>
                    <button onclick="toggleRepresentativeStatus('${shop.id}', false)" 
                            class="ml-2 text-red-600 hover:text-red-800" title="대표샵 해제">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </div>
            `;
        } else {
            repStatusHtml = `
                <button onclick="toggleRepresentativeStatus('${shop.id}', true)" 
                        class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-blue-100 hover:text-blue-700"
                        title="대표샵으로 지정">
                    <i class="fas fa-star mr-1"></i>대표샵 지정
                </button>
            `;
        }
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${shop.name || '업체명 없음'}</div>
                    <div class="text-sm text-gray-500">${shop.owner_name || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${shop.region || `${shop.state || ''} ${shop.district || ''}`.trim() || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${shop.naver_cafe_id || '-'}</div>
                    ${shop.naver_cafe_id ? `<div class="text-xs text-blue-600">
                        <a href="https://cafe.naver.com/cosmetickr" target="_blank" class="hover:underline">
                            <i class="fas fa-external-link-alt mr-1"></i>카페 확인
                        </a>
                    </div>` : '<div class="text-xs text-gray-400">미입력</div>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formatDate(shop.created_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}">
                        ${status === 'active' ? '활성' : status === 'inactive' ? '비활성' : '승인대기'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${repStatusHtml}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewShop('${shop.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
                        보기
                    </button>
                    <button onclick="editShop('${shop.id}')" class="text-blue-600 hover:text-blue-900 mr-2">
                        수정
                    </button>
                    <button onclick="approveShop('${shop.id}')" class="text-green-600 hover:text-green-900 mr-2" title="플랫폼 입점 승인">
                        입점승인
                    </button>
                    <button onclick="deleteShop('${shop.id}')" class="text-red-600 hover:text-red-900 mr-2" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${shop.naver_cafe_id ? `
                        <button onclick="verifyCafeId('${shop.naver_cafe_id}')" class="text-blue-600 hover:text-blue-900">
                            카페 확인
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = shopsHtml;
    
    // "더 보기" 버튼 업데이트
    updateLoadMoreButton(displayedShops.length, allFilteredShops.length);
    
    console.log('✅ 테이블 렌더링 완료');
}

// "더 보기" 버튼 업데이트
function updateLoadMoreButton(displayed, total) {
    let loadMoreContainer = document.getElementById('load-more-shops-container');
    
    // 컨테이너가 없으면 생성
    if (!loadMoreContainer) {
        const shopsSection = document.getElementById('shops-section');
        if (!shopsSection) return;
        
        loadMoreContainer = document.createElement('div');
        loadMoreContainer.id = 'load-more-shops-container';
        loadMoreContainer.className = 'mt-4 text-center';
        
        // shops-table의 부모(card) 다음에 추가
        const card = shopsSection.querySelector('.unni-card');
        if (card && card.nextSibling) {
            shopsSection.insertBefore(loadMoreContainer, card.nextSibling);
        } else if (card) {
            card.parentNode.appendChild(loadMoreContainer);
        }
    }
    
    // 더 표시할 데이터가 있으면 버튼 표시
    if (displayed < total) {
        const remaining = total - displayed;
        loadMoreContainer.innerHTML = `
            <button onclick="loadMoreShops()" 
                    class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                <i class="fas fa-plus-circle mr-2"></i>더 보기 (${remaining}개 남음)
            </button>
            <p class="mt-2 text-sm text-gray-600">현재 ${displayed}개 / 전체 ${total}개</p>
        `;
    } else {
        loadMoreContainer.innerHTML = `
            <p class="text-sm text-gray-600">전체 ${total}개 표시 중</p>
        `;
    }
}

// 더 보기 버튼 클릭
function loadMoreShops() {
    console.log('📄 더 보기 클릭');
    currentPage++;
    displayShops(allFilteredShops, true); // append=true
}

// Refresh shops
function refreshShops() {
    loadShops();
}

// Load consultations
async function loadConsultations(updateTable = true) {
    try {
        const response = await fetch('tables/consultations?limit=1000&sort=created_at');
        const data = await response.json();
        allConsultations = data.data || [];
        
        if (updateTable) {
            displayConsultations(allConsultations);
        }
    } catch (error) {
        console.error('Consultations loading error:', error);
        
        // API 실패시 데모 데이터 사용
        allConsultations = [
            {
                id: 'consult_001',
                customer_name: '김민수',
                customer_phone: '010-1234-5678',
                customer_email: 'minsu@example.com',
                region: '서울특별시 강남구',
                treatment_type: '여드름 관리, 모공 축소',
                consultation_text: '여드름이 심해서 고민입니다. 모공도 넓어서 관리를 받고 싶습니다.',
                status: 'pending',
                created_at: '2024-09-18T03:00:00Z'
            },
            {
                id: 'consult_002',
                customer_name: '이지은',
                customer_phone: '010-9876-5432',
                customer_email: 'jieun@example.com',
                region: '서울특별시 서초구',
                treatment_type: '미백 관리, 수분 관리',
                consultation_text: '피부가 칙칙하고 건조합니다. 미백 관리도 받고 싶어요.',
                status: 'in_progress',
                created_at: '2024-09-18T03:00:00Z'
            }
        ];
        
        if (updateTable) {
            displayConsultations(allConsultations);
        }
    }
}

// Display consultations in table
function displayConsultations(consultations) {
    const tableBody = document.getElementById('consultations-table');
    
    if (consultations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">상담 요청이 없습니다.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = consultations.map(consultation => {
        const status = consultation.status || 'pending';
        const statusLabels = {
            'pending': '대기중',
            'in_progress': '진행중',
            'completed': '완료',
            'cancelled': '취소'
        };
        const statusColors = {
            'pending': 'text-yellow-600 bg-yellow-100',
            'in_progress': 'text-blue-600 bg-blue-100',
            'completed': 'text-green-600 bg-green-100',
            'cancelled': 'text-red-600 bg-red-100'
        };
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${consultation.name}</div>
                    <div class="text-sm text-gray-500">${consultation.phone}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${consultation.region}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formatDate(consultation.created_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}">
                        ${statusLabels[status]}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewConsultation('${consultation.id}')" class="text-indigo-600 hover:text-indigo-900">
                        상세보기
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter consultations
function filterConsultations() {
    const filter = document.getElementById('consultation-filter').value;
    let filteredConsultations = allConsultations;
    
    if (filter) {
        filteredConsultations = allConsultations.filter(consultation => consultation.status === filter);
    }
    
    displayConsultations(filteredConsultations);
}

// Refresh consultations
function refreshConsultations() {
    loadConsultations();
}

// Load quotes for statistics
async function loadQuotes() {
    try {
        const response = await fetch('tables/quotes?limit=1000');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Quotes loading error:', error);
        return [];
    }
}

// Load analytics data
function loadAnalytics() {
    // Calculate monthly statistics
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyUsers = allUsers.filter(user => {
        const createdDate = new Date(user.created_at);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    
    const monthlyConsultations = allConsultations.filter(consultation => {
        const createdDate = new Date(consultation.created_at);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    
    // Update monthly stats
    document.getElementById('monthly-users').textContent = monthlyUsers;
    document.getElementById('monthly-consultations').textContent = monthlyConsultations;
    document.getElementById('monthly-quotes').textContent = '0'; // Will be calculated from quotes data
    
    // Load regional statistics
    loadRegionalStats();
}

// Load regional statistics
function loadRegionalStats() {
    const regionalData = {};
    
    // Count consultations by region
    allConsultations.forEach(consultation => {
        const region = consultation.region;
        if (region) {
            const province = region.split(' ')[0]; // Get province part
            regionalData[province] = (regionalData[province] || 0) + 1;
        }
    });
    
    // Sort by count and get top 5
    const sortedRegions = Object.entries(regionalData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const regionalStatsContainer = document.getElementById('regional-stats');
    
    if (sortedRegions.length === 0) {
        regionalStatsContainer.innerHTML = '<p class="text-gray-500">지역별 데이터가 없습니다.</p>';
        return;
    }
    
    regionalStatsContainer.innerHTML = sortedRegions.map(([region, count]) => `
        <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
            <span class="text-gray-700">${region}</span>
            <span class="font-semibold text-blue-600">${count}건</span>
        </div>
    `).join('');
}

// View user details
function viewUser(userId) {
    selectedUser = allUsers.find(user => user.id === userId);
    if (!selectedUser) return;
    
    const userDetails = document.getElementById('user-details');
    userDetails.innerHTML = `
        <div class="space-y-2">
            <div><strong>이름:</strong> ${selectedUser.name}</div>
            <div><strong>이메일:</strong> ${selectedUser.email}</div>
            <div><strong>연락처:</strong> ${selectedUser.phone || '미등록'}</div>
            <div><strong>사용자 타입:</strong> ${selectedUser.user_type}</div>
            <div><strong>가입일:</strong> ${formatDate(selectedUser.created_at)}</div>
            <div><strong>상태:</strong> ${selectedUser.status || 'active'}</div>
        </div>
    `;
    
    // Update action button
    const actionBtn = document.getElementById('user-action-btn');
    const isActive = selectedUser.status !== 'inactive';
    actionBtn.textContent = isActive ? '계정 비활성화' : '계정 활성화';
    actionBtn.className = isActive ? 
        'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700' :
        'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700';
    
    document.getElementById('user-modal').classList.remove('hidden');
}

// Close user modal
function closeUserModal() {
    document.getElementById('user-modal').classList.add('hidden');
    selectedUser = null;
}

// Toggle user status
async function toggleUserStatus() {
    if (!selectedUser) return;
    
    try {
        const newStatus = selectedUser.status === 'inactive' ? 'active' : 'inactive';
        
        const response = await fetch(`tables/users/${selectedUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            selectedUser.status = newStatus;
            showNotification(`사용자 상태가 ${newStatus === 'active' ? '활성화' : '비활성화'}되었습니다.`, 'success');
            closeUserModal();
            loadUsers(); // Refresh users list
        } else {
            throw new Error('사용자 상태 변경 실패');
        }
    } catch (error) {
        console.error('User status toggle error:', error);
        showNotification('사용자 상태 변경에 실패했습니다.', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    // Find user to get their info for confirmation
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showNotification('사용자를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // Admin cannot be deleted
    if (user.user_type === 'admin') {
        showNotification('관리자 계정은 삭제할 수 없습니다.', 'error');
        return;
    }
    
    // Confirmation
    const confirmMessage = `정말로 이 사용자를 삭제하시겠습니까?\n\n` +
                          `이름: ${user.name}\n` +
                          `이메일: ${user.email}\n` +
                          `타입: ${user.user_type}\n\n` +
                          `⚠️ 이 작업은 되돌릴 수 없습니다.`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        console.log('🗑️ 사용자 삭제 시작:', userId);
        
        // If user is a shop, delete the shop record first
        if (user.user_type === 'shop' && user.shop_id) {
            console.log('🏪 연결된 업체 레코드 삭제:', user.shop_id);
            const shopDeleteResponse = await fetch(`tables/skincare_shops/${user.shop_id}`, {
                method: 'DELETE'
            });
            
            if (!shopDeleteResponse.ok) {
                console.warn('⚠️ 업체 레코드 삭제 실패 (계속 진행)');
            } else {
                console.log('✅ 업체 레코드 삭제 완료');
            }
        }
        
        // Soft Delete user (v2.8.13.6.131 - Soft Delete로 변경)
        console.log('🗑️ 사용자 Soft Delete 시작:', userId);
        
        // GET 기존 데이터
        const getUserResponse = await fetch(`/tables/users/${userId}`);
        if (!getUserResponse.ok) {
            throw new Error(`사용자 조회 실패: ${getUserResponse.status}`);
        }
        const existingUser = await getUserResponse.json();
        
        // Soft Delete: deleted 플래그 설정
        const updatedUser = {
            ...existingUser,
            deleted: true,
            is_active: false,
            status: 'deleted',
            updated_at: Date.now()
        };
        
        const response = await fetch(`/tables/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        });
        
        if (response.ok) {
            console.log('✅ 사용자 Soft Delete 성공:', userId);
            showNotification(`사용자 "${user.name}"이(가) 삭제되었습니다 (복구 가능)`, 'success');
            await loadUsers(); // Refresh users list
        } else {
            throw new Error('사용자 삭제 실패');
        }
    } catch (error) {
        console.error('❌ User delete error:', error);
        showNotification('사용자 삭제에 실패했습니다: ' + error.message, 'error');
    }
}

// Edit user (placeholder)
// Edit user
async function editUser(userId) {
    try {
        console.log('📝 사용자 편집 시작:', userId);
        
        // 사용자 정보 가져오기
        const response = await fetch(`tables/users/${userId}`);
        if (!response.ok) {
            throw new Error('사용자 정보를 가져올 수 없습니다.');
        }
        
        const user = await response.json();
        console.log('✅ 사용자 정보 로드:', user);
        
        // 폼에 데이터 채우기
        document.getElementById('edit-user-name').value = user.name || '';
        document.getElementById('edit-user-email').value = user.email || '';
        document.getElementById('edit-user-phone').value = user.phone || '';
        document.getElementById('edit-user-type').value = user.user_type || 'customer';
        
        // 모달에 사용자 ID 저장
        document.getElementById('user-edit-modal').setAttribute('data-user-id', userId);
        
        // 경고 메시지 표시
        document.getElementById('user-type-warning').classList.remove('hidden');
        
        // 모달 열기
        const modal = document.getElementById('user-edit-modal');
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.error('사용자 편집 오류:', error);
        showNotification('사용자 정보를 불러올 수 없습니다.', 'error');
    }
}

// Close user edit modal
function closeUserEditModal() {
    const modal = document.getElementById('user-edit-modal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
    
    // 폼 초기화
    document.getElementById('user-edit-form').reset();
    document.getElementById('user-type-warning').classList.add('hidden');
}

// Make functions globally accessible
window.editUser = editUser;
window.closeUserEditModal = closeUserEditModal;

// Delete user
async function deleteUser(userId) {
    // Find user to get their info for confirmation
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showNotification('사용자를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // Admin cannot be deleted
    if (user.user_type === 'admin') {
        showNotification('관리자 계정은 삭제할 수 없습니다.', 'error');
        return;
    }
    
    // Confirmation with user details
    const confirmMessage = `정말로 이 사용자를 삭제하시겠습니까?\n\n` +
                          `이름: ${user.name}\n` +
                          `이메일: ${user.email}\n` +
                          `타입: ${user.user_type}\n\n` +
                          `⚠️ 이 작업은 되돌릴 수 없습니다.`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        console.log('🗑️ 사용자 삭제 시작:', userId);
        
        // If user is a shop, try to find and delete the shop record first
        if (user.user_type === 'shop') {
            try {
                // Try to find shop by email
                const shopsResponse = await fetch('tables/skincare_shops?limit=1000');
                if (shopsResponse.ok) {
                    const shopsData = await shopsResponse.json();
                    const userShop = shopsData.data.find(s => 
                        s.email && user.email && 
                        s.email.toLowerCase() === user.email.toLowerCase()
                    );
                    
                    if (userShop) {
                        console.log('🏪 연결된 업체 레코드 삭제:', userShop.id);
                        const shopDeleteResponse = await fetch(`tables/skincare_shops/${userShop.id}`, {
                            method: 'DELETE'
                        });
                        
                        if (shopDeleteResponse.ok) {
                            console.log('✅ 업체 레코드 삭제 완료');
                        } else {
                            console.warn('⚠️ 업체 레코드 삭제 실패 (계속 진행)');
                        }
                    }
                }
            } catch (shopError) {
                console.warn('⚠️ 업체 레코드 삭제 중 오류 (계속 진행):', shopError);
            }
        }
        
        // Delete user
        const response = await fetch(`tables/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('✅ 사용자 삭제 완료:', userId);
            showNotification(`사용자 "${user.name}"이(가) 삭제되었습니다.`, 'success');
            await loadUsers(); // Refresh users list
            
            // Refresh shops list if it was a shop
            if (user.user_type === 'shop') {
                await loadShops();
            }
        } else {
            throw new Error('사용자 삭제 실패');
        }
    } catch (error) {
        console.error('❌ 사용자 삭제 오류:', error);
        showNotification('사용자 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    }
}

window.deleteUser = deleteUser;

// User edit form submission
document.addEventListener('DOMContentLoaded', function() {
    const userEditForm = document.getElementById('user-edit-form');
    if (userEditForm) {
        userEditForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const modal = document.getElementById('user-edit-modal');
            const userId = modal.getAttribute('data-user-id');
            
            if (!userId) {
                showNotification('사용자 ID를 찾을 수 없습니다.', 'error');
                return;
            }
            
            // 폼 데이터 수집
            const name = document.getElementById('edit-user-name').value.trim();
            const phone = document.getElementById('edit-user-phone').value.trim();
            const userType = document.getElementById('edit-user-type').value;
            
            if (!name) {
                showNotification('이름을 입력해주세요.', 'error');
                return;
            }
            
            // 로딩 버튼
            const submitBtn = userEditForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>저장 중...';
            
            try {
                console.log('💾 사용자 정보 업데이트 중...', {userId, name, phone, userType});
                
                // 기존 사용자 정보 가져오기 (타입 변경 감지용)
                const currentUserResponse = await fetch(`tables/users/${userId}`);
                const currentUser = await currentUserResponse.json();
                const oldUserType = currentUser.user_type;
                
                console.log('🔄 사용자 타입 변경:', oldUserType, '→', userType);
                
                // 사용자 정보 업데이트
                const updateData = {
                    name: name,
                    phone: phone,
                    user_type: userType
                };
                
                const response = await fetch(`tables/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`업데이트 실패: ${errorText}`);
                }
                
                const updatedUser = await response.json();
                console.log('✅ 사용자 정보 업데이트 완료:', updatedUser);
                
                // 🔄 사용자 이름이 변경되었고 shop 타입이면 → 샵 이름도 동기화
                if (userType === 'shop' && name !== currentUser.name) {
                    console.log('🔄 사용자 이름 변경 감지 → 샵 이름 동기화 시작');
                    
                    // 기존 샵 레코드 찾기
                    const shopsResponse = await fetch('tables/skincare_shops?limit=1000');
                    const shopsData = await shopsResponse.json();
                    const existingShop = shopsData.data.find(s => 
                        s.email && s.email.toLowerCase() === updatedUser.email.toLowerCase()
                    );
                    
                    if (existingShop) {
                        console.log('🔄 샵 이름 업데이트:', existingShop.name, '→', name);
                        
                        // 샵 이름 업데이트
                        const shopUpdateResponse = await fetch(`tables/skincare_shops/${existingShop.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: name,
                                owner_name: name
                            })
                        });
                        
                        if (shopUpdateResponse.ok) {
                            console.log('✅ 샵 이름 동기화 완료');
                        } else {
                            console.error('❌ 샵 이름 동기화 실패:', await shopUpdateResponse.text());
                        }
                    }
                }
                
                // 🏪 customer → shop 변경 시 skincare_shops 레코드 생성
                if (oldUserType !== 'shop' && userType === 'shop') {
                    console.log('🏪 업체 레코드 생성 중...');
                    
                    // 기존 업체 레코드 확인
                    const shopsResponse = await fetch('tables/skincare_shops?limit=1000');
                    const shopsData = await shopsResponse.json();
                    const existingShop = shopsData.data.find(s => 
                        s.email && s.email.toLowerCase() === updatedUser.email.toLowerCase()
                    );
                    
                    if (existingShop) {
                        console.log('✅ 기존 업체 레코드 존재:', existingShop.id);
                        
                        // 🔧 기존 샵의 시/도, 구/군이 비어있으면 경고
                        if (!existingShop.state || !existingShop.district || 
                            existingShop.state === '' || existingShop.district === '') {
                            console.warn('⚠️ 기존 샵에 시/도, 구/군 정보 없음!');
                            alert(
                                '⚠️ 주의: 이 업체는 시/도, 구/군 정보가 없습니다.\n\n' +
                                '견적 매칭이 제대로 작동하지 않을 수 있습니다.\n\n' +
                                '➡️ "샵 입점 관리"에서 해당 업체를 찾아\n' +
                                '   시/도, 구/군, 주소를 입력해주세요.'
                            );
                        }
                    } else {
                        // 새 업체 레코드 생성 (NOT NULL 필드에 기본값 제공)
                        const shopData = {
                            name: name,  // ✅ 수정: " 업체" 접미사 제거
                            owner_name: name,
                            email: updatedUser.email,
                            phone: phone || '정보 없음',
                            state: '정보 미등록',  // ⚠️ 수정: 명시적으로 미등록 표시
                            district: '정보 미등록',  // ⚠️ 수정: 명시적으로 미등록 표시
                            address: '주소 미등록',
                            business_number: '정보 없음',
                            business_license: '정보 없음',
                            status: 'pending'
                        };
                        
                        const shopResponse = await fetch('tables/skincare_shops', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(shopData)
                        });
                        
                        if (shopResponse.ok) {
                            const newShop = await shopResponse.json();
                            console.log('✅ 업체 레코드 생성 완료:', newShop.id);
                            
                            // ⚠️ 시/도, 구/군 미등록 알림
                            alert(
                                '✅ 업체 레코드가 생성되었습니다.\n\n' +
                                '⚠️ 중요: 시/도, 구/군, 주소가 미등록 상태입니다.\n\n' +
                                '➡️ "샵 입점 관리"에서 해당 업체를 찾아\n' +
                                '   필수 정보를 입력해주세요.\n\n' +
                                '※ 정보 미입력 시 견적 매칭이 작동하지 않습니다.'
                            );
                        } else {
                            const errorText = await shopResponse.text();
                            console.error('❌ 업체 레코드 생성 실패:', shopResponse.status, errorText);
                            console.error('전송한 데이터:', shopData);
                        }
                    }
                }
                
                // 성공 알림
                let successMessage = `${name}님의 정보가 업데이트되었습니다.`;
                if (oldUserType !== 'shop' && userType === 'shop') {
                    successMessage += '\n\n업체 레코드가 생성되었습니다. 추가 정보를 입력하려면 "샵 입점 관리"에서 해당 업체를 편집하세요.';
                }
                showNotification(successMessage, 'success', 7000);
                
                // 모달 닫기
                closeUserEditModal();
                
                // 대시보드 데이터 새로고침
                await loadDashboardData();
                
            } catch (error) {
                console.error('사용자 업데이트 오류:', error);
                showNotification('사용자 정보 업데이트 중 오류가 발생했습니다:\n' + error.message, 'error');
            } finally {
                // 버튼 복원
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});

// View shop (placeholder)
function viewShop(shopId) {
    const shop = allShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('샵 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // Fill view modal with shop data
    document.getElementById('view-shop-name').textContent = shop.name || '-';
    document.getElementById('view-owner-name').textContent = shop.owner_name || '-';
    document.getElementById('view-phone').textContent = shop.phone || '-';
    document.getElementById('view-email').textContent = shop.email || '-';
    document.getElementById('view-business-number').textContent = shop.business_number || '-';
    document.getElementById('view-license-number').textContent = shop.business_license || '-';
    document.getElementById('view-state').textContent = shop.state || shop.shop_state || '-';
    document.getElementById('view-district').textContent = shop.district || shop.shop_district || '-';
    document.getElementById('view-address').textContent = shop.address || shop.shop_address || '-';
    document.getElementById('view-price-range').textContent = shop.price_range || '-';
    document.getElementById('view-naver-cafe').textContent = shop.naver_cafe_id || '-';
    document.getElementById('view-description').textContent = shop.description || '-';
    document.getElementById('view-created-at').textContent = formatDate(shop.created_at) || '-';
    document.getElementById('view-updated-at').textContent = formatDate(shop.updated_at) || '-';
    
    // Handle treatment types
    const treatments = shop.treatment_types;
    let treatmentText = '-';
    if (treatments) {
        if (Array.isArray(treatments)) {
            treatmentText = treatments.join(', ');
        } else if (typeof treatments === 'string') {
            treatmentText = treatments;
        }
    }
    document.getElementById('view-treatments').textContent = treatmentText;
    
    // Handle status with colored badge
    const status = shop.status || 'pending';
    const statusText = status === 'active' ? '승인됨' : 
                      status === 'inactive' ? '비활성' : 
                      status === 'approved' ? '승인됨' : 
                      status === 'rejected' ? '거부됨' : '승인대기';
    const statusColors = {
        'active': 'text-green-700 bg-green-100',
        'approved': 'text-green-700 bg-green-100',
        'inactive': 'text-red-700 bg-red-100',
        'rejected': 'text-red-700 bg-red-100',
        'pending': 'text-yellow-700 bg-yellow-100'
    };
    
    const statusBadge = document.getElementById('view-status-badge');
    statusBadge.textContent = statusText;
    statusBadge.className = `px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`;
    
    // Store current shop ID for edit function
    document.getElementById('shop-view-modal').setAttribute('data-shop-id', shopId);
    
    // Show modal
    document.getElementById('shop-view-modal').classList.remove('hidden');
}

function closeShopViewModal() {
    document.getElementById('shop-view-modal').classList.add('hidden');
}

function editShopFromView() {
    const shopId = document.getElementById('shop-view-modal').getAttribute('data-shop-id');
    closeShopViewModal();
    editShop(shopId);
}

// Approve shop (placeholder)
async function approveShop(shopId) {
    try {
        // 1. 샵 정보 먼저 가져오기 (지역 검증용)
        const shopResponse = await fetch(`tables/skincare_shops/${shopId}`);
        if (!shopResponse.ok) {
            throw new Error('샵 정보를 가져올 수 없습니다.');
        }
        const shop = await shopResponse.json();
        
        // 2. 지역 정보 검증 (필수)
        if (!shop.state || !shop.district) {
            showNotification(
                `⚠️ 승인 불가: 지역 정보가 없습니다.\n\n` +
                `샵명: ${shop.name}\n` +
                `시/도: ${shop.state || '미입력'}\n` +
                `구/군: ${shop.district || '미입력'}\n\n` +
                `해당 샵에 연락하여 지역 정보를 입력하도록 안내해주세요.`,
                'error',
                10000 // 10초 표시
            );
            console.error('❌ 승인 거부:', {
                shop_id: shopId,
                shop_name: shop.name,
                state: shop.state,
                district: shop.district,
                reason: '지역 정보 누락'
            });
            return; // 승인 중단
        }
        
        // 3. 지역 정보 확인 완료 - 승인 진행
        console.log('✅ 지역 정보 검증 완료:', {
            shop_name: shop.name,
            region: `${shop.state} ${shop.district}`
        });
        
        const response = await fetch(`tables/skincare_shops/${shopId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'active' })
        });
        
        if (response.ok) {
            // v2.8.13.6.137: 자동 매칭 비활성화 (public_skincare_data 삭제됨)
            // 4. 자동 매칭 시도 (공공 데이터와 연결)
            // console.log('🔄 공공 데이터 자동 매칭 시도...');
            // const matchedPublicShop = await autoMatchPublicData(shop);
            
            // if (matchedPublicShop) {
            //     console.log('✅ 매칭 성공:', {
            //         registered_shop: shop.name,
            //         public_shop: matchedPublicShop.business_name,
            //         public_shop_id: matchedPublicShop.id
            //     });
            //     
            //     showNotification(
            //         `✅ 플랫폼 입점 승인 완료!\n\n` +
            //         `샵명: ${shop.name}\n` +
            //         `지역: ${shop.state} ${shop.district}\n\n` +
            //         `🔗 공공 데이터 매칭 완료:\n` +
            //         `${matchedPublicShop.business_name}\n\n` +
            //         `이제 리뷰 작성이 가능합니다.`,
            //         'success',
            //         10000
            //     );
            // } else {
            //     console.log('ℹ️ 매칭 실패: 유사한 공공 데이터를 찾지 못했습니다.');
            //     
                showNotification(
                    `✅ 플랫폼 입점 승인 완료!\n\n` +
                    `샵명: ${shop.name}\n` +
                    `지역: ${shop.state} ${shop.district}\n\n` +
                    `해당 지역의 고객 견적 요청을 수신합니다.`,
                    'success',
                    8000
                );
            // }
            
            loadShops(); // Refresh shops list
        } else {
            throw new Error('플랫폼 입점 승인 실패');
        }
    } catch (error) {
        console.error('Shop approval error:', error);
        showNotification('플랫폼 입점 승인에 실패했습니다.', 'error');
    }
}

// Verify Naver Cafe ID
function verifyCafeId(cafeId) {
    if (!cafeId) {
        showNotification('네이버 카페 ID가 없습니다.', 'warning');
        return;
    }
    
    // 새 창에서 네이버 카페 페이지 열기
    const cafeUrl = `https://cafe.naver.com/cosmetickr`;
    const verificationWindow = window.open(cafeUrl, '_blank');
    
    if (verificationWindow) {
        showNotification(`네이버 카페에서 "${cafeId}" 회원을 확인하세요.`, 'info');
    } else {
        showNotification('팝업이 차단되었습니다. 브라우저 설정을 확인하세요.', 'warning');
    }
}

// View consultation (placeholder)
function viewConsultation(consultationId) {
    const consultation = allConsultations.find(c => c.id === consultationId);
    if (!consultation) {
        showNotification('상담 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // message 필드에서 추가 정보 파싱
    let additionalInfo = {};
    try {
        if (consultation.message) {
            additionalInfo = JSON.parse(consultation.message);
        }
    } catch (e) {
        console.log('메시지 파싱 실패:', consultation.message);
        additionalInfo = { notes: consultation.message };
    }
    
    // Fill view modal with consultation data
    document.getElementById('view-consultation-name').textContent = consultation.customer_name || '-';
    document.getElementById('view-consultation-phone').textContent = consultation.phone || '-';
    document.getElementById('view-consultation-region').textContent = consultation.region || '-';
    document.getElementById('view-consultation-budget').textContent = additionalInfo.budget || '-';
    
    // 피부 상태
    document.getElementById('view-consultation-skin-condition').textContent = additionalInfo.skin_condition || '-';
    
    // 추가 요청사항
    document.getElementById('view-consultation-notes').textContent = additionalInfo.notes || '-';
    
    // 신청일시 및 수정일시
    document.getElementById('view-consultation-created-at').textContent = formatDate(consultation.created_at) || '-';
    document.getElementById('view-consultation-updated-at').textContent = formatDate(consultation.updated_at) || '-';
    
    // Handle treatment types
    const treatments = consultation.treatment_type;
    document.getElementById('view-consultation-treatments').textContent = treatments || '-';
    
    // Handle status with colored badge
    const status = consultation.status || 'pending';
    const statusText = {
        'pending': '대기중',
        'in_progress': '진행중',
        'completed': '완료',
        'cancelled': '취소'
    }[status];
    
    const statusColors = {
        'pending': 'text-yellow-700 bg-yellow-100',
        'in_progress': 'text-blue-700 bg-blue-100',
        'completed': 'text-green-700 bg-green-100',
        'cancelled': 'text-red-700 bg-red-100'
    };
    
    const statusBadge = document.getElementById('view-consultation-status-badge');
    statusBadge.textContent = statusText;
    statusBadge.className = `px-3 py-1 text-sm font-semibold rounded-full ${statusColors[status]}`;
    
    // Set current status in dropdown
    document.getElementById('consultation-status-change').value = status;
    
    // Handle matched shops if any
    const matchedShopsSection = document.getElementById('matched-shops-section');
    const matchedShopsList = document.getElementById('matched-shops-list');
    
    if (consultation.matched_shops && consultation.matched_shops.length > 0) {
        matchedShopsSection.classList.remove('hidden');
        matchedShopsList.innerHTML = consultation.matched_shops.map(shop => {
            return `
                <div class="bg-white p-3 rounded border flex justify-between items-center">
                    <div>
                        <div class="font-medium text-gray-900">${shop.name || '업체명 없음'}</div>
                        <div class="text-sm text-gray-500">${shop.region || shop.location || ''}</div>
                    </div>
                    <div class="text-xs text-gray-400">
                        ${formatDate(shop.matched_at)}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        matchedShopsSection.classList.add('hidden');
    }
    
    // Store current consultation ID for status update
    window.currentConsultationId = consultationId;
    
    // 모달 열기
    const modal = document.getElementById('consultation-view-modal');
    modal.setAttribute('data-consultation-id', consultationId);
    modal.classList.remove('hidden');
}

function closeConsultationViewModal() {
    document.getElementById('consultation-view-modal').classList.add('hidden');
}

// Update consultation status
async function updateConsultationStatus() {
    const consultationId = document.getElementById('consultation-view-modal').getAttribute('data-consultation-id');
    const newStatus = document.getElementById('consultation-status-change').value;
    
    if (!consultationId || !newStatus) {
        showNotification('상담 정보가 없습니다.', 'error');
        return;
    }
    
    const consultation = allConsultations.find(c => c.id === consultationId);
    if (!consultation) {
        showNotification('상담 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    if (consultation.status === newStatus) {
        showNotification('이미 동일한 상태입니다.', 'info');
        return;
    }
    
    try {
        const response = await fetch(`tables/consultations/${consultationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            // Update local data
            consultation.status = newStatus;
            consultation.updated_at = new Date().toISOString();
            
            // Update modal display
            viewConsultation(consultationId);
            
            // Refresh consultations table
            displayConsultations(allConsultations);
            
            showNotification('상담 상태가 성공적으로 변경되었습니다.', 'success');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Consultation status update error:', error);
        
        // Update local data on API failure
        consultation.status = newStatus;
        consultation.updated_at = new Date().toISOString();
        
        // Update displays
        viewConsultation(consultationId);
        displayConsultations(allConsultations);
        
        showNotification('상담 상태가 로컬에서 업데이트되었습니다. (API 연결 필요)', 'warning');
    }
}

// Print consultation details
function printConsultation() {
    const consultationId = document.getElementById('consultation-view-modal').getAttribute('data-consultation-id');
    const consultation = allConsultations.find(c => c.id === consultationId);
    
    if (!consultation) {
        showNotification('인쇄할 상담 정보가 없습니다.', 'error');
        return;
    }
    
    // Create print content
    const printContent = `
        <html>
        <head>
            <title>상담 요청서 - ${consultation.name}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; border-left: 4px solid #ff2d92; padding-left: 10px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .info-item { margin-bottom: 10px; }
                .label { font-weight: bold; color: #666; }
                .value { margin-left: 10px; }
                .status { padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
                .status.pending { background-color: #fef3c7; color: #92400e; }
                .status.in_progress { background-color: #dbeafe; color: #1e40af; }
                .status.completed { background-color: #d1fae5; color: #065f46; }
                .status.cancelled { background-color: #fee2e2; color: #991b1b; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>beautycat (뷰티+에티켓)</h1>
                <h2>피부관리 상담 요청서</h2>
                <p>출력일시: ${new Date().toLocaleString('ko-KR')}</p>
            </div>
            
            <div class="section">
                <div class="section-title">고객 정보</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">이름:</span>
                        <span class="value">${consultation.name || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">연령대:</span>
                        <span class="value">${consultation.age || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">전화번호:</span>
                        <span class="value">${consultation.phone || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">성별:</span>
                        <span class="value">${consultation.gender === 'male' ? '남성' : consultation.gender === 'female' ? '여성' : consultation.gender || '-'}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">위치 정보</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">지역:</span>
                        <span class="value">${consultation.region || consultation.location || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">상세 지역:</span>
                        <span class="value">${consultation.detailed_region || consultation.detailed_location || '-'}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">관심 서비스</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">피부 타입:</span>
                        <span class="value">${consultation.skin_type || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">관심 관리:</span>
                        <span class="value">${Array.isArray(consultation.treatment_types) ? consultation.treatment_types.join(', ') : consultation.treatment_types || consultation.interested_treatments || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">중요사항:</span>
                        <span class="value">${consultation.important_factors || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">희망 빈도:</span>
                        <span class="value">${consultation.frequency || '-'}</span>
                    </div>
                </div>
                <div class="info-item" style="margin-top: 15px;">
                    <span class="label">추가 요청사항:</span>
                    <div style="margin-top: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                        ${consultation.additional_requests || consultation.message || '없음'}
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">처리 정보</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">현재 상태:</span>
                        <span class="status ${consultation.status || 'pending'}">${{
                            'pending': '대기중',
                            'in_progress': '진행중', 
                            'completed': '완료',
                            'cancelled': '취소'
                        }[consultation.status] || '대기중'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">신청일시:</span>
                        <span class="value">${formatDate(consultation.created_at) || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">처리일시:</span>
                        <span class="value">${formatDate(consultation.updated_at) || '-'}</span>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    showNotification('상담 정보를 인쇄합니다.', 'info');
}

// ===== 대표샵 관리 관련 함수들 =====

let allRepresentativeShops = [];

// Load representative shops data
async function loadRepresentativeShops(updateTable = true) {
    try {
        const response = await fetch('tables/representative_shops?limit=1000&sort=created_at');
        const data = await response.json();
        allRepresentativeShops = data.data || [];
        
        if (updateTable) {
            displayRepresentativeShops(allRepresentativeShops);
            updateRepresentativeShopStats();
        }
    } catch (error) {
        console.error('Representative shops loading error:', error);
        
        // API 실패시 데모 데이터 사용
        allRepresentativeShops = [
            {
                id: 'rep_shop_001',
                shop_name: '뷰티캣 강남점',
                state: '서울특별시',
                district: '강남구',
                phone: '02-123-4567',
                representative_treatments: ['여드름 관리', '미백 관리', '모공 축소'],
                approved: false,
                status: 'pending',
                created_at: '2024-10-15T10:00:00Z'
            },
            {
                id: 'rep_shop_002', 
                shop_name: '글로우 스킨케어',
                state: '서울특별시',
                district: '서초구',
                phone: '02-987-6543',
                representative_treatments: ['수분 관리', '주름 관리', '민감성 케어'],
                approved: true,
                status: 'approved',
                created_at: '2024-10-15T11:00:00Z'
            },
            {
                id: 'rep_shop_003',
                shop_name: '부산 오션뷰 클리닉',
                state: '부산광역시',
                district: '해운대구',
                phone: '051-111-2222',
                representative_treatments: ['리프팅', '바디 케어', '미백 관리'],
                approved: true,
                status: 'approved',
                created_at: '2024-10-15T12:00:00Z'
            },
            {
                id: 'rep_shop_004',
                shop_name: '대구 프리미엄 클리닉',
                state: '대구광역시',
                district: '수성구',
                phone: '053-333-4444',
                representative_treatments: ['여드름 관리', '색소침착 개선'],
                approved: false,
                status: 'rejected',
                created_at: '2024-10-15T13:00:00Z'
            }
        ];
        
        if (updateTable) {
            displayRepresentativeShops(allRepresentativeShops);
            updateRepresentativeShopStats();
        }
    }
}

// Display representative shops in table
function displayRepresentativeShops(shops) {
    const tableBody = document.getElementById('representative-shops-table');
    
    if (shops.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">등록된 대표샵이 없습니다.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = shops.map(shop => {
        const status = shop.status || (shop.approved ? 'approved' : 'pending');
        const statusLabels = {
            'approved': '승인됨',
            'pending': '승인대기',
            'rejected': '거부됨'
        };
        const statusColors = {
            'approved': 'text-green-600 bg-green-100',
            'pending': 'text-yellow-600 bg-yellow-100',
            'rejected': 'text-red-600 bg-red-100'
        };
        
        const treatments = Array.isArray(shop.representative_treatments) ? 
            shop.representative_treatments.slice(0, 2).join(', ') + 
            (shop.representative_treatments.length > 2 ? '...' : '') : '-';
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${shop.name || '업체명 없음'}</div>
                    <div class="text-sm text-gray-500">ID: ${shop.id}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${shop.state} ${shop.district}${shop.town ? ' ' + shop.town : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${shop.phone}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="max-w-32 truncate" title="${Array.isArray(shop.representative_treatments) ? shop.representative_treatments.join(', ') : '-'}">
                        ${treatments}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}">
                        ${statusLabels[status]}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewRepresentativeShop('${shop.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
                        보기
                    </button>
                    ${status === 'pending' ? `
                        <button onclick="approveRepresentativeShop('${shop.id}')" class="text-green-600 hover:text-green-900 mr-2">
                            승인
                        </button>
                        <button onclick="rejectRepresentativeShop('${shop.id}')" class="text-red-600 hover:text-red-900 mr-2">
                            거부
                        </button>
                    ` : status === 'approved' ? `
                        <button onclick="revokeRepresentativeShop('${shop.id}')" class="text-orange-600 hover:text-orange-900 mr-2">
                            취소
                        </button>
                    ` : `
                        <button onclick="approveRepresentativeShop('${shop.id}')" class="text-green-600 hover:text-green-900 mr-2">
                            재승인
                        </button>
                    `}
                    <button onclick="deleteRepresentativeShop('${shop.id}')" class="text-red-600 hover:text-red-900" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update representative shops statistics
function updateRepresentativeShopStats() {
    const approved = allRepresentativeShops.filter(shop => shop.approved || shop.status === 'approved').length;
    const pending = allRepresentativeShops.filter(shop => shop.status === 'pending' || (!shop.approved && !shop.status)).length;
    const coveredRegions = new Set(allRepresentativeShops.filter(shop => shop.approved || shop.status === 'approved').map(shop => `${shop.state} ${shop.district}`)).size;
    
    document.getElementById('approved-rep-shops').textContent = approved;
    document.getElementById('pending-rep-shops').textContent = pending;
    document.getElementById('covered-regions').textContent = coveredRegions;
    document.getElementById('phone-consultations').textContent = '24'; // 임시 데이터
}

// Refresh representative shops
function refreshRepresentativeShops() {
    loadRepresentativeShops(true);
    showNotification('대표샵 목록을 새로고침했습니다.', 'info');
}

// View representative shop details
function viewRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('대표샵 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const treatments = Array.isArray(shop.representative_treatments) ? 
        shop.representative_treatments.join(', ') : '-';
    
    const details = `
        📍 지역: ${shop.state} ${shop.district}
        📞 전화: ${shop.phone}
        💄 대표 관리: ${treatments}
        📅 등록일: ${formatDate(shop.created_at)}
        ✅ 상태: ${shop.status === 'approved' || shop.approved ? '승인됨' : shop.status === 'rejected' ? '거부됨' : '승인대기'}
    `;
    
    alert(`🏪 ${shop.shop_name}\n\n${details}`);
}

// Approve representative shop
async function approveRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('대표샵 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`tables/representative_shops/${shopId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                approved: true,
                status: 'approved',
                approved_at: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            shop.approved = true;
            shop.status = 'approved';
            shop.approved_at = new Date().toISOString();
            
            displayRepresentativeShops(allRepresentativeShops);
            updateRepresentativeShopStats();
            
            showNotification(`'${shop.shop_name}'이 대표샵으로 승인되었습니다.`, 'success');
        } else {
            throw new Error('승인 실패');
        }
    } catch (error) {
        console.error('Representative shop approval error:', error);
        
        // API 실패시 로컬 데이터 업데이트
        shop.approved = true;
        shop.status = 'approved';
        displayRepresentativeShops(allRepresentativeShops);
        updateRepresentativeShopStats();
        
        showNotification(`'${shop.shop_name}'이 로컬에서 승인되었습니다. (API 연결 필요)`, 'warning');
    }
}

// Reject representative shop
async function rejectRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('대표샵 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const reason = prompt(`'${shop.shop_name}' 대표샵 신청을 거부하시겠습니까?\n\n거부 사유를 입력하세요 (선택사항):`);
    if (reason === null) return; // 취소
    
    try {
        const response = await fetch(`tables/representative_shops/${shopId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                approved: false,
                status: 'rejected',
                rejection_reason: reason,
                rejected_at: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            shop.approved = false;
            shop.status = 'rejected';
            shop.rejection_reason = reason;
            
            displayRepresentativeShops(allRepresentativeShops);
            updateRepresentativeShopStats();
            
            showNotification(`'${shop.shop_name}' 대표샵 신청이 거부되었습니다.`, 'info');
        } else {
            throw new Error('거부 처리 실패');
        }
    } catch (error) {
        console.error('Representative shop rejection error:', error);
        
        shop.approved = false;
        shop.status = 'rejected';
        displayRepresentativeShops(allRepresentativeShops);
        updateRepresentativeShopStats();
        
        showNotification(`'${shop.shop_name}' 대표샵 신청이 로컬에서 거부되었습니다.`, 'warning');
    }
}

// Revoke representative shop approval
async function revokeRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('대표샵 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    if (!confirm(`'${shop.shop_name}'의 대표샵 승인을 취소하시겠습니까?\n\n승인 취소 후에는 해당 지역에서 대표샵 서비스가 중단됩니다.`)) {
        return;
    }
    
    try {
        const response = await fetch(`tables/representative_shops/${shopId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                approved: false,
                status: 'pending',
                revoked_at: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            shop.approved = false;
            shop.status = 'pending';
            
            displayRepresentativeShops(allRepresentativeShops);
            updateRepresentativeShopStats();
            
            showNotification(`'${shop.shop_name}'의 대표샵 승인이 취소되었습니다.`, 'info');
        } else {
            throw new Error('승인 취소 실패');
        }
    } catch (error) {
        console.error('Representative shop revocation error:', error);
        
        shop.approved = false;
        shop.status = 'pending';
        displayRepresentativeShops(allRepresentativeShops);
        updateRepresentativeShopStats();
        
        showNotification(`'${shop.shop_name}'의 대표샵 승인이 로컬에서 취소되었습니다.`, 'warning');
    }
}

// Delete representative shop
async function deleteRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('대표샵 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const confirmMessage = `정말로 '${shop.shop_name}' 대표샵 등록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        const response = await fetch(`tables/representative_shops/${shopId}`, {
            method: 'DELETE'
        });
        
        if (response.ok || response.status === 204) {
            const index = allRepresentativeShops.findIndex(s => s.id === shopId);
            if (index !== -1) {
                allRepresentativeShops.splice(index, 1);
            }
            
            displayRepresentativeShops(allRepresentativeShops);
            updateRepresentativeShopStats();
            
            showNotification('대표샵 등록이 삭제되었습니다.', 'success');
        } else {
            throw new Error('삭제 실패');
        }
    } catch (error) {
        console.error('Representative shop deletion error:', error);
        
        const index = allRepresentativeShops.findIndex(s => s.id === shopId);
        if (index !== -1) {
            allRepresentativeShops.splice(index, 1);
        }
        displayRepresentativeShops(allRepresentativeShops);
        updateRepresentativeShopStats();
        
        showNotification('대표샵 등록이 로컬에서 삭제되었습니다. (API 연결 필요)', 'warning');
    }
}

// Load profile
function loadProfile() {
    if (currentUser) {
        document.getElementById('profile-name').value = currentUser.name || '';
        document.getElementById('profile-email').value = currentUser.email || '';
        document.getElementById('profile-phone').value = currentUser.phone || '';
        document.getElementById('profile-department').value = currentUser.department || '';
    }
}

// Update profile
async function updateProfile(e) {
    e.preventDefault();
    
    try {
        const formData = {
            name: document.getElementById('profile-name').value,
            phone: document.getElementById('profile-phone').value,
            department: document.getElementById('profile-department').value
        };
        
        const response = await fetch(`tables/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            // Update current user data
            Object.assign(currentUser, formData);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('프로필이 업데이트되었습니다.', 'success');
        } else {
            throw new Error('프로필 업데이트 실패');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('프로필 업데이트에 실패했습니다.', 'error');
    }
}

// Update settings
function updateSettings() {
    const allowRegistration = document.getElementById('allow-registration').checked;
    const autoMatching = document.getElementById('auto-matching').checked;
    
    // Save settings to localStorage (in a real app, this would be saved to a server)
    const settings = {
        allowRegistration,
        autoMatching,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    showNotification('설정이 저장되었습니다.', 'success');
}

// Clear cache
function clearCache() {
    if (confirm('캐시를 정리하시겠습니까? 일부 데이터가 다시 로드될 수 있습니다.')) {
        // Clear relevant localStorage items
        const keysToKeep = ['currentUser', 'systemSettings'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        showNotification('캐시가 정리되었습니다.', 'success');
    }
}

// ======= ANNOUNCEMENTS MANAGEMENT =======

let allAnnouncements = [];
let selectedAnnouncement = null;

// Load announcements
async function loadAnnouncements(updateTable = true) {
    try {
        const response = await fetch('tables/announcements?limit=1000&sort=created_at');
        const data = await response.json();
        allAnnouncements = data.data || [];
        
        if (updateTable) {
            displayAnnouncements(allAnnouncements);
        }
    } catch (error) {
        console.error('Announcements loading error:', error);
        
        // API 실패시 데모 데이터 사용
        allAnnouncements = [
            {
                id: 'ann_001',
                title: '서비스 점검 안내',
                content: '시스템 업데이트를 위해 2024년 9월 20일 새벽 2시부터 4시까지 서비스가 일시 중단됩니다.',
                author_name: '관리자',
                priority: 'important',
                target_audience: 'all',
                is_pinned: true,
                is_published: true,
                view_count: 245,
                created_at: '2024-09-18T10:00:00Z'
            },
            {
                id: 'ann_002', 
                title: '새로운 피부관리 프로그램 출시',
                content: '안티에이징 전문 프로그램이 새롭게 추가되었습니다. 지금 신청해보세요!',
                author_name: '관리자',
                priority: 'normal',
                target_audience: 'customers',
                is_pinned: false,
                is_published: true,
                view_count: 89,
                created_at: '2024-09-17T14:30:00Z'
            }
        ];
        
        if (updateTable) {
            displayAnnouncements(allAnnouncements);
        }
    }
}

// Display announcements in table
function displayAnnouncements(announcements) {
    const tableBody = document.getElementById('announcements-table');
    
    if (announcements.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">등록된 공지사항이 없습니다.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = announcements.map(announcement => {
        const priorityColors = {
            'urgent': 'text-red-600 bg-red-100',
            'important': 'text-orange-600 bg-orange-100', 
            'normal': 'text-blue-600 bg-blue-100',
            'low': 'text-gray-600 bg-gray-100'
        };
        
        const priorityLabels = {
            'urgent': '긴급',
            'important': '중요',
            'normal': '일반',
            'low': '낮음'
        };
        
        const targetLabels = {
            'all': '전체',
            'customers': '고객',
            'shops': '업체',
            'admins': '관리자'
        };
        
        const status = announcement.is_published ? '게시중' : '임시저장';
        const statusColor = announcement.is_published ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        ${announcement.is_pinned ? '<i class="fas fa-thumbtack text-red-500 mr-2"></i>' : ''}
                        <div>
                            <div class="text-sm font-medium text-gray-900">${announcement.title}</div>
                            <div class="text-sm text-gray-500">${announcement.content.substring(0, 50)}...</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[announcement.priority]}">
                        ${priorityLabels[announcement.priority]}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${targetLabels[announcement.target_audience]}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                        ${status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formatDate(announcement.created_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${announcement.view_count || 0}회
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editAnnouncement('${announcement.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
                        수정
                    </button>
                    <button onclick="deleteAnnouncement('${announcement.id}')" class="text-red-600 hover:text-red-900">
                        삭제
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter announcements
function filterAnnouncements() {
    const filter = document.getElementById('announcement-filter').value;
    let filteredAnnouncements = allAnnouncements;
    
    if (filter === 'published') {
        filteredAnnouncements = allAnnouncements.filter(ann => ann.is_published);
    } else if (filter === 'draft') {
        filteredAnnouncements = allAnnouncements.filter(ann => !ann.is_published);
    } else if (filter === 'expired') {
        const now = new Date();
        filteredAnnouncements = allAnnouncements.filter(ann => 
            ann.expire_date && new Date(ann.expire_date) < now);
    }
    
    displayAnnouncements(filteredAnnouncements);
}

// Show announcement modal
function showAnnouncementModal(announcementId = null) {
    selectedAnnouncement = announcementId ? allAnnouncements.find(ann => ann.id === announcementId) : null;
    
    const modal = document.getElementById('announcement-modal');
    const form = document.getElementById('announcement-form');
    const title = document.getElementById('announcement-modal-title');
    
    if (selectedAnnouncement) {
        title.textContent = '공지사항 수정';
        fillAnnouncementForm(selectedAnnouncement);
    } else {
        title.textContent = '새 공지사항 작성';
        form.reset();
        // 기본값 설정
        document.getElementById('announcement-published').checked = true;
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('announcement-publish-date').value = now.toISOString().slice(0, 16);
    }
    
    modal.classList.remove('hidden');
}

// Close announcement modal
function closeAnnouncementModal() {
    document.getElementById('announcement-modal').classList.add('hidden');
    selectedAnnouncement = null;
}

// Fill announcement form with data
function fillAnnouncementForm(announcement) {
    document.getElementById('announcement-id').value = announcement.id;
    document.getElementById('announcement-title').value = announcement.title;
    document.getElementById('announcement-content').value = announcement.content;
    document.getElementById('announcement-priority').value = announcement.priority;
    document.getElementById('announcement-target').value = announcement.target_audience;
    document.getElementById('announcement-pinned').checked = announcement.is_pinned;
    document.getElementById('announcement-published').checked = announcement.is_published;
    
    if (announcement.publish_date) {
        const publishDate = new Date(announcement.publish_date);
        publishDate.setMinutes(publishDate.getMinutes() - publishDate.getTimezoneOffset());
        document.getElementById('announcement-publish-date').value = publishDate.toISOString().slice(0, 16);
    }
    
    if (announcement.expire_date) {
        const expireDate = new Date(announcement.expire_date);
        expireDate.setMinutes(expireDate.getMinutes() - expireDate.getTimezoneOffset());
        document.getElementById('announcement-expire-date').value = expireDate.toISOString().slice(0, 16);
    }
}

// Setup announcement form
function setupAnnouncementForm() {
    const form = document.getElementById('announcement-form');
    if (form) {
        form.addEventListener('submit', handleAnnouncementSubmit);
    }
}

// Handle announcement form submit
async function handleAnnouncementSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('announcement-submit-text');
    const originalText = submitText.textContent;
    
    submitBtn.disabled = true;
    submitText.textContent = '저장 중...';
    
    try {
        const formData = new FormData(e.target);
        const announcementData = {
            title: formData.get('title'),
            content: formData.get('content'),
            priority: formData.get('priority'),
            target_audience: formData.get('target_audience'),
            is_pinned: formData.get('is_pinned') === 'on',
            is_published: formData.get('is_published') === 'on',
            publish_date: formData.get('publish_date') ? new Date(formData.get('publish_date')).toISOString() : null,
            expire_date: formData.get('expire_date') ? new Date(formData.get('expire_date')).toISOString() : null,
            author_id: currentUser.id,
            author_name: currentUser.name,
            view_count: selectedAnnouncement ? selectedAnnouncement.view_count : 0
        };
        
        let response;
        if (selectedAnnouncement) {
            // 수정
            announcementData.updated_at = new Date().toISOString();
            response = await fetch(`tables/announcements/${selectedAnnouncement.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(announcementData)
            });
        } else {
            // 새로 작성
            announcementData.created_at = new Date().toISOString();
            response = await fetch('tables/announcements', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(announcementData)
            });
        }
        
        if (response.ok) {
            showNotification(selectedAnnouncement ? '공지사항이 수정되었습니다.' : '공지사항이 작성되었습니다.', 'success');
            closeAnnouncementModal();
            loadAnnouncements();
        } else {
            throw new Error('저장 실패');
        }
        
    } catch (error) {
        console.error('Announcement save error:', error);
        showNotification('저장 중 오류가 발생했습니다.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitText.textContent = originalText;
    }
}

// Edit announcement
function editAnnouncement(announcementId) {
    showAnnouncementModal(announcementId);
}

// Delete announcement
async function deleteAnnouncement(announcementId) {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`tables/announcements/${announcementId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('공지사항이 삭제되었습니다.', 'success');
            loadAnnouncements();
        } else {
            throw new Error('삭제 실패');
        }
    } catch (error) {
        console.error('Announcement delete error:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
    }
}

// Export data (placeholder)
function exportData() {
    showNotification('데이터 내보내기 기능은 준비중입니다.', 'info');
}

// Logout
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '어제';
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
        type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
        type === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
        'bg-blue-100 text-blue-700 border border-blue-300'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-lg leading-none">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Shop Edit Functions
function editShop(shopId) {
    const shop = allShops.find(s => s.id === shopId);
    if (!shop) {
        alert('샵 정보를 찾을 수 없습니다.');
        return;
    }
    
    // Fill form with shop data
    document.getElementById('edit-shop-id').value = shop.id;
    document.getElementById('edit-shop-name').value = shop.shop_name || shop.name || '';
    document.getElementById('edit-owner-name').value = shop.owner_name || '';
    document.getElementById('edit-phone').value = shop.phone || '';
    document.getElementById('edit-email').value = shop.email || '';
    document.getElementById('edit-business-number').value = shop.business_number || '';
    
    // v2.8.13.6.147: state 정규화 (줄임말 → 전체 이름)
    let state = shop.state || '';
    const stateMap = {
        '서울': '서울특별시',
        '부산': '부산광역시',
        '대구': '대구광역시',
        '인천': '인천광역시',
        '광주': '광주광역시',
        '대전': '대전광역시',
        '울산': '울산광역시',
        '세종': '세종특별자치시',
        '경기': '경기도',
        '강원': '강원특별자치도',
        '충북': '충청북도',
        '충남': '충청남도',
        '전북': '전북특별자치도',
        '전남': '전라남도',
        '경북': '경상북도',
        '경남': '경상남도',
        '제주': '제주특별자치도'
    };
    
    // 줄임말이면 전체 이름으로 변환
    if (stateMap[state]) {
        state = stateMap[state];
        console.log('🗺️ 시/도 정규화:', { original: shop.state, normalized: state });
    }
    
    // v2.8.13.6.146: 주소에서 district 자동 추출 (개선)
    let district = shop.district || '';
    let town = shop.town || '';
    
    // district가 없으면 주소에서 추출
    if (!district && shop.address) {
        // 패턴 1: 시/도 + 구/군 + 읍/면/동
        let addressMatch = shop.address.match(/^([가-힣]+특별시|[가-힣]+광역시|[가-힣]+특별자치시|[가-힣]+도)\s+([가-힣]+구|[가-힣]+군|[가-힣]+시)\s+([가-힣]+동|[가-힣]+읍|[가-힣]+면)/);
        
        if (addressMatch) {
            district = addressMatch[2];  // 구/군
            town = addressMatch[3];  // 읍/면/동
            console.log('📍 주소에서 추출 (패턴1):', { district, town, address: shop.address });
        } else {
            // 패턴 2: 시/도 + 구/군 (읍/면/동 없음)
            addressMatch = shop.address.match(/^([가-힣]+특별시|[가-힣]+광역시|[가-힣]+특별자치시|[가-힣]+도)\s+([가-힣]+구|[가-힣]+군|[가-힣]+시)/);
            
            if (addressMatch) {
                district = addressMatch[2];  // 구/군
                console.log('📍 주소에서 추출 (패턴2):', { district, address: shop.address });
            }
        }
    }
    
    console.log('🏪 샵 수정 데이터:', { 
        shopId: shop.id,
        name: shop.name,
        state_original: shop.state,
        state_normalized: state,
        district_original: shop.district,
        district_extracted: district,
        address: shop.address
    });
    
    // 시/도 설정 (정규화된 값 사용)
    document.getElementById('edit-state').value = state;
    
    // 시/도 값이 DOM에 반영될 때까지 대기
    setTimeout(() => {
        updateDistricts();  // 시/도 설정 후 구/군 옵션 생성
        
        // 구/군 값 설정 (옵션 생성 후)
        setTimeout(() => {
            const districtSelect = document.getElementById('edit-district');
            if (districtSelect && district) {
                districtSelect.value = district;
                console.log('✅ 구/군 설정:', district);
                updateTowns();  // 구/군 설정 후 읍/면/동 업데이트
                
                // 읍/면/동 설정
                if (town) {
                    setTimeout(() => {
                        const townSelect = document.getElementById('edit-town');
                        if (townSelect) {
                            townSelect.value = town;
                            console.log('✅ 읍/면/동 설정:', town);
                        }
                    }, 100);
                }
            } else {
                console.warn('⚠️ 구/군을 설정할 수 없음:', { district, hasSelect: !!districtSelect });
            }
        }, 100);
    }, 50);
    
    document.getElementById('edit-address').value = shop.address || '';
    document.getElementById('edit-price-range').value = shop.price_range || '';
    document.getElementById('edit-description').value = shop.description || '';
    
    // Handle treatment types
    const treatmentCheckboxes = document.querySelectorAll('.edit-treatment-checkbox');
    treatmentCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    if (shop.treatment_types) {
        const treatments = Array.isArray(shop.treatment_types) ? shop.treatment_types : 
                         typeof shop.treatment_types === 'string' ? shop.treatment_types.split(',').map(t => t.trim()) : [];
        
        treatmentCheckboxes.forEach(checkbox => {
            if (treatments.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
    }
    
    // 이벤트 리스너 추가 (중복 방지)
    const stateSelect = document.getElementById('edit-state');
    const districtSelect = document.getElementById('edit-district');
    
    if (stateSelect && !stateSelect.dataset.listenerAdded) {
        stateSelect.addEventListener('change', updateDistricts);
        stateSelect.dataset.listenerAdded = 'true';
        console.log('✅ 시/도 변경 이벤트 리스너 추가');
    }
    
    if (districtSelect && !districtSelect.dataset.listenerAdded) {
        districtSelect.addEventListener('change', updateTowns);
        districtSelect.dataset.listenerAdded = 'true';
        console.log('✅ 구/군 변경 이벤트 리스너 추가');
    }
    
    // Show modal
    document.getElementById('shop-edit-modal').classList.remove('hidden');
}

function closeShopEditModal() {
    document.getElementById('shop-edit-modal').classList.add('hidden');
}

// 구/군 드롭다운 업데이트 함수
function updateDistricts() {
    const stateSelect = document.getElementById('edit-state');
    const districtSelect = document.getElementById('edit-district');
    const townSelect = document.getElementById('edit-town');
    
    if (!stateSelect || !districtSelect) {
        console.warn('⚠️ 구/군 업데이트: 필수 요소를 찾을 수 없습니다');
        return;
    }
    
    const state = stateSelect.value;
    
    console.log('🏙️ 구/군 업데이트 시작:', { 
        state, 
        stateSelectValue: stateSelect.value,
        hasKoreaTownData: typeof KOREA_TOWN_DATA !== 'undefined',
        stateKeys: typeof KOREA_TOWN_DATA !== 'undefined' ? Object.keys(KOREA_TOWN_DATA).slice(0, 5) : []
    });
    
    // 구/군 초기화
    districtSelect.innerHTML = '<option value="">선택하세요</option>';
    
    // 읍/면/동 초기화 및 비활성화
    if (townSelect) {
        townSelect.innerHTML = '<option value="">선택하세요</option>';
        townSelect.disabled = true;
    }
    
    // 시/도가 비어있으면 비활성화
    if (!state) {
        districtSelect.disabled = true;
        console.log('⚠️ 시/도가 비어있어 구/군 비활성화');
        return;
    }
    
    // KOREA_TOWN_DATA가 로드되었는지 확인
    if (typeof KOREA_TOWN_DATA === 'undefined') {
        console.error('❌ KOREA_TOWN_DATA가 로드되지 않았습니다');
        districtSelect.disabled = true;
        return;
    }
    
    // 해당 시/도의 구/군 데이터 가져오기
    const stateData = KOREA_TOWN_DATA[state];
    if (!stateData) {
        console.warn('⚠️ 해당 시/도의 데이터가 없습니다:', state);
        districtSelect.disabled = true;
        return;
    }
    
    // 구/군 옵션 추가
    const districts = Object.keys(stateData);
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
    
    // 드롭다운 활성화
    districtSelect.disabled = false;
    console.log(`✅ ${state}의 구/군 ${districts.length}개 로드 완료`);
}

// 읍/면/동 드롭다운 업데이트 함수
function updateTowns() {
    const stateSelect = document.getElementById('edit-state');
    const districtSelect = document.getElementById('edit-district');
    const townSelect = document.getElementById('edit-town');
    
    if (!stateSelect || !districtSelect || !townSelect) {
        console.warn('⚠️ 읍/면/동 업데이트: 필수 요소를 찾을 수 없습니다');
        return;
    }
    
    const state = stateSelect.value;
    const district = districtSelect.value;  // ✅ 수정: .value.trim() → .value (select는 trim 불필요)
    
    console.log('🏘️ 읍/면/동 업데이트:', { state, district });
    
    // 초기화
    townSelect.innerHTML = '<option value="">선택하세요</option>';
    
    // 시/도 또는 구/군이 비어있으면 비활성화
    if (!state || !district) {
        townSelect.disabled = true;
        console.log('⚠️ 시/도 또는 구/군이 비어있어 읍/면/동 비활성화');
        return;
    }
    
    // KOREA_TOWN_DATA가 로드되었는지 확인
    if (typeof KOREA_TOWN_DATA === 'undefined') {
        console.error('❌ KOREA_TOWN_DATA가 로드되지 않았습니다');
        townSelect.disabled = true;
        return;
    }
    
    // 해당 시/도의 읍/면/동 데이터 가져오기
    const stateData = KOREA_TOWN_DATA[state];
    if (!stateData) {
        console.warn('⚠️ 해당 시/도의 데이터가 없습니다:', state);
        townSelect.disabled = true;
        return;
    }
    
    // 해당 구/군의 읍/면/동 데이터 가져오기
    const towns = stateData[district];
    if (!towns || towns.length === 0) {
        console.warn('⚠️ 해당 구/군의 읍/면/동 데이터가 없습니다:', district);
        townSelect.disabled = true;
        return;
    }
    
    // 읍/면/동 옵션 추가
    towns.forEach(town => {
        const option = document.createElement('option');
        option.value = town;
        option.textContent = town;
        townSelect.appendChild(option);
    });
    
    // 드롭다운 활성화
    townSelect.disabled = false;
    console.log(`✅ ${district}의 읍/면/동 ${towns.length}개 로드 완료`);
}

async function saveShopChanges() {
    const shopId = document.getElementById('edit-shop-id').value;
    
    if (!shopId) {
        alert('샵 ID를 찾을 수 없습니다.');
        return;
    }
    
    console.log('💾 샵 정보 저장 시작:', shopId);
    
    // Collect treatment types
    const selectedTreatments = [];
    document.querySelectorAll('.edit-treatment-checkbox:checked').forEach(checkbox => {
        selectedTreatments.push(checkbox.value);
    });
    
    const updatedData = {
        name: document.getElementById('edit-shop-name').value || '',
        owner_name: document.getElementById('edit-owner-name').value || '',
        phone: document.getElementById('edit-phone').value || '',
        email: document.getElementById('edit-email').value || '',
        business_number: document.getElementById('edit-business-number').value || '',
        state: document.getElementById('edit-state').value || '',
        district: document.getElementById('edit-district').value || '',
        town: document.getElementById('edit-town')?.value || '',
        address: document.getElementById('edit-address').value || '',
        representative_treatments: selectedTreatments.join(','),  // ✅ 배열을 문자열로 변환
        price_range: document.getElementById('edit-price-range').value || '',
        description: document.getElementById('edit-description').value || ''
    };
    
    console.log('📤 전송 데이터:', updatedData);
    console.log('📤 업체명 필드 상세 확인:');
    console.log('  - edit-shop-name 요소:', document.getElementById('edit-shop-name'));
    console.log('  - edit-shop-name 값:', document.getElementById('edit-shop-name')?.value);
    console.log('  - updatedData.name:', updatedData.name);
    console.log('📤 전송 URL:', `tables/skincare_shops/${shopId}`);
    console.log('📤 전송 Method:', 'PUT');
    console.log('📤 전송 필드 수:', Object.keys(updatedData).length);
    
    try {
        const response = await fetch(`tables/skincare_shops/${shopId}`, {
            method: 'PATCH',  // ✅ 수정: PATCH 사용 (부분 업데이트)
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
        });
        
        console.log('📡 응답 상태:', response.status);
        console.log('📡 응답 헤더:', [...response.headers.entries()]);
        
        if (response.ok) {
            const updatedShop = await response.json();
            console.log('✅ 샵 정보 업데이트 완료:', updatedShop);
            console.log('✅ 업데이트된 필드 확인:');
            console.log('  - name:', updatedShop.name);
            console.log('  - owner_name:', updatedShop.owner_name);
            console.log('  - phone:', updatedShop.phone);
            console.log('  - updated_at:', updatedShop.updated_at);
            
            showNotification('샵 정보가 성공적으로 수정되었습니다.', 'success');
            closeShopEditModal();
            
            console.log('🔄 샵 목록 새로고침 시작...');
            await loadShops(); // Reload shops table
            console.log('✅ 샵 목록 새로고침 완료');
        } else {
            const errorText = await response.text();
            console.error('❌ 업데이트 실패:', response.status, errorText);
            throw new Error(`업데이트 실패 (${response.status}): ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Shop update error:', error);
        showNotification('샵 정보 수정 중 오류가 발생했습니다: ' + error.message, 'error');
    }
}

// Delete shop function (Soft Delete)
async function deleteShop(shopId) {
    const shop = allShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('샵 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 확인 대화상자
    const confirmMessage = `정말로 '${shop.shop_name}' 샵을 삭제하시겠습니까?\n\n※ 소프트 삭제: 데이터는 보관되며 복구 가능합니다.`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        console.log('🗑️ 샵 Soft Delete 요청:', shopId);
        
        // Soft Delete: deleted 플래그를 true로 설정
        const updatedShop = {
            ...shop,
            deleted: true,
            status: 'deleted',
            updated_at: Date.now()
        };
        
        const response = await fetch(`tables/skincare_shops/${shopId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedShop)
        });
        
        console.log('📡 Soft Delete 응답 상태:', response.status);
        
        if (response.ok) {
            showNotification('샵이 성공적으로 삭제되었습니다.', 'success');
            console.log('✅ 샵 Soft Delete 성공, 테이블 새로고침 중...');
            await loadShops();
        } else {
            const errorData = await response.text();
            console.error('❌ Soft Delete 실패 응답:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }
    } catch (error) {
        console.error('Shop soft deletion error:', error);
        showNotification('샵 삭제에 실패했습니다: ' + error.message, 'error');
    }
}

// Setup shop filters and search
function setupShopFilters() {
    const searchInput = document.getElementById('shop-search');
    const regionFilter = document.getElementById('shop-region-filter');
    const statusFilter = document.getElementById('shop-status-filter');
    
    // Add event listeners for real-time filtering
    if (searchInput) {
        searchInput.addEventListener('input', filterShops);
    }
    if (regionFilter) {
        regionFilter.addEventListener('change', filterShops);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterShops);
    }
}

// Filter shops based on search and filters
function filterShops() {
    // 서버 측 필터링 사용 - loadShops() 재호출
    console.log('🔍 필터 변경 감지 - 서버에서 재검색');
    loadShops(true);
}

// Update filter results display
function updateShopFilterResults(filtered, total) {
    const existingCounter = document.getElementById('shop-filter-results');
    if (existingCounter) {
        existingCounter.remove();
    }
    
    if (filtered !== total) {
        const shopsSection = document.getElementById('shops-section');
        const counter = document.createElement('div');
        counter.id = 'shop-filter-results';
        counter.className = 'mb-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-2';
        counter.innerHTML = `<i class="fas fa-filter mr-2"></i>검색 결과: ${filtered}개 (전체 ${total}개 중)`;
        
        const table = shopsSection.querySelector('.unni-card');
        shopsSection.insertBefore(counter, table);
    }
}

// Clear all shop filters
function clearShopFilters() {
    document.getElementById('shop-search').value = '';
    document.getElementById('shop-region-filter').value = '';
    document.getElementById('shop-status-filter').value = '';
    document.getElementById('shop-type-filter').value = ''; // v2.8.13.6.140: 샵 타입 필터 초기화 추가
    
    // Remove results counter
    const existingCounter = document.getElementById('shop-filter-results');
    if (existingCounter) {
        existingCounter.remove();
    }
    
    // 서버에서 전체 데이터 다시 로딩 - v2.8.13.6.136
    console.log('🔄 필터 초기화 - 전체 데이터 로딩');
    loadShops(true);
}

// Toggle representative shop status
async function toggleRepresentativeStatus(shopId, setAsRepresentative) {
    try {
        // 샵 정보 찾기
        const shop = allShops.find(s => s.id === shopId);
        if (!shop) {
            alert('샵 정보를 찾을 수 없습니다.');
            return;
        }
        
        // 지역 정보 확인
        const state = shop.state;
        const district = shop.district;
        
        if (!state || !district) {
            alert('샵의 지역 정보가 없습니다. 샵 정보를 먼저 수정해주세요.');
            return;
        }
        
        if (setAsRepresentative) {
            // 대표샵으로 지정
            const confirmMsg = `${shop.name}을(를) ${state} ${district}의 대표샵으로 지정하시겠습니까?\n\n대표샵으로 지정되면:\n- 해당 지역 메인 페이지에서 전화상담 버튼으로 노출됩니다\n- 고객이 바로 전화 상담할 수 있습니다`;
            
            if (!confirm(confirmMsg)) {
                return;
            }
            
            // 해당 지역에 이미 대표샵이 있는지 확인
            const existingRep = allShops.find(s => 
                s.state === state && 
                s.district === district && 
                s.is_representative === true && 
                s.id !== shopId
            );
            
            if (existingRep) {
                if (!confirm(`${state} ${district}에는 이미 대표샵 "${existingRep.name}"이(가) 있습니다.\n기존 대표샵을 해제하고 새로 지정하시겠습니까?`)) {
                    return;
                }
                
                // 기존 대표샵 해제
                await updateShopRepresentativeStatus(existingRep.id, false);
            }
            
            // 새로운 대표샵 지정
            await updateShopRepresentativeStatus(shopId, true);
            
        } else {
            // 대표샵 해제
            if (!confirm(`${shop.name}의 대표샵 지정을 해제하시겠습니까?`)) {
                return;
            }
            
            await updateShopRepresentativeStatus(shopId, false);
        }
        
        // 목록 새로고침
        await refreshShops();
        
    } catch (error) {
        console.error('Representative status toggle error:', error);
        alert('대표샵 상태 변경 중 오류가 발생했습니다.');
    }
}

// Update shop representative status via API
async function updateShopRepresentativeStatus(shopId, isRepresentative) {
    try {
        const updateData = {
            is_representative: isRepresentative,
            representative_status: isRepresentative ? 'approved' : 'none',
            representative_approved_at: isRepresentative ? new Date().toISOString() : null
        };
        
        const response = await fetch(`tables/skincare_shops/${shopId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Representative status updated:', result);
        
        // 로컬 데이터 업데이트
        const shopIndex = allShops.findIndex(s => s.id === shopId);
        if (shopIndex !== -1) {
            allShops[shopIndex] = { ...allShops[shopIndex], ...updateData };
        }
        
        alert(isRepresentative ? '대표샵으로 지정되었습니다.' : '대표샵 지정이 해제되었습니다.');
        
    } catch (error) {
        console.error('Representative status update error:', error);
        
        // API 실패 시 로컬 업데이트
        const shopIndex = allShops.findIndex(s => s.id === shopId);
        if (shopIndex !== -1) {
            allShops[shopIndex].is_representative = isRepresentative;
            allShops[shopIndex].representative_status = isRepresentative ? 'approved' : 'none';
            displayShops(allShops);
            alert(isRepresentative ? '대표샵으로 지정되었습니다 (로컬).' : '대표샵 지정이 해제되었습니다 (로컬).');
        } else {
            throw error;
        }
    }
}

// ======= NEW SHOP REGISTRATION MODAL =======

// Open new shop registration modal
function openNewShopModal() {
    const modal = document.getElementById('new-shop-modal');
    const form = document.getElementById('new-shop-form');
    
    // Reset form
    form.reset();
    
    // Show modal
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    
    console.log('New shop modal opened');
}

// Close new shop registration modal
function closeNewShopModal() {
    const modal = document.getElementById('new-shop-modal');
    const form = document.getElementById('new-shop-form');
    
    // Reset form
    form.reset();
    
    // Hide modal
    modal.style.display = 'none';
    modal.classList.add('hidden');
    
    console.log('New shop modal closed');
}

// Handle new shop form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('new-shop-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                // Get form data
                const shopName = document.getElementById('new-shop-name').value.trim();
                const ownerName = document.getElementById('new-shop-owner').value.trim();
                const phone = document.getElementById('new-shop-phone').value.trim();
                const email = document.getElementById('new-shop-email').value.trim();
                const password = document.getElementById('new-shop-password').value;
                const state = document.getElementById('new-shop-state').value;
                const district = document.getElementById('new-shop-district').value.trim();
                const address = document.getElementById('new-shop-address').value.trim();
                const businessNumber = document.getElementById('new-shop-business-number').value.trim();
                const licenseNumber = document.getElementById('new-shop-license-number').value.trim();
                const naverCafeId = document.getElementById('new-shop-naver-id').value.trim();
                
                // Validation
                if (!shopName || !ownerName || !phone || !email || !password || !state || !district || !address || !businessNumber) {
                    alert('필수 항목을 모두 입력해주세요.');
                    return;
                }
                
                if (password.length < 8) {
                    alert('비밀번호는 최소 8자 이상이어야 합니다.');
                    return;
                }
                
                // Show loading
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.dataset.originalText = originalBtnText; // 데이터 속성에 저장
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>등록 중...';
                
                console.log('Creating new shop account...');
                
                // 중복 이메일 체크
                try {
                    const checkResponse = await fetch(`tables/users?limit=1000`);
                    const checkData = await checkResponse.json();
                    const existingUser = checkData.data.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
                    
                    if (existingUser) {
                        alert('이미 등록된 이메일입니다. 다른 이메일을 사용해주세요.');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                        return;
                    }
                } catch (checkError) {
                    console.warn('이메일 중복 체크 실패:', checkError);
                }
                
                // Step 1: Create user account
                const userData = {
                    email: email,
                    password: password,
                    name: ownerName,
                    phone: phone,
                    user_type: 'shop'
                };
                
                const userResponse = await fetch('tables/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                
                if (!userResponse.ok) {
                    const errorText = await userResponse.text();
                    throw new Error(`사용자 계정 생성 실패: ${errorText}`);
                }
                
                const newUser = await userResponse.json();
                console.log('User created:', newUser);
                
                // Step 2: Create shop
                const shopData = {
                    name: shopName,
                    owner_name: ownerName,
                    phone: phone,
                    email: email,
                    state: state,
                    district: district,
                    address: address,
                    business_number: businessNumber,
                    business_license: licenseNumber || null,
                    status: 'pending'
                };
                
                const shopResponse = await fetch('tables/skincare_shops', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shopData)
                });
                
                if (!shopResponse.ok) {
                    const errorText = await shopResponse.text();
                    throw new Error(`업체 등록 실패: ${errorText}`);
                }
                
                const newShop = await shopResponse.json();
                console.log('Shop created:', newShop);
                
                // Step 3: Link user to shop
                const linkResponse = await fetch(`/tables/users/${newUser.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shop_id: newShop.id })
                });
                
                if (!linkResponse.ok) {
                    console.warn('User-shop linking failed, but registration completed');
                }
                
                console.log('✅ Shop registration completed successfully');
                
                // Success!
                alert(`업체 등록이 완료되었습니다!\n\n업체명: ${shopName}\n이메일: ${email}\n승인 상태: 대기중`);
                
                // Close modal
                closeNewShopModal();
                
                // Reload dashboard data
                try {
                    console.log('📊 대시보드 데이터 새로고침 중...');
                    await loadDashboardData();
                    console.log('✅ 대시보드 데이터 새로고침 완료');
                } catch (loadError) {
                    console.error('❌ 대시보드 데이터 로드 실패:', loadError);
                }
                
                try {
                    console.log('🏪 업체 목록 새로고침 중...');
                    await loadShops();
                    console.log('✅ 업체 목록 새로고침 완료');
                } catch (shopsError) {
                    console.error('❌ 업체 목록 로드 실패:', shopsError);
                }
                
                // Show notification
                showNotification('새 업체가 등록되었습니다.', 'success');
                
            } catch (error) {
                console.error('❌ Shop registration error:', error);
                console.error('❌ Error stack:', error.stack);
                alert('업체 등록 중 오류가 발생했습니다:\n' + error.message);
                
                // Restore button
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    // originalBtnText가 정의되어 있을 때만 복원
                    if (typeof submitBtn.dataset.originalText !== 'undefined') {
                        submitBtn.innerHTML = submitBtn.dataset.originalText;
                    } else {
                        submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>업체 등록';
                    }
                }
            }
        });
    }
});

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('new-shop-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeNewShopModal();
            }
        });
    }
});

// 🗺️ 신규 샵 등록 모달용 updateDistricts 함수 (v2.8.13.6.115)
function updateDistricts() {
    const stateSelect = document.getElementById('new-shop-state');
    const districtSelect = document.getElementById('new-shop-district');
    
    if (!stateSelect || !districtSelect) {
        console.error('State or district select not found');
        return;
    }
    
    const selectedState = stateSelect.value;
    
    console.log('🗺️ updateDistricts 호출 (신규 샵 등록):', selectedState);
    
    // 구/군 초기화
    districtSelect.innerHTML = '<option value="">선택하세요</option>';
    
    // KOREA_TOWN_DATA 사용
    if (selectedState && typeof KOREA_TOWN_DATA !== 'undefined' && KOREA_TOWN_DATA[selectedState]) {
        const districts = Object.keys(KOREA_TOWN_DATA[selectedState]);
        console.log(`✅ ${selectedState} 구/군 ${districts.length}개 로드`);
        
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
    } else {
        console.log('⚠️ 시/도가 선택되지 않음 또는 데이터 없음');
        districtSelect.disabled = true;
    }
}

// Make updateDistricts globally accessible
window.updateDistricts = updateDistricts;

// Close modal on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('new-shop-modal');
        if (modal && !modal.classList.contains('hidden')) {
            closeNewShopModal();
        }
    }
});

// ======= RECENT MEMBERS DISPLAY =======

// Load recent members for dashboard
async function loadRecentMembers() {
    try {
        console.log('Loading recent members...');
        
        // Fetch recent 5 users sorted by creation date
        const response = await fetch('tables/users?limit=5&sort=-created_at');
        
        if (!response.ok) {
            throw new Error('Failed to fetch recent members');
        }
        
        const result = await response.json();
        const recentUsers = result.data || [];
        
        console.log('Recent members loaded:', recentUsers.length);
        
        // Display recent members
        displayRecentMembers(recentUsers);
        
    } catch (error) {
        console.error('Recent members loading error:', error);
        
        // Fallback: Use local data if API fails
        if (allUsers && allUsers.length > 0) {
            const sortedUsers = [...allUsers].sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            });
            const recentUsers = sortedUsers.slice(0, 5);
            displayRecentMembers(recentUsers);
            console.log('Using local data for recent members');
        } else {
            // Show empty state
            const container = document.getElementById('recent-members');
            if (container) {
                container.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">최근 가입자가 없습니다.</p>';
            }
        }
    }
}

// Display recent members in the dashboard
function displayRecentMembers(users) {
    const container = document.getElementById('recent-members');
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">최근 가입자가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = users.map(user => {
        const userTypeLabels = {
            'customer': '고객',
            'shop': '업체',
            'admin': '관리자'
        };
        
        const userTypeColors = {
            'customer': 'bg-blue-100 text-blue-800',
            'shop': 'bg-green-100 text-green-800',
            'admin': 'bg-purple-100 text-purple-800'
        };
        
        const userType = user.user_type || 'customer';
        const userName = user.name || user.email || 'Unknown';
        const userEmail = user.email || '';
        const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '날짜 미상';
        
        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onclick="showSection('users')">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-gray-900">${userName}</span>
                        <span class="text-xs px-2 py-1 rounded-full ${userTypeColors[userType]}">${userTypeLabels[userType]}</span>
                    </div>
                    <p class="text-xs text-gray-500">${userEmail}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-500">${createdDate}</p>
                </div>
            </div>
        `;
    }).join('');
}