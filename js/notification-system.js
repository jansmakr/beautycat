/**
 * BeautyCat 알림 시스템
 * Web Push 알림 + 토스트 메시지
 */

class NotificationSystem {
    constructor() {
        this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
        this.permission = Notification.permission;
        this.init();
    }

    async init() {
        console.log('🔔 알림 시스템 초기화...');
        
        if (this.isSupported) {
            await this.requestPermission();
            this.setupEventListeners();
        } else {
            console.warn('⚠️ 브라우저가 알림을 지원하지 않습니다. 토스트 메시지만 사용됩니다.');
        }
    }

    // 알림 권한 요청
    async requestPermission() {
        if (this.permission === 'default') {
            try {
                this.permission = await Notification.requestPermission();
                console.log('🔔 알림 권한:', this.permission);
            } catch (error) {
                console.warn('⚠️ 알림 권한 요청 실패:', error);
            }
        }
        return this.permission === 'granted';
    }

    // 푸시 알림 보내기
    async sendNotification(title, options = {}) {
        if (!await this.requestPermission()) {
            console.warn('⚠️ 알림 권한이 없습니다. 토스트 메시지로 대체합니다.');
            this.showToast(title, options.body);
            return false;
        }

        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            image: '/icons/icon-512x512.png',
            vibrate: [200, 100, 200],
            tag: 'beautycat-notification',
            renotify: true,
            requireInteraction: false,
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);
            
            // 알림 클릭 이벤트
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                notification.close();
                
