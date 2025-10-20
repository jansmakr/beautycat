// 전역 변수
let uploadedImages = [];
const maxImages = 5;

// 지역 데이터 (main.js와 동일)
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
    initializeRegistrationApp();
});

// 등록 앱 초기화
function initializeRegistrationApp() {
    setupEventListeners();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 지역 선택 2단계 처리
    setupShopRegionSelection();

    // 이미지 업로드 처리
    setupImageUpload();

    // 등록 폼 처리
    const registrationForm = document.getElementById('shop-registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistrationSubmit);
    }

    // 전문 분야 선택 검증
    setupSpecialtiesValidation();
}

// 피부관리실 지역 선택 2단계 설정
function setupShopRegionSelection() {
    const provinceSelect = document.getElementById('shop_province');
    const districtSelect = document.getElementById('shop_district');
    
    if (!provinceSelect || !districtSelect) return;

    provinceSelect.addEventListener('change', function() {
        const selectedProvince = this.value;
        
        // 구/군 선택 초기화
        districtSelect.innerHTML = '<option value="">구/군을 선택해주세요</option>';
        
        if (selectedProvince && regionData[selectedProvince]) {
            // 구/군 선택 활성화
            districtSelect.disabled = false;
            districtSelect.classList.remove('disabled:bg-gray-100', 'disabled:cursor-not-allowed');
            
            // 해당 시/도의 구/군 목록 추가
            regionData[selectedProvince].forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
        } else {
            // 구/군 선택 비활성화
            districtSelect.disabled = true;
            districtSelect.classList.add('disabled:bg-gray-100', 'disabled:cursor-not-allowed');
            districtSelect.innerHTML = '<option value="">먼저 시/도를 선택해주세요</option>';
        }
    });
}

// 이미지 업로드 기능 설정
function setupImageUpload() {
    const imageUploadArea = document.getElementById('image-upload-area');
    const shopImages = document.getElementById('shop-images');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    if (!imageUploadArea || !shopImages || !imagePreviewContainer) return;

    // 클릭으로 파일 선택
    imageUploadArea.addEventListener('click', function() {
        shopImages.click();
    });

    // 드래그 앤 드롭
    imageUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        imageUploadArea.classList.add('border-purple-400', 'bg-purple-50');
    });

    imageUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        imageUploadArea.classList.remove('border-purple-400', 'bg-purple-50');
    });

    imageUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        imageUploadArea.classList.remove('border-purple-400', 'bg-purple-50');
        
        const files = Array.from(e.dataTransfer.files);
        handleImageFiles(files);
    });

    // 파일 선택 처리
    shopImages.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        handleImageFiles(files);
    });
}

// 이미지 파일들 처리
function handleImageFiles(files) {
    // 이미지 파일만 필터링
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        showNotification('이미지 파일만 업로드 가능합니다.', 'error');
        return;
    }
    
    // 최대 개수 체크
    if (uploadedImages.length + imageFiles.length > maxImages) {
        showNotification(`최대 ${maxImages}장까지만 업로드 가능합니다.`, 'error');
        return;
    }
    
    // 각 파일 처리
    imageFiles.forEach(file => {
        // 파일 크기 검증 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification(`${file.name}: 파일 크기는 5MB 이하로 업로드해주세요.`, 'error');
            return;
        }
        
        processImageFile(file);
    });
}

// 개별 이미지 파일 처리
function processImageFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageData = {
            file: file,
            dataUrl: e.target.result,
            id: Date.now() + Math.random()
        };
        
        uploadedImages.push(imageData);
        updateImagePreview();
    };
    
    reader.readAsDataURL(file);
}

