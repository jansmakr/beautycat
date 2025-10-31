/**
 * BeautyCat 예약 시스템
 * 간단한 달력 기반 예약 관리
 */

class BookingSystem {
    constructor() {
        this.apiUrl = window.CLOUDFLARE_API?.baseUrl || 'https://beautycat-api.jansmakr.workers.dev/api';
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedShop = null;
        this.availableSlots = [];
        this.init();
    }

    init() {
        console.log('📅 예약 시스템 초기화...');
        this.setupEventListeners();
        this.generateTimeSlots();
    }

    // 기본 시간 슬롯 생성 (9:00 - 18:00, 30분 간격)
    generateTimeSlots() {
        this.availableSlots = [];
        for (let hour = 9; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                this.availableSlots.push({
                    time: timeString,
                    available: true,
                    price: this.getSlotPrice(hour)
                });
            }
        }
        console.log(`⏰ ${this.availableSlots.length}개 시간 슬롯 생성 완료`);
    }

    // 시간대별 가격 (피크 시간 차등 적용)
    getSlotPrice(hour) {
        if (hour >= 10 && hour <= 16) {
            return 80000; // 주간 시간대 (높은 가격)
        } else {
            return 65000; // 아침/저녁 시간대 (할인 가격)
        }
    }

    // 예약 달력 렌더링
    renderBookingCalendar(containerId = 'bookingCalendar') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        container.innerHTML = `
            <div class="booking-calendar bg-white rounded-lg border p-4">
                <div class="calendar-header flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">${currentYear}년 ${currentMonth + 1}월</h3>
                    <div class="text-sm text-gray-500">예약 가능한 날짜를 선택하세요</div>
                </div>
                
                <div class="calendar-grid grid grid-cols-7 gap-1 mb-4">
                    ${this.renderCalendarDays(currentYear, currentMonth)}
                </div>
                
                <div id="timeSlots" class="time-slots hidden">
                    <h4 class="font-medium text-gray-900 mb-3">시간 선택</h4>
                    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        ${this.renderTimeSlots()}
                    </div>
                </div>
                
                <div id="bookingDetails" class="booking-details hidden mt-4 p-4 bg-gray-50 rounded-lg">
                    <!-- 예약 상세 정보 표시 영역 -->
                </div>
            </div>
        `;

        this.bindCalendarEvents();
    }

    // 달력 날짜 렌더링
    renderCalendarDays(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date();
        
        let html = '';
        
        // 요일 헤더
        const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
        dayHeaders.forEach(day => {
            html += `<div class="text-center text-xs font-medium text-gray-500 p-2">${day}</div>`;
        });

        // 첫 주의 빈 공간
        const startDay = firstDay.getDay();
        for (let i = 0; i < startDay; i++) {
            html += `<div class="calendar-day empty p-2"></div>`;
        }

        // 날짜들
        for (let date = 1; date <= lastDay.getDate(); date++) {
            const currentDate = new Date(year, month, date);
            const isToday = currentDate.toDateString() === today.toDateString();
            const isPast = currentDate < today;
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            
            let dayClass = 'calendar-day cursor-pointer p-2 text-center text-sm rounded hover:bg-primary-50 transition-colors';
            
            if (isPast) {
                dayClass += ' text-gray-300 cursor-not-allowed';
            } else if (isToday) {
                dayClass += ' bg-primary-100 text-primary-700 font-semibold';
            } else if (isWeekend) {
                dayClass += ' text-red-500';
            } else {
                dayClass += ' text-gray-700 hover:bg-primary-100';
            }

            html += `
                <div class="${dayClass}" 
                     data-date="${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}"
                     ${isPast ? 'data-disabled="true"' : ''}>
                    ${date}
                </div>
            `;
        }

        return html;
    }

    // 시간 슬롯 렌더링
    renderTimeSlots() {
        return this.availableSlots.map(slot => `
            <button class="time-slot px-3 py-2 text-sm border border-gray-300 rounded hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    data-time="${slot.time}"
                    data-price="${slot.price}">
                <div class="font-medium">${slot.time}</div>
                <div class="text-xs text-gray-500">${this.formatPrice(slot.price)}원</div>
            </button>
        `).join('');
    }

    // 달력 이벤트 바인딩
    bindCalendarEvents() {
        // 날짜 선택 이벤트
        document.querySelectorAll('.calendar-day').forEach(dayEl => {
            if (!dayEl.dataset.disabled) {
                dayEl.addEventListener('click', (e) => {
                    this.selectDate(e.target.dataset.date);
                });
            }
        });

        // 시간 선택 이벤트
        document.querySelectorAll('.time-slot').forEach(slotEl => {
            slotEl.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectTimeSlot(
                    slotEl.dataset.time,
                    parseInt(slotEl.dataset.price)
                );
            });
        });
    }

    // 날짜 선택 처리
    selectDate(dateString) {
        this.selectedDate = dateString;
        
        // 기존 선택 해제
        document.querySelectorAll('.calendar-day').forEach(el => {
            el.classList.remove('bg-primary-500', 'text-white');
        });
        
        // 새 선택 표시
        const selectedEl = document.querySelector(`[data-date="${dateString}"]`);
        if (selectedEl) {
            selectedEl.classList.add('bg-primary-500', 'text-white');
        }

        // 시간 슬롯 표시
        const timeSlotsEl = document.getElementById('timeSlots');
        if (timeSlotsEl) {
            timeSlotsEl.classList.remove('hidden');
        }

        console.log('📅 선택된 날짜:', dateString);
    }

    // 시간 슬롯 선택 처리
    selectTimeSlot(time, price) {
        this.selectedTime = time;
        this.selectedPrice = price;

        // 기존 시간 선택 해제
        document.querySelectorAll('.time-slot').forEach(el => {
            el.classList.remove('bg-primary-500', 'text-white', 'border-primary-500');
        });

        // 새 시간 선택 표시
        const selectedTimeEl = document.querySelector(`[data-time="${time}"]`);
        if (selectedTimeEl) {
            selectedTimeEl.classList.add('bg-primary-500', 'text-white', 'border-primary-500');
        }

        // 예약 상세 정보 표시
        this.showBookingDetails();
        
        console.log('⏰ 선택된 시간:', time, '가격:', price);
    }

    // 예약 상세 정보 표시
    showBookingDetails() {
        const detailsEl = document.getElementById('bookingDetails');
        if (!detailsEl || !this.selectedDate || !this.selectedTime) return;

        const selectedShop = this.selectedShop || {
            name: '강남 뷰티케어',
            address: '서울시 강남구 테헤란로 123',
            rating: 4.8
        };

        detailsEl.innerHTML = `
            <div class="space-y-3">
                <h4 class="font-semibold text-gray-900">📋 예약 상세 정보</h4>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">업체:</span>
                        <span class="font-medium ml-2">${selectedShop.name}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">평점:</span>
                        <span class="font-medium ml-2">⭐ ${selectedShop.rating}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">날짜:</span>
                        <span class="font-medium ml-2">${this.formatDate(this.selectedDate)}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">시간:</span>
                        <span class="font-medium ml-2">${this.selectedTime}</span>
                    </div>
                </div>

                <div class="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                    <span class="text-gray-700">예상 비용:</span>
                    <span class="text-xl font-bold text-primary-600">${this.formatPrice(this.selectedPrice)}원</span>
                </div>

                <div class="flex space-x-2">
                    <button onclick="bookingSystem.confirmBooking()" 
                            class="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors">
                        예약 확정하기
                    </button>
                    <button onclick="bookingSystem.resetSelection()" 
                            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        다시 선택
                    </button>
                </div>
            </div>
        `;

        detailsEl.classList.remove('hidden');

        // 쿠폰 시스템과 연동
        if (window.couponSystem) {
            setTimeout(() => {
                const amountInput = document.getElementById('totalAmount');
                if (amountInput) {
                    amountInput.value = this.selectedPrice;
                }
            }, 100);
        }
    }

    // 예약 확정 처리
    async confirmBooking() {
        if (!this.selectedDate || !this.selectedTime) {
            alert('날짜와 시간을 선택해주세요.');
            return;
        }

        try {
            console.log('📋 예약 확정 처리 중...');

            // 쿠폰 할인 적용 확인
            let finalAmount = this.selectedPrice;
            const couponCode = document.getElementById('couponCode')?.value;
            
            if (couponCode && window.couponSystem) {
                const couponResult = window.couponSystem.applyCoupon(couponCode, this.selectedPrice);
                if (couponResult.success) {
                    finalAmount = couponResult.finalAmount;
                    console.log('🎫 쿠폰 할인 적용:', couponResult.discountAmount);
                }
            }

            // 예약 데이터 준비
            const bookingData = {
                date: this.selectedDate,
                time: this.selectedTime,
                shopId: this.selectedShop?.id || 'demo-shop-1',
                shopName: this.selectedShop?.name || '강남 뷰티케어',
                originalAmount: this.selectedPrice,
                finalAmount: finalAmount,
                couponCode: couponCode || null,
                status: 'confirmed'
            };

            // 로컬스토리지에 예약 정보 저장 (임시)
            const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            bookingData.id = 'booking_' + Date.now();
            bookingData.createdAt = new Date().toISOString();
            bookings.push(bookingData);
            localStorage.setItem('userBookings', JSON.stringify(bookings));

            // 쿠폰 사용 처리
            if (couponCode && window.couponSystem) {
                window.couponSystem.markCouponAsUsed(
                    couponCode, 
                    this.selectedPrice, 
                    this.selectedPrice - finalAmount
                );
            }

            // 성공 메시지
            this.showBookingSuccess(bookingData);

            // 알림 발송 (알림 시스템이 있다면)
            if (window.notificationSystem) {
                window.notificationSystem.bookingConfirmed(
                    bookingData.shopName,
                    this.formatDate(this.selectedDate),
                    this.selectedTime
                );
            }

        } catch (error) {
            console.error('❌ 예약 확정 실패:', error);
            alert('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    // 예약 성공 메시지
    showBookingSuccess(bookingData) {
        const successHtml = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" id="bookingSuccessModal">
                <div class="bg-white rounded-lg p-6 max-w-md w-full">
                    <div class="text-center">
                        <div class="text-6xl mb-4">🎉</div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">예약이 확정되었습니다!</h3>
                        <p class="text-gray-600 mb-4">예약 내역을 확인해주세요.</p>
                        
                        <div class="bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-4">
                            <div><span class="text-gray-600">업체:</span> <span class="font-medium">${bookingData.shopName}</span></div>
                            <div><span class="text-gray-600">날짜:</span> <span class="font-medium">${this.formatDate(bookingData.date)}</span></div>
                            <div><span class="text-gray-600">시간:</span> <span class="font-medium">${bookingData.time}</span></div>
                            <div><span class="text-gray-600">결제 금액:</span> <span class="font-bold text-primary-600">${this.formatPrice(bookingData.finalAmount)}원</span></div>
                            ${bookingData.couponCode ? `<div><span class="text-gray-600">사용 쿠폰:</span> <span class="font-medium text-green-600">${bookingData.couponCode}</span></div>` : ''}
                        </div>

                        <div class="space-y-2">
                            <button onclick="bookingSystem.closeSuccessModal()" 
                                    class="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors">
                                확인
                            </button>
                            <p class="text-xs text-gray-500">
                                곧 업체에서 연락드려 상세 상담을 진행할 예정입니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', successHtml);
    }

    // 성공 모달 닫기
    closeSuccessModal() {
        const modal = document.getElementById('bookingSuccessModal');
        if (modal) {
            modal.remove();
        }
        this.resetSelection();
    }

    // 선택 초기화
    resetSelection() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedPrice = null;

        // UI 초기화
        document.querySelectorAll('.calendar-day').forEach(el => {
            el.classList.remove('bg-primary-500', 'text-white');
        });

        document.querySelectorAll('.time-slot').forEach(el => {
            el.classList.remove('bg-primary-500', 'text-white', 'border-primary-500');
        });

        const timeSlotsEl = document.getElementById('timeSlots');
        const detailsEl = document.getElementById('bookingDetails');
        
        if (timeSlotsEl) timeSlotsEl.classList.add('hidden');
        if (detailsEl) detailsEl.classList.add('hidden');
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // 업체 선택 시 예약 달력 표시
            document.addEventListener('click', (e) => {
                if (e.target.closest('.shop-card, .shop-item')) {
                    setTimeout(() => {
                        this.showBookingCalendar();
                    }, 500);
                }
            });
        });
    }

    // 예약 달력 표시
    showBookingCalendar() {
        let calendarContainer = document.getElementById('bookingCalendar');
        
        if (!calendarContainer) {
            // 달력 컨테이너 생성
            const consultationSection = document.getElementById('consultation');
            if (consultationSection) {
                const calendarSection = document.createElement('section');
                calendarSection.id = 'bookingSection';
                calendarSection.className = 'card mt-6';
                calendarSection.innerHTML = `
                    <div class="text-center mb-6">
                        <h2 class="text-xl font-bold text-gray-900 mb-2">📅 예약 날짜 및 시간 선택</h2>
                        <p class="text-gray-600 text-sm">원하시는 날짜와 시간을 선택해주세요</p>
                    </div>
                    <div id="bookingCalendar"></div>
                `;
                consultationSection.after(calendarSection);
                calendarContainer = document.getElementById('bookingCalendar');
            }
        }

        if (calendarContainer) {
            this.renderBookingCalendar();
            
            // 달력으로 스크롤
            calendarContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    // 유틸리티 함수들
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('ko-KR', options);
    }

    formatPrice(price) {
        return price.toLocaleString('ko-KR');
    }

    // 사용자 예약 내역 조회
    getUserBookings() {
        return JSON.parse(localStorage.getItem('userBookings') || '[]');
    }

    // 예약 취소
    cancelBooking(bookingId) {
        const bookings = this.getUserBookings();
        const updatedBookings = bookings.map(booking => {
            if (booking.id === bookingId) {
                booking.status = 'cancelled';
                booking.cancelledAt = new Date().toISOString();
            }
            return booking;
        });
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        console.log('❌ 예약 취소됨:', bookingId);
    }
}

// 전역 예약 시스템 초기화
let bookingSystem;

document.addEventListener('DOMContentLoaded', function() {
    bookingSystem = new BookingSystem();
    window.bookingSystem = bookingSystem; // 전역 접근 가능
});

console.log('📅 BeautyCat 예약 시스템 로드 완료!');