                if (options.onClick) {
                    options.onClick(event);
                }
            };

            // 자동 닫기 (5초 후)
            setTimeout(() => {
                notification.close();
            }, 5000);

            return notification;
        } catch (error) {
            console.error('❌ 알림 전송 실패:', error);
            this.showToast(title, options.body);
            return false;
        }
    }

    // 토스트 메시지 표시
    showToast(title, message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 max-w-sm bg-white border rounded-lg shadow-lg p-4 transform translate-x-full transition-transform duration-300 ease-out ${this.getToastTypeClass(type)}`;
        
        toast.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    ${this.getToastIcon(type)}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 text-sm">${title}</div>
                    ${message ? `<div class="text-gray-600 text-sm mt-1">${message}</div>` : ''}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="flex-shrink-0 text-gray-400 hover:text-gray-600">
                    <span class="text-lg">&times;</span>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // 애니메이션으로 표시
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // 자동 제거
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);

        return toast;
    }

    // 토스트 타입별 클래스
    getToastTypeClass(type) {
        const classes = {
            'success': 'border-green-200',
            'error': 'border-red-200',
            'warning': 'border-yellow-200',
            'info': 'border-blue-200'
        };
        return classes[type] || classes['info'];
    }

    // 토스트 타입별 아이콘
    getToastIcon(type) {
        const icons = {
            'success': '<span class="text-green-500 text-xl">✅</span>',
            'error': '<span class="text-red-500 text-xl">❌</span>',
            'warning': '<span class="text-yellow-500 text-xl">⚠️</span>',
            'info': '<span class="text-blue-500 text-xl">ℹ️</span>'
        };
        return icons[type] || icons['info'];
    }

    // 예약 확정 알림
    bookingConfirmed(shopName, date, time) {
        const title = '예약이 확정되었습니다! 🎉';
        const body = `${shopName}에서 ${date} ${time} 예약이 확정되었어요.`;
        
        this.sendNotification(title, {
            body: body,
            tag: 'booking-confirmed',
            onClick: () => {
                // 예약 내역 페이지로 이동
                if (document.getElementById('bookingSection')) {
                    document.getElementById('bookingSection').scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        this.showToast(title, body, 'success');
    }

    // 상담 답변 도착 알림
    consultationReplyReceived(shopName) {
        const title = '상담 답변이 도착했습니다! 💬';
        const body = `${shopName}에서 상담 답변을 보내드렸어요.`;
        
        this.sendNotification(title, {
            body: body,
            tag: 'consultation-reply',
            onClick: () => {
                // 채팅 페이지로 이동
                window.location.href = 'chat.html';
            }
        });

        this.showToast(title, body, 'info');
    }

    // 쿠폰 발급 알림
    couponIssued(couponCode, couponName) {
        const title = '새로운 쿠폰이 발급되었습니다! 🎫';
        const body = `${couponName} (${couponCode})`;
        
        this.sendNotification(title, {
            body: body,
            tag: 'coupon-issued'
        });

        this.showToast(title, body, 'success');
    }

    // 예약 리마인더
    bookingReminder(shopName, date, time, hoursUntil) {
        const title = '예약 알림 ⏰';
        const body = `${hoursUntil}시간 후 ${shopName} 예약이 있어요! (${time})`;
        
        this.sendNotification(title, {
            body: body,
            tag: 'booking-reminder',
            requireInteraction: true
        });

        this.showToast(title, body, 'warning', 8000);
    }

    // 특별 혜택 알림
    specialOfferAvailable(offerTitle, description) {
        const title = '특별 혜택이 도착했어요! 🎁';
        const body = `${offerTitle}: ${description}`;
        
        this.sendNotification(title, {
            body: body,
            tag: 'special-offer'
        });

        this.showToast(title, body, 'info', 7000);
    }

    // 리뷰 작성 요청 알림
    reviewRequestSent(shopName) {
        const title = '시술이 어떠셨나요? ⭐';
        const body = `${shopName} 시술 후기를 남겨주시면 3,000원 쿠폰을 드려요!`;
        
        this.sendNotification(title, {
            body: body,
            tag: 'review-request'
        });

        this.showToast(title, body, 'info', 10000);
    }

    // 시스템 점검 알림
    systemMaintenanceNotice(startTime, duration) {
        const title = '시스템 점검 안내 🔧';
        const body = `${startTime}부터 ${duration}간 시스템 점검이 있을 예정입니다.`;
        
        this.sendNotification(title, {
            body: body,
            tag: 'system-maintenance',
            requireInteraction: true
        });

        this.showToast(title, body, 'warning', 10000);
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 페이지 포커스 시 미읽은 알림 확인
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkPendingNotifications();
            }
        });

        // 쿠폰 시스템과 연동
        document.addEventListener('couponApplied', (event) => {
            const { couponCode, discountAmount } = event.detail;
            this.showToast(
                '쿠폰이 적용되었습니다! 🎫',
                `${couponCode} 쿠폰으로 ${this.formatPrice(discountAmount)}원 할인`,
                'success'
            );
        });

        // 예약 시스템과 연동
        document.addEventListener('bookingConfirmed', (event) => {
            const { shopName, date, time } = event.detail;
            this.bookingConfirmed(shopName, date, time);
        });
    }

    // 미읽은 알림 확인 (로컬스토리지 기반)
    checkPendingNotifications() {
        const pendingNotifications = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
        
        pendingNotifications.forEach(notification => {
            if (!notification.sent) {
                this.sendNotification(notification.title, notification.options);
                notification.sent = true;
            }
        });

        // 처리된 알림들을 로컬스토리지에 다시 저장
        localStorage.setItem('pendingNotifications', JSON.stringify(pendingNotifications));
    }

    // 알림 예약 (나중에 보내기)
    scheduleNotification(title, options, delay) {
        setTimeout(() => {
            this.sendNotification(title, options);
        }, delay);
    }

    // 반복 알림 설정
    setRecurringNotification(title, options, interval) {
        return setInterval(() => {
            this.sendNotification(title, options);
        }, interval);
    }

    // 알림 기록 저장
    logNotification(title, body, type = 'info') {
        const notifications = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
        notifications.unshift({
            id: Date.now(),
            title: title,
            body: body,
            type: type,
            timestamp: new Date().toISOString(),
            read: false
        });

        // 최대 100개까지만 보관
        if (notifications.length > 100) {
            notifications.splice(100);
        }

        localStorage.setItem('notificationHistory', JSON.stringify(notifications));
    }

    // 알림 기록 조회
    getNotificationHistory() {
        return JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    }

    // 미읽은 알림 개수
    getUnreadCount() {
        const history = this.getNotificationHistory();
        return history.filter(n => !n.read).length;
    }

    // 알림 읽음 처리
    markAsRead(notificationId) {
        const notifications = this.getNotificationHistory();
        const updated = notifications.map(n => {
            if (n.id === notificationId) {
                n.read = true;
            }
            return n;
        });
        localStorage.setItem('notificationHistory', JSON.stringify(updated));
    }

    // 모든 알림 읽음 처리
    markAllAsRead() {
        const notifications = this.getNotificationHistory();
        const updated = notifications.map(n => ({ ...n, read: true }));
        localStorage.setItem('notificationHistory', JSON.stringify(updated));
    }

    // 알림 설정 변경
    updateSettings(settings) {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...settings };
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
        console.log('🔔 알림 설정 업데이트:', newSettings);
    }

    // 알림 설정 조회
    getSettings() {
        const defaultSettings = {
            bookingReminders: true,
            consultationReplies: true,
            couponAlerts: true,
            specialOffers: true,
            systemNotices: true,
            soundEnabled: true,
            vibrationEnabled: true
        };

        const saved = localStorage.getItem('notificationSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    // 유틸리티 함수
    formatPrice(price) {
        return price.toLocaleString('ko-KR');
    }

    // 알림 테스트
    testNotification() {
        this.sendNotification('알림 테스트 🔔', {
            body: 'beautycat 알림이 정상적으로 작동하고 있습니다!',
            tag: 'test-notification'
        });

        this.showToast(
            '테스트 알림',
            '알림 시스템이 정상 작동 중입니다.',
            'info'
        );
    }
}

// 전역 알림 시스템 초기화
let notificationSystem;

document.addEventListener('DOMContentLoaded', function() {
    notificationSystem = new NotificationSystem();
    window.notificationSystem = notificationSystem; // 전역 접근 가능

    // 베타 테스트 환영 알림 (3초 후)
    setTimeout(() => {
        if (notificationSystem && !localStorage.getItem('welcomeNotificationShown')) {
            notificationSystem.showToast(
                '🐱 beautycat에 오신 것을 환영합니다!',
                '베타 테스트 기간 중 특별 혜택을 놓치지 마세요. 전문가 맞춤 케어!',
                'success',
                8000
            );
            localStorage.setItem('welcomeNotificationShown', 'true');
        }
    }, 3000);
});

// 알림 권한 요청 유틸리티 함수
async function requestNotificationPermission() {
    if (notificationSystem) {
        const granted = await notificationSystem.requestPermission();
        if (granted) {
            notificationSystem.showToast(
                '알림이 활성화되었습니다! 🔔',
                '이제 중요한 업데이트를 놓치지 않으실 수 있어요.',
                'success'
            );
        }
        return granted;
    }
    return false;
}

console.log('🔔 BeautyCat 알림 시스템 로드 완료!');