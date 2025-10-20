// 전역 변수
let uploadedImageUrl = null;

// 지역 데이터
const regionData = {
    "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    "부산광역시": ["강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"],
    "대구광역시": ["남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"],
    "인천광역시": ["계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"],
    "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
    "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
    "울산광역시": ["남구", "동구", "북구", "중구", "울주군"],
    "세종특별자치시": ["세종시"],
    "경기도": ["고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시", "가평군", "양평군", "여주시", "연천군"],
    "강원도": ["강릉시", "동해시", "삼척시", "속초시", "원주시", "춘천시", "태백시", "고성군", "양구군", "양양군", "영월군", "인제군", "정선군", "철원군", "평창군", "홍천군", "화천군", "횡성군"],
    "충청북도": ["제천시", "청주시", "충주시", "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "증평군", "진천군"],
    "충청남도": ["계룡시", "공주시", "논산시", "당진시", "보령시", "서산시", "아산시", "천안시", "금산군", "부여군", "서천군", "예산군", "청양군", "태안군", "홍성군"],
    "전라북도": ["군산시", "김제시", "남원시", "익산시", "전주시", "정읍시", "고창군", "무주군", "부안군", "순창군", "완주군", "임실군", "장수군", "진안군"],
    "전라남도": ["광양시", "나주시", "목포시", "순천시", "여수시", "강진군", "고흥군", "곡성군", "구례군", "담양군", "무안군", "보성군", "신안군", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
    "경상북도": ["경산시", "경주시", "구미시", "김천시", "문경시", "상주시", "안동시", "영주시", "영천시", "포항시", "고령군", "군위군", "봉화군", "성주군", "영덕군", "영양군", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군"],
    "경상남도": ["거제시", "김해시", "밀양시", "사천시", "양산시", "진주시", "창원시", "통영시", "거창군", "고성군", "남해군", "산청군", "의령군", "창녕군", "하동군", "함안군", "함양군", "합천군"],
    "제주특별자치도": ["제주시", "서귀포시"]
};

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 앱 초기화
function initializeApp() {
    updateAuthUI();
    setupEventListeners();
    
    // 지역별 매칭 시스템 초기화
    initializeRegionalMatching();
    
    // 대표샵 시스템 초기화
    initializeRepresentativeShops();
    
    // 데이터 로드는 비동기로 처리하여 페이지 로딩을 방해하지 않음
    setTimeout(() => {
        loadSampleShops().catch(() => {
            // 피부관리실 데이터 로드 실패 (무시)
        });
        loadAnnouncements().catch(() => {
            // 공지사항 데이터 로드 실패 (무시)
        });
        loadRepresentativeShops().catch(() => {
            // 대표샵 데이터 로드 실패 (무시)
        });
    }, 1000);
    
    setupUserAutoFill();
    fillUserDataIfLoggedIn();
    preventAutoFocus();
}

// 자동 포커스 방지
function preventAutoFocus() {
    // 모든 입력 필드에서 포커스 제거
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (document.activeElement === input) {
            input.blur();
        }
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 모바일 메뉴 토글
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 지역 선택 2단계 처리
    setupRegionSelection();

    // 이미지 업로드 처리
    setupImageUpload();

    // 상담 신청 폼 처리
    const consultationForm = document.getElementById('consultation-form');
    if (consultationForm) {
        consultationForm.addEventListener('submit', handleConsultationSubmit);
    }
    
    // 메인 페이지 상담 신청 폼 처리 (새로운 모바일 최적화 폼)
    const mainConsultationForm = document.getElementById('consultationForm');
    if (mainConsultationForm) {
        mainConsultationForm.addEventListener('submit', handleMainConsultationSubmit);
    }
    
    // 빠른 상담 신청 폼 처리
    const quickConsultationForm = document.getElementById('quick-consultation-form');
    if (quickConsultationForm) {
        quickConsultationForm.addEventListener('submit', handleQuickConsultationSubmit);
    }

    // 연락처 폼 처리
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // 치료 타입 선택 검증
    setupTreatmentTypeValidation();
}

// 이미지 업로드 설정
function setupImageUpload() {
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('image-upload');
    
    if (!imageUploadArea || !imageInput) return;

    // 클릭으로 파일 선택
    imageUploadArea.addEventListener('click', function() {
        imageInput.click();
    });

    // 드래그 앤 드롭 처리
    imageUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        imageUploadArea.classList.add('border-blue-500');
    });

    imageUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        imageUploadArea.classList.remove('border-blue-500');
    });

    imageUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        imageUploadArea.classList.remove('border-blue-500');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });

    // 파일 선택 처리
    imageInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });
}

// 이미지 파일 처리
function handleImageFile(file) {
    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('파일 크기는 5MB 이하여야 합니다.', 'error');
        return;
    }
    
    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
        showNotification('이미지 파일만 업로드할 수 있습니다.', 'error');
        return;
    }
    
    // 파일을 Data URL로 변환
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageUrl = e.target.result;
        
        // 업로드 영역에 이미지 미리보기 표시
        const imageUploadArea = document.getElementById('imageUploadArea');
        if (imageUploadArea) {
            imageUploadArea.innerHTML = `
                <div class="text-center">
                    <img src="${uploadedImageUrl}" alt="업로드된 이미지" class="max-w-full max-h-32 mx-auto mb-2 rounded">
                    <p class="text-sm text-gray-600">이미지가 업로드되었습니다.</p>
                    <button type="button" onclick="removeUploadedImage()" class="mt-2 text-red-500 hover:text-red-700 text-sm">
                        <i class="fas fa-trash mr-1"></i>삭제
                    </button>
                </div>
            `;
        }
        
        showNotification('이미지가 성공적으로 업로드되었습니다.', 'success');
    };
    
    reader.onerror = function() {
        showNotification('이미지 업로드 중 오류가 발생했습니다.', 'error');
    };
    
    reader.readAsDataURL(file);
}