// 이미지 미리보기 업데이트
function updateImagePreview() {
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreviews = document.getElementById('image-previews');
    
    if (uploadedImages.length === 0) {
        imagePreviewContainer.classList.add('hidden');
        return;
    }
    
    imagePreviewContainer.classList.remove('hidden');
    
    imagePreviews.innerHTML = uploadedImages.map(image => `
        <div class="relative">
            <img src="${image.dataUrl}" alt="미리보기" class="w-full h-24 object-cover rounded-lg border">
            <button type="button" onclick="removeImage('${image.id}')" 
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// 이미지 제거
function removeImage(imageId) {
    uploadedImages = uploadedImages.filter(image => image.id != imageId);
    updateImagePreview();
}

// 전문 분야 선택 검증 설정
function setupSpecialtiesValidation() {
    const specialtiesCheckboxes = document.querySelectorAll('input[name="specialties"]');
    const form = document.getElementById('shop-registration-form');
    
    if (!specialtiesCheckboxes.length || !form) return;

    form.addEventListener('submit', function(e) {
        const checkedBoxes = document.querySelectorAll('input[name="specialties"]:checked');
        if (checkedBoxes.length === 0) {
            e.preventDefault();
            showNotification('전문 관리 프로그램을 하나 이상 선택해주세요.', 'error');
            
            // 전문 분야 섹션으로 스크롤
            const specialtiesSection = specialtiesCheckboxes[0].closest('div').closest('div');
            specialtiesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// 등록 폼 제출 처리
async function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    
    // 버튼 상태 변경
    submitBtn.disabled = true;
    submitText.textContent = '등록 중...';
    submitLoading.classList.remove('hidden');
    
    try {
        // 폼 데이터 수집
        const formData = collectFormData();
        console.log('수집된 폼 데이터:', formData);
        
        // 유효성 검증
        if (!validateRegistrationData(formData)) {
            return;
        }
        
        // 피부관리실 등록 데이터 저장
        const shopId = await registerShop(formData);
        
        // 성공 메시지
        showNotification('등록 신청이 완료되었습니다! 승인 후 연락드리겠습니다.', 'success');
        
        // 폼 초기화
        resetRegistrationForm();
        
        // 성공 페이지 표시
        showRegistrationSuccess(shopId);
        
    } catch (error) {
        console.error('등록 신청 중 오류 발생:', error);
        const errorMessage = error.message || '등록 신청 중 오류가 발생했습니다.';
        console.error('전체 오류 정보:', error);
        showNotification(`오류: ${errorMessage}`, 'error');
    } finally {
        // 버튼 상태 복원
        submitBtn.disabled = false;
        submitText.textContent = '등록 신청하기';
        submitLoading.classList.add('hidden');
    }
}

// 폼 데이터 수집
function collectFormData() {
    const form = document.getElementById('shop-registration-form');
    const formData = new FormData(form);
    
    // 체크박스 데이터 처리
    const specialties = [];
    const checkedBoxes = document.querySelectorAll('input[name="specialties"]:checked');
    checkedBoxes.forEach(box => specialties.push(box.value));
    
    // 지역 정보 결합
    const province = formData.get('shop_province');
    const district = formData.get('shop_district');
    const fullRegion = district ? `${province} ${district}` : province;
    
    // 이미지 URL 처리 (실제로는 서버에 업로드해야 함)
    const imageUrls = (uploadedImages || []).map(image => 
        `shop_image_${Date.now()}_${image.name || 'unknown.jpg'}`
    );
    
    return {
        shop_name: formData.get('shop_name'),
        owner_name: formData.get('owner_name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        region: fullRegion,
        specialties: specialties.join(', '),
        business_hours: formData.get('business_hours'),
        price_range: formData.get('price_range'),
        description: formData.get('description'),
        images: imageUrls.join(', '),
        rating: 0, // 초기값
        is_active: false, // 승인 대기 상태
        verified: false, // 미인증 상태
        created_at: new Date().toISOString()
    };
}

// 등록 데이터 유효성 검증
function validateRegistrationData(data) {
    // 필수 필드 검증
    const requiredFields = [
        { field: 'shop_name', name: '피부관리실명' },
        { field: 'owner_name', name: '대표자명' },
        { field: 'phone', name: '전화번호' },
        { field: 'email', name: '이메일' },
        { field: 'address', name: '주소' },
        { field: 'business_hours', name: '영업시간' },
        { field: 'price_range', name: '가격대' },
        { field: 'description', name: '피부관리실 소개' }
    ];
    
    for (const { field, name } of requiredFields) {
        if (!data[field] || !data[field].trim()) {
            showNotification(`${name}을(를) 입력해주세요.`, 'error');
            return false;
        }
    }
    
    // 지역 선택 검증 (시/도와 구/군 모두 선택했는지 확인)
    const province = document.getElementById('shop_province').value;
    const district = document.getElementById('shop_district').value;
    
    if (!province) {
        showNotification('시/도를 선택해주세요.', 'error');
        return false;
    }
    
    if (!district) {
        showNotification('구/군을 선택해주세요.', 'error');
        return false;
    }
    
    // 전문 분야 검증
    if (!data.specialties || data.specialties.trim().length === 0) {
        showNotification('전문 관리 프로그램을 하나 이상 선택해주세요.', 'error');
        return false;
    }
    
    // 전화번호 형식 검증
    const phoneRegex = /^0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(data.phone.replace(/[^0-9-]/g, ''))) {
        showNotification('올바른 전화번호 형식으로 입력해주세요.', 'error');
        return false;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('올바른 이메일 형식으로 입력해주세요.', 'error');
        return false;
    }
    
    // 약관 동의 검증
    const termsAgree = document.getElementById('terms_agree').checked;
    const privacyAgree = document.getElementById('privacy_agree').checked;
    
    if (!termsAgree) {
        showNotification('서비스 이용약관에 동의해주세요.', 'error');
        return false;
    }
    
    if (!privacyAgree) {
        showNotification('개인정보 수집 및 이용에 동의해주세요.', 'error');
        return false;
    }
    
    return true;
}

// 피부관리실 등록
async function registerShop(data) {
    try {
        console.log('등록할 데이터:', data);
        
        const response = await fetch('tables/skincare_shops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('API 응답 오류:', errorData);
            throw new Error(`피부관리실 등록 실패 (${response.status}): ${errorData}`);
        }
        
        const result = await response.json();
        console.log('등록 성공:', result);
        return result.id;
        
    } catch (error) {
        console.error('피부관리실 등록 오류:', error);
        throw error;
    }
}

// 등록 폼 초기화
function resetRegistrationForm() {
    const form = document.getElementById('shop-registration-form');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    
    form.reset();
    uploadedImages = [];
    imagePreviewContainer.classList.add('hidden');
}

// 등록 성공 표시
function showRegistrationSuccess(shopId) {
    const successHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="success-modal">
            <div class="bg-white rounded-lg p-8 max-w-lg mx-4">
                <div class="text-center">
                    <i class="fas fa-check-circle text-green-500 text-6xl mb-6"></i>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">등록 신청 완료!</h3>
                    <div class="text-gray-600 mb-6 space-y-2">
                        <p><strong>신청 번호:</strong> ${shopId.substring(0, 8)}</p>
                        <p class="text-sm">
                            등록 신청이 완료되었습니다.<br>
                            승인까지 1-2 영업일이 소요되며,<br>
                            승인 완료 시 등록하신 연락처로 안내해드립니다.
                        </p>
                    </div>
                    <div class="space-y-3">
                        <button onclick="closeSuccessModal(); window.location.href='index.html';" 
                                class="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold">
                            메인 페이지로 이동
                        </button>
                        <button onclick="closeSuccessModal()" 
                                class="w-full text-gray-500 hover:text-gray-700 px-6 py-2">
                            새로 등록하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHtml);
}

// 성공 모달 닫기
function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.remove();
    }
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

// 전역 함수들 (HTML에서 호출)
window.removeImage = removeImage;
window.closeSuccessModal = closeSuccessModal;