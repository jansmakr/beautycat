// Admin Dashboard JavaScript (auth.js에서 정의된 currentUser를 사용)
let currentSection = 'dashboard';
let allUsers = [];
let allShops = [];
let allConsultations = [];
let selectedUser = null;

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

// Check admin authentication  
function checkAdminAuth() {
    // 관리자 인증 확인 (비밀번호 5874로 로그인한 경우)
    const adminAuth = localStorage.getItem('adminAuth');
    const adminLoginTime = localStorage.getItem('adminLoginTime');
    
    // 24시간 세션 유지 (24 * 60 * 60 * 1000 = 86400000ms)
    const sessionExpiry = 24 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    
    if (adminAuth === 'true' && adminLoginTime && (currentTime - parseInt(adminLoginTime)) < sessionExpiry) {
        // 관리자 세션 유효
        currentUser = {
            id: 'admin_5874',
            email: 'admin@beautycat.com',
            name: 'beautycat 관리자',
            user_type: 'admin'
        };
        console.log('관리자 인증 성공');
    } else {
        // 세션이 없거나 만료됨
        alert('관리자 권한이 필요합니다. 로그인 페이지로 이동합니다.');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'index.html';
        return;
    }
    
    // Display admin name
    const adminNameElement = document.getElementById('admin-name');
    if (adminNameElement) {
        adminNameElement.textContent = currentUser.name || '관리자';
    }
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
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        currentSection = sectionName;
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'users':
            loadUsers();
            break;
        case 'shops':
            loadShops();
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
    }
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
        const response = await fetch('tables/users?limit=1000&sort=created_at');
        const data = await response.json();
        allUsers = data.data || [];
        
        if (updateTable) {
            displayUsers(allUsers);
        }
    } catch (error) {
        console.error('Users loading error:', error);
        
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
    const tableBody = document.getElementById('users-table');
    
    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">등록된 사용자가 없습니다.</td></tr>';
        return;
    }
    
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
                    <button onclick="editUser('${user.id}')" class="text-green-600 hover:text-green-900">
                        수정
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