// 업로드된 이미지 제거
function removeUploadedImage() {
    uploadedImageUrl = null;
    
    // 업로드 영역 초기화
    const imageUploadArea = document.getElementById('imageUploadArea');
    if (imageUploadArea) {
        imageUploadArea.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                <p class="text-gray-600 mb-2">피부 상태 이미지 업로드 (선택사항)</p>
                <p class="text-sm text-gray-500">드래그 앤 드롭하거나 클릭하여 이미지를 업로드하세요</p>
                <p class="text-xs text-gray-400 mt-2">최대 5MB, JPG, PNG, GIF 형식</p>
            </div>
        `;
    }
    
    // 파일 인풋 초기화
    const imageInput = document.getElementById('image-upload');
    if (imageInput) {
        imageInput.value = '';
    }
    
    showNotification('이미지가 제거되었습니다.', 'info');
}

// 지역 선택 2단계 설정
function setupRegionSelection() {
    // 기존 지역 선택 처리
    const provinceSelect = document.getElementById('province');
    const citySelect = document.getElementById('city');
    
    if (provinceSelect && citySelect) {
        provinceSelect.addEventListener('change', function() {
            const selectedProvince = this.value;
            
            // 구/군 선택 초기화
            citySelect.innerHTML = '<option value="">구/군 선택</option>';
            
            if (selectedProvince && regionData[selectedProvince]) {
                // 해당 시/도의 구/군 목록 추가
                regionData[selectedProvince].forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = city;
                    citySelect.appendChild(option);
                });
                citySelect.disabled = false;
            } else {
                citySelect.disabled = true;
            }
        });
    }
    
    // 간단한 폼의 지역 선택 처리
    const simpleStateSelect = document.getElementById('simpleState');
    const simpleDistrictSelect = document.getElementById('simpleDistrict');
    
    if (simpleStateSelect && simpleDistrictSelect) {
        // 시/도 옵션 추가
        Object.keys(regionData).forEach(province => {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            simpleStateSelect.appendChild(option);
        });
        
        simpleStateSelect.addEventListener('change', function() {
            const selectedProvince = this.value;
            
            // 구/군 선택 초기화
            simpleDistrictSelect.innerHTML = '<option value="">구/군 선택</option>';
            
            if (selectedProvince && regionData[selectedProvince]) {
                // 해당 시/도의 구/군 목록 추가
                regionData[selectedProvince].forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = city;
                    simpleDistrictSelect.appendChild(option);
                });
                simpleDistrictSelect.disabled = false;
            } else {
                simpleDistrictSelect.disabled = true;
            }
        });
    }
}

// 치료 타입 선택 검증 설정
function setupTreatmentTypeValidation() {
    const treatmentCheckboxes = document.querySelectorAll('input[name="treatment_type"]');
    const treatmentError = document.getElementById('treatment-type-error');
    
    if (treatmentCheckboxes.length === 0) return;

    treatmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkedBoxes = document.querySelectorAll('input[name="treatment_type"]:checked');
            
            if (checkedBoxes.length > 0 && treatmentError) {
                treatmentError.classList.add('hidden');
            }
        });
    });
}

// 상담 신청 폼 검증
function validateConsultationForm() {
    const requiredFields = [
        { id: 'name', name: '이름' },
        { id: 'email', name: '이메일' },
        { id: 'province', name: '시/도' },
        { id: 'city', name: '구/군' },
        { id: 'age', name: '나이' },
        { id: 'consultation_text', name: '상담 내용' }
    ];
    
    let isValid = true;
    
    // 필수 필드 검증
    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        const errorElement = document.getElementById(field.id + '-error');
        
        if (!element || !element.value.trim()) {
            if (errorElement) {
                errorElement.textContent = `${field.name}을(를) 입력해주세요.`;
                errorElement.classList.remove('hidden');
            }
            isValid = false;
        } else {
            if (errorElement) {
                errorElement.classList.add('hidden');
            }
        }
    }
    
    // 이메일 형식 검증
    const emailElement = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    if (emailElement && emailElement.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailElement.value)) {
            if (emailError) {
                emailError.textContent = '올바른 이메일 형식을 입력해주세요.';
                emailError.classList.remove('hidden');
            }
            isValid = false;
        }
    }
    
    
    // 치료 타입 선택 검증
    const treatmentCheckboxes = document.querySelectorAll('input[name="treatment_type"]:checked');
    const treatmentError = document.getElementById('treatment-type-error');
    
    if (treatmentCheckboxes.length === 0) {
        if (treatmentError) {
            treatmentError.textContent = '관심 있는 치료 타입을 최소 1개 이상 선택해주세요.';
            treatmentError.classList.remove('hidden');
        }
        isValid = false;
    }
    
    return isValid;
}

// 상담 신청 폼 제출 (지역별 매칭 시스템 연동)
async function submitConsultationForm() {
    try {
        // 폼 데이터 수집
        const stateElement = document.getElementById('stateSelect');
        const districtElement = document.getElementById('citySelect');
        
        const formData = {
            customer_name: document.getElementById('customerName').value,
            customer_email: document.getElementById('customerEmail').value,
            // customer_phone 제거 - 개인정보 보호를 위해 업체에게 노출하지 않음
            state: stateElement ? stateElement.value : '',
            district: districtElement ? districtElement.value : '',
            treatment_types: Array.from(document.querySelectorAll('input[name="treatment_type"]:checked')).map(cb => cb.value),
            skin_concerns: Array.from(document.querySelectorAll('input[name="skin_concern"]:checked')).map(cb => cb.value),
            age_range: document.getElementById('ageRange') ? document.getElementById('ageRange').value : '',
            budget_range: document.getElementById('budgetRange') ? document.getElementById('budgetRange').value : '',
            preferred_schedule: document.getElementById('preferredSchedule') ? document.getElementById('preferredSchedule').value : '',
            additional_notes: document.getElementById('additionalNotes') ? document.getElementById('additionalNotes').value : '',
            status: 'pending',
            submission_date: new Date().toISOString()
        };
        
        // 현재 사용자 정보 추가
        const currentUser = getCurrentUser();
        if (currentUser) {
            formData.user_id = currentUser.id;
            formData.user_type = currentUser.user_type;
        }

        // 지역 정보 검증
        if (!formData.state || !formData.district) {
            showNotification('지역을 선택해주세요.', 'error');
            return;
        }

        console.log('🏥 견적 요청 데이터:', formData);
        
        // 지역별 매칭 시스템을 통해 견적 요청 배포
        if (typeof window.regionalMatching !== 'undefined') {
            const matchingResult = await window.regionalMatching.distributeQuoteRequest(formData);
            
            if (matchingResult.success) {
                showConsultationResultWithShops(
                    matchingResult.consultationId, 
                    formData.state, 
                    formData.district,
                    matchingResult.shopsCount,
                    matchingResult.shops
                );
                
                // 폼 초기화
                const form = document.getElementById('consultationForm');
                if (form) {
                    form.reset();
                    // 지역 선택 초기화
                    if (districtElement) {
                        districtElement.innerHTML = '<option value="">먼저 시/도를 선택해주세요</option>';
                        districtElement.disabled = true;
                    }
                }
            } else {
                // 해당 지역에 샵이 없는 경우 확장 검색 제안
                showNoShopsInRegion(formData.state, formData.district, matchingResult.message);
            }
            
        } else {
            // 기존 방식으로 폴백
            console.warn('⚠️ 지역별 매칭 시스템이 로드되지 않음. 기존 방식 사용');
            
            const response = await fetch('tables/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('상담 신청에 실패했습니다.');
            }
            
            const result = await response.json();
            showConsultationResultWithShops(result.id, formData.state, formData.district, 0);
        }
        
    } catch (error) {
        console.error('상담 신청 오류:', error);
        showNotification('상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    }
}

// 연락처 문의 제출 처리
async function handleContactSubmit(e) {
    e.preventDefault();
    
    // 폼 검증
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    
    if (!name || !email || !subject || !message) {
        showNotification('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    // 이메일 형식 검증
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showNotification('올바른 이메일 형식을 입력해주세요.', 'error');
        return;
    }
    
    try {
        // 연락처 문의 데이터 생성
        const contactData = {
            name: name,
            email: email,
            subject: subject,
            message: message,
            status: 'pending',
            priority: 'normal'
        };
        
        // 현재 사용자 정보 추가 (로그인된 경우)
        const currentUser = getCurrentUser();
        if (currentUser) {
            contactData.user_id = currentUser.id;
        }
        
        // API 호출 (연락처 문의 저장)
        const response = await fetch('tables/contact_inquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        
        if (!response.ok) {
            throw new Error('문의 접수에 실패했습니다.');
        }
        
        const result = await response.json();
        
        // 성공 시 결과 모달 표시
        showContactResult(result.id);
        
        // 폼 초기화
        e.target.reset();
        
    } catch (error) {
        console.error('연락처 문의 오류:', error);
        showNotification('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    }
}

// 연락처 문의 결과 표시
function showContactResult(contactId) {
    const resultHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="contact-result-modal">
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <div class="text-center">
                    <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 mb-4">문의 접수 완료!</h3>
                    <p class="text-gray-600 mb-6">
                        문의 번호: <strong>${contactId}</strong><br><br>
                        문의사항이 성공적으로 접수되었습니다.<br>
                        영업일 기준 1-2일 내에 답변드리겠습니다.
                    </p>
                    <div class="text-sm text-gray-500 mb-6">
                        <p><strong>연락 방법:</strong> 이메일 또는 전화</p>
                        <p><strong>운영 시간:</strong> 평일 09:00 - 18:00</p>
                    </div>
                    <button onclick="closeContactResultModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                        확인
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', resultHtml);
}

// 연락처 결과 모달 닫기
function closeContactResultModal() {
    const modal = document.getElementById('contact-result-modal');
    if (modal) {
        modal.remove();
    }
}

// 샘플 피부관리실 데이터 로드 (개발 및 테스트용)
async function loadSampleShops() {
    try {
        // 기존 데이터 확인
        const existingShops = await fetch('tables/skincare_shops');
        
        if (!existingShops.ok) {
            console.log('피부관리실 테이블에 접근할 수 없습니다. 데이터 로드를 건너뜁니다.');
            return;
        }
        
        const shopsData = await existingShops.json();
        
        if (shopsData.data && shopsData.data.length >= 3) {
            return;
        }
        
        // 샘플 데이터 생성
        const sampleShops = [
            {
                shop_name: "뷰티스킨 클리닉",
                owner_name: "김미영",
                phone: "02-123-4567",
                email: "beautyskin@example.com",
                address: "서울시 강남구 역삼동 123-45",
                region: "서울특별시 강남구",
                specialties: "여드름 관리, 미백 관리, 모공 축소",
                business_hours: "월-금 09:00-18:00, 토 09:00-15:00",
                price_range: "10-50만원",
                description: "10년 경력의 전문 피부관리사가 운영하는 프리미엄 피부관리실입니다.",
                rating: 4.8,
                is_active: true,
                verified: true
            },
            {
                shop_name: "글로우 스킨케어",
                owner_name: "박지은",
                phone: "02-987-6543",
                email: "glow@example.com",
                address: "서울시 서초구 서초동 567-89",
                region: "서울특별시 서초구",
                specialties: "주름 개선, 탄력 관리, 수분 관리",
                business_hours: "화-일 10:00-19:00",
                price_range: "20-100만원",
                description: "최신 장비와 프리미엄 제품으로 확실한 효과를 보장합니다.",
                rating: 4.9,
                is_active: true,
                verified: true
            },
            {
                shop_name: "청담 피부관리실",
                owner_name: "이수정",
                phone: "051-123-4567",
                email: "cheongdam@example.com",
                address: "부산시 해운대구 우동 789-12",
                region: "부산광역시 해운대구",
                specialties: "여드름 관리, 수분 관리, 모공 축소",
                business_hours: "월-토 09:30-18:30",
                price_range: "15-40만원",
                description: "해운대에서 가장 인기 있는 피부관리실입니다.",
                rating: 4.7,
                is_active: true,
                verified: true
            }
        ];
        
        // 샘플 데이터 저장
        for (const shop of sampleShops) {
            await fetch('tables/skincare_shops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shop)
            });
        }
        
        console.log('샘플 피부관리실 데이터가 로드되었습니다.');
        
    } catch (error) {
        console.error('샘플 데이터 로드 오류:', error);
    }
}

// ======= ANNOUNCEMENTS FUNCTIONS =======

// 공지사항 로드 및 표시
async function loadAnnouncements() {
    try {
        const response = await fetch('tables/announcements?limit=10&sort=created_at');
        
        if (!response.ok) {
            console.log('공지사항 테이블에 접근할 수 없습니다. 데모 데이터를 표시합니다.');
            loadDemoAnnouncements();
            return;
        }
        
        const data = await response.json();
        const announcements = data.data || [];
        
        displayAnnouncements(announcements);
    } catch (error) {
        console.log('공지사항 로드 중 오류 발생. 데모 데이터를 표시합니다.');
        loadDemoAnnouncements();
    }
}

// 데모 공지사항 로드
function loadDemoAnnouncements() {
    const demoAnnouncements = [
        {
            id: 'ann_001',
            title: '서비스 점검 안내',
            content: '시스템 업데이트를 위해 2024년 9월 20일 새벽 2시부터 4시까지 서비스가 일시 중단됩니다. 이용에 불편을 드려 죄송합니다.',
            priority: 'important',
            target_audience: 'all',
            is_pinned: true,
            is_published: true,
            created_at: '2024-09-18T10:00:00Z'
        },
        {
            id: 'ann_002',
            title: '새로운 피부관리 프로그램 출시',
            content: '안티에이징 전문 프로그램이 새롭게 추가되었습니다. 더욱 효과적인 피부 관리를 경험해보세요!',
            priority: 'normal',
            target_audience: 'customers',
            is_pinned: false,
            is_published: true,
            created_at: '2024-09-17T14:30:00Z'
        },
        {
            id: 'ann_003',
            title: '이벤트: 첫 상담 20% 할인',
            content: '9월 한 달간 첫 상담 신청 시 20% 할인 혜택을 드립니다. 이 기회를 놓치지 마세요!',
            priority: 'normal',
            target_audience: 'customers',
            is_pinned: false,
            is_published: true,
            created_at: '2024-09-16T09:15:00Z'
        }
    ];
    
    displayAnnouncements(demoAnnouncements);
}

// 공지사항 표시
function displayAnnouncements(announcements) {
    if (!announcements || announcements.length === 0) {
        return; // 공지사항이 없으면 섹션을 숨김
    }
    
    // 게시된 공지사항만 필터링
    const publishedAnnouncements = announcements.filter(ann => 
        ann.is_published && 
        (!ann.expire_date || new Date(ann.expire_date) > new Date())
    );
    
    if (publishedAnnouncements.length === 0) {
        return; // 게시할 공지사항이 없으면 섹션을 숨김
    }
    
    // 공지사항 섹션 표시
    const announcementSection = document.getElementById('announcements-section');
    if (announcementSection) {
        announcementSection.classList.remove('hidden');
    }
    
    // 최신 공지사항 (고정된 것 우선, 그 다음 최신순)
    const sortedAnnouncements = publishedAnnouncements.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
            return b.is_pinned ? 1 : -1; // 고정된 것이 먼저
        }
        return new Date(b.created_at) - new Date(a.created_at); // 최신순
    });
    
    const latestAnnouncement = sortedAnnouncements[0];
    displayLatestAnnouncement(latestAnnouncement);
    displayAllAnnouncements(sortedAnnouncements);
}

// 최신 공지사항 표시 (항상 보이는 부분)
function displayLatestAnnouncement(announcement) {
    const container = document.getElementById('latest-announcement');
    if (!container) return;
    
    const priorityIcon = {
        'urgent': '<i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>',
        'important': '<i class="fas fa-exclamation-circle text-orange-500 mr-2"></i>',
        'normal': '<i class="fas fa-info-circle text-blue-500 mr-2"></i>',
        'low': '<i class="fas fa-info text-gray-500 mr-2"></i>'
    };
    
    container.innerHTML = `
        <div class="flex items-start">
            ${announcement.is_pinned ? '<i class="fas fa-thumbtack text-red-500 mr-2 mt-1"></i>' : ''}
            <div class="flex-1">
                <div class="flex items-center mb-2">
                    ${priorityIcon[announcement.priority] || priorityIcon.normal}
                    <h4 class="font-semibold text-gray-900">${announcement.title}</h4>
                    <span class="ml-2 text-xs text-gray-500">${formatAnnouncementDate(announcement.created_at)}</span>
                </div>
                <p class="text-gray-700 text-sm leading-relaxed">${announcement.content}</p>
            </div>
        </div>
    `;
}

// 모든 공지사항 리스트 표시
function displayAllAnnouncements(announcements) {
    const container = document.getElementById('all-announcements');
    if (!container) return;
    
    container.innerHTML = announcements.map(announcement => `
        <div class="flex items-start py-3 border-b border-gray-100 last:border-b-0">
            ${announcement.is_pinned ? '<i class="fas fa-thumbtack text-red-500 mr-2 mt-1"></i>' : ''}
            <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                    <h5 class="font-medium text-gray-900 text-sm">${announcement.title}</h5>
                    <span class="text-xs text-gray-500">${formatAnnouncementDate(announcement.created_at)}</span>
                </div>
                <p class="text-gray-600 text-sm">${announcement.content.length > 100 ? 
                    announcement.content.substring(0, 100) + '...' : 
                    announcement.content}</p>
            </div>
        </div>
    `).join('');
}

// 공지사항 목록 토글
function toggleAnnouncementsList() {
    const list = document.getElementById('announcements-list');
    const toggleText = document.getElementById('announcements-toggle-text');
    const toggleIcon = document.getElementById('announcements-toggle-icon');
    
    if (list.classList.contains('hidden')) {
        list.classList.remove('hidden');
        toggleText.textContent = '접기';
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
    } else {
        list.classList.add('hidden');
        toggleText.textContent = '전체보기';
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
    }
}

// 공지사항 날짜 포맷
function formatAnnouncementDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '오늘';
    } else if (diffDays === 2) {
        return '어제';
    } else if (diffDays <= 7) {
        return `${diffDays - 1}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR', { 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// ======= USER AUTO FILL & MEMBER-ONLY FEATURES =======

// 사용자 자동입력 설정
function setupUserAutoFill() {
    // 로그인 사용자의 정보를 자동으로 입력하는 기능은 fillUserDataIfLoggedIn에서 처리
}

// 로그인 사용자 데이터 자동 입력 (개선된 버전)
function fillUserDataIfLoggedIn() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    console.log('🔄 사용자 정보 자동 입력:', currentUser.name, currentUser.email);
    
    // 다양한 필드 ID들을 확인하여 자동 입력 (연락처 제외)
    const fieldMappings = [
        // 이름 필드들
        { ids: ['name', 'customerName', 'customer-name', 'customer_name'], value: currentUser.name },
        // 이메일 필드들  
        { ids: ['email', 'customerEmail', 'customer-email', 'customer_email'], value: currentUser.email }
        // 휴대폰 필드 제거 - 개인정보 보호를 위해 연락처는 자동 입력하지 않음
    ];
    
    fieldMappings.forEach(mapping => {
        if (!mapping.value) return;
        
        mapping.ids.forEach(id => {
            const field = document.getElementById(id);
            if (field && !field.value) {
                field.value = mapping.value;
                
                // readonly 속성 제거 (사용자가 수정할 수 있도록)
                if (field.hasAttribute('readonly')) {
                    field.removeAttribute('readonly');
                    field.classList.remove('cursor-pointer');
                    field.classList.add('cursor-text');
                }
                
                console.log(`✅ ${id} 필드에 ${mapping.value} 자동 입력 완료`);
            }
        });
    });
    
    // 폼 필드들 활성화 (로그인 사용자는 바로 작성 가능)
    enableAllFormFields();
}

// 모든 폼 필드 활성화 (로그인 사용자용)
function enableAllFormFields() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // readonly 속성이 있는 모든 필드 활성화
    const readonlyFields = document.querySelectorAll('input[readonly], textarea[readonly]');
    readonlyFields.forEach(field => {
        field.removeAttribute('readonly');
        field.classList.remove('cursor-pointer');
        field.classList.add('cursor-text');
        
        // 클릭 이벤트 리스너 제거 (로그인 체크 불필요)
        field.removeAttribute('onclick');
    });
    
    console.log(`✅ ${readonlyFields.length}개 폼 필드 활성화 완료`);
}

