 1	// 전역 변수
     2	let uploadedImageUrl = null;
     3	
     4	// 지역 데이터
     5	const regionData = {
     6	    "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
     7	    "부산광역시": ["강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"],
     8	    "대구광역시": ["남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"],
     9	    "인천광역시": ["계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"],
    10	    "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
    11	    "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
    12	    "울산광역시": ["남구", "동구", "북구", "중구", "울주군"],
    13	    "세종특별자치시": ["세종시"],
    14	    "경기도": ["고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시", "가평군", "양평군", "여주시", "연천군"],
    15	    "강원도": ["강릉시", "동해시", "삼척시", "속초시", "원주시", "춘천시", "태백시", "고성군", "양구군", "양양군", "영월군", "인제군", "정선군", "철원군", "평창군", "홍천군", "화천군", "횡성군"],
    16	    "충청북도": ["제천시", "청주시", "충주시", "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "증평군", "진천군"],
    17	    "충청남도": ["계룡시", "공주시", "논산시", "당진시", "보령시", "서산시", "아산시", "천안시", "금산군", "부여군", "서천군", "예산군", "청양군", "태안군", "홍성군"],
    18	    "전라북도": ["군산시", "김제시", "남원시", "익산시", "전주시", "정읍시", "고창군", "무주군", "부안군", "순창군", "완주군", "임실군", "장수군", "진안군"],
    19	    "전라남도": ["광양시", "나주시", "목포시", "순천시", "여수시", "강진군", "고흥군", "곡성군", "구례군", "담양군", "무안군", "보성군", "신안군", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
    20	    "경상북도": ["경산시", "경주시", "구미시", "김천시", "문경시", "상주시", "안동시", "영주시", "영천시", "포항시", "고령군", "군위군", "봉화군", "성주군", "영덕군", "영양군", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군"],
    21	    "경상남도": ["거제시", "김해시", "밀양시", "사천시", "양산시", "진주시", "창원시", "통영시", "거창군", "고성군", "남해군", "산청군", "의령군", "창녕군", "하동군", "함안군", "함양군", "합천군"],
    22	    "제주특별자치도": ["제주시", "서귀포시"]
    23	};
    24	
    25	// DOM 로드 완료 후 초기화
    26	document.addEventListener('DOMContentLoaded', function() {
    27	    initializeApp();
    28	});
    29	
    30	// 앱 초기화
    31	function initializeApp() {
    32	    updateAuthUI();
    33	    setupEventListeners();
    34	    
    35	    // 지역별 매칭 시스템 초기화
    36	    initializeRegionalMatching();
    37	    
    38	    // 대표샵 시스템 초기화
    39	    initializeRepresentativeShops();
    40	    
    41	    // 데이터 로드는 비동기로 처리하여 페이지 로딩을 방해하지 않음
    42	    setTimeout(() => {
    43	        loadSampleShops().catch(() => {
    44	            // 피부관리실 데이터 로드 실패 (무시)
    45	        });
    46	        loadAnnouncements().catch(() => {
    47	            // 공지사항 데이터 로드 실패 (무시)
    48	        });
    49	        loadRepresentativeShops().catch(() => {
    50	            // 대표샵 데이터 로드 실패 (무시)
    51	        });
    52	    }, 1000);
    53	    
    54	    setupUserAutoFill();
    55	    fillUserDataIfLoggedIn();
    56	    preventAutoFocus();
    57	}
    58	
    59	// 자동 포커스 방지
    60	function preventAutoFocus() {
    61	    // 모든 입력 필드에서 포커스 제거
    62	    const inputs = document.querySelectorAll('input, textarea, select');
    63	    inputs.forEach(input => {
    64	        if (document.activeElement === input) {
    65	            input.blur();
    66	        }
    67	    });
    68	}
    69	
    70	// 이벤트 리스너 설정
    71	function setupEventListeners() {
    72	    // 모바일 메뉴 토글
    73	    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    74	    const mobileMenu = document.getElementById('mobile-menu');
    75	    
    76	    if (mobileMenuBtn && mobileMenu) {
    77	        mobileMenuBtn.addEventListener('click', function() {
    78	            mobileMenu.classList.toggle('hidden');
    79	        });
    80	    }
    81	
    82	    // 지역 선택 2단계 처리
    83	    setupRegionSelection();
    84	
    85	    // 이미지 업로드 처리
    86	    setupImageUpload();
    87	
    88	    // 상담 신청 폼 처리
    89	    const consultationForm = document.getElementById('consultation-form');
    90	    if (consultationForm) {
    91	        consultationForm.addEventListener('submit', handleConsultationSubmit);
    92	    }
    93	    
    94	    // 메인 페이지 상담 신청 폼 처리 (새로운 모바일 최적화 폼)
    95	    const mainConsultationForm = document.getElementById('consultationForm');
    96	    if (mainConsultationForm) {
    97	        mainConsultationForm.addEventListener('submit', handleMainConsultationSubmit);
    98	    }
    99	    
   100	    // 빠른 상담 신청 폼 처리
   101	    const quickConsultationForm = document.getElementById('quick-consultation-form');
   102	    if (quickConsultationForm) {
   103	        quickConsultationForm.addEventListener('submit', handleQuickConsultationSubmit);
   104	    }
   105	
   106	    // 연락처 폼 처리
   107	    const contactForm = document.getElementById('contact-form');
   108	    if (contactForm) {
   109	        contactForm.addEventListener('submit', handleContactSubmit);
   110	    }
   111	
   112	    // 치료 타입 선택 검증
   113	    setupTreatmentTypeValidation();
   114	}
   115	
   116	// 이미지 업로드 설정
   117	function setupImageUpload() {
   118	    const imageUploadArea = document.getElementById('imageUploadArea');
   119	    const imageInput = document.getElementById('image-upload');
   120	    
   121	    if (!imageUploadArea || !imageInput) return;
   122	
   123	    // 클릭으로 파일 선택
   124	    imageUploadArea.addEventListener('click', function() {
   125	        imageInput.click();
   126	    });
   127	
   128	    // 드래그 앤 드롭 처리
   129	    imageUploadArea.addEventListener('dragover', function(e) {
   130	        e.preventDefault();
   131	        imageUploadArea.classList.add('border-blue-500');
   132	    });
   133	
   134	    imageUploadArea.addEventListener('dragleave', function(e) {
   135	        e.preventDefault();
   136	        imageUploadArea.classList.remove('border-blue-500');
   137	    });
   138	
   139	    imageUploadArea.addEventListener('drop', function(e) {
   140	        e.preventDefault();
   141	        imageUploadArea.classList.remove('border-blue-500');
   142	        
   143	        const files = e.dataTransfer.files;
   144	        if (files.length > 0) {
   145	            handleImageFile(files[0]);
   146	        }
   147	    });
   148	
   149	    // 파일 선택 처리
   150	    imageInput.addEventListener('change', function(e) {
   151	        if (e.target.files.length > 0) {
   152	            handleImageFile(e.target.files[0]);
   153	        }
   154	    });
   155	}
   156	
   157	// 이미지 파일 처리
   158	function handleImageFile(file) {
   159	    // 파일 크기 체크 (5MB 제한)
   160	    if (file.size > 5 * 1024 * 1024) {
   161	        showNotification('파일 크기는 5MB 이하여야 합니다.', 'error');
   162	        return;
   163	    }
   164	    
   165	    // 이미지 파일 체크
   166	    if (!file.type.startsWith('image/')) {
   167	        showNotification('이미지 파일만 업로드할 수 있습니다.', 'error');
   168	        return;
   169	    }
   170	    
   171	    // 파일을 Data URL로 변환
   172	    const reader = new FileReader();
   173	    reader.onload = function(e) {
   174	        uploadedImageUrl = e.target.result;
   175	        
   176	        // 업로드 영역에 이미지 미리보기 표시
   177	        const imageUploadArea = document.getElementById('imageUploadArea');
   178	        if (imageUploadArea) {
   179	            imageUploadArea.innerHTML = `
   180	                <div class="text-center">
   181	                    <img src="${uploadedImageUrl}" alt="업로드된 이미지" class="max-w-full max-h-32 mx-auto mb-2 rounded">
   182	                    <p class="text-sm text-gray-600">이미지가 업로드되었습니다.</p>
   183	                    <button type="button" onclick="removeUploadedImage()" class="mt-2 text-red-500 hover:text-red-700 text-sm">
   184	                        <i class="fas fa-trash mr-1"></i>삭제
   185	                    </button>
   186	                </div>
   187	            `;
   188	        }
   189	        
   190	        showNotification('이미지가 성공적으로 업로드되었습니다.', 'success');
   191	    };
   192	    
   193	    reader.onerror = function() {
   194	        showNotification('이미지 업로드 중 오류가 발생했습니다.', 'error');
   195	    };
   196	    
   197	    reader.readAsDataURL(file);
   198	}
   199	
   200	// 업로드된 이미지 제거
   201	function removeUploadedImage() {
   202	    uploadedImageUrl = null;
   203	    
   204	    // 업로드 영역 초기화
   205	    const imageUploadArea = document.getElementById('imageUploadArea');
   206	    if (imageUploadArea) {
   207	        imageUploadArea.innerHTML = `
   208	            <div class="text-center py-8">
   209	                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
   210	                <p class="text-gray-600 mb-2">피부 상태 이미지 업로드 (선택사항)</p>
   211	                <p class="text-sm text-gray-500">드래그 앤 드롭하거나 클릭하여 이미지를 업로드하세요</p>
   212	                <p class="text-xs text-gray-400 mt-2">최대 5MB, JPG, PNG, GIF 형식</p>
   213	            </div>
   214	        `;
   215	    }
   216	    
   217	    // 파일 인풋 초기화
   218	    const imageInput = document.getElementById('image-upload');
   219	    if (imageInput) {
   220	        imageInput.value = '';
   221	    }
   222	    
   223	    showNotification('이미지가 제거되었습니다.', 'info');
   224	}
   225	
   226	// 지역 선택 2단계 설정
   227	function setupRegionSelection() {
   228	    // 기존 지역 선택 처리
   229	    const provinceSelect = document.getElementById('province');
   230	    const citySelect = document.getElementById('city');
   231	    
   232	    if (provinceSelect && citySelect) {
   233	        provinceSelect.addEventListener('change', function() {
   234	            const selectedProvince = this.value;
   235	            
   236	            // 구/군 선택 초기화
   237	            citySelect.innerHTML = '<option value="">구/군 선택</option>';
   238	            
   239	            if (selectedProvince && regionData[selectedProvince]) {
   240	                // 해당 시/도의 구/군 목록 추가
   241	                regionData[selectedProvince].forEach(city => {
   242	                    const option = document.createElement('option');
   243	                    option.value = city;
   244	                    option.textContent = city;
   245	                    citySelect.appendChild(option);
   246	                });
   247	                citySelect.disabled = false;
   248	            } else {
   249	                citySelect.disabled = true;
   250	            }
   251	        });
   252	    }
   253	    
   254	    // 간단한 폼의 지역 선택 처리
   255	    const simpleStateSelect = document.getElementById('simpleState');
   256	    const simpleDistrictSelect = document.getElementById('simpleDistrict');
   257	    
   258	    if (simpleStateSelect && simpleDistrictSelect) {
   259	        // 시/도 옵션 추가
   260	        Object.keys(regionData).forEach(province => {
   261	            const option = document.createElement('option');
   262	            option.value = province;
   263	            option.textContent = province;
   264	            simpleStateSelect.appendChild(option);
   265	        });
   266	        
   267	        simpleStateSelect.addEventListener('change', function() {
   268	            const selectedProvince = this.value;
   269	            
   270	            // 구/군 선택 초기화
   271	            simpleDistrictSelect.innerHTML = '<option value="">구/군 선택</option>';
   272	            
   273	            if (selectedProvince && regionData[selectedProvince]) {
   274	                // 해당 시/도의 구/군 목록 추가
   275	                regionData[selectedProvince].forEach(city => {
   276	                    const option = document.createElement('option');
   277	                    option.value = city;
   278	                    option.textContent = city;
   279	                    simpleDistrictSelect.appendChild(option);
   280	                });
   281	                simpleDistrictSelect.disabled = false;
   282	            } else {
   283	                simpleDistrictSelect.disabled = true;
   284	            }
   285	        });
   286	    }
   287	}
   288	
   289	// 치료 타입 선택 검증 설정
   290	function setupTreatmentTypeValidation() {
   291	    const treatmentCheckboxes = document.querySelectorAll('input[name="treatment_type"]');
   292	    const treatmentError = document.getElementById('treatment-type-error');
   293	    
   294	    if (treatmentCheckboxes.length === 0) return;
   295	
   296	    treatmentCheckboxes.forEach(checkbox => {
   297	        checkbox.addEventListener('change', function() {
   298	            const checkedBoxes = document.querySelectorAll('input[name="treatment_type"]:checked');
   299	            
   300	            if (checkedBoxes.length > 0 && treatmentError) {
   301	                treatmentError.classList.add('hidden');
   302	            }
   303	        });
   304	    });
   305	}
   306	
   307	// 상담 신청 폼 검증
   308	function validateConsultationForm() {
   309	    const requiredFields = [
   310	        { id: 'name', name: '이름' },
   311	        { id: 'email', name: '이메일' },
   312	        { id: 'province', name: '시/도' },
   313	        { id: 'city', name: '구/군' },
   314	        { id: 'age', name: '나이' },
   315	        { id: 'consultation_text', name: '상담 내용' }
   316	    ];
   317	    
   318	    let isValid = true;
   319	    
   320	    // 필수 필드 검증
   321	    for (const field of requiredFields) {
   322	        const element = document.getElementById(field.id);
   323	        const errorElement = document.getElementById(field.id + '-error');
   324	        
   325	        if (!element || !element.value.trim()) {
   326	            if (errorElement) {
   327	                errorElement.textContent = `${field.name}을(를) 입력해주세요.`;
   328	                errorElement.classList.remove('hidden');
   329	            }
   330	            isValid = false;
   331	        } else {
   332	            if (errorElement) {
   333	                errorElement.classList.add('hidden');
   334	            }
   335	        }
   336	    }
   337	    
   338	    // 이메일 형식 검증
   339	    const emailElement = document.getElementById('email');
   340	    const emailError = document.getElementById('email-error');
   341	    if (emailElement && emailElement.value) {
   342	        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   343	        if (!emailPattern.test(emailElement.value)) {
   344	            if (emailError) {
   345	                emailError.textContent = '올바른 이메일 형식을 입력해주세요.';
   346	                emailError.classList.remove('hidden');
   347	            }
   348	            isValid = false;
   349	        }
   350	    }
   351	    
   352	    
   353	    // 치료 타입 선택 검증
   354	    const treatmentCheckboxes = document.querySelectorAll('input[name="treatment_type"]:checked');
   355	    const treatmentError = document.getElementById('treatment-type-error');
   356	    
   357	    if (treatmentCheckboxes.length === 0) {
   358	        if (treatmentError) {
   359	            treatmentError.textContent = '관심 있는 치료 타입을 최소 1개 이상 선택해주세요.';
   360	            treatmentError.classList.remove('hidden');
   361	        }
   362	        isValid = false;
   363	    }
   364	    
   365	    return isValid;
   366	}
   367	
   368	// 상담 신청 폼 제출 (지역별 매칭 시스템 연동)
   369	async function submitConsultationForm() {
   370	    try {
   371	        // 폼 데이터 수집
   372	        const stateElement = document.getElementById('stateSelect');
   373	        const districtElement = document.getElementById('citySelect');
   374	        
   375	        const formData = {
   376	            customer_name: document.getElementById('customerName').value,
   377	            customer_email: document.getElementById('customerEmail').value,
   378	            // customer_phone 제거 - 개인정보 보호를 위해 업체에게 노출하지 않음
   379	            state: stateElement ? stateElement.value : '',
   380	            district: districtElement ? districtElement.value : '',
   381	            treatment_types: Array.from(document.querySelectorAll('input[name="treatment_type"]:checked')).map(cb => cb.value),
   382	            skin_concerns: Array.from(document.querySelectorAll('input[name="skin_concern"]:checked')).map(cb => cb.value),
   383	            age_range: document.getElementById('ageRange') ? document.getElementById('ageRange').value : '',
   384	            budget_range: document.getElementById('budgetRange') ? document.getElementById('budgetRange').value : '',
   385	            preferred_schedule: document.getElementById('preferredSchedule') ? document.getElementById('preferredSchedule').value : '',
   386	            additional_notes: document.getElementById('additionalNotes') ? document.getElementById('additionalNotes').value : '',
   387	            status: 'pending',
   388	            submission_date: new Date().toISOString()
   389	        };
   390	        
   391	        // 현재 사용자 정보 추가
   392	        const currentUser = getCurrentUser();
   393	        if (currentUser) {
   394	            formData.user_id = currentUser.id;
   395	            formData.user_type = currentUser.user_type;
   396	        }
   397	
   398	        // 지역 정보 검증
   399	        if (!formData.state || !formData.district) {
   400	            showNotification('지역을 선택해주세요.', 'error');
   401	            return;
   402	        }
   403	
   404	        console.log('🏥 견적 요청 데이터:', formData);
   405	        
   406	        // 지역별 매칭 시스템을 통해 견적 요청 배포
   407	        if (typeof window.regionalMatching !== 'undefined') {
   408	            const matchingResult = await window.regionalMatching.distributeQuoteRequest(formData);
   409	            
   410	            if (matchingResult.success) {
   411	                showConsultationResultWithShops(
   412	                    matchingResult.consultationId, 
   413	                    formData.state, 
   414	                    formData.district,
   415	                    matchingResult.shopsCount,
   416	                    matchingResult.shops
   417	                );
   418	                
   419	                // 폼 초기화
   420	                const form = document.getElementById('consultationForm');
   421	                if (form) {
   422	                    form.reset();
   423	                    // 지역 선택 초기화
   424	                    if (districtElement) {
   425	                        districtElement.innerHTML = '<option value="">먼저 시/도를 선택해주세요</option>';
   426	                        districtElement.disabled = true;
   427	                    }
   428	                }
   429	            } else {
   430	                // 해당 지역에 샵이 없는 경우 확장 검색 제안
   431	                showNoShopsInRegion(formData.state, formData.district, matchingResult.message);
   432	            }
   433	            
   434	        } else {
   435	            // 기존 방식으로 폴백
   436	            console.warn('⚠️ 지역별 매칭 시스템이 로드되지 않음. 기존 방식 사용');
   437	            
   438	            const response = await fetch('tables/consultations', {
   439	                method: 'POST',
   440	                headers: { 'Content-Type': 'application/json' },
   441	                body: JSON.stringify(formData)
   442	            });
   443	            
   444	            if (!response.ok) {
   445	                throw new Error('상담 신청에 실패했습니다.');
   446	            }
   447	            
   448	            const result = await response.json();
   449	            showConsultationResultWithShops(result.id, formData.state, formData.district, 0);
   450	        }
   451	        
   452	    } catch (error) {
   453	        console.error('상담 신청 오류:', error);
   454	        showNotification('상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
   455	    }
   456	}
   457	
   458	// 연락처 문의 제출 처리
   459	async function handleContactSubmit(e) {
   460	    e.preventDefault();
   461	    
   462	    // 폼 검증
   463	    const name = document.getElementById('contact-name').value.trim();
   464	    const email = document.getElementById('contact-email').value.trim();
   465	    const subject = document.getElementById('contact-subject').value.trim();
   466	    const message = document.getElementById('contact-message').value.trim();
   467	    
   468	    if (!name || !email || !subject || !message) {
   469	        showNotification('모든 필드를 입력해주세요.', 'error');
   470	        return;
   471	    }
   472	    
   473	    // 이메일 형식 검증
   474	    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   475	    if (!emailPattern.test(email)) {
   476	        showNotification('올바른 이메일 형식을 입력해주세요.', 'error');
   477	        return;
   478	    }
   479	    
   480	    try {
   481	        // 연락처 문의 데이터 생성
   482	        const contactData = {
   483	            name: name,
   484	            email: email,
   485	            subject: subject,
   486	            message: message,
   487	            status: 'pending',
   488	            priority: 'normal'
   489	        };
   490	        
   491	        // 현재 사용자 정보 추가 (로그인된 경우)
   492	        const currentUser = getCurrentUser();
   493	        if (currentUser) {
   494	            contactData.user_id = currentUser.id;
   495	        }
   496	        
   497	        // API 호출 (연락처 문의 저장)
   498	        const response = await fetch('tables/contact_inquiries', {
   499	            method: 'POST',
   500	            headers: {
   501	                'Content-Type': 'application/json'
   502	            },
   503	            body: JSON.stringify(contactData)
   504	        });
   505	        
   506	        if (!response.ok) {
   507	            throw new Error('문의 접수에 실패했습니다.');
   508	        }
   509	        
   510	        const result = await response.json();
   511	        
   512	        // 성공 시 결과 모달 표시
   513	        showContactResult(result.id);
   514	        
   515	        // 폼 초기화
   516	        e.target.reset();
   517	        
   518	    } catch (error) {
   519	        console.error('연락처 문의 오류:', error);
   520	        showNotification('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
   521	    }
   522	}
   523	
   524	// 연락처 문의 결과 표시
   525	function showContactResult(contactId) {
   526	    const resultHtml = `
   527	        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="contact-result-modal">
   528	            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
   529	                <div class="text-center">
   530	                    <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
   531	                    <h3 class="text-xl font-bold text-gray-900 mb-4">문의 접수 완료!</h3>
   532	                    <p class="text-gray-600 mb-6">
   533	                        문의 번호: <strong>${contactId}</strong><br><br>
   534	                        문의사항이 성공적으로 접수되었습니다.<br>
   535	                        영업일 기준 1-2일 내에 답변드리겠습니다.
   536	                    </p>
   537	                    <div class="text-sm text-gray-500 mb-6">
   538	                        <p><strong>연락 방법:</strong> 이메일 또는 전화</p>
   539	                        <p><strong>운영 시간:</strong> 평일 09:00 - 18:00</p>
   540	                    </div>
   541	                    <button onclick="closeContactResultModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
   542	                        확인
   543	                    </button>
   544	                </div>
   545	            </div>
   546	        </div>
   547	    `;
   548	    
   549	    document.body.insertAdjacentHTML('beforeend', resultHtml);
   550	}
   551	
   552	// 연락처 결과 모달 닫기
   553	function closeContactResultModal() {
   554	    const modal = document.getElementById('contact-result-modal');
   555	    if (modal) {
   556	        modal.remove();
   557	    }
   558	}
   559	
   560	// 샘플 피부관리실 데이터 로드 (개발 및 테스트용)
   561	async function loadSampleShops() {
   562	    try {
   563	        // 프로덕션 환경에서는 샘플 데이터 로드 건너뛰기
   564	        const isProduction = !location.hostname.includes('localhost') && 
   565	                           !location.hostname.includes('127.0.0.1') && 
   566	                           !location.hostname.includes('genspark.ai');
   567	        
   568	        if (isProduction) {
   569	            console.log('🏭 프로덕션 환경: 샘플 데이터 로드 건너뛰기');
   570	            return;
   571	        }
   572	        
   573	        // 기존 데이터 확인 (새로운 안전한 API 방식)
   574	        const shopsData = await window.BeautyCatApi?.ApiRequest.safeGet(
   575	            'tables/skincare_shops', 
   576	            { name: '샘플 데이터' }
   577	        );
   578	        
   579	        if (!shopsData) {
   580	            console.warn('⚠️ 피부관리실 테이블에 접근할 수 없습니다. 데이터 로드를 건너뜁니다.');
   581	            return;
   582	        }
   583	        
   584	        if (shopsData.data && shopsData.data.length >= 3) {
   585	            return;
   586	        }
   587	        
   588	        // 샘플 데이터 생성
   589	        const sampleShops = [
   590	            {
   591	                shop_name: "뷰티스킨 클리닉",
   592	                owner_name: "김미영",
   593	                phone: "02-123-4567",
   594	                email: "beautyskin@example.com",
   595	                address: "서울시 강남구 역삼동 123-45",
   596	                region: "서울특별시 강남구",
   597	                specialties: "여드름 관리, 미백 관리, 모공 축소",
   598	                business_hours: "월-금 09:00-18:00, 토 09:00-15:00",
   599	                price_range: "10-50만원",
   600	                description: "10년 경력의 전문 피부관리사가 운영하는 프리미엄 피부관리실입니다.",
   601	                rating: 4.8,
   602	                is_active: true,
   603	                verified: true
   604	            },
   605	            {
   606	                shop_name: "글로우 스킨케어",
   607	                owner_name: "박지은",
   608	                phone: "02-987-6543",
   609	                email: "glow@example.com",
   610	                address: "서울시 서초구 서초동 567-89",
   611	                region: "서울특별시 서초구",
   612	                specialties: "주름 개선, 탄력 관리, 수분 관리",
   613	                business_hours: "화-일 10:00-19:00",
   614	                price_range: "20-100만원",
   615	                description: "최신 장비와 프리미엄 제품으로 확실한 효과를 보장합니다.",
   616	                rating: 4.9,
   617	                is_active: true,
   618	                verified: true
   619	            },
   620	            {
   621	                shop_name: "청담 피부관리실",
   622	                owner_name: "이수정",
   623	                phone: "051-123-4567",
   624	                email: "cheongdam@example.com",
   625	                address: "부산시 해운대구 우동 789-12",
   626	                region: "부산광역시 해운대구",
   627	                specialties: "여드름 관리, 수분 관리, 모공 축소",
   628	                business_hours: "월-토 09:30-18:30",
   629	                price_range: "15-40만원",
   630	                description: "해운대에서 가장 인기 있는 피부관리실입니다.",
   631	                rating: 4.7,
   632	                is_active: true,
   633	                verified: true
   634	            }
   635	        ];
   636	        
   637	        // 샘플 데이터 저장
   638	        for (const shop of sampleShops) {
   639	            await fetch('tables/skincare_shops', {
   640	                method: 'POST',
   641	                headers: {
   642	                    'Content-Type': 'application/json'
   643	                },
   644	                body: JSON.stringify(shop)
   645	            });
   646	        }
   647	        
   648	        console.log('샘플 피부관리실 데이터가 로드되었습니다.');
   649	        
   650	    } catch (error) {
   651	        console.warn('⚠️ 샘플 데이터 로드 오류 (무시됨):', error.message);
   652	        // 프로덕션에서는 샘플 데이터 없이도 정상 작동해야 함
   653	    }
   654	}
   655	
   656	// ======= ANNOUNCEMENTS FUNCTIONS =======
   657	
   658	// 공지사항 로드 및 표시
   659	async function loadAnnouncements() {
   660	    try {
   661	        const response = await fetch('tables/announcements?limit=10&sort=created_at');
   662	        
   663	        if (!response.ok) {
   664	            console.log('공지사항 테이블에 접근할 수 없습니다. 데모 데이터를 표시합니다.');
   665	            loadDemoAnnouncements();
   666	            return;
   667	        }
   668	        
   669	        const data = await response.json();
   670	        const announcements = data.data || [];
   671	        
   672	        displayAnnouncements(announcements);
   673	    } catch (error) {
   674	        console.log('공지사항 로드 중 오류 발생. 데모 데이터를 표시합니다.');
   675	        loadDemoAnnouncements();
   676	    }
   677	}
   678	
   679	// 데모 공지사항 로드
   680	function loadDemoAnnouncements() {
   681	    const demoAnnouncements = [
   682	        {
   683	            id: 'ann_001',
   684	            title: '서비스 점검 안내',
   685	            content: '시스템 업데이트를 위해 2024년 9월 20일 새벽 2시부터 4시까지 서비스가 일시 중단됩니다. 이용에 불편을 드려 죄송합니다.',
   686	            priority: 'important',
   687	            target_audience: 'all',
   688	            is_pinned: true,
   689	            is_published: true,
   690	            created_at: '2024-09-18T10:00:00Z'
   691	        },
   692	        {
   693	            id: 'ann_002',
   694	            title: '새로운 피부관리 프로그램 출시',
   695	            content: '안티에이징 전문 프로그램이 새롭게 추가되었습니다. 더욱 효과적인 피부 관리를 경험해보세요!',
   696	            priority: 'normal',
   697	            target_audience: 'customers',
   698	            is_pinned: false,
   699	            is_published: true,
   700	            created_at: '2024-09-17T14:30:00Z'
   701	        },
   702	        {
   703	            id: 'ann_003',
   704	            title: '이벤트: 첫 상담 20% 할인',
   705	            content: '9월 한 달간 첫 상담 신청 시 20% 할인 혜택을 드립니다. 이 기회를 놓치지 마세요!',
   706	            priority: 'normal',
   707	            target_audience: 'customers',
   708	            is_pinned: false,
   709	            is_published: true,
   710	            created_at: '2024-09-16T09:15:00Z'
   711	        }
   712	    ];
   713	    
   714	    displayAnnouncements(demoAnnouncements);
   715	}
   716	
   717	// 공지사항 표시
   718	function displayAnnouncements(announcements) {
   719	    if (!announcements || announcements.length === 0) {
   720	        return; // 공지사항이 없으면 섹션을 숨김
   721	    }
   722	    
   723	    // 게시된 공지사항만 필터링
   724	    const publishedAnnouncements = announcements.filter(ann => 
   725	        ann.is_published && 
   726	        (!ann.expire_date || new Date(ann.expire_date) > new Date())
   727	    );
   728	    
   729	    if (publishedAnnouncements.length === 0) {
   730	        return; // 게시할 공지사항이 없으면 섹션을 숨김
   731	    }
   732	    
   733	    // 공지사항 섹션 표시
   734	    const announcementSection = document.getElementById('announcements-section');
   735	    if (announcementSection) {
   736	        announcementSection.classList.remove('hidden');
   737	    }
   738	    
   739	    // 최신 공지사항 (고정된 것 우선, 그 다음 최신순)
   740	    const sortedAnnouncements = publishedAnnouncements.sort((a, b) => {
   741	        if (a.is_pinned !== b.is_pinned) {
   742	            return b.is_pinned ? 1 : -1; // 고정된 것이 먼저
   743	        }
   744	        return new Date(b.created_at) - new Date(a.created_at); // 최신순
   745	    });
   746	    
   747	    const latestAnnouncement = sortedAnnouncements[0];
   748	    displayLatestAnnouncement(latestAnnouncement);
   749	    displayAllAnnouncements(sortedAnnouncements);
   750	}
   751	
   752	// 최신 공지사항 표시 (항상 보이는 부분)
   753	function displayLatestAnnouncement(announcement) {
   754	    const container = document.getElementById('latest-announcement');
   755	    if (!container) return;
   756	    
   757	    const priorityIcon = {
   758	        'urgent': '<i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>',
   759	        'important': '<i class="fas fa-exclamation-circle text-orange-500 mr-2"></i>',
   760	        'normal': '<i class="fas fa-info-circle text-blue-500 mr-2"></i>',
   761	        'low': '<i class="fas fa-info text-gray-500 mr-2"></i>'
   762	    };
   763	    
   764	    container.innerHTML = `
   765	        <div class="flex items-start">
   766	            ${announcement.is_pinned ? '<i class="fas fa-thumbtack text-red-500 mr-2 mt-1"></i>' : ''}
   767	            <div class="flex-1">
   768	                <div class="flex items-center mb-2">
   769	                    ${priorityIcon[announcement.priority] || priorityIcon.normal}
   770	                    <h4 class="font-semibold text-gray-900">${announcement.title}</h4>
   771	                    <span class="ml-2 text-xs text-gray-500">${formatAnnouncementDate(announcement.created_at)}</span>
   772	                </div>
   773	                <p class="text-gray-700 text-sm leading-relaxed">${announcement.content}</p>
   774	            </div>
   775	        </div>
   776	    `;
   777	}
   778	
   779	// 모든 공지사항 리스트 표시
   780	function displayAllAnnouncements(announcements) {
   781	    const container = document.getElementById('all-announcements');
   782	    if (!container) return;
   783	    
   784	    container.innerHTML = announcements.map(announcement => `
   785	        <div class="flex items-start py-3 border-b border-gray-100 last:border-b-0">
   786	            ${announcement.is_pinned ? '<i class="fas fa-thumbtack text-red-500 mr-2 mt-1"></i>' : ''}
   787	            <div class="flex-1">
   788	                <div class="flex items-center justify-between mb-1">
   789	                    <h5 class="font-medium text-gray-900 text-sm">${announcement.title}</h5>
   790	                    <span class="text-xs text-gray-500">${formatAnnouncementDate(announcement.created_at)}</span>
   791	                </div>
   792	                <p class="text-gray-600 text-sm">${announcement.content.length > 100 ? 
   793	                    announcement.content.substring(0, 100) + '...' : 
   794	                    announcement.content}</p>
   795	            </div>
   796	        </div>
   797	    `).join('');
   798	}
   799	
   800	// 공지사항 목록 토글
   801	function toggleAnnouncementsList() {
   802	    const list = document.getElementById('announcements-list');
   803	    const toggleText = document.getElementById('announcements-toggle-text');
   804	    const toggleIcon = document.getElementById('announcements-toggle-icon');
   805	    
   806	    if (list.classList.contains('hidden')) {
   807	        list.classList.remove('hidden');
   808	        toggleText.textContent = '접기';
   809	        toggleIcon.classList.remove('fa-chevron-down');
   810	        toggleIcon.classList.add('fa-chevron-up');
   811	    } else {
   812	        list.classList.add('hidden');
   813	        toggleText.textContent = '전체보기';
   814	        toggleIcon.classList.remove('fa-chevron-up');
   815	        toggleIcon.classList.add('fa-chevron-down');
   816	    }
   817	}
   818	
   819	// 공지사항 날짜 포맷
   820	function formatAnnouncementDate(dateString) {
   821	    const date = new Date(dateString);
   822	    const now = new Date();
   823	    const diffTime = Math.abs(now - date);
   824	    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   825	    
   826	    if (diffDays === 1) {
   827	        return '오늘';
   828	    } else if (diffDays === 2) {
   829	        return '어제';
   830	    } else if (diffDays <= 7) {
   831	        return `${diffDays - 1}일 전`;
   832	    } else {
   833	        return date.toLocaleDateString('ko-KR', { 
   834	            month: 'long', 
   835	            day: 'numeric' 
   836	        });
   837	    }
   838	}
   839	
   840	// ======= USER AUTO FILL & MEMBER-ONLY FEATURES =======
   841	
   842	// 사용자 자동입력 설정
   843	function setupUserAutoFill() {
   844	    // 로그인 사용자의 정보를 자동으로 입력하는 기능은 fillUserDataIfLoggedIn에서 처리
   845	}
   846	
   847	// 로그인 사용자 데이터 자동 입력 (개선된 버전)
   848	function fillUserDataIfLoggedIn() {
   849	    const currentUser = getCurrentUser();
   850	    if (!currentUser) return;
   851	    
   852	    console.log('🔄 사용자 정보 자동 입력:', currentUser.name, currentUser.email);
   853	    
   854	    // 다양한 필드 ID들을 확인하여 자동 입력 (연락처 제외)
   855	    const fieldMappings = [
   856	        // 이름 필드들
   857	        { ids: ['name', 'customerName', 'customer-name', 'customer_name'], value: currentUser.name },
   858	        // 이메일 필드들  
   859	        { ids: ['email', 'customerEmail', 'customer-email', 'customer_email'], value: currentUser.email }
   860	        // 휴대폰 필드 제거 - 개인정보 보호를 위해 연락처는 자동 입력하지 않음
   861	    ];
   862	    
   863	    fieldMappings.forEach(mapping => {
   864	        if (!mapping.value) return;
   865	        
   866	        mapping.ids.forEach(id => {
   867	            const field = document.getElementById(id);
   868	            if (field && !field.value) {
   869	                field.value = mapping.value;
   870	                
   871	                // readonly 속성 제거 (사용자가 수정할 수 있도록)
   872	                if (field.hasAttribute('readonly')) {
   873	                    field.removeAttribute('readonly');
   874	                    field.classList.remove('cursor-pointer');
   875	                    field.classList.add('cursor-text');
   876	                }
   877	                
   878	                console.log(`✅ ${id} 필드에 ${mapping.value} 자동 입력 완료`);
   879	            }
   880	        });
   881	    });
   882	    
   883	    // 폼 필드들 활성화 (로그인 사용자는 바로 작성 가능)
   884	    enableAllFormFields();
   885	}
   886	
   887	// 모든 폼 필드 활성화 (로그인 사용자용)
   888	function enableAllFormFields() {
   889	    const currentUser = getCurrentUser();
   890	    if (!currentUser) return;
   891	    
   892	    // readonly 속성이 있는 모든 필드 활성화
   893	    const readonlyFields = document.querySelectorAll('input[readonly], textarea[readonly]');
   894	    readonlyFields.forEach(field => {
   895	        field.removeAttribute('readonly');
   896	        field.classList.remove('cursor-pointer');
   897	        field.classList.add('cursor-text');
   898	        
   899	        // 클릭 이벤트 리스너 제거 (로그인 체크 불필요)
   900	        field.removeAttribute('onclick');
   901	    });
   902	    
   903	    console.log(`✅ ${readonlyFields.length}개 폼 필드 활성화 완료`);
   904	}
   905	
   906	// 결과 모달 닫기
   907	function closeResultModal() {
   908	    const modal = document.getElementById('result-modal');
   909	    if (modal) {
   910	        modal.remove();
   911	    }
   912	}
   913	
   914	// 기본 상담 결과 표시
   915	function showConsultationResult(consultationId) {
   916	    const resultHtml = `
   917	        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="result-modal">
   918	            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
   919	                <div class="text-center">
   920	                    <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
   921	                    <h3 class="text-2xl font-bold text-gray-900 mb-4">상담 신청 완료!</h3>
   922	                    <p class="text-gray-600 mb-6">
   923	                        상담 번호: <strong>${consultationId}</strong><br><br>
   924	                        해당 지역의 피부관리실에서 곧 연락드릴 예정입니다.<br>
   925	                        보통 24시간 내에 여러 업체의 견적을 받아보실 수 있습니다.
   926	                    </p>
   927	                    <div class="space-y-2">
   928	                        <button onclick="closeResultModal()" class="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg">
   929	                            확인
   930	                        </button>
   931	                        <a href="customer-dashboard.html" class="block w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-center">
   932	                            내 상담 현황 보기
   933	                        </a>
   934	                    </div>
   935	                </div>
   936	            </div>
   937	        </div>
   938	    `;
   939	    
   940	    document.body.insertAdjacentHTML('beforeend', resultHtml);
   941	}
   942	
   943	// 상담 결과와 함께 지역별 업체 표시 (업데이트됨)
   944	async function showConsultationResultWithShops(consultationId, state, district, shopsCount = 0, shops = []) {
   945	    try {
   946	        // 해당 지역의 우수업체 가져오기
   947	        const topShops = await getTopRatedShops(region);
   948	        
   949	        const resultHtml = `
   950	            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="result-modal">
   951	                <div class="bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
   952	                    <div class="text-center mb-6">
   953	                        <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
   954	                        <h3 class="text-2xl font-bold text-gray-900 mb-4">상담 신청 완료!</h3>
   955	                        <p class="text-gray-600 mb-4">
   956	                            상담 번호: <strong>${consultationId}</strong><br><br>
   957	                            <span class="text-green-600 font-semibold">${state} ${district}</span> 지역의 <strong>${shopsCount}개 피부관리실</strong>에 견적 요청이 전송되었습니다.<br>
   958	                            보통 24시간 내에 여러 업체의 견적을 받아보실 수 있습니다.
   959	                        </p>
   960	                    </div>
   961	                    
   962	                    ${shops.length > 0 ? `
   963	                    <div class="border-t pt-6">
   964	                        <div class="flex items-center mb-4">
   965	                            <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>
   966	                            <h4 class="text-lg font-semibold text-gray-900">${state} ${district} 견적 요청 업체 ${Math.min(shops.length, 3)}개</h4>
   967	                        </div>
   968	                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
   969	                            ${shops.slice(0, 3).map((shop, index) => `
   970	                                <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
   971	                                    <div class="flex items-center mb-2">
   972	                                        <span class="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">
   973	                                            ${index + 1}
   974	                                        </span>
   975	                                        <h5 class="font-semibold text-gray-900">${shop.name}</h5>
   976	                                    </div>
   977	                                    <div class="flex items-center mb-2">
   978	                                        <i class="fas fa-phone text-green-500 mr-1"></i>
   979	                                        <span class="text-sm text-gray-600">${shop.phone}</span>
   980	                                    </div>
   981	                                    <p class="text-xs text-gray-500 mb-2">견적 요청이 전송되었습니다</p>
   982	                                    <p class="text-xs text-green-600 font-medium">24시간 내 연락 예정</p>
   983	                                </div>
   984	                            `).join('')}
   985	                        </div>
   986	                        <div class="mt-4 text-center text-sm text-gray-500">
   987	                            * ${state} ${district} 지역에서 견적 요청을 받는 업체들입니다.
   988	                        </div>
   989	                    </div>
   990	                    ` : ''}
   991	                    
   992	                    <div class="mt-6 text-center">
   993	                        <button onclick="closeResultModal()" class="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg mr-2">
   994	                            확인
   995	                        </button>
   996	                        <a href="customer-dashboard.html" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
   997	                            내 상담 현황 보기
   998	                        </a>
   999	                    </div>
  1000	                </div>
  1001	            </div>
  1002	        `;
  1003	        
  1004	        document.body.insertAdjacentHTML('beforeend', resultHtml);
  1005	    } catch (error) {
  1006	        console.error('업체 조회 오류:', error);
  1007	        // 오류 시 기본 결과 모달 표시
  1008	        showConsultationResult(consultationId);
  1009	    }
  1010	}
  1011	
  1012	// 해당 지역에 샵이 없을 때 표시
  1013	function showNoShopsInRegion(state, district, message) {
  1014	    const resultHtml = `
  1015	        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="no-shops-modal">
  1016	            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
  1017	                <div class="text-center">
  1018	                    <i class="fas fa-map-marker-alt text-orange-500 text-5xl mb-4"></i>
  1019	                    <h3 class="text-xl font-bold text-gray-900 mb-4">지역 검색 결과</h3>
  1020	                    <p class="text-gray-600 mb-6">
  1021	                        ${message}
  1022	                    </p>
  1023	                    
  1024	                    <div class="space-y-3">
  1025	                        <button onclick="expandSearch('${state}', '${district}')" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
  1026	                            인근 지역 포함 검색
  1027	                        </button>
  1028	                        <button onclick="closeNoShopsModal()" class="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
  1029	                            다시 시도
  1030	                        </button>
  1031	                    </div>
  1032	                    
  1033	                    <div class="mt-4 text-sm text-gray-500">
  1034	                        <p>📞 직접 문의: 1588-0000</p>
  1035	                        <p>📧 이메일: help@pposhop.kr</p>
  1036	                    </div>
  1037	                </div>
  1038	            </div>
  1039	        </div>
  1040	    `;
  1041	    
  1042	    document.body.insertAdjacentHTML('beforeend', resultHtml);
  1043	}
  1044	
  1045	// 인근 지역 포함 확장 검색
  1046	async function expandSearch(state, district) {
  1047	    try {
  1048	        console.log(`🔍 확장 검색 시작: ${state} ${district}`);
  1049	        
  1050	        if (typeof window.regionalMatching !== 'undefined') {
  1051	            const expandedShops = await window.regionalMatching.expandedSearch(state, district);
  1052	            
  1053	            closeNoShopsModal();
  1054	            
  1055	            if (expandedShops.length > 0) {
  1056	                showExpandedSearchResults(state, district, expandedShops);
  1057	            } else {
  1058	                showNotification('인근 지역에도 등록된 피부관리실이 없습니다. 직접 문의해주세요.', 'warning');
  1059	            }
  1060	        }
  1061	        
  1062	    } catch (error) {
  1063	        console.error('확장 검색 오류:', error);
  1064	        showNotification('확장 검색 중 오류가 발생했습니다.', 'error');
  1065	    }
  1066	}
  1067	
  1068	// 확장 검색 결과 표시
  1069	function showExpandedSearchResults(state, district, shops) {
  1070	    const resultHtml = `
  1071	        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="expanded-results-modal">
  1072	            <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
  1073	                <div class="text-center mb-6">
  1074	                    <i class="fas fa-search-location text-blue-500 text-5xl mb-4"></i>
  1075	                    <h3 class="text-xl font-bold text-gray-900 mb-4">인근 지역 피부관리실 ${shops.length}개 발견</h3>
  1076	                    <p class="text-gray-600 mb-4">
  1077	                        ${state} ${district} 및 인근 지역의 피부관리실들입니다.<br>
  1078	                        직접 연락하여 상담받아보세요.
  1079	                    </p>
  1080	                </div>
  1081	                
  1082	                <div class="space-y-4">
  1083	                    ${shops.slice(0, 5).map(shop => `
  1084	                        <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
  1085	                            <div class="flex justify-between items-start mb-2">
  1086	                                <h5 class="font-semibold text-gray-900">${shop.shop_name}</h5>
  1087	                                <span class="text-sm text-gray-500">${shop.state} ${shop.district}</span>
  1088	                            </div>
  1089	                            <div class="flex items-center mb-2">
  1090	                                <i class="fas fa-phone text-green-500 mr-2"></i>
  1091	                                <span class="text-sm text-gray-600">${shop.phone}</span>
  1092	                            </div>
  1093	                            <p class="text-sm text-gray-600">${shop.address || '주소 정보 없음'}</p>
  1094	                            ${shop.treatment_types ? `<p class="text-xs text-blue-600 mt-1">전문분야: ${shop.treatment_types.join(', ')}</p>` : ''}
  1095	                        </div>
  1096	                    `).join('')}
  1097	                </div>
  1098	                
  1099	                <div class="mt-6 text-center">
  1100	                    <button onclick="closeExpandedResultsModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
  1101	                        확인
  1102	                    </button>
  1103	                </div>
  1104	            </div>
  1105	        </div>
  1106	    `;
  1107	    
  1108	    document.body.insertAdjacentHTML('beforeend', resultHtml);
  1109	}
  1110	
  1111	// 모달 닫기 함수들
  1112	function closeNoShopsModal() {
  1113	    const modal = document.getElementById('no-shops-modal');
  1114	    if (modal) {
  1115	        modal.remove();
  1116	    }
  1117	}
  1118	
  1119	function closeExpandedResultsModal() {
  1120	    const modal = document.getElementById('expanded-results-modal');
  1121	    if (modal) {
  1122	        modal.remove();
  1123	    }
  1124	}
  1125	
  1126	// 지역별 우수업체 가져오기
  1127	async function getTopRatedShops(region) {
  1128	    try {
  1129	        // 해당 지역의 피부관리실 조회
  1130	        const response = await fetch(`tables/skincare_shops?search=${encodeURIComponent(region)}&limit=50`);
  1131	        const data = await response.json();
  1132	        let shops = data.data || [];
  1133	        
  1134	        if (shops.length === 0) {
  1135	            // API 실패 시 데모 데이터 사용
  1136	            shops = [
  1137	                {
  1138	                    id: 'shop_001',
  1139	                    shop_name: '뷰티스킨 클리닉',
  1140	                    specialties: '여드름 관리, 미백 관리, 모공 축소',
  1141	                    address: '서울시 강남구 역삼동 123-45',
  1142	                    price_range: '10-50만원',
  1143	                    rating: 4.8,
  1144	                    review_count: 127,
  1145	                    region: region
  1146	                },
  1147	                {
  1148	                    id: 'shop_002',
  1149	                    shop_name: '글로우 스킨케어',
  1150	                    specialties: '주름 개선, 탄력 관리, 수분 관리',
  1151	                    address: '서울시 서초구 서초동 567-89',
  1152	                    price_range: '20-100만원',
  1153	                    rating: 4.9,
  1154	                    review_count: 89,
  1155	                    region: region
  1156	                },
  1157	                {
  1158	                    id: 'shop_003',
  1159	                    shop_name: '청담 피부관리실',
  1160	                    specialties: '여드름 관리, 수분 관리, 모공 축소',
  1161	                    address: '부산시 해운대구 우동 789-12',
  1162	                    price_range: '15-40만원',
  1163	                    rating: 4.7,
  1164	                    review_count: 156,
  1165	                    region: region
  1166	                }
  1167	            ];
  1168	        }
  1169	        
  1170	        // 평점 순으로 정렬하여 상위 3개만 반환
  1171	        const topShops = shops
  1172	            .filter(shop => shop.is_active !== false && shop.verified !== false)
  1173	            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
  1174	            .slice(0, 3);
  1175	        
  1176	        return topShops;
  1177	    } catch (error) {
  1178	        console.error('우수업체 조회 오류:', error);
  1179	        return [];
  1180	    }
  1181	}
  1182	
  1183	// 별점 생성 도우미 함수
  1184	function generateStarRating(rating) {
  1185	    const fullStars = Math.floor(rating);
  1186	    const hasHalfStar = rating % 1 >= 0.5;
  1187	    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  1188	    
  1189	    let stars = '';
  1190	    
  1191	    // 완전한 별
  1192	    for (let i = 0; i < fullStars; i++) {
  1193	        stars += '<i class="fas fa-star"></i>';
  1194	    }
  1195	    
  1196	    // 반 별
  1197	    if (hasHalfStar) {
  1198	        stars += '<i class="fas fa-star-half-alt"></i>';
  1199	    }
  1200	    
  1201	    // 빈 별
  1202	    for (let i = 0; i < emptyStars; i++) {
  1203	        stars += '<i class="far fa-star"></i>';
  1204	    }
  1205	    
  1206	    return stars;
  1207	}
  1208	
  1209	// 알림 표시 함수
  1210	function showNotification(message, type = 'info') {
  1211	    const notification = document.createElement('div');
  1212	    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
  1213	    
  1214	    const bgColor = type === 'success' ? 'bg-green-500' :
  1215	                   type === 'error' ? 'bg-red-500' :
  1216	                   type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  1217	    
  1218	    const icon = type === 'success' ? 'fa-check-circle' : 
  1219	                 type === 'error' ? 'fa-exclamation-circle' : 
  1220	                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
  1221	    
  1222	    notification.className += ` ${bgColor} text-white`;
  1223	    
  1224	    notification.innerHTML = `
  1225	        <div class="flex items-center">
  1226	            <i class="fas ${icon} mr-3"></i>
  1227	            <span>${message}</span>
  1228	            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
  1229	                <i class="fas fa-times"></i>
  1230	            </button>
  1231	        </div>
  1232	    `;
  1233	    
  1234	    document.body.appendChild(notification);
  1235	    
  1236	    // 애니메이션으로 표시
  1237	    setTimeout(() => {
  1238	        notification.classList.remove('translate-x-full');
  1239	    }, 100);
  1240	    
  1241	    // 자동 제거
  1242	    setTimeout(() => {
  1243	        notification.classList.add('translate-x-full');
  1244	        setTimeout(() => {
  1245	            if (notification.parentElement) {
  1246	                notification.remove();
  1247	            }
  1248	        }, 300);
  1249	    }, 5000);
  1250	}
  1251	
  1252	// 스크롤 함수
  1253	function scrollToConsultation() {
  1254	    document.getElementById('consultation').scrollIntoView({ 
  1255	        behavior: 'smooth' 
  1256	    });
  1257	}
  1258	
  1259	// 피부관리실 등록 페이지 열기
  1260	function openShopRegistration() {
  1261	    window.location.href = 'shop-registration.html';
  1262	}
  1263	
  1264	// ======= 헤더 메뉴 함수들 =======
  1265	
  1266	// 모바일 네비게이션 메뉴 토글
  1267	function toggleMobileNavMenu() {
  1268	    const mobileNavMenu = document.getElementById('mobile-nav-menu');
  1269	    if (mobileNavMenu) {
  1270	        mobileNavMenu.classList.toggle('hidden');
  1271	    }
  1272	}
  1273	
  1274	// 모바일 네비게이션 메뉴 닫기
  1275	function closeMobileNavMenu() {
  1276	    const mobileNavMenu = document.getElementById('mobile-nav-menu');
  1277	    if (mobileNavMenu) {
  1278	        mobileNavMenu.classList.add('hidden');
  1279	    }
  1280	}
  1281	
  1282	// 사용자 메뉴 토글
  1283	function toggleUserMenu() {
  1284	    const userMenu = document.getElementById('user-menu');
  1285	    if (userMenu) {
  1286	        userMenu.classList.toggle('hidden');
  1287	    }
  1288	}
  1289	
  1290	// 대시보드로 리디렉션 개선
  1291	function redirectToDashboard() {
  1292	    const currentUser = getCurrentUser();
  1293	    if (currentUser) {
  1294	        switch(currentUser.user_type) {
  1295	            case 'customer':
  1296	                window.location.href = 'customer-dashboard.html';
  1297	                break;
  1298	            case 'shop':
  1299	            case 'shop_owner':
  1300	                window.location.href = 'shop-dashboard.html';
  1301	                break;
  1302	            case 'admin':
  1303	                window.location.href = 'admin-dashboard.html';
  1304	                break;
  1305	            default:
  1306	                window.location.href = 'login.html';
  1307	        }
  1308	    } else {
  1309	        window.location.href = 'login.html';
  1310	    }
  1311	}
  1312	
  1313	// 로그아웃 함수
  1314	function logout() {
  1315	    // 세션 데이터 정리
  1316	    localStorage.removeItem('session_token');
  1317	    localStorage.removeItem('user_type');
  1318	    localStorage.removeItem('user_data');
  1319	    localStorage.removeItem('currentUser');
  1320	    
  1321	    // 전역 변수 초기화
  1322	    window.currentUser = null;
  1323	    window.sessionToken = null;
  1324	    
  1325	    // UI 업데이트
  1326	    updateAuthUI();
  1327	    
  1328	    // 메인 페이지로 리다이렉트
  1329	    window.location.href = 'index.html';
  1330	}
  1331	
  1332	// 현재 로그인한 사용자 가져오기 (간단 버전)
  1333	function getCurrentUser() {
  1334	    try {
  1335	        const userData = localStorage.getItem('currentUser');
  1336	        return userData ? JSON.parse(userData) : null;
  1337	    } catch (error) {
  1338	        console.error('사용자 데이터 파싱 오류:', error);
  1339	        return null;
  1340	    }
  1341	}
  1342	
  1343	// 로그아웃 함수
  1344	function logout() {
  1345	    if (confirm('로그아웃 하시겠습니까?')) {
  1346	        localStorage.removeItem('currentUser');
  1347	        localStorage.removeItem('authToken');
  1348	        localStorage.removeItem('session_token');
  1349	        localStorage.removeItem('user_type');
  1350	        localStorage.removeItem('user_data');
  1351	        showNotification('로그아웃되었습니다.', 'info');
  1352	        updateAuthUI(); // UI 업데이트
  1353	    }
  1354	}
  1355	
  1356	// 로그인 상태에 따른 UI 업데이트
  1357	function updateAuthUI() {
  1358	    const userMenu = document.getElementById('userMenu');
  1359	    const loginBtn = document.getElementById('loginBtn');
  1360	    
  1361	    // 현재 사용자 정보 가져오기
  1362	    const currentUser = getCurrentUser();
  1363	    
  1364	    if (currentUser && userMenu) {
  1365	        // 로그인된 상태 - 사용자 정보 표시
  1366	        userMenu.innerHTML = '';
  1367	        
  1368	        const userInfoDiv = document.createElement('div');
  1369	        userInfoDiv.className = 'flex items-center space-x-2';
  1370	        
  1371	        const userName = document.createElement('span');
  1372	        userName.className = 'text-sm text-gray-700';
  1373	        userName.textContent = `${currentUser.name}님`;
  1374	        
  1375	        const logoutBtn = document.createElement('button');
  1376	        logoutBtn.className = 'btn-secondary text-sm px-4 py-2 touch-feedback';
  1377	        logoutBtn.textContent = '로그아웃';
  1378	        logoutBtn.onclick = function() {
  1379	            logout();
  1380	        };
  1381	        
  1382	        userInfoDiv.appendChild(userName);
  1383	        userInfoDiv.appendChild(logoutBtn);
  1384	        userMenu.appendChild(userInfoDiv);
  1385	        
  1386	    } else if (userMenu && !currentUser) {
  1387	        // 로그인되지 않은 상태 - 기존 로그인 버튼이 있으면 그대로 유지
  1388	        if (!loginBtn) {
  1389	            userMenu.innerHTML = '';
  1390	            
  1391	            const newLoginBtn = document.createElement('button');
  1392	            newLoginBtn.id = 'loginBtn';
  1393	            newLoginBtn.className = 'btn-secondary text-sm px-4 py-2 touch-feedback';
  1394	            newLoginBtn.textContent = '로그인';
  1395	            newLoginBtn.onclick = function() {
  1396	                window.location.href = 'login.html';
  1397	            };
  1398	            
  1399	            userMenu.appendChild(newLoginBtn);
  1400	        }
  1401	        // 기존 로그인 버튼이 있으면 그대로 유지 (HTML에서 정의된 onclick 핸들러 보존)
  1402	    }
  1403	}
  1404	
  1405	// 대시보드로 리다이렉트
  1406	function redirectToDashboard(userType) {
  1407	    switch(userType) {
  1408	        case 'customer':
  1409	            window.location.href = 'customer-dashboard.html';
  1410	            break;
  1411	        case 'shop_owner':
  1412	            window.location.href = 'shop-dashboard.html';
  1413	            break;
  1414	        case 'admin':
  1415	            window.location.href = 'admin-dashboard.html';
  1416	            break;
  1417	        default:
  1418	            window.location.href = 'login.html';
  1419	    }
  1420	}
  1421	
  1422	// 고급 기능 접근 시 로그인 체크
  1423	function checkLoginForAdvancedFeatures() {
  1424	    const currentUser = getCurrentUser();
  1425	    
  1426	    if (!currentUser) {
  1427	        showLoginModal();
  1428	        return false;
  1429	    }
  1430	    
  1431	    // 로그인된 경우 정상적으로 선택 허용
  1432	    return true;
  1433	}
  1434	
  1435	// 치료 타입 선택 시 로그인 체크
  1436	function checkLoginForTreatmentType(element) {
  1437	    // 이벤트가 실제 사용자 클릭인지 확인
  1438	    if (!event || !event.isTrusted) {
  1439	        return true;
  1440	    }
  1441	    
  1442	    const currentUser = getCurrentUser();
  1443	    const checkbox = element.querySelector('input[type="checkbox"]');
  1444	    
  1445	    if (!currentUser) {
  1446	        event.preventDefault();
  1447	        event.stopPropagation();
  1448	        // 비회원인 경우 체크박스 선택 방지하고 모달 표시
  1449	        if (checkbox) {
  1450	            checkbox.checked = false;
  1451	        }
  1452	        showLoginModal();
  1453	        return false;
  1454	    }
  1455	    
  1456	    // 로그인된 사용자인 경우 체크박스 상태 토글
  1457	    if (checkbox) {
  1458	        checkbox.checked = !checkbox.checked;
  1459	    }
  1460	    return true;
  1461	}
  1462	
  1463	// 로그인 모달 표시
  1464	function showLoginModal() {
  1465	    const modal = document.getElementById('login-modal');
  1466	    if (modal) {
  1467	        modal.classList.remove('hidden');
  1468	        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
  1469	    }
  1470	}
  1471	
  1472	// 로그인 모달 닫기
  1473	function closeLoginModal() {
  1474	    const modal = document.getElementById('login-modal');
  1475	    if (modal) {
  1476	        modal.classList.add('hidden');
  1477	        document.body.style.overflow = ''; // 스크롤 복원
  1478	    }
  1479	}
  1480	
  1481	// 비회원으로 계속하기
  1482	function continueAsGuest() {
  1483	    closeLoginModal();
  1484	    showNotification('회원가입 후 더 정확하고 개인화된 상담 서비스를 받아보세요!', 'info');
  1485	    
  1486	    // 상세 상담 신청 폼으로 스크롤
  1487	    setTimeout(() => {
  1488	        const consultationSection = document.getElementById('consultation');
  1489	        if (consultationSection) {
  1490	            consultationSection.scrollIntoView({ 
  1491	                behavior: 'smooth' 
  1492	            });
  1493	        }
  1494	    }, 500);
  1495	}
  1496	
  1497	// 폼 필드 클릭 시 로그인 체크
  1498	function checkLoginForFormField(element) {
  1499	    // 이벤트가 실제 사용자 클릭인지 확인
  1500	    if (!event || !event.isTrusted) {
  1501	        return true;
  1502	    }
  1503	    
  1504	    const currentUser = getCurrentUser();
  1505	    if (!currentUser) {
  1506	        event.preventDefault();
  1507	        event.stopPropagation();
  1508	        
  1509	        // 포커스 제거
  1510	        if (element.blur) {
  1511	            element.blur();
  1512	        }
  1513	        // 체크박스인 경우 체크 해제
  1514	        if (element.type === 'checkbox') {
  1515	            element.checked = false;
  1516	        }
  1517	        showLoginModal();
  1518	        return false;
  1519	    }
  1520	    
  1521	    // 로그인된 경우 정상 동작 허용
  1522	    return true;
  1523	}
  1524	
  1525	// 폼 필드 활성화
  1526	function enableFormField(element) {
  1527	    if (element.hasAttribute('readonly')) {
  1528	        element.removeAttribute('readonly');
  1529	        element.classList.remove('cursor-pointer');
  1530	        element.classList.add('cursor-text');
  1531	    }
  1532	    
  1533	    // 입력 필드인 경우 포커스
  1534	    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
  1535	        setTimeout(() => {
  1536	            element.focus();
  1537	        }, 100);
  1538	    }
  1539	}
  1540	
  1541	// 상담 신청 폼 제출 핸들러
  1542	function handleConsultationSubmit(e) {
  1543	    // 이벤트가 있다면 기본 동작 방지
  1544	    if (e) {
  1545	        e.preventDefault();
  1546	    }
  1547	    
  1548	    const currentUser = getCurrentUser();
  1549	    
  1550	    if (!currentUser) {
  1551	        showLoginModal();
  1552	        return;
  1553	    }
  1554	    
  1555	    // 폼 검증 및 제출
  1556	    if (validateConsultationForm()) {
  1557	        submitConsultationForm();
  1558	    }
  1559	}
  1560	
  1561	// ======= 빠른 상담 신청 처리 =======
  1562	
  1563	// 빠른 상담 신청 폼 제출 처리
  1564	async function handleQuickConsultationSubmit(e) {
  1565	    e.preventDefault();
  1566	    
  1567	    const currentUser = getCurrentUser();
  1568	    
  1569	    // 비회원인 경우 회원가입 유도
  1570	    if (!currentUser) {
  1571	        showLoginModal();
  1572	        return;
  1573	    }
  1574	    
  1575	    // 회원인 경우 상세 상담 신청 페이지로 이동하여 정보 자동 입력
  1576	    const formData = collectQuickFormData();
  1577	    
  1578	    // 세션 스토리지에 임시 저장
  1579	    sessionStorage.setItem('quickConsultationData', JSON.stringify(formData));
  1580	    
  1581	    // 상세 상담 신청으로 스크롤 이동
  1582	    document.getElementById('consultation').scrollIntoView({ 
  1583	        behavior: 'smooth' 
  1584	    });
  1585	    
  1586	    // 상세 폼에 데이터 미리 입력
  1587	    setTimeout(() => {
  1588	        fillDetailedFormFromQuickForm(formData);
  1589	        showNotification('상세 상담 신청 폼으로 정보가 이동되었습니다.', 'info');
  1590	    }, 1000);
  1591	}
  1592	
  1593	// 빠른 폼 데이터 수집
  1594	function collectQuickFormData() {
  1595	    const form = document.getElementById('quick-consultation-form');
  1596	    const formData = new FormData(form);
  1597	    
  1598	    // 체크박스 데이터 처리
  1599	    const treatments = [];
  1600	    const checkedBoxes = document.querySelectorAll('input[name="quick-treatment"]:checked');
  1601	    checkedBoxes.forEach(box => treatments.push(box.value));
  1602	    
  1603	    return {
  1604	        name: formData.get('quick-name'),
  1605	        email: formData.get('quick-email'),
  1606	        region: formData.get('quick-region'),
  1607	        treatments: treatments,
  1608	        message: formData.get('quick-message')
  1609	    };
  1610	}
  1611	
  1612	// 상세 폼에 빠른 폼 데이터 입력
  1613	function fillDetailedFormFromQuickForm(data) {
  1614	    // 이름과 이메일은 이미 자동 입력됨 (로그인 사용자)
  1615	    
  1616	    // 지역 선택
  1617	    if (data.region) {
  1618	        const provinceSelect = document.getElementById('province');
  1619	        if (provinceSelect) {
  1620	            provinceSelect.value = data.region;
  1621	            // 지역 변경 이벤트 트리거
  1622	            const event = new Event('change');
  1623	            provinceSelect.dispatchEvent(event);
  1624	        }
  1625	    }
  1626	    
  1627	    // 치료 타입 선택
  1628	    if (data.treatments && data.treatments.length > 0) {
  1629	        const treatmentCheckboxes = document.querySelectorAll('input[name="treatment_type"]');
  1630	        treatmentCheckboxes.forEach(checkbox => {
  1631	            if (data.treatments.includes(checkbox.value)) {
  1632	                checkbox.checked = true;
  1633	            }
  1634	        });
  1635	    }
  1636	    
  1637	    // 상담 내용
  1638	    if (data.message) {
  1639	        const consultationText = document.getElementById('consultation_text');
  1640	        if (consultationText) {
  1641	            consultationText.value = data.message;
  1642	        }
  1643	    }
  1644	}
  1645	
  1646	// ======= 레벨 1 기본인증 시스템 (40원) =======
  1647	
  1648	class Level1BasicAuth {
  1649	    constructor() {
  1650	        this.config = {
  1651	            // API 엔드포인트
  1652	            endpoints: {
  1653	                basic_auth: '/api/auth/basic',
  1654	                sms_send: '/api/sms/send',
  1655	                sms_verify: '/api/sms/verify',
  1656	                email_send: '/api/email/send',
  1657	                email_verify: '/api/email/verify'
  1658	            },
  1659	            
  1660	            // 비용 설정 (원/건)
  1661	            pricing: {
  1662	                email_auth: 5,      // 이메일 인증
  1663	                sms_auth: 35,       // SMS 인증  
  1664	                total_basic: 40     // 레벨 1 기본인증 총 비용
  1665	            },
  1666	            
  1667	            // 기본 인증 설정
  1668	            basic: {
  1669	                name: '레벨 1 기본 인증',
  1670	                cost: 40,
  1671	                methods: ['email', 'sms'],
  1672	                security_level: 1
  1673	            }
  1674	        };
  1675	        
  1676	        this.currentAuth = null;
  1677	        this.init();
  1678	    }
  1679	    
  1680	    // 초기화
  1681	    init() {
  1682	        console.log('📱 레벨 1 기본인증 시스템 초기화 완료');
  1683	    }
  1684	    
  1685	    // 레벨 1 기본 인증 시작 (이메일 5원 + SMS 35원 = 40원)
  1686	    async startBasicAuth(userData) {
  1687	        console.log('🚀 레벨 1 기본 인증 시작:', userData);
  1688	        
  1689	        try {
  1690	            // 입력 데이터 검증
  1691	            if (!userData.email || !userData.phone) {
  1692	                throw new Error('이메일과 휴대폰 번호를 입력해주세요.');
  1693	            }
  1694	            
  1695	            this.currentAuth = {
  1696	                level: 'basic',
  1697	                userData: userData,
  1698	                steps: ['email', 'sms'],
  1699	                currentStep: 0,
  1700	                startTime: Date.now(),
  1701	                verified: {
  1702	                    email: false,
  1703	                    sms: false
  1704	                }
  1705	            };
  1706	            
  1707	            // 1단계: 이메일 인증 (5원)
  1708	            const emailResult = await this.sendEmailVerification(userData.email);
  1709	            if (!emailResult.success) {
  1710	                throw new Error('이메일 인증 요청 실패: ' + emailResult.message);
  1711	            }
  1712	            
  1713	            // 2단계: SMS 인증 (35원)
  1714	            const smsResult = await this.sendSMSVerification(userData.phone);
  1715	            if (!smsResult.success) {
  1716	                throw new Error('SMS 인증 요청 실패: ' + smsResult.message);
  1717	            }
  1718	            
  1719	            // 인증 진행 UI 표시
  1720	            this.showVerificationUI();
  1721	            
  1722	            return {
  1723	                success: true,
  1724	                message: '이메일과 SMS로 인증 코드를 발송했습니다. (총 비용: 40원)',
  1725	                auth_id: this.generateAuthId(),
  1726	                expires_in: 300, // 5분
  1727	                cost: this.config.basic.cost
  1728	            };
  1729	            
  1730	        } catch (error) {
  1731	            console.error('레벨 1 기본 인증 실패:', error);
  1732	            this.showError(error.message);
  1733	            return { success: false, message: error.message };
  1734	        }
  1735	    }
  1736	    
  1737	    // 이메일 인증 발송 (실제 API - SendGrid 5원)
  1738	    async sendEmailVerification(email) {
  1739	        try {
  1740	            console.log('📧 이메일 인증 발송:', email);
  1741	            
  1742	            // 실제 환경에서는 SendGrid API 호출
  1743	            const response = await this.callEmailAPI({
  1744	                to: email,
  1745	                subject: '[beautycat] 이메일 인증 코드',
  1746	                template: 'email_verification',
  1747	                verification_code: this.generateVerificationCode()
  1748	            });
  1749	            
  1750	            // 개발 환경에서는 Mock 응답
  1751	            const mockResponse = {
  1752	                success: true,
  1753	                message: '이메일 인증 코드를 발송했습니다.',
  1754	                cost: 5,
  1755	                messageId: 'mock_' + Date.now()
  1756	            };
  1757	            
  1758	            console.log('✅ 이메일 발송 완료 (비용: 5원)');
  1759	            return mockResponse;
  1760	            
  1761	        } catch (error) {
  1762	            console.error('이메일 발송 실패:', error);
  1763	            return { success: false, message: '이메일 발송에 실패했습니다.' };
  1764	        }
  1765	    }
  1766	    
  1767	    // SMS 인증 발송 (실제 API - NHN Cloud 35원)
  1768	    async sendSMSVerification(phone) {
  1769	        try {
  1770	            console.log('📱 SMS 인증 발송:', phone);
  1771	            
  1772	            // 실제 환경에서는 NHN Cloud SMS API 호출
  1773	            const response = await this.callSMSAPI({
  1774	                to: phone,
  1775	                message: `[beautycat] 인증번호: ${this.generateVerificationCode()}`,
  1776	                type: 'SMS'
  1777	            });
  1778	            
  1779	            // 개발 환경에서는 Mock 응답
  1780	            const mockResponse = {
  1781	                success: true,
  1782	                message: 'SMS 인증 코드를 발송했습니다.',
  1783	                cost: 35,
  1784	                messageId: 'sms_mock_' + Date.now()
  1785	            };
  1786	            
  1787	            console.log('✅ SMS 발송 완료 (비용: 35원)');
  1788	            return mockResponse;
  1789	            
  1790	        } catch (error) {
  1791	            console.error('SMS 발송 실패:', error);
  1792	            return { success: false, message: 'SMS 발송에 실패했습니다.' };
  1793	        }
  1794	    }
  1795	    
  1796	    // 인증 코드 검증
  1797	    async verifyCode(type, identifier, code) {
  1798	        try {
  1799	            console.log(`🔍 ${type} 인증 코드 검증:`, identifier, code);
  1800	            
  1801	            // 실제 환경에서는 API 검증
  1802	            const isValid = await this.validateCodeWithAPI(type, identifier, code);
  1803	            
  1804	            // 개발 환경에서는 Mock 검증 (코드: 123456)
  1805	            const mockValid = code === '123456' || code === '000000';
  1806	            
  1807	            if (isValid || mockValid) {
  1808	                console.log(`✅ ${type} 인증 검증 성공`);
  1809	                
  1810	                // 인증 상태 업데이트
  1811	                this.currentAuth.verified[type] = true;
  1812	                this.updateAuthProgress();
  1813	                
  1814	                // 모든 인증이 완료되었는지 확인
  1815	                if (this.isAuthComplete()) {
  1816	                    await this.completeBasicAuth();
  1817	                }
  1818	                
  1819	                return {
  1820	                    success: true,
  1821	                    message: `${type} 인증이 완료되었습니다.`
  1822	                };
  1823	            } else {
  1824	                throw new Error('인증 코드가 올바르지 않습니다.');
  1825	            }
  1826	            
  1827	        } catch (error) {
  1828	            console.error('코드 검증 실패:', error);
  1829	            return { success: false, message: error.message };
  1830	        }
  1831	    }
  1832	    
  1833	    // 인증 완료 여부 확인
  1834	    isAuthComplete() {
  1835	        if (!this.currentAuth || !this.currentAuth.verified) {
  1836	            return false;
  1837	        }
  1838	        
  1839	        return this.currentAuth.verified.email && this.currentAuth.verified.sms;
  1840	    }
  1841	    
  1842	    // 기본 인증 완료 처리
  1843	    async completeBasicAuth() {
  1844	        try {
  1845	            console.log('🎉 레벨 1 기본인증 완료!');
  1846	            
  1847	            const authData = {
  1848	                user_id: this.currentAuth.userData.user_id,
  1849	                auth_level: 1,
  1850	                auth_type: 'basic',
  1851	                verified_email: this.currentAuth.userData.email,
  1852	                verified_phone: this.currentAuth.userData.phone,
  1853	                auth_time: new Date().toISOString(),
  1854	                total_cost: this.config.basic.cost
  1855	            };
  1856	            
  1857	            // 인증 결과 저장
  1858	            await this.saveAuthResult(authData);
  1859	            
  1860	            // 사용자에게 완료 알림
  1861	            this.showSuccess('레벨 1 기본인증이 완료되었습니다! (총 비용: 40원)');
  1862	            
  1863	            // 인증 UI 닫기
  1864	            setTimeout(() => {
  1865	                this.hideVerificationUI();
  1866	            }, 2000);
  1867	            
  1868	            return authData;
  1869	            
  1870	        } catch (error) {
  1871	            console.error('인증 완료 처리 실패:', error);
  1872	            throw error;
  1873	        }
  1874	    }
  1875	    
  1876	    // 인증 진행 UI 표시
  1877	    showVerificationUI() {
  1878	        // 기존 모달이 있으면 제거
  1879	        const existingModal = document.getElementById('level1AuthModal');
  1880	        if (existingModal) {
  1881	            existingModal.remove();
  1882	        }
  1883	        
  1884	        // 새 인증 UI 생성
  1885	        const modalHTML = `
  1886	            <div id="level1AuthModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  1887	                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
  1888	                    <div class="text-center mb-4">
  1889	                        <h3 class="text-lg font-semibold text-gray-900">레벨 1 기본인증</h3>
  1890	                        <p class="text-sm text-gray-600">이메일과 SMS로 발송된 인증코드를 입력해주세요</p>
  1891	                        <p class="text-xs text-blue-600">총 인증 비용: 40원 (이메일 5원 + SMS 35원)</p>
  1892	                    </div>
  1893	                    
  1894	                    <div class="space-y-4">
  1895	                        <div>
  1896	                            <label class="block text-sm font-medium text-gray-700 mb-2">
  1897	                                이메일 인증코드
  1898	                            </label>
  1899	                            <input type="text" id="emailCode" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
  1900	                                   placeholder="이메일로 받은 6자리 코드" maxlength="6">
  1901	                            <button onclick="level1Auth.verifyEmailCode()" 
  1902	                                    class="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
  1903	                                이메일 인증 확인
  1904	                            </button>
  1905	                        </div>
  1906	                        
  1907	                        <div>
  1908	                            <label class="block text-sm font-medium text-gray-700 mb-2">
  1909	                                SMS 인증코드
  1910	                            </label>
  1911	                            <input type="text" id="smsCode" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
  1912	                                   placeholder="SMS로 받은 6자리 코드" maxlength="6">
  1913	                            <button onclick="level1Auth.verifySMSCode()" 
  1914	                                    class="mt-2 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600">
  1915	                                SMS 인증 확인
  1916	                            </button>
  1917	                        </div>
  1918	                    </div>
  1919	                    
  1920	                    <div id="authProgress" class="mt-4 text-center">
  1921	                        <div class="flex justify-center space-x-4">
  1922	                            <span id="emailStatus" class="text-gray-400">📧 이메일</span>
  1923	                            <span id="smsStatus" class="text-gray-400">📱 SMS</span>
  1924	                        </div>
  1925	                    </div>
  1926	                    
  1927	                    <div class="mt-4 text-center">
  1928	                        <button onclick="level1Auth.hideVerificationUI()" 
  1929	                                class="px-4 py-2 text-gray-500 hover:text-gray-700">
  1930	                            취소
  1931	                        </button>
  1932	                    </div>
  1933	                </div>
  1934	            </div>
  1935	        `;
  1936	        
  1937	        document.body.insertAdjacentHTML('beforeend', modalHTML);
  1938	    }
  1939	    
  1940	    // 이메일 코드 검증 (UI 헬퍼)
  1941	    async verifyEmailCode() {
  1942	        const code = document.getElementById('emailCode').value;
  1943	        if (!code) {
  1944	            this.showError('이메일 인증코드를 입력해주세요.');
  1945	            return;
  1946	        }
  1947	        
  1948	        const result = await this.verifyCode('email', this.currentAuth.userData.email, code);
  1949	        if (result.success) {
  1950	            document.getElementById('emailStatus').innerHTML = '✅ 이메일 완료';
  1951	            document.getElementById('emailStatus').className = 'text-green-500';
  1952	        } else {
  1953	            this.showError(result.message);
  1954	        }
  1955	    }
  1956	    
  1957	    // SMS 코드 검증 (UI 헬퍼)
  1958	    async verifySMSCode() {
  1959	        const code = document.getElementById('smsCode').value;
  1960	        if (!code) {
  1961	            this.showError('SMS 인증코드를 입력해주세요.');
  1962	            return;
  1963	        }
  1964	        
  1965	        const result = await this.verifyCode('sms', this.currentAuth.userData.phone, code);
  1966	        if (result.success) {
  1967	            document.getElementById('smsStatus').innerHTML = '✅ SMS 완료';
  1968	            document.getElementById('smsStatus').className = 'text-green-500';
  1969	        } else {
  1970	            this.showError(result.message);
  1971	        }
  1972	    }
  1973	    
  1974	    // 인증 진행 상황 업데이트
  1975	    updateAuthProgress() {
  1976	        console.log('🔄 인증 진행 상황 업데이트:', this.currentAuth.verified);
  1977	    }
  1978	    
  1979	    // 인증 UI 숨기기
  1980	    hideVerificationUI() {
  1981	        const modal = document.getElementById('level1AuthModal');
  1982	        if (modal) {
  1983	            modal.remove();
  1984	        }
  1985	    }
  1986	    
  1987	    // 유틸리티 함수들
  1988	    generateAuthId() {
  1989	        return 'AUTH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  1990	    }
  1991	    
  1992	    generateVerificationCode() {
  1993	        return Math.floor(100000 + Math.random() * 900000).toString();
  1994	    }
  1995	    
  1996	    // Mock API 호출들 (실제 환경에서는 실제 API 사용)
  1997	    async callEmailAPI(data) {
  1998	        // SendGrid API 호출 시뮬레이션
  1999	        await new Promise(resolve => setTimeout(resolve, 500));
  2000	        return { success: true, messageId: 'mock_email_' + Date.now() };
  2001	    }
  2002	    
  2003	    async callSMSAPI(data) {
  2004	        // NHN Cloud SMS API 호출 시뮬레이션
  2005	        await new Promise(resolve => setTimeout(resolve, 500));
  2006	        return { success: true, messageId: 'mock_sms_' + Date.now() };
  2007	    }
  2008	    
  2009	    async validateCodeWithAPI(type, identifier, code) {
  2010	        // 실제 환경에서는 서버 검증
  2011	        await new Promise(resolve => setTimeout(resolve, 300));
  2012	        return false; // Mock에서는 항상 false 반환하여 클라이언트 검증 사용
  2013	    }
  2014	    
  2015	    async saveAuthResult(authData) {
  2016	        // 실제 환경에서는 데이터베이스 저장
  2017	        console.log('💾 인증 결과 저장:', authData);
  2018	        localStorage.setItem('level1_auth_result', JSON.stringify(authData));
  2019	    }
  2020	    
  2021	    // UI 메시지 표시
  2022	    showError(message) {
  2023	        showNotification(message, 'error');
  2024	    }
  2025	    
  2026	    showSuccess(message) {
  2027	        showNotification(message, 'success');
  2028	    }
  2029	}
  2030	
  2031	// 전역 레벨 1 기본인증 인스턴스 생성
  2032	const level1Auth = new Level1BasicAuth();
  2033	
  2034	// 지역별 매칭 시스템 초기화
  2035	function initializeRegionalMatching() {
  2036	    try {
  2037	        // RegionalMatching 클래스가 로드되었는지 확인
  2038	        if (typeof RegionalMatching !== 'undefined') {
  2039	            window.regionalMatching = new RegionalMatching();
  2040	            console.log('✅ 지역별 매칭 시스템 초기화 완료');
  2041	        } else {
  2042	            console.warn('⚠️ RegionalMatching 클래스를 찾을 수 없습니다. regional-matching.js가 로드되었는지 확인하세요.');
  2043	            
  2044	            // 간단한 폴백 매칭 시스템 생성
  2045	            window.regionalMatching = createFallbackMatching();
  2046	        }
  2047	    } catch (error) {
  2048	        console.error('❌ 지역별 매칭 시스템 초기화 오류:', error);
  2049	        
  2050	        // 폴백 시스템 사용
  2051	        window.regionalMatching = createFallbackMatching();
  2052	    }
  2053	}
  2054	
  2055	// 폴백 매칭 시스템 (regional-matching.js가 로드되지 않은 경우)
  2056	function createFallbackMatching() {
  2057	    return {
  2058	        async distributeQuoteRequest(consultationData) {
  2059	            try {
  2060	                console.log('🔄 폴백 매칭 시스템 사용');
  2061	                
  2062	                // 해당 지역 샵 검색
  2063	                const response = await fetch('tables/skincare_shops?limit=100');
  2064	                const shopsData = await response.json();
  2065	                
  2066	                // 지역 필터링
  2067	                const matchedShops = shopsData.data.filter(shop => {
  2068	                    const shopState = shop.state || shop.shop_state || '';
  2069	                    const shopDistrict = shop.district || shop.shop_district || '';
  2070	                    
  2071	                    const stateMatch = shopState.includes(consultationData.state?.replace('특별시', '').replace('광역시', '')) || 
  2072	                                     consultationData.state?.includes(shopState.replace('특별시', '').replace('광역시', ''));
  2073	                    const districtMatch = shopDistrict.includes(consultationData.district) || 
  2074	                                        consultationData.district?.includes(shopDistrict);
  2075	                    
  2076	                    return stateMatch && districtMatch && (shop.status === 'approved' || !shop.status);
  2077	                });
  2078	                
  2079	                console.log(`📍 ${consultationData.state} ${consultationData.district} 지역에서 ${matchedShops.length}개 업체 발견`);
  2080	                
  2081	                if (matchedShops.length === 0) {
  2082	                    return {
  2083	                        success: false,
  2084	                        message: '해당 지역에 등록된 피부관리실이 없습니다.',
  2085	                        shopsCount: 0
  2086	                    };
  2087	                }
  2088	                
  2089	                // 상담 요청 저장
  2090	                const consultationResponse = await fetch('tables/consultations', {
  2091	                    method: 'POST',
  2092	                    headers: { 'Content-Type': 'application/json' },
  2093	                    body: JSON.stringify({
  2094	                        ...consultationData,
  2095	                        status: 'pending',
  2096	                        submission_date: new Date().toISOString()
  2097	                    })
  2098	                });
  2099	                
  2100	                if (!consultationResponse.ok) {
  2101	                    throw new Error('상담 요청 저장 실패');
  2102	                }
  2103	                
  2104	                const savedConsultation = await consultationResponse.json();
  2105	                
  2106	                return {
  2107	                    success: true,
  2108	                    message: `${consultationData.state} ${consultationData.district} 지역의 ${matchedShops.length}개 피부관리실에 견적 요청이 전송되었습니다.`,
  2109	                    shopsCount: matchedShops.length,
  2110	                    consultationId: savedConsultation.id,
  2111	                    shops: matchedShops.map(shop => ({
  2112	                        name: shop.shop_name || shop.name,
  2113	                        phone: shop.phone
  2114	                    }))
  2115	                };
  2116	                
  2117	            } catch (error) {
  2118	                console.error('폴백 매칭 오류:', error);
  2119	                return {
  2120	                    success: false,
  2121	                    message: '견적 요청 처리 중 오류가 발생했습니다.',
  2122	                    shopsCount: 0
  2123	                };
  2124	            }
  2125	        }
  2126	    };
  2127	}
  2128	
  2129	// 레벨 1 인증 데모 함수
  2130	function showLevel1Demo() {
  2131	    const demoData = {
  2132	        email: 'demo@pposhop.kr',
  2133	        phone: '010-1234-5678',
  2134	        user_id: 'demo_user'
  2135	    };
  2136	    
  2137	    showNotification('레벨 1 기본인증 데모를 시작합니다 (테스트 코드: 123456 또는 000000)', 'info');
  2138	    
  2139	    // 데모 인증 시작
  2140	    setTimeout(() => {
  2141	        level1Auth.startBasicAuth(demoData);
  2142	    }, 1000);
  2143	}
  2144	
  2145	// 전역 함수로 등록
  2146	window.showLevel1Demo = showLevel1Demo;
  2147	
  2148	// 메인 페이지 상담 신청 폼 처리 (연락처 정보 제외)
  2149	async function handleMainConsultationSubmit(e) {
  2150	    e.preventDefault();
  2151	    
  2152	    // 제출 버튼 상태 관리
  2153	    const submitBtn = document.getElementById('submitBtn');
  2154	    const originalText = submitBtn ? submitBtn.innerHTML : '<i class="fas fa-paper-plane mr-2"></i>견적 요청하기';
  2155	    
  2156	    const currentUser = getCurrentUser();
  2157	    
  2158	    // 비회원인 경우 로그인 안내
  2159	    if (!currentUser) {
  2160	        showNotification('로그인 후 상담 신청이 가능합니다.', 'warning');
  2161	        return;
  2162	    }
  2163	    
  2164	    try {
  2165	        // 폼 데이터 수집 (연락처 제외)
  2166	        const formData = {
  2167	            customer_name: document.getElementById('customerName').value,
  2168	            customer_email: currentUser.email, // 로그인된 사용자 이메일 사용
  2169	            // customer_phone 완전 제외 - 개인정보 보호
  2170	            state: document.getElementById('customerState').value,
  2171	            district: document.getElementById('customerDistrict').value,
  2172	            // 페이스 케어 서비스 수집
  2173	            face_services: Array.from(document.querySelectorAll('input[name="faceServices"]:checked')).map(input => {
  2174	                if (input.value === 'face-other') {
  2175	                    const otherTextInput = document.querySelector('input[name="faceOtherText"]');
  2176	                    const otherText = otherTextInput ? otherTextInput.value.trim() : '';
  2177	                    return otherText ? `기타: ${otherText}` : '페이스 기타/모름';
  2178	                }
  2179	                return input.value;
  2180	            }),
  2181	            // 바디 케어 서비스 수집
  2182	            body_services: Array.from(document.querySelectorAll('input[name="bodyServices"]:checked')).map(input => {
  2183	                if (input.value === 'body-other') {
  2184	                    const otherTextInput = document.querySelector('input[name="bodyOtherText"]');
  2185	                    const otherText = otherTextInput ? otherTextInput.value.trim() : '';
  2186	                    return otherText ? `기타: ${otherText}` : '바디 기타/모름';
  2187	                }
  2188	                return input.value;
  2189	            }),
  2190	            // 전체 관심 영역 (호환성 유지)
  2191	            interest_area: [
  2192	                ...Array.from(document.querySelectorAll('input[name="faceServices"]:checked')).map(input => input.value),
  2193	                ...Array.from(document.querySelectorAll('input[name="bodyServices"]:checked')).map(input => input.value)
  2194	            ].join(', '),
  2195	            important_factors: document.getElementById('importantFactors').value || '',
  2196	            skin_condition: document.getElementById('skinCondition').value || '', // 현재 피부상태
  2197	            has_photos: document.getElementById('skinPhotos').files.length > 0, // 사진 여부
  2198	            photo_count: document.getElementById('skinPhotos').files.length, // 사진 개수
  2199	            status: 'pending',
  2200	            submission_date: new Date().toISOString(),
  2201	            user_id: currentUser.id,
  2202	            user_type: currentUser.user_type
  2203	        };
  2204	        
  2205	        // 사진 파일 정보 추가 (실제 파일은 별도 처리 필요)
  2206	        if (formData.has_photos) {
  2207	            const files = Array.from(document.getElementById('skinPhotos').files);
  2208	            formData.photo_info = files.map(file => ({
  2209	                name: file.name,
  2210	                size: file.size,
  2211	                type: file.type
  2212	            }));
  2213	        }
  2214	        
  2215	        // 필수 필드 검증
  2216	        if (!formData.customer_name.trim()) {
  2217	            showNotification('이름을 입력해주세요.', 'error');
  2218	            return;
  2219	        }
  2220	        
  2221	        if (!formData.state) {
  2222	            showNotification('지역(시/도)을 선택해주세요.', 'error');
  2223	            return;
  2224	        }
  2225	        
  2226	        if (!formData.district) {
  2227	            showNotification('지역(구/군)을 선택해주세요.', 'error');
  2228	            return;
  2229	        }
  2230	        
  2231	        if (formData.face_services.length === 0 && formData.body_services.length === 0) {
  2232	            showNotification('관심있는 관리 프로그램을 하나 이상 선택해주세요.', 'error');
  2233	            return;
  2234	        }
  2235	        
  2236	        console.log('📋 상담 신청 데이터 (연락처 제외):', formData);
  2237	        
  2238	        // 제출 버튼 비활성화 (originalText는 이미 함수 시작에서 정의됨)
  2239	        if (submitBtn) {
  2240	            submitBtn.disabled = true;
  2241	            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>견적 요청 중...';
  2242	        }
  2243	        
  2244	        // 지역별 매칭 시스템을 통해 견적 요청 배포
  2245	        let result;
  2246	        if (typeof window.regionalMatching !== 'undefined') {
  2247	            result = await window.regionalMatching.distributeQuoteRequest(formData);
  2248	        } else {
  2249	            // 폴백: 직접 데이터베이스에 저장
  2250	            const response = await fetch('tables/consultations', {
  2251	                method: 'POST',
  2252	                headers: { 'Content-Type': 'application/json' },
  2253	                body: JSON.stringify(formData)
  2254	            });
  2255	            
  2256	            if (response.ok) {
  2257	                result = {
  2258	                    success: true,
  2259	                    message: '견적 요청이 성공적으로 전송되었습니다.',
  2260	                    shopsCount: 1
  2261	                };
  2262	            } else {
  2263	                throw new Error('견적 요청 전송 실패');
  2264	            }
  2265	        }
  2266	        
  2267	        if (result.success) {
  2268	            showNotification(
  2269	                `✅ ${formData.state} ${formData.district} 지역의 피부관리실에 견적 요청이 전송되었습니다!<br>
  2270	                📧 업체에서 연락을 드릴 예정입니다.<br>
  2271	                💡 연락처는 개인정보 보호를 위해 업체에게 노출되지 않습니다.`, 
  2272	                'success', 
  2273	                8000
  2274	            );
  2275	            
  2276	            // 폼 초기화
  2277	            document.getElementById('consultationForm').reset();
  2278	            
  2279	            // 대시보드로 이동 안내
  2280	            setTimeout(() => {
  2281	                if (confirm('고객 대시보드에서 견적 현황을 확인하시겠습니까?')) {
  2282	                    window.location.href = 'customer-dashboard.html';
  2283	                }
  2284	            }, 3000);
  2285	            
  2286	        } else {
  2287	            showNotification(result.message || '견적 요청 전송에 실패했습니다.', 'error');
  2288	        }
  2289	        
  2290	    } catch (error) {
  2291	        console.error('상담 신청 처리 오류:', error);
  2292	        showNotification('견적 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
  2293	    } finally {
  2294	        // 버튼 상태 복원
  2295	        if (submitBtn && originalText) {
  2296	            submitBtn.disabled = false;
  2297	            submitBtn.innerHTML = originalText;
  2298	        } else {
  2299	            console.warn('⚠️ 버튼 복원 실패:', { submitBtn: !!submitBtn, originalText: !!originalText });
  2300	        }
  2301	    }
  2302	}
  2303	
  2304	// ===== 지역별 대표샵 관련 함수들 =====
  2305	
  2306	// 대표샵 데이터 (임시 데모 데이터)
  2307	let representativeShopsData = [];
  2308	
  2309	// 대표샵 시스템 초기화
  2310	function initializeRepresentativeShops() {
  2311	    const stateSelect = document.getElementById('representative-state');
  2312	    const districtSelect = document.getElementById('representative-district');
  2313	    
  2314	    if (!stateSelect || !districtSelect) {
  2315	        return;
  2316	    }
  2317	    
  2318	    // 시/도 선택 시 구/군 업데이트
  2319	    stateSelect.addEventListener('change', function() {
  2320	        const selectedState = this.value;
  2321	        updateDistrictOptions(selectedState);
  2322	        hideRepresentativeShopInfo();
  2323	    });
  2324	    
  2325	    // 구/군 선택 시 대표샵 검색
  2326	    districtSelect.addEventListener('change', function() {
  2327	        const selectedState = stateSelect.value;
  2328	        const selectedDistrict = this.value;
  2329	        
  2330	        if (selectedState && selectedDistrict) {
  2331	            findAndDisplayRepresentativeShop(selectedState, selectedDistrict);
  2332	        } else {
  2333	            hideRepresentativeShopInfo();
  2334	        }
  2335	    });
  2336	    
  2337	    console.log('🏪 대표샵 시스템 초기화 완료');
  2338	}
  2339	
  2340	// 구/군 옵션 업데이트
  2341	function updateDistrictOptions(state) {
  2342	    const districtSelect = document.getElementById('representative-district');
  2343	    
  2344	    if (!state) {
  2345	        districtSelect.disabled = true;
  2346	        districtSelect.innerHTML = '<option value="">먼저 시/도를 선택하세요</option>';
  2347	        return;
  2348	    }
  2349	    
  2350	    const districts = regionData[state] || [];
  2351	    districtSelect.disabled = false;
  2352	    districtSelect.innerHTML = '<option value="">시/군/구 선택</option>' + 
  2353	        districts.map(district => `<option value="${district}">${district}</option>`).join('');
  2354	}
  2355	
  2356	// 대표샵 데이터 로드
  2357	async function loadRepresentativeShops() {
  2358	    try {
  2359	        // 새로운 안전한 API 요청 방식 사용
  2360	        const data = await window.BeautyCatApi?.ApiRequest.safeGet(
  2361	            'tables/representative_shops?limit=1000&sort=created_at', 
  2362	            { name: '대표샵 데이터' }
  2363	        );
  2364	        
  2365	        representativeShopsData = data?.data || [];
  2366	        
  2367	        console.log('🏪 대표샵 데이터 로드 완료:', representativeShopsData.length, '개');
  2368	    } catch (error) {
  2369	        console.warn('⚠️ 대표샵 데이터 로드 오류 (무시됨):', error.message);
  2370	        representativeShopsData = [];
  2371	        
  2372	        // 데모 데이터 사용
  2373	        representativeShopsData = [
  2374	            {
  2375	                id: 'rep_shop_001',
  2376	                shop_name: '뷰티캣 강남점',
  2377	                state: '서울특별시',
  2378	                district: '강남구',
  2379	                phone: '02-123-4567',
  2380	                representative_treatments: ['여드름 관리', '미백 관리', '모공 축소'],
  2381	                approved: true,
  2382	                created_at: '2024-10-15T10:00:00Z'
  2383	            },
  2384	            {
  2385	                id: 'rep_shop_002', 
  2386	                shop_name: '글로우 스킨케어',
  2387	                state: '서울특별시',
  2388	                district: '서초구',
  2389	                phone: '02-987-6543',
  2390	                representative_treatments: ['수분 관리', '주름 관리', '민감성 케어'],
  2391	                approved: true,
  2392	                created_at: '2024-10-15T11:00:00Z'
  2393	            },
  2394	            {
  2395	                id: 'rep_shop_003',
  2396	                shop_name: '부산 오션뷰 클리닉',
  2397	                state: '부산광역시',
  2398	                district: '해운대구',
  2399	                phone: '051-111-2222',
  2400	                representative_treatments: ['리프팅', '바디 케어', '미백 관리'],
  2401	                approved: true,
  2402	                created_at: '2024-10-15T12:00:00Z'
  2403	            }
  2404	        ];
  2405	        
  2406	        console.log('🏪 데모 대표샵 데이터 로드 완료');
  2407	    }
  2408	}
  2409	
  2410	// 대표샵 검색 및 표시
  2411	function findAndDisplayRepresentativeShop(state, district) {
  2412	    const representativeShop = representativeShopsData.find(shop => 
  2413	        shop.state === state && 
  2414	        shop.district === district && 
  2415	        shop.approved === true
  2416	    );
  2417	    
  2418	    if (representativeShop) {
  2419	        displayRepresentativeShop(representativeShop);
  2420	    } else {
  2421	        showNoRepresentativeShop();
  2422	    }
  2423	}
  2424	
  2425	// 대표샵 정보 표시
  2426	function displayRepresentativeShop(shop) {
  2427	    // 기본 정보 설정
  2428	    document.getElementById('rep-shop-name').textContent = shop.shop_name;
  2429	    document.getElementById('rep-shop-location').textContent = `${shop.state} ${shop.district}`;
  2430	    document.getElementById('rep-shop-phone').textContent = shop.phone;
  2431	    
  2432	    // 대표 관리 태그 표시
  2433	    const treatmentsContainer = document.getElementById('rep-shop-treatments');
  2434	    treatmentsContainer.innerHTML = '';
  2435	    
  2436	    if (shop.representative_treatments && shop.representative_treatments.length > 0) {
  2437	        shop.representative_treatments.forEach(treatment => {
  2438	            const tag = document.createElement('span');
  2439	            tag.className = 'inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full';
  2440	            tag.textContent = treatment;
  2441	            treatmentsContainer.appendChild(tag);
  2442	        });
  2443	    }
  2444	    
  2445	    // 전화하기 버튼 설정
  2446	    const callButton = document.getElementById('call-representative-shop');
  2447	    callButton.onclick = function() {
  2448	        makePhoneCall(shop.phone, shop.shop_name);
  2449	    };
  2450	    
  2451	    // 정보 영역 표시
  2452	    document.getElementById('representative-shop-info').classList.remove('hidden');
  2453	    document.getElementById('no-representative-shop').classList.add('hidden');
  2454	}
  2455	
  2456	// 대표샵 없음 메시지 표시
  2457	function showNoRepresentativeShop() {
  2458	    document.getElementById('representative-shop-info').classList.add('hidden');
  2459	    document.getElementById('no-representative-shop').classList.remove('hidden');
  2460	}
  2461	
  2462	// 대표샵 정보 숨기기
  2463	function hideRepresentativeShopInfo() {
  2464	    document.getElementById('representative-shop-info').classList.add('hidden');
  2465	    document.getElementById('no-representative-shop').classList.add('hidden');
  2466	}
  2467	
  2468	// 전화하기 기능
  2469	function makePhoneCall(phoneNumber, shopName) {
  2470	    // 모바일에서는 전화앱 실행
  2471	    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  2472	        window.location.href = `tel:${phoneNumber}`;
  2473	    } else {
  2474	        // 데스크톱에서는 확인 메시지와 함께 번호 표시
  2475	        const message = `${shopName}에 전화하시겠습니까?\n\n전화번호: ${phoneNumber}\n\n모바일에서는 자동으로 전화앱이 실행됩니다.`;
  2476	        
  2477	        if (confirm(message)) {
  2478	            // 전화번호를 클립보드에 복사 (가능한 경우)
  2479	            if (navigator.clipboard) {
  2480	                navigator.clipboard.writeText(phoneNumber).then(() => {
  2481	                    showNotification(`전화번호가 클립보드에 복사되었습니다: ${phoneNumber}`, 'info');
  2482	                }).catch(() => {
  2483	                    showNotification(`전화번호: ${phoneNumber}`, 'info');
  2484	                });
  2485	            } else {
  2486	                showNotification(`전화번호: ${phoneNumber}`, 'info');
  2487	            }
  2488	        }
  2489	    }
  2490	    
  2491	    // 통계 기록 (선택적)
  2492	    recordPhoneCallStat(shopName, phoneNumber);
  2493	}
  2494	
  2495	// 전화 통계 기록
  2496	function recordPhoneCallStat(shopName, phoneNumber) {
  2497	    try {
  2498	        const statData = {
  2499	            action: 'phone_call',
  2500	            shop_name: shopName,
  2501	            phone_number: phoneNumber,
  2502	            timestamp: new Date().toISOString(),
  2503	            user_agent: navigator.userAgent
  2504	        };
  2505	        
  2506	        // 통계 API 호출 (비동기, 실패해도 무시)
  2507	        fetch('tables/call_statistics', {
  2508	            method: 'POST',
  2509	            headers: { 'Content-Type': 'application/json' },
  2510	            body: JSON.stringify(statData)
  2511	        }).catch(() => {
  2512	            // 통계 기록 실패는 무시
  2513	        });
  2514	    } catch (error) {
  2515	        // 통계 기록 실패는 무시
  2516	    }
  2517	}