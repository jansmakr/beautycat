// Admin Dashboard JavaScript (auth.js?ì„œ ?•ì˜??currentUserë¥??¬ìš©)
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
    // ê´€ë¦¬ì ?¸ì¦ ?•ì¸ (ë¹„ë?ë²ˆí˜¸ 5874ë¡?ë¡œê·¸?¸í•œ ê²½ìš°)
    const adminAuth = localStorage.getItem('adminAuth');
    const adminLoginTime = localStorage.getItem('adminLoginTime');
    
    // 24?œê°„ ?¸ì…˜ ? ì? (24 * 60 * 60 * 1000 = 86400000ms)
    const sessionExpiry = 24 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    
    if (adminAuth === 'true' && adminLoginTime && (currentTime - parseInt(adminLoginTime)) < sessionExpiry) {
        // ê´€ë¦¬ì ?¸ì…˜ ? íš¨
        currentUser = {
            id: 'admin_5874',
            email: 'admin@beautycat.com',
            name: 'beautycat ê´€ë¦¬ì',
            user_type: 'admin'
        };
        console.log('ê´€ë¦¬ì ?¸ì¦ ?±ê³µ');
    } else {
        // ?¸ì…˜???†ê±°??ë§Œë£Œ??        alert('ê´€ë¦¬ì ê¶Œí•œ???„ìš”?©ë‹ˆ?? ë¡œê·¸???˜ì´ì§€ë¡??´ë™?©ë‹ˆ??');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'index.html';
        return;
    }
    
    // Display admin name
    const adminNameElement = document.getElementById('admin-name');
    if (adminNameElement) {
        adminNameElement.textContent = currentUser.name || 'ê´€ë¦¬ì';
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
    
    // Show selected section - try both with and without '-section' suffix
    let targetSection = document.getElementById(sectionName + '-section');
    if (!targetSection) {
        targetSection = document.getElementById(sectionName);
    }
    
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
        case 'announcements':
            loadAnnouncements();
            break;
        case 'test':
            // Test section doesn't need data loading
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
        
        // Load recent members for dashboard
        loadRecentMembers();
        
    } catch (error) {
        console.error('Dashboard data loading error:', error);
        showNotification('?€?œë³´???°ì´?°ë? ë¶ˆëŸ¬?¤ëŠ”???¤íŒ¨?ˆìŠµ?ˆë‹¤.', 'error');
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
            message: `${consultation.name}?˜ì´ ?ë‹´???”ì²­?ˆìŠµ?ˆë‹¤. (${consultation.region})`,
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
            message: `${shop.business_name}???…ì²´ë¡??±ë¡?ˆìŠµ?ˆë‹¤.`,
            time: formatDate(shop.created_at),
            icon: 'fas fa-store text-green-600'
        });
    });
    
    // Sort all activities by time and limit to 8
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, 8);
    
    if (limitedActivities.length === 0) {
        activitiesContainer.innerHTML = '<p class="text-gray-500">ìµœê·¼ ?œë™???†ìŠµ?ˆë‹¤.</p>';
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
        console.log('?‘¥ ?¬ìš©???°ì´??ë¡œë”© ì¤?..');
        const response = await fetch('tables/users?limit=1000&sort=created_at');
        console.log('?“¡ ?‘ë‹µ ?íƒœ:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('?“Š ?„ì²´ ?°ì´??', data);
        console.log('?‘¥ ?¬ìš©????', data.total, 'ëª?);
        
        allUsers = data.data || [];
        console.log('??allUsers ë°°ì—´:', allUsers.length, 'ëª?);
        
        if (updateTable) {
            console.log('?”„ ?Œì´ë¸??…ë°?´íŠ¸ ?œì‘');
            displayUsers(allUsers);
        }
    } catch (error) {
        console.error('??Users loading error:', error);
        
        // API ?¤íŒ¨???°ëª¨ ?°ì´???¬ìš©
        allUsers = [
            {
                id: 'demo_customer_1',
                email: 'demo@customer.com',
                name: '?°ëª¨ ê³ ê°',
                phone: '010-1111-1111',
                user_type: 'customer',
                status: 'active',
                is_verified: true,
                created_at: '2024-09-18T03:00:00Z'
            },
            {
                id: 'demo_shop_1',
                email: 'demo@shop.com',
                name: '?°ëª¨ ?ì ',
                phone: '010-2222-2222',
                user_type: 'shop',
                status: 'active',
                is_verified: true,
                created_at: '2024-09-18T03:00:00Z'
            },
            {
                id: 'demo_admin_1',
                email: 'admin@demo.com',
                name: 'ê´€ë¦¬ì',
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
    console.log('?–¼ï¸?displayUsers ?¸ì¶œ?? ?¬ìš©????', users.length);
    
    const tableBody = document.getElementById('users-table');
    
    if (!tableBody) {
        console.error('??users-table ?”ì†Œë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤!');
        return;
    }
    
    console.log('??users-table ?”ì†Œ ì°¾ìŒ');
    
    if (users.length === 0) {
        console.log('? ï¸ ?œì‹œ???¬ìš©?ê? ?†ìŠµ?ˆë‹¤');
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">?±ë¡???¬ìš©?ê? ?†ìŠµ?ˆë‹¤.</td></tr>';
        return;
    }
    
    console.log('?”¨ ?Œì´ë¸?HTML ?ì„± ì¤?..');
    tableBody.innerHTML = users.map(user => {
        const userTypeLabels = {
            'customer': 'ê³ ê°',
            'shop': '?…ì²´',
            'admin': 'ê´€ë¦¬ì'
        };
        
        const statusColors = {
            'active': 'text-green-600 bg-green-100',
            'inactive': 'text-red-600 bg-red-100',
            'pending': 'text-yellow-600 bg-yellow-100'
        };
        
        const status = user.status || 'active';
        
        // ë¹„ë?ë²ˆí˜¸ ?œì‹œ (?´ì‹œ??ê²½ìš° ?¼ë?ë§? ?‰ë¬¸??ê²½ìš° ?„ì²´)
        let passwordDisplay = '';
        // password??:ê°€ ?¬í•¨?˜ì–´ ?ˆìœ¼ë©??´ì‹œ??ë¹„ë?ë²ˆí˜¸ (hash:salt ?•ì‹)
        if (user.password && user.password.includes(':')) {
            // ?´ì‹œ??ë¹„ë?ë²ˆí˜¸ - ?¼ë?ë§??œì‹œ
            const [hash] = user.password.split(':');
            passwordDisplay = `
                <span class="text-gray-400 text-xs" title="?´ì‹œ??ë¹„ë?ë²ˆí˜¸ (hash:salt)">
                    ${hash.substring(0, 12)}...
                </span>
                <button onclick="copyPassword('${user.id}')" class="ml-2 text-blue-600 hover:text-blue-900 text-xs" title="?„ì²´ ?´ì‹œ ë³µì‚¬">
                    <i class="fas fa-copy"></i>
                </button>
            `;
        } else {
            // ?‰ë¬¸ ë¹„ë?ë²ˆí˜¸ - ?„ì²´ ?œì‹œ
            passwordDisplay = `
                <span class="font-mono text-sm" id="password-${user.id}">${user.password || '-'}</span>
                <button onclick="copyPassword('${user.id}')" class="ml-2 text-blue-600 hover:text-blue-900" title="ë¹„ë?ë²ˆí˜¸ ë³µì‚¬">
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
                        ${status === 'active' ? '?œì„±' : status === 'inactive' ? 'ë¹„í™œ?? : '?€ê¸?}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewUser('${user.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
                        ë³´ê¸°
                    </button>
                    <button onclick="editUser('${user.id}')" class="text-green-600 hover:text-green-900">
                        ?˜ì •
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
        alert('ë¹„ë?ë²ˆí˜¸ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.');
        return;
    }
    
    // ?´ë¦½ë³´ë“œ??ë³µì‚¬
    navigator.clipboard.writeText(user.password).then(() => {
        // ?±ê³µ ?Œë¦¼
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>ë¹„ë?ë²ˆí˜¸ê°€ ?´ë¦½ë³´ë“œ??ë³µì‚¬?˜ì—ˆ?µë‹ˆ??/span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }).catch(err => {
        console.error('ë³µì‚¬ ?¤íŒ¨:', err);
        alert('ë³µì‚¬???¤íŒ¨?ˆìŠµ?ˆë‹¤.');
    });
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
        
        // API ?¤íŒ¨???°ëª¨ ?°ì´???¬ìš©
        allShops = [
            {
                id: 'shop_001',
                shop_name: 'ë·°í‹°?¤í‚¨ ?´ë¦¬??,
                owner_name: 'ê¹€ë¯¸ì˜',
                phone: '02-123-4567',
                email: 'beautyskin@example.com',
                region: '?œìš¸?¹ë³„??ê°•ë‚¨êµ?,
                status: 'active',
                is_active: true,
                verified: true,
                created_at: '2024-09-18T03:00:00Z'
            },
            {
                id: 'shop_002',
                shop_name: 'ê¸€ë¡œìš° ?¤í‚¨ì¼€??,
                owner_name: 'ë°•ì??€',
                phone: '02-987-6543',
                email: 'glow@example.com',
                region: '?œìš¸?¹ë³„???œì´ˆêµ?,
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
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">?±ë¡???…ì²´ê°€ ?†ìŠµ?ˆë‹¤.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = shops.map(shop => {
        const status = shop.status || 'active';
        const statusColors = {
            'active': 'text-green-600 bg-green-100',
            'inactive': 'text-red-600 bg-red-100',
            'pending': 'text-yellow-600 bg-yellow-100'
        };
        
        // ?€?œìƒµ ?íƒœ ?•ì¸
        const isRepresentative = shop.is_representative === true || shop.is_representative === 'true';
        const repStatus = shop.representative_status || 'none';
        
        // ?€?œìƒµ ?íƒœ ?œì‹œ
        let repStatusHtml = '';
        if (isRepresentative && repStatus === 'approved') {
            repStatusHtml = `
                <div class="flex items-center">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        <i class="fas fa-star mr-1"></i>?€?œìƒµ
                    </span>
                    <button onclick="toggleRepresentativeStatus('${shop.id}', false)" 
                            class="ml-2 text-red-600 hover:text-red-800" title="?€?œìƒµ ?´ì œ">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </div>
            `;
        } else {
            repStatusHtml = `
                <button onclick="toggleRepresentativeStatus('${shop.id}', true)" 
                        class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-blue-100 hover:text-blue-700"
                        title="?€?œìƒµ?¼ë¡œ ì§€??>
                    <i class="fas fa-star mr-1"></i>?€?œìƒµ ì§€??                </button>
            `;
        }
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${shop.name || '?…ì²´ëª??†ìŒ'}</div>
                    <div class="text-sm text-gray-500">${shop.owner_name || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${shop.region || `${shop.state || ''} ${shop.district || ''}`.trim() || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${shop.naver_cafe_id || '-'}</div>
                    ${shop.naver_cafe_id ? `<div class="text-xs text-blue-600">
                        <a href="https://cafe.naver.com/cosmetickr" target="_blank" class="hover:underline">
                            <i class="fas fa-external-link-alt mr-1"></i>ì¹´í˜ ?•ì¸
                        </a>
                    </div>` : '<div class="text-xs text-gray-400">ë¯¸ì…??/div>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formatDate(shop.created_at)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}">
                        ${status === 'active' ? '?œì„±' : status === 'inactive' ? 'ë¹„í™œ?? : '?¹ì¸?€ê¸?}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${repStatusHtml}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="viewShop('${shop.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
                        ë³´ê¸°
                    </button>
                    <button onclick="editShop('${shop.id}')" class="text-blue-600 hover:text-blue-900 mr-2">
                        ?˜ì •
                    </button>
                    <button onclick="approveShop('${shop.id}')" class="text-green-600 hover:text-green-900 mr-2" title="?Œë«???…ì  ?¹ì¸">
                        ?…ì ?¹ì¸
                    </button>
                    <button onclick="deleteShop('${shop.id}')" class="text-red-600 hover:text-red-900 mr-2" title="?? œ">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${shop.naver_cafe_id ? `
                        <button onclick="verifyCafeId('${shop.naver_cafe_id}')" class="text-blue-600 hover:text-blue-900">
                            ì¹´í˜ ?•ì¸
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
        
        // API ?¤íŒ¨???°ëª¨ ?°ì´???¬ìš©
        allConsultations = [
            {
                id: 'consult_001',
                customer_name: 'ê¹€ë¯¼ìˆ˜',
                customer_phone: '010-1234-5678',
                customer_email: 'minsu@example.com',
                region: '?œìš¸?¹ë³„??ê°•ë‚¨êµ?,
                treatment_type: '?¬ë“œë¦?ê´€ë¦? ëª¨ê³µ ì¶•ì†Œ',
                consultation_text: '?¬ë“œë¦„ì´ ?¬í•´??ê³ ë??…ë‹ˆ?? ëª¨ê³µ???“ì–´??ê´€ë¦¬ë? ë°›ê³  ?¶ìŠµ?ˆë‹¤.',
                status: 'pending',
                created_at: '2024-09-18T03:00:00Z'
            },
            {
                id: 'consult_002',
                customer_name: '?´ì??€',
                customer_phone: '010-9876-5432',
                customer_email: 'jieun@example.com',
                region: '?œìš¸?¹ë³„???œì´ˆêµ?,
                treatment_type: 'ë¯¸ë°± ê´€ë¦? ?˜ë¶„ ê´€ë¦?,
                consultation_text: '?¼ë?ê°€ ì¹™ì¹™?˜ê³  ê±´ì¡°?©ë‹ˆ?? ë¯¸ë°± ê´€ë¦¬ë„ ë°›ê³  ?¶ì–´??',
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
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">?ë‹´ ?”ì²­???†ìŠµ?ˆë‹¤.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = consultations.map(consultation => {
        const status = consultation.status || 'pending';
        const statusLabels = {
            'pending': '?€ê¸°ì¤‘',
            'in_progress': 'ì§„í–‰ì¤?,
            'completed': '?„ë£Œ',
            'cancelled': 'ì·¨ì†Œ'
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
                        ?ì„¸ë³´ê¸°
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
        regionalStatsContainer.innerHTML = '<p class="text-gray-500">ì§€??³„ ?°ì´?°ê? ?†ìŠµ?ˆë‹¤.</p>';
        return;
    }
    
    regionalStatsContainer.innerHTML = sortedRegions.map(([region, count]) => `
        <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
            <span class="text-gray-700">${region}</span>
            <span class="font-semibold text-blue-600">${count}ê±?/span>
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
            <div><strong>?´ë¦„:</strong> ${selectedUser.name}</div>
            <div><strong>?´ë©”??</strong> ${selectedUser.email}</div>
            <div><strong>?°ë½ì²?</strong> ${selectedUser.phone || 'ë¯¸ë“±ë¡?}</div>
            <div><strong>?¬ìš©???€??</strong> ${selectedUser.user_type}</div>
            <div><strong>ê°€?…ì¼:</strong> ${formatDate(selectedUser.created_at)}</div>
            <div><strong>?íƒœ:</strong> ${selectedUser.status || 'active'}</div>
        </div>
    `;
    
    // Update action button
    const actionBtn = document.getElementById('user-action-btn');
    const isActive = selectedUser.status !== 'inactive';
    actionBtn.textContent = isActive ? 'ê³„ì • ë¹„í™œ?±í™”' : 'ê³„ì • ?œì„±??;
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
            showNotification(`?¬ìš©???íƒœê°€ ${newStatus === 'active' ? '?œì„±?? : 'ë¹„í™œ?±í™”'}?˜ì—ˆ?µë‹ˆ??`, 'success');
            closeUserModal();
            loadUsers(); // Refresh users list
        } else {
            throw new Error('?¬ìš©???íƒœ ë³€ê²??¤íŒ¨');
        }
    } catch (error) {
        console.error('User status toggle error:', error);
        showNotification('?¬ìš©???íƒœ ë³€ê²½ì— ?¤íŒ¨?ˆìŠµ?ˆë‹¤.', 'error');
    }
}

// Edit user (placeholder)
function editUser(userId) {
    showNotification('?¬ìš©???¸ì§‘ ê¸°ëŠ¥?€ ì¤€ë¹„ì¤‘?…ë‹ˆ??', 'info');
}

// View shop (placeholder)
function viewShop(shopId) {
    const shop = allShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('???•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    // Fill view modal with shop data
    document.getElementById('view-shop-name').textContent = shop.name || '-';
    document.getElementById('view-owner-name').textContent = shop.owner_name || '-';
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
    const statusText = status === 'active' ? '?¹ì¸?? : 
                      status === 'inactive' ? 'ë¹„í™œ?? : 
                      status === 'approved' ? '?¹ì¸?? : 
                      status === 'rejected' ? 'ê±°ë??? : '?¹ì¸?€ê¸?;
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
            showNotification('?¼ë?ê´€ë¦¬ì‹¤???Œë«???…ì ???¹ì¸?˜ì—ˆ?µë‹ˆ??', 'success');
            loadShops(); // Refresh shops list
        } else {
            throw new Error('?Œë«???…ì  ?¹ì¸ ?¤íŒ¨');
        }
    } catch (error) {
        console.error('Shop approval error:', error);
        showNotification('?Œë«???…ì  ?¹ì¸???¤íŒ¨?ˆìŠµ?ˆë‹¤.', 'error');
    }
}

// Verify Naver Cafe ID
function verifyCafeId(cafeId) {
    if (!cafeId) {
        showNotification('?¤ì´ë²?ì¹´í˜ IDê°€ ?†ìŠµ?ˆë‹¤.', 'warning');
        return;
    }
    
    // ??ì°½ì—???¤ì´ë²?ì¹´í˜ ?˜ì´ì§€ ?´ê¸°
    const cafeUrl = `https://cafe.naver.com/cosmetickr`;
    const verificationWindow = window.open(cafeUrl, '_blank');
    
    if (verificationWindow) {
        showNotification(`?¤ì´ë²?ì¹´í˜?ì„œ "${cafeId}" ?Œì›???•ì¸?˜ì„¸??`, 'info');
    } else {
        showNotification('?ì—…??ì°¨ë‹¨?˜ì—ˆ?µë‹ˆ?? ë¸Œë¼?°ì? ?¤ì •???•ì¸?˜ì„¸??', 'warning');
    }
}

// View consultation (placeholder)
function viewConsultation(consultationId) {
    const consultation = allConsultations.find(c => c.id === consultationId);
    if (!consultation) {
        showNotification('?ë‹´ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    // message ?„ë“œ?ì„œ ì¶”ê? ?•ë³´ ?Œì‹±
    let additionalInfo = {};
    try {
        if (consultation.message) {
            additionalInfo = JSON.parse(consultation.message);
        }
    } catch (e) {
        console.log('ë©”ì‹œì§€ ?Œì‹± ?¤íŒ¨:', consultation.message);
        additionalInfo = { notes: consultation.message };
    }
    
    // Fill view modal with consultation data
    document.getElementById('view-consultation-name').textContent = consultation.customer_name || '-';
    document.getElementById('view-consultation-phone').textContent = consultation.phone || '-';
    document.getElementById('view-consultation-region').textContent = consultation.region || '-';
    document.getElementById('view-consultation-budget').textContent = additionalInfo.budget || '-';
    
    // ?¼ë? ?íƒœ
    document.getElementById('view-consultation-skin-condition').textContent = additionalInfo.skin_condition || '-';
    
    // ì¶”ê? ?”ì²­?¬í•­
    document.getElementById('view-consultation-notes').textContent = additionalInfo.notes || '-';
    
    // ? ì²­?¼ì‹œ ë°??˜ì •?¼ì‹œ
    document.getElementById('view-consultation-created-at').textContent = formatDate(consultation.created_at) || '-';
    document.getElementById('view-consultation-updated-at').textContent = formatDate(consultation.updated_at) || '-';
    
    // Handle treatment types
    const treatments = consultation.treatment_type;
    document.getElementById('view-consultation-treatments').textContent = treatments || '-';
    
    // Handle status with colored badge
    const status = consultation.status || 'pending';
    const statusText = {
        'pending': '?€ê¸°ì¤‘',
        'in_progress': 'ì§„í–‰ì¤?,
        'completed': '?„ë£Œ',
        'cancelled': 'ì·¨ì†Œ'
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
                        <div class="font-medium text-gray-900">${shop.name || '?…ì²´ëª??†ìŒ'}</div>
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
    
    // ëª¨ë‹¬ ?´ê¸°
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
        showNotification('?ë‹´ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    const consultation = allConsultations.find(c => c.id === consultationId);
    if (!consultation) {
        showNotification('?ë‹´ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    if (consultation.status === newStatus) {
        showNotification('?´ë? ?™ì¼???íƒœ?…ë‹ˆ??', 'info');
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
            
            showNotification('?ë‹´ ?íƒœê°€ ?±ê³µ?ìœ¼ë¡?ë³€ê²½ë˜?ˆìŠµ?ˆë‹¤.', 'success');
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
        
        showNotification('?ë‹´ ?íƒœê°€ ë¡œì»¬?ì„œ ?…ë°?´íŠ¸?˜ì—ˆ?µë‹ˆ?? (API ?°ê²° ?„ìš”)', 'warning');
    }
}

// Print consultation details
function printConsultation() {
    const consultationId = document.getElementById('consultation-view-modal').getAttribute('data-consultation-id');
    const consultation = allConsultations.find(c => c.id === consultationId);
    
    if (!consultation) {
        showNotification('?¸ì‡„???ë‹´ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    // Create print content
    const printContent = `
        <html>
        <head>
            <title>?ë‹´ ?”ì²­??- ${consultation.name}</title>
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
                <h1>beautycat (ë·°í‹°+?í‹°ì¼?</h1>
                <h2>?¼ë?ê´€ë¦??ë‹´ ?”ì²­??/h2>
                <p>ì¶œë ¥?¼ì‹œ: ${new Date().toLocaleString('ko-KR')}</p>
            </div>
            
            <div class="section">
                <div class="section-title">ê³ ê° ?•ë³´</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">?´ë¦„:</span>
                        <span class="value">${consultation.name || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">?°ë ¹?€:</span>
                        <span class="value">${consultation.age || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">?„í™”ë²ˆí˜¸:</span>
                        <span class="value">${consultation.phone || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">?±ë³„:</span>
                        <span class="value">${consultation.gender === 'male' ? '?¨ì„±' : consultation.gender === 'female' ? '?¬ì„±' : consultation.gender || '-'}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">?„ì¹˜ ?•ë³´</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">ì§€??</span>
                        <span class="value">${consultation.region || consultation.location || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">?ì„¸ ì§€??</span>
                        <span class="value">${consultation.detailed_region || consultation.detailed_location || '-'}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">ê´€???œë¹„??/div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">?¼ë? ?€??</span>
                        <span class="value">${consultation.skin_type || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">ê´€??ê´€ë¦?</span>
                        <span class="value">${Array.isArray(consultation.treatment_types) ? consultation.treatment_types.join(', ') : consultation.treatment_types || consultation.interested_treatments || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">ì¤‘ìš”?¬í•­:</span>
                        <span class="value">${consultation.important_factors || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">?¬ë§ ë¹ˆë„:</span>
                        <span class="value">${consultation.frequency || '-'}</span>
                    </div>
                </div>
                <div class="info-item" style="margin-top: 15px;">
                    <span class="label">ì¶”ê? ?”ì²­?¬í•­:</span>
                    <div style="margin-top: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                        ${consultation.additional_requests || consultation.message || '?†ìŒ'}
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">ì²˜ë¦¬ ?•ë³´</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">?„ì¬ ?íƒœ:</span>
                        <span class="status ${consultation.status || 'pending'}">${{
                            'pending': '?€ê¸°ì¤‘',
                            'in_progress': 'ì§„í–‰ì¤?, 
                            'completed': '?„ë£Œ',
                            'cancelled': 'ì·¨ì†Œ'
                        }[consultation.status] || '?€ê¸°ì¤‘'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">? ì²­?¼ì‹œ:</span>
                        <span class="value">${formatDate(consultation.created_at) || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">ì²˜ë¦¬?¼ì‹œ:</span>
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
    
    showNotification('?ë‹´ ?•ë³´ë¥??¸ì‡„?©ë‹ˆ??', 'info');
}

// ===== ?€?œìƒµ ê´€ë¦?ê´€???¨ìˆ˜??=====

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
        
        // API ?¤íŒ¨???°ëª¨ ?°ì´???¬ìš©
        allRepresentativeShops = [
            {
                id: 'rep_shop_001',
                shop_name: 'ë·°í‹°ìº?ê°•ë‚¨??,
                state: '?œìš¸?¹ë³„??,
                district: 'ê°•ë‚¨êµ?,
                phone: '02-123-4567',
                representative_treatments: ['?¬ë“œë¦?ê´€ë¦?, 'ë¯¸ë°± ê´€ë¦?, 'ëª¨ê³µ ì¶•ì†Œ'],
                approved: false,
                status: 'pending',
                created_at: '2024-10-15T10:00:00Z'
            },
            {
                id: 'rep_shop_002', 
                shop_name: 'ê¸€ë¡œìš° ?¤í‚¨ì¼€??,
                state: '?œìš¸?¹ë³„??,
                district: '?œì´ˆêµ?,
                phone: '02-987-6543',
                representative_treatments: ['?˜ë¶„ ê´€ë¦?, 'ì£¼ë¦„ ê´€ë¦?, 'ë¯¼ê°??ì¼€??],
                approved: true,
                status: 'approved',
                created_at: '2024-10-15T11:00:00Z'
            },
            {
                id: 'rep_shop_003',
                shop_name: 'ë¶€???¤ì…˜ë·??´ë¦¬??,
                state: 'ë¶€?°ê´‘??‹œ',
                district: '?´ìš´?€êµ?,
                phone: '051-111-2222',
                representative_treatments: ['ë¦¬í”„??, 'ë°”ë”” ì¼€??, 'ë¯¸ë°± ê´€ë¦?],
                approved: true,
                status: 'approved',
                created_at: '2024-10-15T12:00:00Z'
            },
            {
                id: 'rep_shop_004',
                shop_name: '?€êµ??„ë¦¬ë¯¸ì—„ ?´ë¦¬??,
                state: '?€êµ¬ê´‘??‹œ',
                district: '?˜ì„±êµ?,
                phone: '053-333-4444',
                representative_treatments: ['?¬ë“œë¦?ê´€ë¦?, '?‰ì†Œì¹¨ì°© ê°œì„ '],
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
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">?±ë¡???€?œìƒµ???†ìŠµ?ˆë‹¤.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = shops.map(shop => {
        const status = shop.status || (shop.approved ? 'approved' : 'pending');
        const statusLabels = {
            'approved': '?¹ì¸??,
            'pending': '?¹ì¸?€ê¸?,
            'rejected': 'ê±°ë???
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
                    <div class="text-sm font-medium text-gray-900">${shop.name || '?…ì²´ëª??†ìŒ'}</div>
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
                        ë³´ê¸°
                    </button>
                    ${status === 'pending' ? `
                        <button onclick="approveRepresentativeShop('${shop.id}')" class="text-green-600 hover:text-green-900 mr-2">
                            ?¹ì¸
                        </button>
                        <button onclick="rejectRepresentativeShop('${shop.id}')" class="text-red-600 hover:text-red-900 mr-2">
                            ê±°ë?
                        </button>
                    ` : status === 'approved' ? `
                        <button onclick="revokeRepresentativeShop('${shop.id}')" class="text-orange-600 hover:text-orange-900 mr-2">
                            ì·¨ì†Œ
                        </button>
                    ` : `
                        <button onclick="approveRepresentativeShop('${shop.id}')" class="text-green-600 hover:text-green-900 mr-2">
                            ?¬ìŠ¹??                        </button>
                    `}
                    <button onclick="deleteRepresentativeShop('${shop.id}')" class="text-red-600 hover:text-red-900" title="?? œ">
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
    document.getElementById('phone-consultations').textContent = '24'; // ?„ì‹œ ?°ì´??}

// Refresh representative shops
function refreshRepresentativeShops() {
    loadRepresentativeShops(true);
    showNotification('?€?œìƒµ ëª©ë¡???ˆë¡œê³ ì¹¨?ˆìŠµ?ˆë‹¤.', 'info');
}

// View representative shop details
function viewRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('?€?œìƒµ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    const treatments = Array.isArray(shop.representative_treatments) ? 
        shop.representative_treatments.join(', ') : '-';
    
    const details = `
        ?“ ì§€?? ${shop.state} ${shop.district}
        ?“ ?„í™”: ${shop.phone}
        ?’„ ?€??ê´€ë¦? ${treatments}
        ?“… ?±ë¡?? ${formatDate(shop.created_at)}
        ???íƒœ: ${shop.status === 'approved' || shop.approved ? '?¹ì¸?? : shop.status === 'rejected' ? 'ê±°ë??? : '?¹ì¸?€ê¸?}
    `;
    
    alert(`?ª ${shop.shop_name}\n\n${details}`);
}

// Approve representative shop
async function approveRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('?€?œìƒµ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'error');
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
            
            showNotification(`'${shop.shop_name}'???€?œìƒµ?¼ë¡œ ?¹ì¸?˜ì—ˆ?µë‹ˆ??`, 'success');
        } else {
            throw new Error('?¹ì¸ ?¤íŒ¨');
        }
    } catch (error) {
        console.error('Representative shop approval error:', error);
        
        // API ?¤íŒ¨??ë¡œì»¬ ?°ì´???…ë°?´íŠ¸
        shop.approved = true;
        shop.status = 'approved';
        displayRepresentativeShops(allRepresentativeShops);
        updateRepresentativeShopStats();
        
        showNotification(`'${shop.shop_name}'??ë¡œì»¬?ì„œ ?¹ì¸?˜ì—ˆ?µë‹ˆ?? (API ?°ê²° ?„ìš”)`, 'warning');
    }
}

// Reject representative shop
async function rejectRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('?€?œìƒµ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    const reason = prompt(`'${shop.shop_name}' ?€?œìƒµ ? ì²­??ê±°ë??˜ì‹œê² ìŠµ?ˆê¹Œ?\n\nê±°ë? ?¬ìœ ë¥??…ë ¥?˜ì„¸??(? íƒ?¬í•­):`);
    if (reason === null) return; // ì·¨ì†Œ
    
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
            
            showNotification(`'${shop.shop_name}' ?€?œìƒµ ? ì²­??ê±°ë??˜ì—ˆ?µë‹ˆ??`, 'info');
        } else {
            throw new Error('ê±°ë? ì²˜ë¦¬ ?¤íŒ¨');
        }
    } catch (error) {
        console.error('Representative shop rejection error:', error);
        
        shop.approved = false;
        shop.status = 'rejected';
        displayRepresentativeShops(allRepresentativeShops);
        updateRepresentativeShopStats();
        
        showNotification(`'${shop.shop_name}' ?€?œìƒµ ? ì²­??ë¡œì»¬?ì„œ ê±°ë??˜ì—ˆ?µë‹ˆ??`, 'warning');
    }
}

// Revoke representative shop approval
async function revokeRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('?€?œìƒµ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    if (!confirm(`'${shop.shop_name}'???€?œìƒµ ?¹ì¸??ì·¨ì†Œ?˜ì‹œê² ìŠµ?ˆê¹Œ?\n\n?¹ì¸ ì·¨ì†Œ ?„ì—???´ë‹¹ ì§€??—???€?œìƒµ ?œë¹„?¤ê? ì¤‘ë‹¨?©ë‹ˆ??`)) {
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
            
            showNotification(`'${shop.shop_name}'???€?œìƒµ ?¹ì¸??ì·¨ì†Œ?˜ì—ˆ?µë‹ˆ??`, 'info');
        } else {
            throw new Error('?¹ì¸ ì·¨ì†Œ ?¤íŒ¨');
        }
    } catch (error) {
        console.error('Representative shop revocation error:', error);
        
        shop.approved = false;
        shop.status = 'pending';
        displayRepresentativeShops(allRepresentativeShops);
        updateRepresentativeShopStats();
        
        showNotification(`'${shop.shop_name}'???€?œìƒµ ?¹ì¸??ë¡œì»¬?ì„œ ì·¨ì†Œ?˜ì—ˆ?µë‹ˆ??`, 'warning');
    }
}

// Delete representative shop
async function deleteRepresentativeShop(shopId) {
    const shop = allRepresentativeShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('?€?œìƒµ ?•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    const confirmMessage = `?•ë§ë¡?'${shop.shop_name}' ?€?œìƒµ ?±ë¡???? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?\n\n???‘ì—…?€ ?˜ëŒë¦????†ìŠµ?ˆë‹¤.`;
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
            
            showNotification('?€?œìƒµ ?±ë¡???? œ?˜ì—ˆ?µë‹ˆ??', 'success');
        } else {
            throw new Error('?? œ ?¤íŒ¨');
        }
    } catch (error) {
        console.error('Representative shop deletion error:', error);
        
        const index = allRepresentativeShops.findIndex(s => s.id === shopId);
        if (index !== -1) {
            allRepresentativeShops.splice(index, 1);
        }
        displayRepresentativeShops(allRepresentativeShops);
        updateRepresentativeShopStats();
        
        showNotification('?€?œìƒµ ?±ë¡??ë¡œì»¬?ì„œ ?? œ?˜ì—ˆ?µë‹ˆ?? (API ?°ê²° ?„ìš”)', 'warning');
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
            
            showNotification('?„ë¡œ?„ì´ ?…ë°?´íŠ¸?˜ì—ˆ?µë‹ˆ??', 'success');
        } else {
            throw new Error('?„ë¡œ???…ë°?´íŠ¸ ?¤íŒ¨');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('?„ë¡œ???…ë°?´íŠ¸???¤íŒ¨?ˆìŠµ?ˆë‹¤.', 'error');
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
    showNotification('?¤ì •???€?¥ë˜?ˆìŠµ?ˆë‹¤.', 'success');
}

// Clear cache
function clearCache() {
    if (confirm('ìºì‹œë¥??•ë¦¬?˜ì‹œê² ìŠµ?ˆê¹Œ? ?¼ë? ?°ì´?°ê? ?¤ì‹œ ë¡œë“œ?????ˆìŠµ?ˆë‹¤.')) {
        // Clear relevant localStorage items
        const keysToKeep = ['currentUser', 'systemSettings'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        showNotification('ìºì‹œê°€ ?•ë¦¬?˜ì—ˆ?µë‹ˆ??', 'success');
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
        
        // API ?¤íŒ¨???°ëª¨ ?°ì´???¬ìš©
        allAnnouncements = [
            {
                id: 'ann_001',
                title: '?œë¹„???ê? ?ˆë‚´',
                content: '?œìŠ¤???…ë°?´íŠ¸ë¥??„í•´ 2024??9??20???ˆë²½ 2?œë???4?œê¹Œì§€ ?œë¹„?¤ê? ?¼ì‹œ ì¤‘ë‹¨?©ë‹ˆ??',
                author_name: 'ê´€ë¦¬ì',
                priority: 'important',
                target_audience: 'all',
                is_pinned: true,
                is_published: true,
                view_count: 245,
                created_at: '2024-09-18T10:00:00Z'
            },
            {
                id: 'ann_002', 
                title: '?ˆë¡œ???¼ë?ê´€ë¦??„ë¡œê·¸ë¨ ì¶œì‹œ',
                content: '?ˆí‹°?ì´ì§??„ë¬¸ ?„ë¡œê·¸ë¨???ˆë¡­ê²?ì¶”ê??˜ì—ˆ?µë‹ˆ?? ì§€ê¸?? ì²­?´ë³´?¸ìš”!',
                author_name: 'ê´€ë¦¬ì',
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
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-500">?±ë¡??ê³µì??¬í•­???†ìŠµ?ˆë‹¤.</td></tr>';
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
            'urgent': 'ê¸´ê¸‰',
            'important': 'ì¤‘ìš”',
            'normal': '?¼ë°˜',
            'low': '??Œ'
        };
        
        const targetLabels = {
            'all': '?„ì²´',
            'customers': 'ê³ ê°',
            'shops': '?…ì²´',
            'admins': 'ê´€ë¦¬ì'
        };
        
        const status = announcement.is_published ? 'ê²Œì‹œì¤? : '?„ì‹œ?€??;
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
                    ${announcement.view_count || 0}??                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editAnnouncement('${announcement.id}')" class="text-indigo-600 hover:text-indigo-900 mr-2">
                        ?˜ì •
                    </button>
                    <button onclick="deleteAnnouncement('${announcement.id}')" class="text-red-600 hover:text-red-900">
                        ?? œ
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
        title.textContent = 'ê³µì??¬í•­ ?˜ì •';
        fillAnnouncementForm(selectedAnnouncement);
    } else {
        title.textContent = '??ê³µì??¬í•­ ?‘ì„±';
        form.reset();
        // ê¸°ë³¸ê°??¤ì •
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
    submitText.textContent = '?€??ì¤?..';
    
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
            // ?˜ì •
            announcementData.updated_at = new Date().toISOString();
            response = await fetch(`tables/announcements/${selectedAnnouncement.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(announcementData)
            });
        } else {
            // ?ˆë¡œ ?‘ì„±
            announcementData.created_at = new Date().toISOString();
            response = await fetch('tables/announcements', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(announcementData)
            });
        }
        
        if (response.ok) {
            showNotification(selectedAnnouncement ? 'ê³µì??¬í•­???˜ì •?˜ì—ˆ?µë‹ˆ??' : 'ê³µì??¬í•­???‘ì„±?˜ì—ˆ?µë‹ˆ??', 'success');
            closeAnnouncementModal();
            loadAnnouncements();
        } else {
            throw new Error('?€???¤íŒ¨');
        }
        
    } catch (error) {
        console.error('Announcement save error:', error);
        showNotification('?€??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.', 'error');
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
    if (!confirm('??ê³µì??¬í•­???? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
        return;
    }
    
    try {
        const response = await fetch(`tables/announcements/${announcementId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('ê³µì??¬í•­???? œ?˜ì—ˆ?µë‹ˆ??', 'success');
            loadAnnouncements();
        } else {
            throw new Error('?? œ ?¤íŒ¨');
        }
    } catch (error) {
        console.error('Announcement delete error:', error);
        showNotification('?? œ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.', 'error');
    }
}

// Export data (placeholder)
function exportData() {
    showNotification('?°ì´???´ë³´?´ê¸° ê¸°ëŠ¥?€ ì¤€ë¹„ì¤‘?…ë‹ˆ??', 'info');
}

// Logout
function logout() {
    if (confirm('ë¡œê·¸?„ì›ƒ ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
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
        return '?´ì œ';
    } else if (diffDays < 7) {
        return `${diffDays}????;
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
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-lg leading-none">Ã—</button>
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
        alert('???•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.');
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
    // document.getElementById('edit-status').value = shop.status || 'pending'; // ÇÊµå ¾øÀ½
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
            alert('???•ë³´ê°€ ?±ê³µ?ìœ¼ë¡??˜ì •?˜ì—ˆ?µë‹ˆ??');
            closeShopEditModal();
            refreshShops(); // Reload shops table
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Shop update error:', error);
        
        // ë¡œì»¬ ?°ì´???…ë°?´íŠ¸ (API ?¤íŒ¨??
        const shopIndex = allShops.findIndex(s => s.id === shopId);
        if (shopIndex !== -1) {
            allShops[shopIndex] = { ...allShops[shopIndex], ...updatedData };
            displayShops(allShops);
            closeShopEditModal();
            alert('???•ë³´ê°€ ë¡œì»¬?ì„œ ?…ë°?´íŠ¸?˜ì—ˆ?µë‹ˆ?? (API ?°ê²° ?„ìš”)');
        } else {
            alert('???•ë³´ ?˜ì •???¤íŒ¨?ˆìŠµ?ˆë‹¤.');
        }
    }
}

// Delete shop function
async function deleteShop(shopId) {
    const shop = allShops.find(s => s.id === shopId);
    if (!shop) {
        showNotification('???•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'error');
        return;
    }
    
    // ?•ì¸ ?€?”ìƒ??    const confirmMessage = `?•ë§ë¡?'${shop.shop_name}' ?µì„ ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?\n\n???‘ì—…?€ ?˜ëŒë¦????†ìŠµ?ˆë‹¤.`;
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
            showNotification('?µì´ ?±ê³µ?ìœ¼ë¡??? œ?˜ì—ˆ?µë‹ˆ??', 'success');
            refreshShops(); // Reload shops table
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Shop deletion error:', error);
        
        // API ?¤íŒ¨??ë¡œì»¬ ?°ì´?°ì—???œê±°
        const shopIndex = allShops.findIndex(s => s.id === shopId);
        if (shopIndex !== -1) {
            allShops.splice(shopIndex, 1);
            displayShops(allShops);
            showNotification('?µì´ ë¡œì»¬?ì„œ ?? œ?˜ì—ˆ?µë‹ˆ?? (API ?°ê²° ?„ìš”)', 'warning');
        } else {
            showNotification('???? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.', 'error');
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
        counter.innerHTML = `<i class="fas fa-filter mr-2"></i>ê²€??ê²°ê³¼: ${filtered}ê°?(?„ì²´ ${total}ê°?ì¤?`;
        
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

// Toggle representative shop status
async function toggleRepresentativeStatus(shopId, setAsRepresentative) {
    try {
        // ???•ë³´ ì°¾ê¸°
        const shop = allShops.find(s => s.id === shopId);
        if (!shop) {
            alert('???•ë³´ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.');
            return;
        }
        
        // ì§€???•ë³´ ?•ì¸
        const state = shop.state;
        const district = shop.district;
        
        if (!state || !district) {
            alert('?µì˜ ì§€???•ë³´ê°€ ?†ìŠµ?ˆë‹¤. ???•ë³´ë¥?ë¨¼ì? ?˜ì •?´ì£¼?¸ìš”.');
            return;
        }
        
        if (setAsRepresentative) {
            // ?€?œìƒµ?¼ë¡œ ì§€??            const confirmMsg = `${shop.name}??ë¥? ${state} ${district}???€?œìƒµ?¼ë¡œ ì§€?•í•˜?œê² ?µë‹ˆê¹?\n\n?€?œìƒµ?¼ë¡œ ì§€?•ë˜ë©?\n- ?´ë‹¹ ì§€??ë©”ì¸ ?˜ì´ì§€?ì„œ ?„í™”?ë‹´ ë²„íŠ¼?¼ë¡œ ?¸ì¶œ?©ë‹ˆ??n- ê³ ê°??ë°”ë¡œ ?„í™” ?ë‹´?????ˆìŠµ?ˆë‹¤`;
            
            if (!confirm(confirmMsg)) {
                return;
            }
            
            // ?´ë‹¹ ì§€??— ?´ë? ?€?œìƒµ???ˆëŠ”ì§€ ?•ì¸
            const existingRep = allShops.find(s => 
                s.state === state && 
                s.district === district && 
                s.is_representative === true && 
                s.id !== shopId
            );
            
            if (existingRep) {
                if (!confirm(`${state} ${district}?ëŠ” ?´ë? ?€?œìƒµ "${existingRep.name}"??ê°€) ?ˆìŠµ?ˆë‹¤.\nê¸°ì¡´ ?€?œìƒµ???´ì œ?˜ê³  ?ˆë¡œ ì§€?•í•˜?œê² ?µë‹ˆê¹?`)) {
                    return;
                }
                
                // ê¸°ì¡´ ?€?œìƒµ ?´ì œ
                await updateShopRepresentativeStatus(existingRep.id, false);
            }
            
            // ?ˆë¡œ???€?œìƒµ ì§€??            await updateShopRepresentativeStatus(shopId, true);
            
        } else {
            // ?€?œìƒµ ?´ì œ
            if (!confirm(`${shop.name}???€?œìƒµ ì§€?•ì„ ?´ì œ?˜ì‹œê² ìŠµ?ˆê¹Œ?`)) {
                return;
            }
            
            await updateShopRepresentativeStatus(shopId, false);
        }
        
        // ëª©ë¡ ?ˆë¡œê³ ì¹¨
        await refreshShops();
        
    } catch (error) {
        console.error('Representative status toggle error:', error);
        alert('?€?œìƒµ ?íƒœ ë³€ê²?ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.');
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
        
        // ë¡œì»¬ ?°ì´???…ë°?´íŠ¸
        const shopIndex = allShops.findIndex(s => s.id === shopId);
        if (shopIndex !== -1) {
            allShops[shopIndex] = { ...allShops[shopIndex], ...updateData };
        }
        
        alert(isRepresentative ? '?€?œìƒµ?¼ë¡œ ì§€?•ë˜?ˆìŠµ?ˆë‹¤.' : '?€?œìƒµ ì§€?•ì´ ?´ì œ?˜ì—ˆ?µë‹ˆ??');
        
    } catch (error) {
        console.error('Representative status update error:', error);
        
        // API ?¤íŒ¨ ??ë¡œì»¬ ?…ë°?´íŠ¸
        const shopIndex = allShops.findIndex(s => s.id === shopId);
        if (shopIndex !== -1) {
            allShops[shopIndex].is_representative = isRepresentative;
            allShops[shopIndex].representative_status = isRepresentative ? 'approved' : 'none';
            displayShops(allShops);
            alert(isRepresentative ? '?€?œìƒµ?¼ë¡œ ì§€?•ë˜?ˆìŠµ?ˆë‹¤ (ë¡œì»¬).' : '?€?œìƒµ ì§€?•ì´ ?´ì œ?˜ì—ˆ?µë‹ˆ??(ë¡œì»¬).');
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
                    alert('?„ìˆ˜ ??ª©??ëª¨ë‘ ?…ë ¥?´ì£¼?¸ìš”.');
                    return;
                }
                
                if (password.length < 8) {
                    alert('ë¹„ë?ë²ˆí˜¸??ìµœì†Œ 8???´ìƒ?´ì–´???©ë‹ˆ??');
                    return;
                }
                
                // Show loading
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>?±ë¡ ì¤?..';
                
                console.log('Creating new shop account...');
                
                // Step 1: Create user account
                const userData = {
                    email: email,
                    password: password,
                    name: ownerName,
                    phone: phone,
                    user_type: 'shop'
                };
                
                const userResponse = await fetch('/tables/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                
                if (!userResponse.ok) {
                    const errorText = await userResponse.text();
                    throw new Error(`?¬ìš©??ê³„ì • ?ì„± ?¤íŒ¨: ${errorText}`);
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
                    business_license_number: licenseNumber || null,
                    naver_cafe_id: naverCafeId || null,
                    status: 'pending',
                    approved: false,
                    user_id: newUser.id
                };
                
                const shopResponse = await fetch('/tables/skincare_shops', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shopData)
                });
                
                if (!shopResponse.ok) {
                    const errorText = await shopResponse.text();
                    throw new Error(`?…ì²´ ?±ë¡ ?¤íŒ¨: ${errorText}`);
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
                
                console.log('Shop registration completed successfully');
                
                // Success!
                alert(`?…ì²´ ?±ë¡???„ë£Œ?˜ì—ˆ?µë‹ˆ??\n\n?…ì²´ëª? ${shopName}\n?´ë©”?? ${email}\n?¹ì¸ ?íƒœ: ?€ê¸°ì¤‘`);
                
                // Close modal
                closeNewShopModal();
                
                // Reload dashboard data
                await loadDashboardData();
                await loadShops();
                
                // Show notification
                showNotification('???…ì²´ê°€ ?±ë¡?˜ì—ˆ?µë‹ˆ??', 'success');
                
            } catch (error) {
                console.error('Shop registration error:', error);
                alert('?…ì²´ ?±ë¡ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤:\n' + error.message);
                
                // Restore button
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
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
        const response = await fetch('/tables/users?limit=5&sort=-created_at');
        
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
                container.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">ìµœê·¼ ê°€?…ìê°€ ?†ìŠµ?ˆë‹¤.</p>';
            }
        }
    }
}

// Display recent members in the dashboard
function displayRecentMembers(users) {
    const container = document.getElementById('recent-members');
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">ìµœê·¼ ê°€?…ìê°€ ?†ìŠµ?ˆë‹¤.</p>';
        return;
    }
    
    container.innerHTML = users.map(user => {
        const userTypeLabels = {
            'customer': 'ê³ ê°',
            'shop': '?…ì²´',
            'admin': 'ê´€ë¦¬ì'
        };
        
        const userTypeColors = {
            'customer': 'bg-blue-100 text-blue-800',
            'shop': 'bg-green-100 text-green-800',
            'admin': 'bg-purple-100 text-purple-800'
        };
        
        const userType = user.user_type || 'customer';
        const userName = user.name || user.email || 'Unknown';
        const userEmail = user.email || '';
        const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '? ì§œ ë¯¸ìƒ';
        
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