// 결과 모달 닫기
function closeResultModal() {
    const modal = document.getElementById('result-modal');
    if (modal) {
        modal.remove();
    }
}

// 기본 상담 결과 표시
function showConsultationResult(consultationId) {
    const resultHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="result-modal">
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <div class="text-center">
                    <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">상담 신청 완료!</h3>
                    <p class="text-gray-600 mb-6">
                        상담 번호: <strong>${consultationId}</strong><br><br>
                        해당 지역의 피부관리실에서 곧 연락드릴 예정입니다.<br>
                        보통 24시간 내에 여러 업체의 견적을 받아보실 수 있습니다.
                    </p>
                    <div class="space-y-2">
                        <button onclick="closeResultModal()" class="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg">
                            확인
                        </button>
                        <a href="customer-dashboard.html" class="block w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-center">
                            내 상담 현황 보기
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', resultHtml);
}

// 상담 결과와 함께 지역별 업체 표시 (업데이트됨)
async function showConsultationResultWithShops(consultationId, state, district, shopsCount = 0, shops = []) {
    try {
        // 해당 지역의 우수업체 가져오기
        const topShops = await getTopRatedShops(region);
        
        const resultHtml = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="result-modal">
                <div class="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="text-center mb-6">
                        <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">상담 신청 완료!</h3>
                        <p class="text-gray-600 mb-4">
                            상담 번호: <strong>${consultationId}</strong><br><br>
                            <span class="text-green-600 font-semibold">${state} ${district}</span> 지역의 <strong>${shopsCount}개 피부관리실</strong>에 견적 요청이 전송되었습니다.<br>
                            보통 24시간 내에 여러 업체의 견적을 받아보실 수 있습니다.
                        </p>
                    </div>
                    
                    ${shops.length > 0 ? `
                    <div class="border-t pt-6">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                            <h4 class="text-lg font-semibold text-gray-900">${state} ${district} 견적 요청 업체 ${Math.min(shops.length, 3)}개</h4>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            ${shops.slice(0, 3).map((shop, index) => `
                                <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div class="flex items-center mb-2">
                                        <span class="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">
                                            ${index + 1}
                                        </span>
                                        <h5 class="font-semibold text-gray-900">${shop.name}</h5>
                                    </div>
                                    <div class="flex items-center mb-2">
                                        <i class="fas fa-phone text-green-500 mr-1"></i>
                                        <span class="text-sm text-gray-600">${shop.phone}</span>
                                    </div>
                                    <p class="text-xs text-gray-500 mb-2">견적 요청이 전송되었습니다</p>
                                    <p class="text-xs text-green-600 font-medium">24시간 내 연락 예정</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="mt-4 text-center text-sm text-gray-500">
                            * ${state} ${district} 지역에서 견적 요청을 받는 업체들입니다.
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="mt-6 text-center">
                        <button onclick="closeResultModal()" class="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg mr-2">
                            확인
                        </button>
                        <a href="customer-dashboard.html" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                            내 상담 현황 보기
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', resultHtml);
    } catch (error) {
        console.error('업체 조회 오류:', error);
        // 오류 시 기본 결과 모달 표시
        showConsultationResult(consultationId);
    }
}

// 해당 지역에 샵이 없을 때 표시
function showNoShopsInRegion(state, district, message) {
    const resultHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="no-shops-modal">
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <div class="text-center">
                    <i class="fas fa-map-marker-alt text-orange-500 text-5xl mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 mb-4">지역 검색 결과</h3>
                    <p class="text-gray-600 mb-6">
                        ${message}
                    </p>
                    
                    <div class="space-y-3">
                        <button onclick="expandSearch('${state}', '${district}')" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                            인근 지역 포함 검색
                        </button>
                        <button onclick="closeNoShopsModal()" class="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                            다시 시도
                        </button>
                    </div>
                    
                    <div class="mt-4 text-sm text-gray-500">
                        <p>📞 직접 문의: 1588-0000</p>
                        <p>📧 이메일: help@pposhop.kr</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', resultHtml);
}

// 인근 지역 포함 확장 검색
async function expandSearch(state, district) {
    try {
        console.log(`🔍 확장 검색 시작: ${state} ${district}`);
        
        if (typeof window.regionalMatching !== 'undefined') {
            const expandedShops = await window.regionalMatching.expandedSearch(state, district);
            
            closeNoShopsModal();
            
            if (expandedShops.length > 0) {
                showExpandedSearchResults(state, district, expandedShops);
            } else {
                showNotification('인근 지역에도 등록된 피부관리실이 없습니다. 직접 문의해주세요.', 'warning');
            }
        }
        
    } catch (error) {
        console.error('확장 검색 오류:', error);
        showNotification('확장 검색 중 오류가 발생했습니다.', 'error');
    }
}

// 확장 검색 결과 표시
function showExpandedSearchResults(state, district, shops) {
    const resultHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="expanded-results-modal">
            <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div class="text-center mb-6">
                    <i class="fas fa-search-location text-blue-500 text-5xl mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 mb-4">인근 지역 피부관리실 ${shops.length}개 발견</h3>
                    <p class="text-gray-600 mb-4">
                        ${state} ${district} 및 인근 지역의 피부관리실들입니다.<br>
                        직접 연락하여 상담받아보세요.
                    </p>
                </div>
                
                <div class="space-y-4">
                    ${shops.slice(0, 5).map(shop => `
                        <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-2">
                                <h5 class="font-semibold text-gray-900">${shop.shop_name}</h5>
                                <span class="text-sm text-gray-500">${shop.state} ${shop.district}</span>
                            </div>
                            <div class="flex items-center mb-2">
                                <i class="fas fa-phone text-green-500 mr-2"></i>
                                <span class="text-sm text-gray-600">${shop.phone}</span>
                            </div>
                            <p class="text-sm text-gray-600">${shop.address || '주소 정보 없음'}</p>
                            ${shop.treatment_types ? `<p class="text-xs text-blue-600 mt-1">전문분야: ${shop.treatment_types.join(', ')}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-6 text-center">
                    <button onclick="closeExpandedResultsModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                        확인
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', resultHtml);
}

// 모달 닫기 함수들
function closeNoShopsModal() {
    const modal = document.getElementById('no-shops-modal');
    if (modal) {
        modal.remove();
    }
}

function closeExpandedResultsModal() {
    const modal = document.getElementById('expanded-results-modal');
    if (modal) {
        modal.remove();
    }
}

// 지역별 우수업체 가져오기
async function getTopRatedShops(region) {
    try {
        // 해당 지역의 피부관리실 조회
        const response = await fetch(`tables/skincare_shops?search=${encodeURIComponent(region)}&limit=50`);
        const data = await response.json();
        let shops = data.data || [];
        
        if (shops.length === 0) {
            // API 실패 시 데모 데이터 사용
            shops = [
                {
                    id: 'shop_001',
                    shop_name: '뷰티스킨 클리닉',
                    specialties: '여드름 관리, 미백 관리, 모공 축소',
                    address: '서울시 강남구 역삼동 123-45',
                    price_range: '10-50만원',
                    rating: 4.8,
                    review_count: 127,
                    region: region
                },
                {
                    id: 'shop_002',
                    shop_name: '글로우 스킨케어',
                    specialties: '주름 개선, 탄력 관리, 수분 관리',
                    address: '서울시 서초구 서초동 567-89',
                    price_range: '20-100만원',
                    rating: 4.9,
                    review_count: 89,
                    region: region
                },
                {
                    id: 'shop_003',
                    shop_name: '청담 피부관리실',
                    specialties: '여드름 관리, 수분 관리, 모공 축소',
                    address: '부산시 해운대구 우동 789-12',
                    price_range: '15-40만원',
                    rating: 4.7,
                    review_count: 156,
                    region: region
                }
            ];
        }
        
        // 평점 순으로 정렬하여 상위 3개만 반환
        const topShops = shops
            .filter(shop => shop.is_active !== false && shop.verified !== false)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3);
        
        return topShops;
    } catch (error) {
        console.error('우수업체 조회 오류:', error);
        return [];
    }
}

// 별점 생성 도우미 함수
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // 완전한 별
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    // 반 별
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // 빈 별
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    
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

// 스크롤 함수
function scrollToConsultation() {
    document.getElementById('consultation').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// 피부관리실 등록 페이지 열기
function openShopRegistration() {
    window.location.href = 'shop-registration.html';
}

// ======= 헤더 메뉴 함수들 =======

// 모바일 네비게이션 메뉴 토글
function toggleMobileNavMenu() {
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    if (mobileNavMenu) {
        mobileNavMenu.classList.toggle('hidden');
    }
}

// 모바일 네비게이션 메뉴 닫기
function closeMobileNavMenu() {
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    if (mobileNavMenu) {
        mobileNavMenu.classList.add('hidden');
    }
}

// 사용자 메뉴 토글
function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.classList.toggle('hidden');
    }
}

// 대시보드로 리디렉션 개선
function redirectToDashboard() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        switch(currentUser.user_type) {
            case 'customer':
                window.location.href = 'customer-dashboard.html';
                break;
            case 'shop':
            case 'shop_owner':
                window.location.href = 'shop-dashboard.html';
                break;
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            default:
                window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
}

// 로그아웃 함수
function logout() {
    // 세션 데이터 정리
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_data');
    localStorage.removeItem('currentUser');
    
    // 전역 변수 초기화
    window.currentUser = null;
    window.sessionToken = null;
    
    // UI 업데이트
    updateAuthUI();
    
    // 메인 페이지로 리다이렉트
    window.location.href = 'index.html';
}

// 현재 로그인한 사용자 가져오기 (간단 버전)
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('사용자 데이터 파싱 오류:', error);
        return null;
    }
}

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_type');
        localStorage.removeItem('user_data');
        showNotification('로그아웃되었습니다.', 'info');
        updateAuthUI(); // UI 업데이트
    }
}

