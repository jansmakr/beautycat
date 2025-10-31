// 전역 변수
let currentConsultationId = null;
let currentUser = null;
let userType = null; // 'customer' 또는 'shop'
let messagesPollingInterval = null;
let notificationsEnabled = true;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeChatApp();
});

// 채팅 앱 초기화
function initializeChatApp() {
    // URL 파라미터에서 상담 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    currentConsultationId = urlParams.get('consultation_id');
    userType = urlParams.get('user_type') || 'customer';
    
    if (!currentConsultationId) {
        showNotification('상담 ID가 없습니다. 메인 페이지로 돌아갑니다.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    setupEventListeners();
    loadConsultationInfo();
    loadMessages();
    startMessagesPolling();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 메시지 전송 폼
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSubmit);
    }

    // 견적서 작성 폼
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmit);
    }

    // 파일 업로드
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    // 메시지 입력창 엔터키 처리
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleMessageSubmit(e);
            }
        });
    }
}

// 상담 정보 로드
async function loadConsultationInfo() {
    try {
        const response = await fetch(`tables/consultations/${currentConsultationId}`);
        
        if (!response.ok) {
            throw new Error('상담 정보를 불러올 수 없습니다.');
        }

        const consultation = await response.json();
        updateConsultationInfo(consultation);
        loadParticipatingShops();
        
    } catch (error) {
        console.error('상담 정보 로드 오류:', error);
        showNotification('상담 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// 상담 정보 업데이트
function updateConsultationInfo(consultation) {
    document.getElementById('consultation-id').textContent = consultation.id.substring(0, 8);
    document.getElementById('customer-name').textContent = consultation.customer_name;
    document.getElementById('consultation-region').textContent = consultation.region;
    document.getElementById('treatment-type').textContent = consultation.treatment_type;
    document.getElementById('budget-range').textContent = consultation.budget_range || '미설정';
    document.getElementById('preferred-schedule').textContent = consultation.preferred_schedule || '미설정';

    // 상태 업데이트
    const statusElement = document.getElementById('consultation-status');
    const statusMap = {
        'pending': { text: '대기 중', class: 'bg-yellow-100 text-yellow-800' },
        'in_progress': { text: '상담 진행 중', class: 'bg-blue-100 text-blue-800' },
        'matched': { text: '매칭 완료', class: 'bg-green-100 text-green-800' },
        'completed': { text: '완료', class: 'bg-gray-100 text-gray-800' },
        'cancelled': { text: '취소됨', class: 'bg-red-100 text-red-800' }
    };
    
    const status = statusMap[consultation.status] || statusMap['pending'];
    statusElement.textContent = status.text;
    statusElement.className = `px-3 py-1 text-sm rounded-full ${status.class}`;
}

// 참여 피부관리실 로드
async function loadParticipatingShops() {
    try {
        // 해당 상담에 메시지를 보낸 피부관리실들 조회
        const messagesResponse = await fetch(`tables/messages?search=${currentConsultationId}`);
        const messagesData = await messagesResponse.json();
        
        const shopIds = [...new Set(
            messagesData.data
                .filter(msg => msg.sender_type === 'shop')
                .map(msg => msg.sender_id)
        )];

        if (shopIds.length === 0) {
            document.getElementById('participating-shops').innerHTML = 
                '<p class="text-gray-500 text-sm">아직 응답한 업체가 없습니다.</p>';
            return;
        }

        // 피부관리실 정보 조회
        const shopsHtml = [];
        for (const shopId of shopIds) {
            try {
                const shopResponse = await fetch(`tables/skincare_shops/${shopId}`);
                if (shopResponse.ok) {
                    const shop = await shopResponse.json();
                    shopsHtml.push(`
                        <div class="p-3 border border-gray-200 rounded-lg">
                            <h4 class="font-medium text-gray-900">${shop.shop_name}</h4>
                            <p class="text-sm text-gray-600">${shop.region}</p>
                            <div class="flex items-center mt-1">
                                <span class="text-xs text-yellow-500">
                                    ${'★'.repeat(Math.floor(shop.rating || 4))}
                                </span>
                                <span class="text-xs text-gray-500 ml-1">${shop.rating || 4.0}</span>
                            </div>
                        </div>
                    `);
                }
            } catch (error) {
                console.error(`피부관리실 ${shopId} 정보 로드 오류:`, error);
            }
        }

        document.getElementById('participating-shops').innerHTML = shopsHtml.join('');
        
    } catch (error) {
        console.error('참여 업체 로드 오류:', error);
    }
}

// 메시지 로드
async function loadMessages() {
    try {
        const response = await fetch(`tables/messages?search=${currentConsultationId}&sort=timestamp`);
        
        if (!response.ok) {
            throw new Error('메시지를 불러올 수 없습니다.');
        }

        const data = await response.json();
        const messages = data.data.filter(msg => msg.consultation_id === currentConsultationId);
        
        displayMessages(messages);
        scrollToBottom();
        
    } catch (error) {
        console.error('메시지 로드 오류:', error);
        showNotification('메시지를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// 메시지 표시
function displayMessages(messages) {
    const messagesList = document.getElementById('messages-list');
    messagesList.innerHTML = '';

    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        messagesList.appendChild(messageElement);
    });
}

// 메시지 요소 생성
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    const isOwnMessage = message.sender_type === userType;
    const isQuote = message.message.includes('[견적서]');
    
    messageDiv.className = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`;
    
    const messageTime = new Date(message.timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    let senderName = '';
    if (message.sender_type === 'shop') {
        senderName = '피부관리실';
    } else if (message.sender_type === 'customer') {
        senderName = '고객';
    } else {
        senderName = '시스템';
    }

    const messageContent = message.message.replace(/\n/g, '<br>');
    
    let messageHtml = '';
    if (isQuote) {
        messageHtml = `
            <div class="max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                isOwnMessage ? 'bg-pink-500 text-white' : 'bg-blue-500 text-white'
            }">
                <div class="flex items-center mb-2">
                    <i class="fas fa-file-invoice-dollar mr-2"></i>
                    <span class="font-medium">견적서</span>
                </div>
                <div class="text-sm" onclick="showQuoteDetail('${message.id}')" style="cursor: pointer;">
                    ${messageContent}
                </div>
                <div class="text-xs mt-2 opacity-75">${messageTime}</div>
            </div>
        `;
    } else {
        messageHtml = `
            <div class="max-w-xs lg:max-w-md">
                ${!isOwnMessage ? `<div class="text-xs text-gray-500 mb-1">${senderName}</div>` : ''}
                <div class="px-4 py-3 rounded-lg ${
                    isOwnMessage 
                        ? 'bg-pink-500 text-white' 
                        : message.sender_type === 'system' 
                            ? 'bg-gray-200 text-gray-800' 
                            : 'bg-gray-100 text-gray-800'
                }">
                    <div class="text-sm">${messageContent}</div>
                    ${message.attachment_url ? `
                        <div class="mt-2">
                            <a href="${message.attachment_url}" target="_blank" class="text-xs underline">
                                <i class="fas fa-paperclip mr-1"></i>첨부파일
                            </a>
                        </div>
                    ` : ''}
                    <div class="text-xs mt-2 ${isOwnMessage ? 'opacity-75' : 'opacity-60'}">${messageTime}</div>
                </div>
            </div>
        `;
    }
    
    messageDiv.innerHTML = messageHtml;
    return messageDiv;
}

// 메시지 전송 처리
async function handleMessageSubmit(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    try {
        const messageData = {
            consultation_id: currentConsultationId,
            sender_type: userType,
            sender_id: currentUser || `${userType}_${Date.now()}`,
            message: message,
            is_read: false,
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch('tables/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });
        
        if (!response.ok) {
            throw new Error('메시지 전송에 실패했습니다.');
        }
        
        messageInput.value = '';
        loadMessages(); // 메시지 새로고침
        
    } catch (error) {
        console.error('메시지 전송 오류:', error);
        showNotification('메시지 전송 중 오류가 발생했습니다.', 'error');
    }
}

// 견적서 작성 모달 토글
function toggleQuoteForm() {
    const modal = document.getElementById('quote-modal');
    modal.classList.toggle('hidden');
    
    if (!modal.classList.contains('hidden')) {
        // 모달이 열릴 때 폼 초기화
        document.getElementById('quote-form').reset();
    }
}

// 견적서 제출 처리
async function handleQuoteSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        // 견적서 데이터 저장
        const quoteData = {
            consultation_id: currentConsultationId,
            shop_id: currentUser || `shop_${Date.now()}`,
            treatment_details: formData.get('treatment-details') || document.getElementById('treatment-details').value,
            price: parseInt(formData.get('quote-price') || document.getElementById('quote-price').value),
            duration: formData.get('duration') || document.getElementById('duration').value,
            available_dates: [formData.get('available-dates') || document.getElementById('available-dates').value],
            additional_notes: formData.get('additional-notes') || document.getElementById('additional-notes').value,
            status: 'sent',
            valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7일 후
        };
        
        const quoteResponse = await fetch('tables/quotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quoteData)
        });
        
        if (!quoteResponse.ok) {
            throw new Error('견적서 저장에 실패했습니다.');
        }
        
        const quote = await quoteResponse.json();
        
        // 견적서 메시지 전송
        const messageData = {
            consultation_id: currentConsultationId,
            sender_type: 'shop',
            sender_id: currentUser || `shop_${Date.now()}`,
            message: `[견적서]\n관리 내용: ${quoteData.treatment_details}\n가격: ${quoteData.price.toLocaleString()}원\n소요시간: ${quoteData.duration}\n예약 가능일: ${quoteData.available_dates.join(', ')}\n추가사항: ${quoteData.additional_notes}`,
            is_read: false,
            timestamp: new Date().toISOString()
        };
        
        const messageResponse = await fetch('tables/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });
        
        if (!messageResponse.ok) {
            throw new Error('견적서 메시지 전송에 실패했습니다.');
        }
        
        toggleQuoteForm();
        loadMessages();
        showNotification('견적서가 성공적으로 전송되었습니다.', 'success');
        
    } catch (error) {
        console.error('견적서 전송 오류:', error);
        showNotification('견적서 전송 중 오류가 발생했습니다.', 'error');
    }
}

// 파일 업로드 처리
async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('파일 크기는 10MB 이하로 업로드해주세요.', 'error');
        return;
    }
    
    try {
        // 실제 서비스에서는 파일을 서버에 업로드해야 함
        // 여기서는 파일명만 메시지로 전송
        const messageData = {
            consultation_id: currentConsultationId,
            sender_type: userType,
            sender_id: currentUser || `${userType}_${Date.now()}`,
            message: `파일을 첨부했습니다: ${file.name}`,
            attachment_url: `#file_${file.name}`, // 실제로는 업로드된 파일 URL
            is_read: false,
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch('tables/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });
        
        if (!response.ok) {
            throw new Error('파일 전송에 실패했습니다.');
        }
        
        loadMessages();
        showNotification('파일이 성공적으로 전송되었습니다.', 'success');
        
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        showNotification('파일 업로드 중 오류가 발생했습니다.', 'error');
    }
}

// 견적서 상세 보기
function showQuoteDetail(messageId) {
    // 실제로는 messageId를 통해 견적서 정보를 조회해야 함
    const modal = document.getElementById('quote-detail-modal');
    const content = document.getElementById('quote-detail-content');
    
    // 샘플 견적서 내용
    content.innerHTML = `
        <div class="space-y-4">
            <div>
                <h4 class="font-medium text-gray-900 mb-2">관리 내용</h4>
                <p class="text-gray-600">여드름 집중 관리 + 진정 케어</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-medium text-gray-900 mb-2">가격</h4>
                    <p class="text-2xl font-bold text-pink-600">150,000원</p>
                </div>
                <div>
                    <h4 class="font-medium text-gray-900 mb-2">소요시간</h4>
                    <p class="text-gray-600">1시간 30분</p>
                </div>
            </div>
            <div>
                <h4 class="font-medium text-gray-900 mb-2">예약 가능일</h4>
                <p class="text-gray-600">월-금 오전 10시-5시, 토요일 가능</p>
            </div>
            <div>
                <h4 class="font-medium text-gray-900 mb-2">추가사항</h4>
                <p class="text-gray-600">첫 방문 고객 20% 할인 혜택</p>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// 견적서 상세 모달 닫기
function closeQuoteDetail() {
    document.getElementById('quote-detail-modal').classList.add('hidden');
}

// 견적 수락
function acceptQuote() {
    showNotification('견적이 수락되었습니다. 피부관리실에서 연락드릴 예정입니다.', 'success');
    closeQuoteDetail();
}

// 메시지 새로고침
function refreshMessages() {
    loadMessages();
    showNotification('메시지를 새로고침했습니다.', 'info');
}

// 알림 토글
function toggleNotifications() {
    notificationsEnabled = !notificationsEnabled;
    const btn = document.getElementById('notification-btn');
    
    if (notificationsEnabled) {
        btn.innerHTML = '<i class="fas fa-bell"></i>';
        btn.classList.remove('text-gray-400');
        btn.classList.add('text-gray-700');
        showNotification('알림이 활성화되었습니다.', 'info');
    } else {
        btn.innerHTML = '<i class="fas fa-bell-slash"></i>';
        btn.classList.remove('text-gray-700');
        btn.classList.add('text-gray-400');
        showNotification('알림이 비활성화되었습니다.', 'info');
    }
}

// 메시지 폴링 시작
function startMessagesPolling() {
    messagesPollingInterval = setInterval(() => {
        loadMessages();
    }, 5000); // 5초마다 새로운 메시지 확인
}

// 메시지 폴링 중지
function stopMessagesPolling() {
    if (messagesPollingInterval) {
        clearInterval(messagesPollingInterval);
    }
}

// 화면 맨 아래로 스크롤
function scrollToBottom() {
    const container = document.getElementById('messages-container');
    container.scrollTop = container.scrollHeight;
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

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    stopMessagesPolling();
});