// Load shops
async function loadShops(updateTable = true) {
    try {
        const response = await fetch('tables/skincare_shops?limit=1000&sort=created_at');
        const data = await response.json();
        allShops = data.data || [];
        
        if (updateTable) {
            displayShops(allShops);
        }
    } catch (error) {
        console.error('Shops loading error:', error);
        
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

// Display shops in table
function displayShops(shops) {
    const tableBody = document.getElementById('shops-table');
    
    if (shops.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">등록된 업체가 없습니다.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = shops.map(shop => {
        const status = shop.status || 'active';
        const statusColors = {
            'active': 'text-green-600 bg-green-100',
            'inactive': 'text-red-600 bg-red-100',
            'pending': 'text-yellow-600 bg-yellow-100'
        };
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${shop.shop_name}</div>
                    <div class="text-sm text-gray-500">${shop.owner_name || shop.name || '-'}</div>
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

// Edit user (placeholder)
function editUser(userId) {
    showNotification('사용자 편집 기능은 준비중입니다.', 'info');
}

// View shop (placeholder)
function viewShop(shopId) {
    const shop = allShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('샵 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // Fill view modal with shop data
    document.getElementById('view-shop-name').textContent = shop.shop_name || '-';
    document.getElementById('view-owner-name').textContent = shop.owner_name || shop.name || '-';
    document.getElementById('view-phone').textContent = shop.phone || '-';
    document.getElementById('view-email').textContent = shop.email || '-';
    document.getElementById('view-business-number').textContent = shop.business_number || '-';
    document.getElementById('view-license-number').textContent = shop.business_license_number || '-';
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
        const response = await fetch(`tables/skincare_shops/${shopId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'active' })
        });
        
        if (response.ok) {
            showNotification('피부관리실의 플랫폼 입점이 승인되었습니다.', 'success');
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
    
    // Fill view modal with consultation data
    document.getElementById('view-consultation-name').textContent = consultation.name || '-';
    document.getElementById('view-consultation-age').textContent = consultation.age || '-';
    document.getElementById('view-consultation-phone').textContent = consultation.phone || '-';
    document.getElementById('view-consultation-gender').textContent = consultation.gender === 'male' ? '남성' : consultation.gender === 'female' ? '여성' : consultation.gender || '-';
    document.getElementById('view-consultation-region').textContent = consultation.region || consultation.location || '-';
    document.getElementById('view-consultation-detailed-region').textContent = consultation.detailed_region || consultation.detailed_location || '-';
    document.getElementById('view-consultation-skin-type').textContent = consultation.skin_type || '-';
    document.getElementById('view-consultation-budget').textContent = consultation.budget || '-';
    document.getElementById('view-consultation-frequency').textContent = consultation.frequency || '-';
    document.getElementById('view-consultation-additional').textContent = consultation.additional_requests || consultation.message || '-';
    document.getElementById('view-consultation-created-at').textContent = formatDate(consultation.created_at) || '-';
    document.getElementById('view-consultation-updated-at').textContent = formatDate(consultation.updated_at) || '-';
    
    // Handle treatment types
    const treatments = consultation.treatment_types || consultation.interested_treatments;
    let treatmentText = '-';
    if (treatments) {
        if (Array.isArray(treatments)) {
            treatmentText = treatments.join(', ');
        } else if (typeof treatments === 'string') {
            treatmentText = treatments;
        }
    }
    document.getElementById('view-consultation-treatments').textContent = treatmentText;
    
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
    statusBadge.className = `px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`;
    
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
                        <div class="font-medium text-gray-900">${shop.shop_name}</div>
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
    document.getElementById('consultation-view-modal').setAttribute('data-consultation-id', consultationId);
    
    // Show modal
    document.getElementById('consultation-view-modal').classList.remove('hidden');
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
                    <div class="text-sm font-medium text-gray-900">${shop.shop_name}</div>
                    <div class="text-sm text-gray-500">ID: ${shop.id}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${shop.state} ${shop.district}
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
    document.getElementById('edit-shop-name').value = shop.shop_name || '';
    document.getElementById('edit-owner-name').value = shop.owner_name || '';
    document.getElementById('edit-phone').value = shop.phone || '';
    document.getElementById('edit-email').value = shop.email || '';
    document.getElementById('edit-business-number').value = shop.business_number || '';
    document.getElementById('edit-state').value = shop.state || '';
    document.getElementById('edit-district').value = shop.district || '';
    document.getElementById('edit-status').value = shop.status || 'pending';
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
    
    // Show modal
    document.getElementById('shop-edit-modal').classList.remove('hidden');
}

function closeShopEditModal() {
    document.getElementById('shop-edit-modal').classList.add('hidden');
}

async function saveShopChanges() {
    const shopId = document.getElementById('edit-shop-id').value;
    
    // Collect treatment types
    const selectedTreatments = [];
    document.querySelectorAll('.edit-treatment-checkbox:checked').forEach(checkbox => {
        selectedTreatments.push(checkbox.value);
    });
    
    const updatedData = {
        shop_name: document.getElementById('edit-shop-name').value,
        owner_name: document.getElementById('edit-owner-name').value,
        phone: document.getElementById('edit-phone').value,
        email: document.getElementById('edit-email').value,
        business_number: document.getElementById('edit-business-number').value,
        state: document.getElementById('edit-state').value,
        district: document.getElementById('edit-district').value,
        address: document.getElementById('edit-address').value,
        treatment_types: selectedTreatments,
        price_range: document.getElementById('edit-price-range').value,
        description: document.getElementById('edit-description').value,
        status: document.getElementById('edit-status').value,
        updated_at: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`tables/skincare_shops/${shopId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
        });
        
        if (response.ok) {
            alert('샵 정보가 성공적으로 수정되었습니다.');
            closeShopEditModal();
            refreshShops(); // Reload shops table
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Shop update error:', error);
        
        // 로컬 데이터 업데이트 (API 실패시)
        const shopIndex = allShops.findIndex(s => s.id === shopId);
        if (shopIndex !== -1) {
            allShops[shopIndex] = { ...allShops[shopIndex], ...updatedData };
            displayShops(allShops);
            closeShopEditModal();
            alert('샵 정보가 로컬에서 업데이트되었습니다. (API 연결 필요)');
        } else {
            alert('샵 정보 수정에 실패했습니다.');
        }
    }
}

// Delete shop function
async function deleteShop(shopId) {
    const shop = allShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('샵 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 확인 대화상자
    const confirmMessage = `정말로 '${shop.shop_name}' 샵을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        const response = await fetch(`tables/skincare_shops/${shopId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok || response.status === 204) {
            showNotification('샵이 성공적으로 삭제되었습니다.', 'success');
            refreshShops(); // Reload shops table
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Shop deletion error:', error);
        
        // API 실패시 로컬 데이터에서 제거
        const shopIndex = allShops.findIndex(s => s.id === shopId);
        if (shopIndex !== -1) {
            allShops.splice(shopIndex, 1);
            displayShops(allShops);
            showNotification('샵이 로컬에서 삭제되었습니다. (API 연결 필요)', 'warning');
        } else {
            showNotification('샵 삭제에 실패했습니다.', 'error');
        }
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
    const searchTerm = document.getElementById('shop-search')?.value.toLowerCase() || '';
    const regionFilter = document.getElementById('shop-region-filter')?.value || '';
    const statusFilter = document.getElementById('shop-status-filter')?.value || '';
    
    let filteredShops = allShops.filter(shop => {
        // Search filter
        const matchesSearch = !searchTerm || 
            (shop.shop_name && shop.shop_name.toLowerCase().includes(searchTerm)) ||
            (shop.owner_name && shop.owner_name.toLowerCase().includes(searchTerm)) ||
            (shop.name && shop.name.toLowerCase().includes(searchTerm)) ||
            (shop.email && shop.email.toLowerCase().includes(searchTerm)) ||
            (shop.business_number && shop.business_number.includes(searchTerm));
        
        // Region filter
        const matchesRegion = !regionFilter || 
            (shop.state && shop.state === regionFilter) ||
            (shop.shop_state && shop.shop_state === regionFilter) ||
            (shop.region && shop.region.includes(regionFilter));
        
        // Status filter
        const matchesStatus = !statusFilter || 
            (shop.status === statusFilter);
        
        return matchesSearch && matchesRegion && matchesStatus;
    });
    
    displayShops(filteredShops);
    
    // Update results count
    updateShopFilterResults(filteredShops.length, allShops.length);
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
    
    // Remove results counter
    const existingCounter = document.getElementById('shop-filter-results');
    if (existingCounter) {
        existingCounter.remove();
    }
    
    // Show all shops
    displayShops(allShops);
}