// 로그인 상태에 따른 UI 업데이트
function updateAuthUI() {
    const userMenu = document.getElementById('userMenu');
    const loginBtn = document.getElementById('loginBtn');
    
    // 현재 사용자 정보 가져오기
    const currentUser = getCurrentUser();
    
    if (currentUser && userMenu) {
        // 로그인된 상태 - 사용자 정보 표시
        userMenu.innerHTML = '';
        
        const userInfoDiv = document.createElement('div');
        userInfoDiv.className = 'flex items-center space-x-2';
        
        const userName = document.createElement('span');
        userName.className = 'text-sm text-gray-700';
        userName.textContent = `${currentUser.name}님`;
        
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn-secondary text-sm px-4 py-2 touch-feedback';
        logoutBtn.textContent = '로그아웃';
        logoutBtn.onclick = function() {
            logout();
        };
        
        userInfoDiv.appendChild(userName);
        userInfoDiv.appendChild(logoutBtn);
        userMenu.appendChild(userInfoDiv);
        
    } else if (userMenu && !currentUser) {
        // 로그인되지 않은 상태 - 기존 로그인 버튼이 있으면 그대로 유지
        if (!loginBtn) {
            userMenu.innerHTML = '';
            
            const newLoginBtn = document.createElement('button');
            newLoginBtn.id = 'loginBtn';
            newLoginBtn.className = 'btn-secondary text-sm px-4 py-2 touch-feedback';
            newLoginBtn.textContent = '로그인';
            newLoginBtn.onclick = function() {
                window.location.href = 'login.html';
            };
            
            userMenu.appendChild(newLoginBtn);
        }
        // 기존 로그인 버튼이 있으면 그대로 유지 (HTML에서 정의된 onclick 핸들러 보존)
    }
}

// 대시보드로 리다이렉트
function redirectToDashboard(userType) {
    switch(userType) {
        case 'customer':
            window.location.href = 'customer-dashboard.html';
            break;
        case 'shop_owner':
            window.location.href = 'shop-dashboard.html';
            break;
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        default:
            window.location.href = 'login.html';
    }
}

// 고급 기능 접근 시 로그인 체크
function checkLoginForAdvancedFeatures() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        showLoginModal();
        return false;
    }
    
    // 로그인된 경우 정상적으로 선택 허용
    return true;
}

// 치료 타입 선택 시 로그인 체크
function checkLoginForTreatmentType(element) {
    // 이벤트가 실제 사용자 클릭인지 확인
    if (!event || !event.isTrusted) {
        return true;
    }
    
    const currentUser = getCurrentUser();
    const checkbox = element.querySelector('input[type="checkbox"]');
    
    if (!currentUser) {
        event.preventDefault();
        event.stopPropagation();
        // 비회원인 경우 체크박스 선택 방지하고 모달 표시
        if (checkbox) {
            checkbox.checked = false;
        }
        showLoginModal();
        return false;
    }
    
    // 로그인된 사용자인 경우 체크박스 상태 토글
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
    }
    return true;
}

// 로그인 모달 표시
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }
}

// 로그인 모달 닫기
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // 스크롤 복원
    }
}

// 비회원으로 계속하기
function continueAsGuest() {
    closeLoginModal();
    showNotification('회원가입 후 더 정확하고 개인화된 상담 서비스를 받아보세요!', 'info');
    
    // 상세 상담 신청 폼으로 스크롤
    setTimeout(() => {
        const consultationSection = document.getElementById('consultation');
        if (consultationSection) {
            consultationSection.scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
    }, 500);
}

// 폼 필드 클릭 시 로그인 체크
function checkLoginForFormField(element) {
    // 이벤트가 실제 사용자 클릭인지 확인
    if (!event || !event.isTrusted) {
        return true;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        event.preventDefault();
        event.stopPropagation();
        
        // 포커스 제거
        if (element.blur) {
            element.blur();
        }
        // 체크박스인 경우 체크 해제
        if (element.type === 'checkbox') {
            element.checked = false;
        }
        showLoginModal();
        return false;
    }
    
    // 로그인된 경우 정상 동작 허용
    return true;
}

// 폼 필드 활성화
function enableFormField(element) {
    if (element.hasAttribute('readonly')) {
        element.removeAttribute('readonly');
        element.classList.remove('cursor-pointer');
        element.classList.add('cursor-text');
    }
    
    // 입력 필드인 경우 포커스
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        setTimeout(() => {
            element.focus();
        }, 100);
    }
}

// 상담 신청 폼 제출 핸들러
function handleConsultationSubmit(e) {
    // 이벤트가 있다면 기본 동작 방지
    if (e) {
        e.preventDefault();
    }
    
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    // 폼 검증 및 제출
    if (validateConsultationForm()) {
        submitConsultationForm();
    }
}

// ======= 빠른 상담 신청 처리 =======

// 빠른 상담 신청 폼 제출 처리
async function handleQuickConsultationSubmit(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    
    // 비회원인 경우 회원가입 유도
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    // 회원인 경우 상세 상담 신청 페이지로 이동하여 정보 자동 입력
    const formData = collectQuickFormData();
    
    // 세션 스토리지에 임시 저장
    sessionStorage.setItem('quickConsultationData', JSON.stringify(formData));
    
    // 상세 상담 신청으로 스크롤 이동
    document.getElementById('consultation').scrollIntoView({ 
        behavior: 'smooth' 
    });
    
    // 상세 폼에 데이터 미리 입력
    setTimeout(() => {
        fillDetailedFormFromQuickForm(formData);
        showNotification('상세 상담 신청 폼으로 정보가 이동되었습니다.', 'info');
    }, 1000);
}

// 빠른 폼 데이터 수집
function collectQuickFormData() {
    const form = document.getElementById('quick-consultation-form');
    const formData = new FormData(form);
    
    // 체크박스 데이터 처리
    const treatments = [];
    const checkedBoxes = document.querySelectorAll('input[name="quick-treatment"]:checked');
    checkedBoxes.forEach(box => treatments.push(box.value));
    
    return {
        name: formData.get('quick-name'),
        email: formData.get('quick-email'),
        region: formData.get('quick-region'),
        treatments: treatments,
        message: formData.get('quick-message')
    };
}

// 상세 폼에 빠른 폼 데이터 입력
function fillDetailedFormFromQuickForm(data) {
    // 이름과 이메일은 이미 자동 입력됨 (로그인 사용자)
    
    // 지역 선택
    if (data.region) {
        const provinceSelect = document.getElementById('province');
        if (provinceSelect) {
            provinceSelect.value = data.region;
            // 지역 변경 이벤트 트리거
            const event = new Event('change');
            provinceSelect.dispatchEvent(event);
        }
    }
    
    // 치료 타입 선택
    if (data.treatments && data.treatments.length > 0) {
        const treatmentCheckboxes = document.querySelectorAll('input[name="treatment_type"]');
        treatmentCheckboxes.forEach(checkbox => {
            if (data.treatments.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
    }
    
    // 상담 내용
    if (data.message) {
        const consultationText = document.getElementById('consultation_text');
        if (consultationText) {
            consultationText.value = data.message;
        }
    }
}

// ======= 레벨 1 기본인증 시스템 (40원) =======

class Level1BasicAuth {
    constructor() {
        this.config = {
            // API 엔드포인트
            endpoints: {
                basic_auth: '/api/auth/basic',
                sms_send: '/api/sms/send',
                sms_verify: '/api/sms/verify',
                email_send: '/api/email/send',
                email_verify: '/api/email/verify'
            },
            
            // 비용 설정 (원/건)
            pricing: {
                email_auth: 5,      // 이메일 인증
                sms_auth: 35,       // SMS 인증  
                total_basic: 40     // 레벨 1 기본인증 총 비용
            },
            
            // 기본 인증 설정
            basic: {
                name: '레벨 1 기본 인증',
                cost: 40,
                methods: ['email', 'sms'],
                security_level: 1
            }
        };
        
        this.currentAuth = null;
        this.init();
    }
    
    // 초기화
    init() {
        console.log('📱 레벨 1 기본인증 시스템 초기화 완료');
    }
    
    // 레벨 1 기본 인증 시작 (이메일 5원 + SMS 35원 = 40원)
    async startBasicAuth(userData) {
        console.log('🚀 레벨 1 기본 인증 시작:', userData);
        
        try {
            // 입력 데이터 검증
            if (!userData.email || !userData.phone) {
                throw new Error('이메일과 휴대폰 번호를 입력해주세요.');
            }
            
            this.currentAuth = {
                level: 'basic',
                userData: userData,
                steps: ['email', 'sms'],
                currentStep: 0,
                startTime: Date.now(),
                verified: {
                    email: false,
                    sms: false
                }
            };
            
            // 1단계: 이메일 인증 (5원)
            const emailResult = await this.sendEmailVerification(userData.email);
            if (!emailResult.success) {
                throw new Error('이메일 인증 요청 실패: ' + emailResult.message);
            }
            
            // 2단계: SMS 인증 (35원)
            const smsResult = await this.sendSMSVerification(userData.phone);
            if (!smsResult.success) {
                throw new Error('SMS 인증 요청 실패: ' + smsResult.message);
            }
            
            // 인증 진행 UI 표시
            this.showVerificationUI();
            
            return {
                success: true,
                message: '이메일과 SMS로 인증 코드를 발송했습니다. (총 비용: 40원)',
                auth_id: this.generateAuthId(),
                expires_in: 300, // 5분
                cost: this.config.basic.cost
            };
            
        } catch (error) {
            console.error('레벨 1 기본 인증 실패:', error);
            this.showError(error.message);
            return { success: false, message: error.message };
        }
    }
    
    // 이메일 인증 발송 (실제 API - SendGrid 5원)
    async sendEmailVerification(email) {
        try {
            console.log('📧 이메일 인증 발송:', email);
            
            // 실제 환경에서는 SendGrid API 호출
            const response = await this.callEmailAPI({
                to: email,
                subject: '[beautycat] 이메일 인증 코드',
                template: 'email_verification',
                verification_code: this.generateVerificationCode()
            });
            
            // 개발 환경에서는 Mock 응답
            const mockResponse = {
                success: true,
                message: '이메일 인증 코드를 발송했습니다.',
                cost: 5,
                messageId: 'mock_' + Date.now()
            };
            
            console.log('✅ 이메일 발송 완료 (비용: 5원)');
            return mockResponse;
            
        } catch (error) {
            console.error('이메일 발송 실패:', error);
            return { success: false, message: '이메일 발송에 실패했습니다.' };
        }
    }
    
    // SMS 인증 발송 (실제 API - NHN Cloud 35원)
    async sendSMSVerification(phone) {
        try {
            console.log('📱 SMS 인증 발송:', phone);
            
            // 실제 환경에서는 NHN Cloud SMS API 호출
            const response = await this.callSMSAPI({
                to: phone,
                message: `[beautycat] 인증번호: ${this.generateVerificationCode()}`,
                type: 'SMS'
            });
            
            // 개발 환경에서는 Mock 응답
            const mockResponse = {
                success: true,
                message: 'SMS 인증 코드를 발송했습니다.',
                cost: 35,
                messageId: 'sms_mock_' + Date.now()
            };
            
            console.log('✅ SMS 발송 완료 (비용: 35원)');
            return mockResponse;
            
        } catch (error) {
            console.error('SMS 발송 실패:', error);
            return { success: false, message: 'SMS 발송에 실패했습니다.' };
        }
    }
    
    // 인증 코드 검증
    async verifyCode(type, identifier, code) {
        try {
            console.log(`🔍 ${type} 인증 코드 검증:`, identifier, code);
            
            // 실제 환경에서는 API 검증
            const isValid = await this.validateCodeWithAPI(type, identifier, code);
            
            // 개발 환경에서는 Mock 검증 (코드: 123456)
            const mockValid = code === '123456' || code === '000000';
            
            if (isValid || mockValid) {
                console.log(`✅ ${type} 인증 검증 성공`);
                
                // 인증 상태 업데이트
                this.currentAuth.verified[type] = true;
                this.updateAuthProgress();
                
                // 모든 인증이 완료되었는지 확인
                if (this.isAuthComplete()) {
                    await this.completeBasicAuth();
                }
                
                return {
                    success: true,
                    message: `${type} 인증이 완료되었습니다.`
                };
            } else {
                throw new Error('인증 코드가 올바르지 않습니다.');
            }
            
        } catch (error) {
            console.error('코드 검증 실패:', error);
            return { success: false, message: error.message };
        }
    }
    
    // 인증 완료 여부 확인
    isAuthComplete() {
        if (!this.currentAuth || !this.currentAuth.verified) {
            return false;
        }
        
        return this.currentAuth.verified.email && this.currentAuth.verified.sms;
    }
    
    // 기본 인증 완료 처리
    async completeBasicAuth() {
        try {
            console.log('🎉 레벨 1 기본인증 완료!');
            
            const authData = {
                user_id: this.currentAuth.userData.user_id,
                auth_level: 1,
                auth_type: 'basic',
                verified_email: this.currentAuth.userData.email,
                verified_phone: this.currentAuth.userData.phone,
                auth_time: new Date().toISOString(),
                total_cost: this.config.basic.cost
            };
            
            // 인증 결과 저장
            await this.saveAuthResult(authData);
            
            // 사용자에게 완료 알림
            this.showSuccess('레벨 1 기본인증이 완료되었습니다! (총 비용: 40원)');
            
            // 인증 UI 닫기
            setTimeout(() => {
                this.hideVerificationUI();
            }, 2000);
            
            return authData;
            
        } catch (error) {
            console.error('인증 완료 처리 실패:', error);
            throw error;
        }
    }
    
    // 인증 진행 UI 표시
    showVerificationUI() {
        // 기존 모달이 있으면 제거
        const existingModal = document.getElementById('level1AuthModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 새 인증 UI 생성
        const modalHTML = `
            <div id="level1AuthModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div class="text-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">레벨 1 기본인증</h3>
                        <p class="text-sm text-gray-600">이메일과 SMS로 발송된 인증코드를 입력해주세요</p>
                        <p class="text-xs text-blue-600">총 인증 비용: 40원 (이메일 5원 + SMS 35원)</p>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                이메일 인증코드
                            </label>
                            <input type="text" id="emailCode" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                                   placeholder="이메일로 받은 6자리 코드" maxlength="6">
                            <button onclick="level1Auth.verifyEmailCode()" 
                                    class="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
                                이메일 인증 확인
                            </button>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                SMS 인증코드
                            </label>
                            <input type="text" id="smsCode" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                                   placeholder="SMS로 받은 6자리 코드" maxlength="6">
                            <button onclick="level1Auth.verifySMSCode()" 
                                    class="mt-2 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600">
                                SMS 인증 확인
                            </button>
                        </div>
                    </div>
                    
                    <div id="authProgress" class="mt-4 text-center">
                        <div class="flex justify-center space-x-4">
                            <span id="emailStatus" class="text-gray-400">📧 이메일</span>
                            <span id="smsStatus" class="text-gray-400">📱 SMS</span>
                        </div>
                    </div>
                    
                    <div class="mt-4 text-center">
                        <button onclick="level1Auth.hideVerificationUI()" 
                                class="px-4 py-2 text-gray-500 hover:text-gray-700">
                            취소
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // 이메일 코드 검증 (UI 헬퍼)
    async verifyEmailCode() {
        const code = document.getElementById('emailCode').value;
        if (!code) {
            this.showError('이메일 인증코드를 입력해주세요.');
            return;
        }
        
        const result = await this.verifyCode('email', this.currentAuth.userData.email, code);
        if (result.success) {
            document.getElementById('emailStatus').innerHTML = '✅ 이메일 완료';
            document.getElementById('emailStatus').className = 'text-green-500';
        } else {
            this.showError(result.message);
        }
    }
    
    // SMS 코드 검증 (UI 헬퍼)
    async verifySMSCode() {
        const code = document.getElementById('smsCode').value;
        if (!code) {
            this.showError('SMS 인증코드를 입력해주세요.');
            return;
        }
        
        const result = await this.verifyCode('sms', this.currentAuth.userData.phone, code);
        if (result.success) {
            document.getElementById('smsStatus').innerHTML = '✅ SMS 완료';
            document.getElementById('smsStatus').className = 'text-green-500';
        } else {
            this.showError(result.message);
        }
    }
    
    // 인증 진행 상황 업데이트
    updateAuthProgress() {
        console.log('🔄 인증 진행 상황 업데이트:', this.currentAuth.verified);
    }
    
    // 인증 UI 숨기기
    hideVerificationUI() {
        const modal = document.getElementById('level1AuthModal');
        if (modal) {
            modal.remove();
        }
    }
    
    // 유틸리티 함수들
    generateAuthId() {
        return 'AUTH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // Mock API 호출들 (실제 환경에서는 실제 API 사용)
    async callEmailAPI(data) {
        // SendGrid API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, messageId: 'mock_email_' + Date.now() };
    }
    
    async callSMSAPI(data) {
        // NHN Cloud SMS API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, messageId: 'mock_sms_' + Date.now() };
    }
    
    async validateCodeWithAPI(type, identifier, code) {
        // 실제 환경에서는 서버 검증
        await new Promise(resolve => setTimeout(resolve, 300));
        return false; // Mock에서는 항상 false 반환하여 클라이언트 검증 사용
    }
    
    async saveAuthResult(authData) {
        // 실제 환경에서는 데이터베이스 저장
        console.log('💾 인증 결과 저장:', authData);
        localStorage.setItem('level1_auth_result', JSON.stringify(authData));
    }
    
    // UI 메시지 표시
    showError(message) {
        showNotification(message, 'error');
    }
    
    showSuccess(message) {
        showNotification(message, 'success');
    }
}

// 전역 레벨 1 기본인증 인스턴스 생성
const level1Auth = new Level1BasicAuth();

// 지역별 매칭 시스템 초기화
function initializeRegionalMatching() {
    try {
        // RegionalMatching 클래스가 로드되었는지 확인
        if (typeof RegionalMatching !== 'undefined') {
            window.regionalMatching = new RegionalMatching();
            console.log('✅ 지역별 매칭 시스템 초기화 완료');
        } else {
            console.warn('⚠️ RegionalMatching 클래스를 찾을 수 없습니다. regional-matching.js가 로드되었는지 확인하세요.');
            
            // 간단한 폴백 매칭 시스템 생성
            window.regionalMatching = createFallbackMatching();
        }
    } catch (error) {
        console.error('❌ 지역별 매칭 시스템 초기화 오류:', error);
        
        // 폴백 시스템 사용
        window.regionalMatching = createFallbackMatching();
    }
}

// 폴백 매칭 시스템 (regional-matching.js가 로드되지 않은 경우)
function createFallbackMatching() {
    return {
        async distributeQuoteRequest(consultationData) {
            try {
                console.log('🔄 폴백 매칭 시스템 사용');
                
                // 해당 지역 샵 검색
                const response = await fetch('tables/skincare_shops?limit=100');
                const shopsData = await response.json();
                
                // 지역 필터링
                const matchedShops = shopsData.data.filter(shop => {
                    const shopState = shop.state || shop.shop_state || '';
                    const shopDistrict = shop.district || shop.shop_district || '';
                    
                    const stateMatch = shopState.includes(consultationData.state?.replace('특별시', '').replace('광역시', '')) || 
                                     consultationData.state?.includes(shopState.replace('특별시', '').replace('광역시', ''));
                    const districtMatch = shopDistrict.includes(consultationData.district) || 
                                        consultationData.district?.includes(shopDistrict);
                    
                    return stateMatch && districtMatch && (shop.status === 'approved' || !shop.status);
                });
                
                console.log(`📍 ${consultationData.state} ${consultationData.district} 지역에서 ${matchedShops.length}개 업체 발견`);
                
                if (matchedShops.length === 0) {
                    return {
                        success: false,
                        message: '해당 지역에 등록된 피부관리실이 없습니다.',
                        shopsCount: 0
                    };
                }
                
                // 상담 요청 저장
                const consultationResponse = await fetch('tables/consultations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...consultationData,
                        status: 'pending',
                        submission_date: new Date().toISOString()
                    })
                });
                
                if (!consultationResponse.ok) {
                    throw new Error('상담 요청 저장 실패');
                }
                
                const savedConsultation = await consultationResponse.json();
                
                return {
                    success: true,
                    message: `${consultationData.state} ${consultationData.district} 지역의 ${matchedShops.length}개 피부관리실에 견적 요청이 전송되었습니다.`,
                    shopsCount: matchedShops.length,
                    consultationId: savedConsultation.id,
                    shops: matchedShops.map(shop => ({
                        name: shop.shop_name || shop.name,
                        phone: shop.phone
                    }))
                };
                
            } catch (error) {
                console.error('폴백 매칭 오류:', error);
                return {
                    success: false,
                    message: '견적 요청 처리 중 오류가 발생했습니다.',
                    shopsCount: 0
                };
            }
        }
    };
}

// 레벨 1 인증 데모 함수
function showLevel1Demo() {
    const demoData = {
        email: 'demo@pposhop.kr',
        phone: '010-1234-5678',
        user_id: 'demo_user'
    };
    
    showNotification('레벨 1 기본인증 데모를 시작합니다 (테스트 코드: 123456 또는 000000)', 'info');
    
    // 데모 인증 시작
    setTimeout(() => {
        level1Auth.startBasicAuth(demoData);
    }, 1000);
}

// 전역 함수로 등록
window.showLevel1Demo = showLevel1Demo;

// 메인 페이지 상담 신청 폼 처리 (연락처 정보 제외)
async function handleMainConsultationSubmit(e) {
    e.preventDefault();
    
    // 제출 버튼 상태 관리
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn ? submitBtn.innerHTML : '<i class="fas fa-paper-plane mr-2"></i>견적 요청하기';
    
    const currentUser = getCurrentUser();
    
    // 비회원인 경우 로그인 안내
    if (!currentUser) {
        showNotification('로그인 후 상담 신청이 가능합니다.', 'warning');
        return;
    }
    
    try {
        // 폼 데이터 수집 (연락처 제외)
        const formData = {
            customer_name: document.getElementById('customerName').value,
            customer_email: currentUser.email, // 로그인된 사용자 이메일 사용
            // customer_phone 완전 제외 - 개인정보 보호
            state: document.getElementById('customerState').value,
            district: document.getElementById('customerDistrict').value,
            // 페이스 케어 서비스 수집
            face_services: Array.from(document.querySelectorAll('input[name="faceServices"]:checked')).map(input => {
                if (input.value === 'face-other') {
                    const otherTextInput = document.querySelector('input[name="faceOtherText"]');
                    const otherText = otherTextInput ? otherTextInput.value.trim() : '';
                    return otherText ? `기타: ${otherText}` : '페이스 기타/모름';
                }
                return input.value;
            }),
            // 바디 케어 서비스 수집
            body_services: Array.from(document.querySelectorAll('input[name="bodyServices"]:checked')).map(input => {
                if (input.value === 'body-other') {
                    const otherTextInput = document.querySelector('input[name="bodyOtherText"]');
                    const otherText = otherTextInput ? otherTextInput.value.trim() : '';
                    return otherText ? `기타: ${otherText}` : '바디 기타/모름';
                }
                return input.value;
            }),
            // 전체 관심 영역 (호환성 유지)
            interest_area: [
                ...Array.from(document.querySelectorAll('input[name="faceServices"]:checked')).map(input => input.value),
                ...Array.from(document.querySelectorAll('input[name="bodyServices"]:checked')).map(input => input.value)
            ].join(', '),
            important_factors: document.getElementById('importantFactors').value || '',
            skin_condition: document.getElementById('skinCondition').value || '', // 현재 피부상태
            has_photos: document.getElementById('skinPhotos').files.length > 0, // 사진 여부
            photo_count: document.getElementById('skinPhotos').files.length, // 사진 개수
            status: 'pending',
            submission_date: new Date().toISOString(),
            user_id: currentUser.id,
            user_type: currentUser.user_type
        };
        
        // 사진 파일 정보 추가 (실제 파일은 별도 처리 필요)
        if (formData.has_photos) {
            const files = Array.from(document.getElementById('skinPhotos').files);
            formData.photo_info = files.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            }));
        }
        
        // 필수 필드 검증
        if (!formData.customer_name.trim()) {
            showNotification('이름을 입력해주세요.', 'error');
            return;
        }
        
        if (!formData.state) {
            showNotification('지역(시/도)을 선택해주세요.', 'error');
            return;
        }
        
        if (!formData.district) {
            showNotification('지역(구/군)을 선택해주세요.', 'error');
            return;
        }
        
        if (formData.face_services.length === 0 && formData.body_services.length === 0) {
            showNotification('관심있는 관리 프로그램을 하나 이상 선택해주세요.', 'error');
            return;
        }
        
        console.log('📋 상담 신청 데이터 (연락처 제외):', formData);
        
        // 제출 버튼 비활성화 (originalText는 이미 함수 시작에서 정의됨)
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>견적 요청 중...';
        }
        
        // 지역별 매칭 시스템을 통해 견적 요청 배포
        let result;
        if (typeof window.regionalMatching !== 'undefined') {
            result = await window.regionalMatching.distributeQuoteRequest(formData);
        } else {
            // 폴백: 직접 데이터베이스에 저장
            const response = await fetch('tables/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                result = {
                    success: true,
                    message: '견적 요청이 성공적으로 전송되었습니다.',
                    shopsCount: 1
                };
            } else {
                throw new Error('견적 요청 전송 실패');
            }
        }
        
        if (result.success) {
            showNotification(
                `✅ ${formData.state} ${formData.district} 지역의 피부관리실에 견적 요청이 전송되었습니다!<br>
                📧 업체에서 연락을 드릴 예정입니다.<br>
                💡 연락처는 개인정보 보호를 위해 업체에게 노출되지 않습니다.`, 
                'success', 
                8000
            );
            
            // 폼 초기화
            document.getElementById('consultationForm').reset();
            
            // 대시보드로 이동 안내
            setTimeout(() => {
                if (confirm('고객 대시보드에서 견적 현황을 확인하시겠습니까?')) {
                    window.location.href = 'customer-dashboard.html';
                }
            }, 3000);
            
        } else {
            showNotification(result.message || '견적 요청 전송에 실패했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('상담 신청 처리 오류:', error);
        showNotification('견적 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
        // 버튼 상태 복원
        if (submitBtn && originalText) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        } else {
            console.warn('⚠️ 버튼 복원 실패:', { submitBtn: !!submitBtn, originalText: !!originalText });
        }
    }
}

// ===== 지역별 대표샵 관련 함수들 =====

// 대표샵 데이터 (임시 데모 데이터)
let representativeShopsData = [];

// 대표샵 시스템 초기화
function initializeRepresentativeShops() {
    const stateSelect = document.getElementById('representative-state');
    const districtSelect = document.getElementById('representative-district');
    
    if (!stateSelect || !districtSelect) {
        return;
    }
    
    // 시/도 선택 시 구/군 업데이트
    stateSelect.addEventListener('change', function() {
        const selectedState = this.value;
        updateDistrictOptions(selectedState);
        hideRepresentativeShopInfo();
    });
    
    // 구/군 선택 시 대표샵 검색
    districtSelect.addEventListener('change', function() {
        const selectedState = stateSelect.value;
        const selectedDistrict = this.value;
        
        if (selectedState && selectedDistrict) {
            findAndDisplayRepresentativeShop(selectedState, selectedDistrict);
        } else {
            hideRepresentativeShopInfo();
        }
    });
    
    console.log('🏪 대표샵 시스템 초기화 완료');
}

// 구/군 옵션 업데이트
function updateDistrictOptions(state) {
    const districtSelect = document.getElementById('representative-district');
    
    if (!state) {
        districtSelect.disabled = true;
        districtSelect.innerHTML = '<option value="">먼저 시/도를 선택하세요</option>';
        return;
    }
    
    const districts = regionData[state] || [];
    districtSelect.disabled = false;
    districtSelect.innerHTML = '<option value="">시/군/구 선택</option>' + 
        districts.map(district => `<option value="${district}">${district}</option>`).join('');
}

// 대표샵 데이터 로드
async function loadRepresentativeShops() {
    try {
        const response = await fetch('tables/representative_shops?limit=1000&sort=created_at');
        const data = await response.json();
        representativeShopsData = data.data || [];
        
        console.log('🏪 대표샵 데이터 로드 완료:', representativeShopsData.length, '개');
    } catch (error) {
        console.error('대표샵 데이터 로드 오류:', error);
        
        // 데모 데이터 사용
        representativeShopsData = [
            {
                id: 'rep_shop_001',
                shop_name: '뷰티캣 강남점',
                state: '서울특별시',
                district: '강남구',
                phone: '02-123-4567',
                representative_treatments: ['여드름 관리', '미백 관리', '모공 축소'],
                approved: true,
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
                created_at: '2024-10-15T12:00:00Z'
            }
        ];
        
        console.log('🏪 데모 대표샵 데이터 로드 완료');
    }
}

// 대표샵 검색 및 표시
function findAndDisplayRepresentativeShop(state, district) {
    const representativeShop = representativeShopsData.find(shop => 
        shop.state === state && 
        shop.district === district && 
        shop.approved === true
    );
    
    if (representativeShop) {
        displayRepresentativeShop(representativeShop);
    } else {
        showNoRepresentativeShop();
    }
}

// 대표샵 정보 표시
function displayRepresentativeShop(shop) {
    // 기본 정보 설정
    document.getElementById('rep-shop-name').textContent = shop.shop_name;
    document.getElementById('rep-shop-location').textContent = `${shop.state} ${shop.district}`;
    document.getElementById('rep-shop-phone').textContent = shop.phone;
    
    // 대표 관리 태그 표시
    const treatmentsContainer = document.getElementById('rep-shop-treatments');
    treatmentsContainer.innerHTML = '';
    
    if (shop.representative_treatments && shop.representative_treatments.length > 0) {
        shop.representative_treatments.forEach(treatment => {
            const tag = document.createElement('span');
            tag.className = 'inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full';
            tag.textContent = treatment;
            treatmentsContainer.appendChild(tag);
        });
    }
    
    // 전화하기 버튼 설정
    const callButton = document.getElementById('call-representative-shop');
    callButton.onclick = function() {
        makePhoneCall(shop.phone, shop.shop_name);
    };
    
    // 정보 영역 표시
    document.getElementById('representative-shop-info').classList.remove('hidden');
    document.getElementById('no-representative-shop').classList.add('hidden');
}

// 대표샵 없음 메시지 표시
function showNoRepresentativeShop() {
    document.getElementById('representative-shop-info').classList.add('hidden');
    document.getElementById('no-representative-shop').classList.remove('hidden');
}

// 대표샵 정보 숨기기
function hideRepresentativeShopInfo() {
    document.getElementById('representative-shop-info').classList.add('hidden');
    document.getElementById('no-representative-shop').classList.add('hidden');
}

// 전화하기 기능
function makePhoneCall(phoneNumber, shopName) {
    // 모바일에서는 전화앱 실행
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.location.href = `tel:${phoneNumber}`;
    } else {
        // 데스크톱에서는 확인 메시지와 함께 번호 표시
        const message = `${shopName}에 전화하시겠습니까?\n\n전화번호: ${phoneNumber}\n\n모바일에서는 자동으로 전화앱이 실행됩니다.`;
        
        if (confirm(message)) {
            // 전화번호를 클립보드에 복사 (가능한 경우)
            if (navigator.clipboard) {
                navigator.clipboard.writeText(phoneNumber).then(() => {
                    showNotification(`전화번호가 클립보드에 복사되었습니다: ${phoneNumber}`, 'info');
                }).catch(() => {
                    showNotification(`전화번호: ${phoneNumber}`, 'info');
                });
            } else {
                showNotification(`전화번호: ${phoneNumber}`, 'info');
            }
        }
    }
    
    // 통계 기록 (선택적)
    recordPhoneCallStat(shopName, phoneNumber);
}

// 전화 통계 기록
function recordPhoneCallStat(shopName, phoneNumber) {
    try {
        const statData = {
            action: 'phone_call',
            shop_name: shopName,
            phone_number: phoneNumber,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
        };
        
        // 통계 API 호출 (비동기, 실패해도 무시)
        fetch('tables/call_statistics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statData)
        }).catch(() => {
            // 통계 기록 실패는 무시
        });
    } catch (error) {
        // 통계 기록 실패는 무시
    }
}