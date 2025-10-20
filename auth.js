     1	// 전역 변수
     2	let currentUser = null;
     3	let sessionToken = null;
     4	let emailCheckResult = false;
     5	
     6	// DOM 로드 완료 후 초기화
     7	document.addEventListener('DOMContentLoaded', function() {
     8	    initializeAuthApp();
     9	    checkExistingSession();
    10	});
    11	
    12// 인증 앱 초기화
function initializeAuthApp() {
    setupAuthEventListeners();
    
    // 프로덕션 환경 체크
    const isProduction = location.hostname === 'beautycat.kr' || 
                        location.hostname === 'www.beautycat.kr' ||
                        location.hostname.includes('beautycat.pages.dev');
    
    if (!isProduction) {
        // 개발 환경에서만 데모 계정 로드
        loadDemoAccounts();
    } else {
        console.log('🏭 프로덕션 환경 감지: 데모 계정 로드 건너뛰기');
    }
    
    // 페이지별 초기화
    const pathname = window.location.pathname;
    if (pathname.includes('login.html')) {
        initializeLoginPage();
    } else if (pathname.includes('register.html')) {
        initializeRegisterPage();
    }
}

    25	
    26	// 인증 관련 이벤트 리스너 설정
    27	function setupAuthEventListeners() {
    28	    // 로그인 폼
    29	    const loginForm = document.getElementById('login-form');
    30	    if (loginForm) {
    31	        loginForm.addEventListener('submit', handleLogin);
    32	    }
    33	
    34	    // 회원가입 폼
    35	    const registerForm = document.getElementById('registerForm');
    36	    if (registerForm) {
    37	        registerForm.addEventListener('submit', handleRegister);
    38	    }
    39	
    40	    // 사용자 타입 선택 (로그인 페이지)
    41	    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    42	    userTypeRadios.forEach(radio => {
    43	        radio.addEventListener('change', handleUserTypeChange);
    44	    });
    45	
    46	    // 사용자 타입 선택 (회원가입 페이지)
    47	    const registerUserTypeRadios = document.querySelectorAll('input[name="userType"]');
    48	    registerUserTypeRadios.forEach(radio => {
    49	        radio.addEventListener('change', handleRegisterUserTypeChange);
    50	    });
    51	
    52	    // 비밀번호 확인
    53	    const passwordConfirm = document.getElementById('confirmPassword');
    54	    if (passwordConfirm) {
    55	        passwordConfirm.addEventListener('input', checkPasswordMatch);
    56	    }
    57	
    58	    // 전체 약관 동의는 register.html에서 처리됨
    59	}
    60	
    61	// 로그인 페이지 초기화
    62	function initializeLoginPage() {
    63	    // 데모 계정 정보 표시
    64	    setTimeout(() => {
    65	        const demoInfo = document.getElementById('demo-info');
    66	        if (demoInfo) {
    67	            demoInfo.classList.remove('hidden');
    68	        }
    69	    }, 2000);
    70	}
    71	
    72	// 회원가입 페이지 초기화
    73	function initializeRegisterPage() {
    74	    // 기본적으로 고객 가입 선택
    75	    handleRegisterUserTypeChange();
    76	}
    77	
    78	// 기존 세션 확인
    79	async function checkExistingSession() {
    80	    try {
    81	        const token = localStorage.getItem('session_token');
    82	        const userType = localStorage.getItem('user_type');
    83	        
    84	        if (token && userType) {
    85	            // 세션 유효성 검증
    86	            const isValid = await validateSession(token);
    87	            if (isValid) {
    88	                sessionToken = token;
    89	                // 사용자 정보 로드
    90	                const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    91	                currentUser = userData;
    92	                
    93	                // 이미 로그인된 상태에서 로그인/회원가입 페이지 접근 시 대시보드로 리다이렉트
    94	                const pathname = window.location.pathname;
    95	                if (pathname.includes('login.html') || pathname.includes('register.html')) {
    96	                    redirectToDashboard(userType);
    97	                }
    98	            } else {
    99	                // 무효한 세션 정리
   100	                clearSession();
   101	            }
   102	        }
   103	    } catch (error) {
   104	        console.error('세션 확인 오류:', error);
   105	        clearSession();
   106	    }
   107	}
   108	
   109	// 세션 유효성 검증
   110	async function validateSession(token) {
   111	    try {
   112	        // 실제로는 서버에서 세션 토큰 검증
   113	        // 여기서는 localStorage의 만료 시간 확인
   114	        const expiresAt = localStorage.getItem('session_expires');
   115	        if (!expiresAt || new Date() > new Date(expiresAt)) {
   116	            return false;
   117	        }
   118	        return true;
   119	    } catch (error) {
   120	        return false;
   121	    }
   122	}
   123	
   124	// 사용자 타입 변경 처리 (로그인)
   125	function handleUserTypeChange() {
   126	    const selectedType = document.querySelector('input[name="userType"]:checked').value;
   127	    
   128	    // UI 업데이트
   129	    document.querySelectorAll('label[id$="-option"]').forEach(label => {
   130	        const radio = label.querySelector('input[type="radio"]');
   131	        const icon = label.querySelector('.fa-check-circle');
   132	        
   133	        if (radio.value === selectedType) {
   134	            label.classList.add('border-pink-300', 'bg-pink-50');
   135	            label.classList.remove('border-gray-200');
   136	            icon.classList.remove('hidden');
   137	        } else {
   138	            label.classList.remove('border-pink-300', 'bg-pink-50', 'border-purple-300', 'bg-purple-50', 'border-blue-300', 'bg-blue-50');
   139	            label.classList.add('border-gray-200');
   140	            icon.classList.add('hidden');
   141	        }
   142	    });
   143	    
   144	    // 선택된 타입에 따른 색상 적용
   145	    const selectedLabel = document.querySelector(`#${selectedType}-option`);
   146	    if (selectedLabel) {
   147	        const colorMap = {
   148	            'customer': ['border-pink-300', 'bg-pink-50'],
   149	            'shop': ['border-purple-300', 'bg-purple-50'],
   150	            'admin': ['border-blue-300', 'bg-blue-50']
   151	        };
   152	        selectedLabel.classList.add(...colorMap[selectedType]);
   153	    }
   154	}
   155	
   156	// 사용자 타입 변경 처리 (회원가입)
   157	function handleRegisterUserTypeChange() {
   158	    const selectedType = document.querySelector('input[name="userType"]:checked')?.value || 'customer';
   159	    const shopInfo = document.getElementById('shop-additional-info');
   160	    
   161	    // UI 업데이트
   162	    document.querySelectorAll('label[id^="register-"]').forEach(label => {
   163	        const radio = label.querySelector('input[type="radio"]');
   164	        const icon = label.querySelector('.fa-check-circle');
   165	        
   166	        if (radio && radio.value === selectedType) {
   167	            label.classList.add('border-pink-300', 'bg-pink-50');
   168	            label.classList.remove('border-gray-200');
   169	            if (icon) icon.classList.remove('hidden');
   170	        } else {
   171	            label.classList.remove('border-pink-300', 'bg-pink-50', 'border-purple-300', 'bg-purple-50');
   172	            label.classList.add('border-gray-200');
   173	            if (icon) icon.classList.add('hidden');
   174	        }
   175	    });
   176	    
   177	    // 선택된 타입에 따른 색상 적용
   178	    const selectedLabel = document.querySelector(`#register-${selectedType}-option`);
   179	    if (selectedLabel) {
   180	        const colorMap = {
   181	            'customer': ['border-pink-300', 'bg-pink-50'],
   182	            'shop': ['border-purple-300', 'bg-purple-50']
   183	        };
   184	        if (colorMap[selectedType]) {
   185	            selectedLabel.classList.add(...colorMap[selectedType]);
   186	        }
   187	    }
   188	    
   189	    // 피부관리실 추가 정보 표시/숨김
   190	    if (shopInfo) {
   191	        if (selectedType === 'shop') {
   192	            shopInfo.classList.remove('hidden');
   193	            // 필수 항목으로 변경
   194	            document.getElementById('shop_name').setAttribute('required', 'required');
   195	        } else {
   196	            shopInfo.classList.add('hidden');
   197	            // 필수 항목 제거
   198	            const shopNameInput = document.getElementById('shop_name');
   199	            if (shopNameInput) shopNameInput.removeAttribute('required');
   200	        }
   201	    }
   202	}
   203	
   204	// 로그인 처리
   205	async function handleLogin(e) {
   206	    e.preventDefault();
   207	    
   208	    const loginBtn = e.target.querySelector('button[type="submit"]');
   209	    const originalText = loginBtn.innerHTML;
   210	    
   211	    // 버튼 상태 변경
   212	    if (loginBtn) {
   213	        loginBtn.disabled = true;
   214	        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>로그인 중...';
   215	    }
   216	    
   217	    try {
   218	        // 폼 데이터 수집
   219	        const formData = new FormData(e.target);
   220	        const loginData = {
   221	            email: formData.get('email') || '',
   222	            password: formData.get('password') || '',
   223	            user_type: document.querySelector('input[name="userType"]:checked')?.value || '',
   224	            remember_me: false
   225	        };
   226	        
   227	        // 유효성 검증
   228	        if (!validateLoginData(loginData)) {
   229	            return;
   230	        }
   231	        
   232	        // 로그인 처리
   233	        const result = await processLogin(loginData);
   234	        
   235	        if (result.success) {
   236	            // 세션 저장 (이미 processLogin에서 저장됨)
   237	            // saveSession(result.user, result.token, loginData.remember_me);
   238	            
   239	            // 성공 메시지
   240	            const message = result.message || `${result.user.name}님, 환영합니다!`;
   241	            showNotification(message, 'success');
   242	            
   243	            // 사용자 정보를 localStorage에 저장 (호환성을 위해 두 키 모두 사용)
   244	            localStorage.setItem('currentUser', JSON.stringify(result.user));
   245	            localStorage.setItem('user_data', JSON.stringify(result.user));
   246	            localStorage.setItem('authToken', result.token);
   247	            
   248	            console.log('로그인 성공, 리다이렉트:', result.user.user_type);
   249	            
   250	            // 대시보드로 리다이렉트
   251	            setTimeout(() => {
   252	                redirectToDashboard(result.user.user_type);
   253	            }, 1500);
   254	        } else {
   255	            showNotification(result.message || '로그인에 실패했습니다.', 'error');
   256	        }
   257	        
   258	    } catch (error) {
   259	        console.error('로그인 오류:', error);
   260	        showNotification('로그인 중 오류가 발생했습니다.', 'error');
   261	    } finally {
   262	        // 버튼 상태 복원
   263	        if (loginBtn) {
   264	            loginBtn.disabled = false;
   265	            loginBtn.innerHTML = originalText;
   266	        }
   267	    }
   268	}
   269	
   270	// 로그인 데이터 유효성 검증
   271	function validateLoginData(data) {
   272	    if (!data.email || !data.email.trim()) {
   273	        showNotification('이메일을 입력해주세요.', 'error');
   274	        return false;
   275	    }
   276	    
   277	    if (!data.password || !data.password.trim()) {
   278	        showNotification('비밀번호를 입력해주세요.', 'error');
   279	        return false;
   280	    }
   281	    
   282	    // 이메일 형식 검증
   283	    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   284	    if (!emailRegex.test(data.email)) {
   285	        showNotification('올바른 이메일 형식으로 입력해주세요.', 'error');
   286	        return false;
   287	    }
   288	    
   289	    return true;
   290	}
   291	
   292	// 로그인 처리 (실제 인증)
   293	async function processLogin(loginData) {
   294	    try {
   295	        console.log('로그인 시도:', { email: loginData.email, user_type: loginData.user_type });
   296	        
   297	        // 보안 매니저로 로그인 시도 제한 확인
   298	        if (window.securityManager) {
   299	            try {
   300	                window.securityManager.checkLoginAttempts(loginData.email);
   301	            } catch (lockoutError) {
   302	                return {
   303	                    success: false,
   304	                    message: lockoutError.message
   305	                };
   306	            }
   307	        }
   308	        
   309	        // 데모 계정 확인 (우선순위)
   310	        const demoAccounts = getDemoAccounts();
   311	        const demoUser = demoAccounts.find(account => 
   312	            account.email === loginData.email && 
   313	            account.password === loginData.password &&
   314	            account.user_type === loginData.user_type
   315	        );
   316	        
   317	        if (demoUser) {
   318	            console.log('데모 계정으로 로그인:', demoUser.name);
   319	            
   320	            // 보안 세션 생성
   321	            if (window.securityManager) {
   322	                await window.securityManager.createSession(demoUser);
   323	                window.securityManager.clearLoginAttempts(loginData.email);
   324	            }
   325	            
   326	            const sessionToken = generateSessionToken();
   327	            
   328	            // 기존 세션 저장 (호환성)
   329	            saveSession({
   330	                user: demoUser,
   331	                token: sessionToken,
   332	                loginTime: new Date().toISOString()
   333	            });
   334	            
   335	            return {
   336	                success: true,
   337	                user: demoUser,
   338	                token: sessionToken,
   339	                message: `${demoUser.name}님, 환영합니다! (데모 계정)`
   340	            };
   341	        }
   342	        
   343	        // 실제 사용자 계정 확인
   344	        const response = await fetch(`tables/users?limit=100`);
   345	        
   346	        if (!response.ok) {
   347	            throw new Error('사용자 데이터를 불러올 수 없습니다.');
   348	        }
   349	        
   350	        const userData = await response.json();
   351	        console.log('사용자 데이터 조회 완료:', userData.data?.length || 0, '명');
   352	        
   353	        const user = userData.data?.find(u => 
   354	            u.email === loginData.email && 
   355	            u.user_type === loginData.user_type &&
   356	            u.is_active !== false
   357	        );
   358	        
   359	        if (user) {
   360	            console.log('사용자 찾음:', user.name, user.user_type);
   361	            
   362	            // 비밀번호 확인 (보안 강화)
   363	            let passwordValid = false;
   364	            
   365	            if (window.securityManager && user.password_salt) {
   366	                // 해시된 비밀번호 검증
   367	                const hashedInput = await window.securityManager.hashPassword(loginData.password, user.password_salt);
   368	                passwordValid = (hashedInput.hash === user.password);
   369	            } else {
   370	                // 기존 방식 (보안 취약)
   371	                passwordValid = (user.password === loginData.password);
   372	            }
   373	            
   374	            if (passwordValid) {
   375	                // 로그인 성공 - 보안 세션 생성
   376	                if (window.securityManager) {
   377	                    await window.securityManager.createSession(user);
   378	                    window.securityManager.clearLoginAttempts(loginData.email);
   379	                }
   380	                
   381	                const sessionToken = generateSessionToken();
   382	                
   383	                try {
   384	                    // 마지막 로그인 시간 업데이트
   385	                    await fetch(`tables/users/${user.id}`, {
   386	                        method: 'PATCH',
   387	                        headers: {
   388	                            'Content-Type': 'application/json'
   389	                        },
   390	                        body: JSON.stringify({
   391	                            last_login: new Date().toISOString()
   392	                        })
   393	                    });
   394	                } catch (updateError) {
   395	                    console.warn('로그인 시간 업데이트 실패:', updateError);
   396	                    // 업데이트 실패해도 로그인은 계속 진행
   397	                }
   398	                
   399	                // 세션 저장
   400	                saveSession({
   401	                    user: user,
   402	                    token: sessionToken,
   403	                    loginTime: new Date().toISOString()
   404	                });
   405	                
   406	                return {
   407	                    success: true,
   408	                    user: user,
   409	                    token: sessionToken,
   410	                    message: `${user.name}님, 환영합니다!`
   411	                };
   412	            } else {
   413	                console.log('비밀번호 불일치');
   414	                
   415	                // 로그인 실패 기록
   416	                if (window.securityManager) {
   417	                    window.securityManager.recordFailedLogin(loginData.email);
   418	                }
   419	                
   420	                return {
   421	                    success: false,
   422	                    message: '비밀번호가 올바르지 않습니다.'
   423	                };
   424	            }
   425	        } else {
   426	            console.log('사용자를 찾을 수 없음');
   427	            
   428	            // 로그인 실패 기록
   429	            if (window.securityManager) {
   430	                window.securityManager.recordFailedLogin(loginData.email);
   431	            }
   432	            
   433	            return {
   434	                success: false,
   435	                message: '해당 이메일로 등록된 계정이 없거나 사용자 유형이 일치하지 않습니다.'
   436	            };
   437	        }
   438	        
   439	    } catch (error) {
   440	        console.error('로그인 처리 오류:', error);
   441	        return {
   442	            success: false,
   443	            message: '로그인 처리 중 오류가 발생했습니다: ' + error.message
   444	        };
   445	    }
   446	}
   447	
   448	// 회원가입 처리
   449	async function handleRegister(e) {
   450	    e.preventDefault();
   451	    
   452	    const registerBtn = e.target.querySelector('button[type="submit"]');
   453	    const originalText = registerBtn ? registerBtn.innerHTML : '회원가입';
   454	    
   455	    // 버튼 상태 변경
   456	    if (registerBtn) {
   457	        registerBtn.disabled = true;
   458	        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>가입 중...';
   459	    }
   460	    
   461	    try {
   462	        // 폼 데이터 수집
   463	        const formData = new FormData(e.target);
   464	        const registerData = {
   465	            name: formData.get('name') || '',
   466	            phone: formData.get('phone') || '',
   467	            email: formData.get('email') || '',
   468	            password: formData.get('password') || '',
   469	            password_confirm: formData.get('confirmPassword') || '',
   470	            user_type: document.querySelector('input[name="userType"]:checked')?.value || 'customer',
   471	            shop_name: formData.get('shop_name') || '',
   472	            business_number: formData.get('business_number') || '',
   473	            business_license_number: formData.get('business_license_number') || '',
   474	            naver_cafe_id: formData.get('naver_cafe_id') || '',
   475	            shop_state: formData.get('shop_state') || '',
   476	            shop_district: formData.get('shop_district') || '',
   477	            shop_address: formData.get('shop_address') || '',
   478	            terms_service: formData.get('terms_service') === 'on',
   479	            terms_privacy: formData.get('terms_privacy') === 'on',
   480	            terms_marketing: formData.get('terms_marketing') === 'on'
   481	        };
   482	        
   483	        // 유효성 검증
   484	        if (!validateRegisterData(registerData)) {
   485	            return;
   486	        }
   487	        
   488	        // 레벨 1 기본인증 확인 옵션 제공
   489	        const shouldUseLevel1Auth = await askForLevel1Auth(registerData);
   490	        
   491	        let authResult = null;
   492	        if (shouldUseLevel1Auth) {
   493	            // 레벨 1 기본인증 실행 (40원)
   494	            authResult = await startLevel1AuthForRegistration(registerData);
   495	            if (!authResult.success) {
   496	                showNotification('인증에 실패했습니다: ' + authResult.message, 'error');
   497	                return;
   498	            }
   499	            registerData.auth_level = 1;
   500	            registerData.auth_data = authResult;
   501	        }
   502	        
   503	        // 회원가입 처리
   504	        const result = await processRegister(registerData);
   505	        
   506	        if (result.success) {
   507	            // 업체 가입 시 추가 안내 메시지
   508	            if (registerData.user_type === 'shop') {
   509	                showNotification(
   510	                    `🎉 회원가입이 완료되었습니다!<br>
   511	                    📧 <strong>서류 제출 필수:</strong> utuber@kakao.com으로 사업자등록증과 영업신고증을 제출해주세요.<br>
   512	                    👥 <strong>카페 활동 확인:</strong> 네이버 피.창.성 카페에서 활동 이력을 확인합니다.<br>
   513	                    ✅ 서류 확인 및 카페 회원 인증 완료 후 업체 승인됩니다.`, 
   514	                    'success', 
   515	                    10000  // 10초간 표시
   516	                );
   517	            } else {
   518	                showNotification('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.', 'success');
   519	            }
   520	            
   521	            // 로그인 페이지로 리다이렉트
   522	            setTimeout(() => {
   523	                window.location.href = 'login.html';
   524	            }, registerData.user_type === 'shop' ? 8000 : 2000);  // 업체는 8초, 고객은 2초 후 이동
   525	        } else {
   526	            showNotification(result.message || '회원가입에 실패했습니다.', 'error');
   527	        }
   528	        
   529	    } catch (error) {
   530	        console.error('회원가입 오류:', error);
   531	        showNotification('회원가입 중 오류가 발생했습니다.', 'error');
   532	    } finally {
   533	        // 버튼 상태 복원
   534	        if (registerBtn) {
   535	            registerBtn.disabled = false;
   536	            registerBtn.innerHTML = originalText;
   537	        }
   538	    }
   539	}
   540	
   541	// 회원가입 데이터 유효성 검증
   542	function validateRegisterData(data) {
   543	    // 필수 필드 검증
   544	    if (!data.name || !data.name.trim()) {
   545	        showNotification('이름을 입력해주세요.', 'error');
   546	        return false;
   547	    }
   548	    
   549	    if (!data.phone || !data.phone.trim()) {
   550	        showNotification('전화번호를 입력해주세요.', 'error');
   551	        return false;
   552	    }
   553	    
   554	    if (!data.email || !data.email.trim()) {
   555	        showNotification('이메일을 입력해주세요.', 'error');
   556	        return false;
   557	    }
   558	    
   559	    if (!emailCheckResult) {
   560	        showNotification('이메일 중복 확인을 해주세요.', 'error');
   561	        return false;
   562	    }
   563	    
   564	    if (!data.password) {
   565	        showNotification('비밀번호를 입력해주세요.', 'error');
   566	        return false;
   567	    }
   568	    
   569	    if (data.password !== data.password_confirm) {
   570	        showNotification('비밀번호가 일치하지 않습니다.', 'error');
   571	        return false;
   572	    }
   573	    
   574	    // 비밀번호 강도 검증
   575	    if (data.password.length < 8) {
   576	        showNotification('비밀번호는 8자리 이상이어야 합니다.', 'error');
   577	        return false;
   578	    }
   579	    
   580	    // 피부관리실 추가 정보 검증
   581	    if (data.user_type === 'shop') {
   582	        if (!data.shop_name.trim()) {
   583	            showNotification('피부관리실명을 입력해주세요.', 'error');
   584	            return false;
   585	        }
   586	        
   587	        if (!data.shop_state) {
   588	            showNotification('업체 위치의 시/도를 선택해주세요.', 'error');
   589	            return false;
   590	        }
   591	        
   592	        if (!data.shop_district) {
   593	            showNotification('업체 위치의 구/군을 선택해주세요.', 'error');
   594	            return false;
   595	        }
   596	        
   597	        if (!data.shop_address.trim()) {
   598	            showNotification('업체의 상세 주소를 입력해주세요.', 'error');
   599	            return false;
   600	        }
   601	        
   602	        if (!data.business_number || !data.business_number.trim()) {
   603	            showNotification('사업자등록번호를 입력해주세요.', 'error');
   604	            return false;
   605	        }
   606	        
   607	        // 사업자등록번호 형식 검증 (000-00-00000)
   608	        const businessNumberPattern = /^\d{3}-\d{2}-\d{5}$/;
   609	        if (!businessNumberPattern.test(data.business_number)) {
   610	            showNotification('사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)', 'error');
   611	            return false;
   612	        }
   613	        
   614	        if (!data.business_license_number || !data.business_license_number.trim()) {
   615	            showNotification('영업신고증 번호를 입력해주세요.', 'error');
   616	            return false;
   617	        }
   618	        
   619	        // 영업신고증 번호 기본 검증
   620	        if (data.business_license_number.length < 5) {
   621	            showNotification('영업신고증 번호를 정확히 입력해주세요.', 'error');
   622	            return false;
   623	        }
   624	        
   625	        // 네이버 카페 아이디 검증
   626	        if (!data.naver_cafe_id || !data.naver_cafe_id.trim()) {
   627	            showNotification('네이버 카페 아이디를 입력해주세요.', 'error');
   628	            return false;
   629	        }
   630	        
   631	        // 네이버 아이디 형식 기본 검증 (영문, 숫자, 4-20자)
   632	        const naverIdPattern = /^[a-zA-Z0-9]{4,20}$/;
   633	        if (!naverIdPattern.test(data.naver_cafe_id)) {
   634	            showNotification('네이버 아이디는 영문, 숫자 조합으로 4-20자여야 합니다.', 'error');
   635	            return false;
   636	        }
   637	    }
   638	    
   639	    // 약관 동의 검증
   640	    if (!data.terms_service) {
   641	        showNotification('서비스 이용약관에 동의해주세요.', 'error');
   642	        return false;
   643	    }
   644	    
   645	    if (!data.terms_privacy) {
   646	        showNotification('개인정보 수집 및 이용에 동의해주세요.', 'error');
   647	        return false;
   648	    }
   649	    
   650	    return true;
   651	}
   652	
   653	// 회원가입 처리
   654	async function processRegister(registerData) {
   655	    try {
   656	        // 이메일 중복 확인 (다시 한 번)
   657	        const emailExists = await checkEmailExists(registerData.email);
   658	        if (emailExists) {
   659	            return {
   660	                success: false,
   661	                message: '이미 사용 중인 이메일입니다.'
   662	            };
   663	        }
   664	        
   665	        // 비밀번호 강도 검증
   666	        if (window.securityManager) {
   667	            const passwordCheck = window.securityManager.validatePasswordStrength(registerData.password);
   668	            if (!passwordCheck.isStrong) {
   669	                return {
   670	                    success: false,
   671	                    message: `비밀번호가 너무 약합니다. ${passwordCheck.message}`
   672	                };
   673	            }
   674	            
   675	            // 비밀번호 해시화
   676	            const hashedPassword = await window.securityManager.hashPassword(registerData.password);
   677	            
   678	            // 사용자 데이터 생성 (보안 강화)
   679	            const userData = {
   680	                email: window.securityManager.sanitizeInput(registerData.email),
   681	                password: hashedPassword.hash,
   682	                password_salt: hashedPassword.salt,
   683	                name: window.securityManager.sanitizeInput(registerData.name),
   684	                phone: window.securityManager.sanitizeInput(registerData.phone),
   685	                user_type: registerData.user_type,
   686	                is_active: true,
   687	                is_verified: false,
   688	                profile_image: '',
   689	                shop_id: '',
   690	                permissions: registerData.user_type === 'admin' ? ['all'] : [],
   691	                created_at: new Date().toISOString(),
   692	                last_login: null
   693	            };
   694	        } else {
   695	            // 보안 매니저가 없는 경우 기본 처리
   696	            const userData = {
   697	                email: registerData.email,
   698	                password: registerData.password, // 기본 처리 (보안 취약)
   699	                name: registerData.name,
   700	                phone: registerData.phone,
   701	                user_type: registerData.user_type,
   702	                is_active: true,
   703	                is_verified: false,
   704	                profile_image: '',
   705	                shop_id: '',
   706	                permissions: registerData.user_type === 'admin' ? ['all'] : []
   707	            };
   708	        }
   709	        
   710	        // 사용자 생성
   711	        const response = await fetch('tables/users', {
   712	            method: 'POST',
   713	            headers: {
   714	                'Content-Type': 'application/json'
   715	            },
   716	            body: JSON.stringify(userData)
   717	        });
   718	        
   719	        if (!response.ok) {
   720	            throw new Error('사용자 생성 실패');
   721	        }
   722	        
   723	        const newUser = await response.json();
   724	        
   725	        // 피부관리실인 경우 추가 처리
   726	        if (registerData.user_type === 'shop') {
   727	            // 피부관리실 정보 생성
   728	            const shopData = {
   729	                shop_name: registerData.shop_name,
   730	                owner_name: registerData.name,
   731	                phone: registerData.phone,
   732	                email: registerData.email,
   733	                business_number: registerData.business_number || '',
   734	                state: registerData.shop_state,
   735	                district: registerData.shop_district,
   736	                address: registerData.shop_address,
   737	                region: '',
   738	                specialties: [],
   739	                business_hours: '',
   740	                price_range: '',
   741	                description: '',
   742	                images: [],
   743	                rating: 0,
   744	                is_active: false, // 승인 대기
   745	                verified: false
   746	            };
   747	            
   748	            const shopResponse = await fetch('tables/skincare_shops', {
   749	                method: 'POST',
   750	                headers: {
   751	                    'Content-Type': 'application/json'
   752	                },
   753	                body: JSON.stringify(shopData)
   754	            });
   755	            
   756	            if (shopResponse.ok) {
   757	                const newShop = await shopResponse.json();
   758	                
   759	                // 사용자에 피부관리실 ID 연결
   760	                await fetch(`tables/users/${newUser.id}`, {
   761	                    method: 'PATCH',
   762	                    headers: {
   763	                        'Content-Type': 'application/json'
   764	                    },
   765	                    body: JSON.stringify({
   766	                        shop_id: newShop.id
   767	                    })
   768	                });
   769	            }
   770	        }
   771	        
   772	        return {
   773	            success: true,
   774	            user: newUser
   775	        };
   776	        
   777	    } catch (error) {
   778	        console.error('회원가입 처리 오류:', error);
   779	        return {
   780	            success: false,
   781	            message: '회원가입 처리 중 오류가 발생했습니다.'
   782	        };
   783	    }
   784	}
   785	
   786	// 이메일 중복 확인
   787	async function checkEmailDuplicate() {
   788	    const emailInput = document.getElementById('email');
   789	    const resultDiv = document.getElementById('email-check-result');
   790	    
   791	    const email = emailInput.value.trim();
   792	    
   793	    if (!email) {
   794	        showNotification('이메일을 입력해주세요.', 'error');
   795	        return;
   796	    }
   797	    
   798	    // 이메일 형식 검증
   799	    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   800	    if (!emailRegex.test(email)) {
   801	        showNotification('올바른 이메일 형식으로 입력해주세요.', 'error');
   802	        return;
   803	    }
   804	    
   805	    try {
   806	        const exists = await checkEmailExists(email);
   807	        
   808	        if (exists) {
   809	            resultDiv.textContent = '이미 사용 중인 이메일입니다.';
   810	            resultDiv.className = 'mt-1 text-sm text-red-600';
   811	            emailCheckResult = false;
   812	        } else {
   813	            resultDiv.textContent = '사용 가능한 이메일입니다.';
   814	            resultDiv.className = 'mt-1 text-sm text-green-600';
   815	            emailCheckResult = true;
   816	        }
   817	        
   818	        resultDiv.classList.remove('hidden');
   819	        
   820	    } catch (error) {
   821	        console.error('이메일 확인 오류:', error);
   822	        showNotification('이메일 확인 중 오류가 발생했습니다.', 'error');
   823	    }
   824	}
   825	
   826	// 이메일 존재 여부 확인
   827	async function checkEmailExists(email) {
   828	    try {
   829	        // 데모 계정 확인
   830	        const demoAccounts = getDemoAccounts();
   831	        const demoExists = demoAccounts.some(account => account.email === email);
   832	        
   833	        if (demoExists) {
   834	            return true;
   835	        }
   836	        
   837	        // 실제 사용자 확인
   838	        const response = await fetch(`tables/users?search=${encodeURIComponent(email)}`);
   839	        const userData = await response.json();
   840	        
   841	        return userData.data.some(user => user.email === email);
   842	        
   843	    } catch (error) {
   844	        console.error('이메일 존재 확인 오류:', error);
   845	        return false;
   846	    }
   847	}
   848	
   849	// 비밀번호 일치 확인
   850	function checkPasswordMatch() {
   851	    const password = document.getElementById('password').value;
   852	    const passwordConfirm = document.getElementById('confirmPassword').value;
   853	    const resultDiv = document.getElementById('password-match-result');
   854	    
   855	    if (passwordConfirm && resultDiv) {
   856	        if (password === passwordConfirm) {
   857	            resultDiv.textContent = '비밀번호가 일치합니다.';
   858	            resultDiv.className = 'mt-1 text-sm text-green-600';
   859	        } else {
   860	            resultDiv.textContent = '비밀번호가 일치하지 않습니다.';
   861	            resultDiv.className = 'mt-1 text-sm text-red-600';
   862	        }
   863	        resultDiv.classList.remove('hidden');
   864	    } else if (resultDiv) {
   865	        resultDiv.classList.add('hidden');
   866	    }
   867	}
   868	
   869	// 전체 약관 동의 처리는 register.html에서 처리됨
   870	
   871	// 비밀번호 표시/숨김 토글
   872	function togglePassword() {
   873	    const passwordInput = document.getElementById('password');
   874	    const passwordIcon = document.getElementById('password-icon');
   875	    
   876	    if (passwordInput.type === 'password') {
   877	        passwordInput.type = 'text';
   878	        passwordIcon.className = 'fas fa-eye';
   879	    } else {
   880	        passwordInput.type = 'password';
   881	        passwordIcon.className = 'fas fa-eye-slash';
   882	    }
   883	}
   884	
   885	// 회원가입 비밀번호 표시/숨김 토글
   886	function toggleRegisterPassword() {
   887	    const passwordInput = document.getElementById('password');
   888	    const passwordIcon = document.getElementById('passwordToggle');
   889	    
   890	    if (passwordInput && passwordIcon) {
   891	        if (passwordInput.type === 'password') {
   892	            passwordInput.type = 'text';
   893	            passwordIcon.className = 'fas fa-eye';
   894	        } else {
   895	            passwordInput.type = 'password';
   896	            passwordIcon.className = 'fas fa-eye-slash';
   897	        }
   898	    }
   899	}
   900	
   901	// 세션 저장
   902	function saveSession(user, token, rememberMe) {
   903	    currentUser = user;
   904	    sessionToken = token;
   905	    
   906	    localStorage.setItem('session_token', token);
   907	    localStorage.setItem('user_type', user.user_type);
   908	    localStorage.setItem('user_data', JSON.stringify(user));
   909	    
   910	    // Remember Me 기능
   911	    const expirationTime = rememberMe 
   912	        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일
   913	        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간
   914	    
   915	    localStorage.setItem('session_expires', expirationTime.toISOString());
   916	}
   917	
   918	// 세션 정리
   919	function clearSession() {
   920	    currentUser = null;
   921	    sessionToken = null;
   922	    
   923	    localStorage.removeItem('session_token');
   924	    localStorage.removeItem('user_type');
   925	    localStorage.removeItem('user_data');
   926	    localStorage.removeItem('session_expires');
   927	}
   928	
   929	// 로그아웃
   930	function logout() {
   931	    clearSession();
   932	    showNotification('로그아웃되었습니다.', 'info');
   933	    window.location.href = 'index.html';
   934	}
   935	
   936	// 대시보드로 리다이렉트
   937	function redirectToDashboard(userType) {
   938	    const redirectMap = {
   939	        'customer': 'customer-dashboard.html',
   940	        'shop': 'shop-dashboard.html',
   941	        'admin': 'admin-dashboard.html'
   942	    };
   943	    
   944	    const targetPage = redirectMap[userType] || 'index.html';
   945	    window.location.href = targetPage;
   946	}
   947	
   948	// 세션 토큰 생성
   949	function generateSessionToken() {
   950	    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
   951	}
   952	
   953	// 데모 계정 데이터
   954	function getDemoAccounts() {
   955	    return [
   956	        {
   957	            id: 'demo_customer_1',
   958	            email: 'demo@customer.com',
   959	            password: 'customer123',
   960	            name: '데모 고객',
   961	            phone: '010-1111-1111',
   962	            user_type: 'customer',
   963	            is_active: true,
   964	            is_verified: true,
   965	            profile_image: '',
   966	            last_login: null,
   967	            shop_id: '',
   968	            permissions: ['customer']
   969	        },
   970	        {
   971	            id: 'demo_shop_1',
   972	            email: 'demo@shop.com',
   973	            password: 'shop123',
   974	            name: '데모 상점',
   975	            phone: '010-2222-2222',
   976	            user_type: 'shop',
   977	            is_active: true,
   978	            is_verified: true,
   979	            profile_image: '',
   980	            last_login: null,
   981	            shop_id: 'shop_001',
   982	            permissions: ['shop']
   983	        },
   984	        {
   985	            id: 'demo_admin_1',
   986	            email: 'admin@demo.com',
   987	            password: 'admin123',
   988	            name: '관리자',
   989	            phone: '010-0000-0000',
   990	            user_type: 'admin',
   991	            is_active: true,
   992	            is_verified: true,
   993	            profile_image: '',
   994	            last_login: null,
   995	            shop_id: '',
   996	            permissions: ['all']
   997	        }
   998	    ];
   999	}
  1000	
  1001	// 데모 계정 로드 (개발용)
  1002	async function loadDemoAccounts() {
  1003	    try {
  1004        // 개발 환경이 아니면 데모 데이터 로드 건너뛰기
        const isProduction = location.hostname === 'beautycat.kr' || 
                           location.hostname === 'www.beautycat.kr' ||
                           location.hostname.includes('beautycat.pages.dev');
  1008	        
  1009	        if (isProduction) {
  1010	            console.log('🏭 프로덕션 환경: 데모 계정 로드 건너뛰기');
  1011	            return;
  1012	        }
  1013	        
  1014	        // 기존 사용자 확인 (새로운 안전한 API 방식)
  1015	        const usersData = await window.BeautyCatApi?.ApiRequest.safeGet(
  1016	            'tables/users', 
  1017	            { name: '데모 계정' }
  1018	        );
  1019	        
  1020	        if (!usersData) {
  1021	            console.warn('⚠️ 사용자 테이블 접근 실패. 데모 계정 로드를 건너뜁니다.');
  1022	            return;
  1023	        }
  1024	        
  1025	        // 데이터가 유효하지 않은 경우 처리
  1026	        if (!usersData || !Array.isArray(usersData.data)) {
  1027	            console.warn('사용자 데이터 형식이 올바르지 않습니다. 데모 계정 로드를 건너뜁니다.');
  1028	            return;
  1029	        }
  1030	        
  1031	        // 데모 계정이 이미 존재하는지 확인
  1032	        const demoExists = usersData.data.some(user => user.email && user.email.includes('@demo.com'));
  1033	        
  1034	        if (!demoExists) {
  1035	            // 데모 계정 생성
  1036	            const demoAccounts = getDemoAccounts();
  1037	            
  1038	            for (const account of demoAccounts) {
  1039	                await fetch('tables/users', {
  1040	                    method: 'POST',
  1041	                    headers: {
  1042	                        'Content-Type': 'application/json'
  1043	                    },
  1044	                    body: JSON.stringify(account)
  1045	                });
  1046	            }
  1047	            
  1048	            console.log('데모 계정이 생성되었습니다.');
  1049	        }
  1050	        
  1051	        // 데모 업체 정보도 생성
  1052	        await loadDemoShops();
  1053	        
  1054	    } catch (error) {
  1055	        console.warn('⚠️ 데모 계정 로드 오류 (무시됨):', error.message);
  1056	        // 프로덕션에서는 데모 계정 없이도 정상 작동해야 함
  1057	    }
  1058	}
  1059	
  1060	// 데모 업체 정보 로드 (지역 정보 포함)
  1061	async function loadDemoShops() {
  1062	    try {
  1063	        const existingShops = await fetch('tables/skincare_shops');
  1064	        const shopsData = await existingShops.json();
  1065	        
  1066	        // 데모 업체가 이미 존재하는지 확인
  1067	        const demoShopExists = shopsData.data.some(shop => 
  1068	            shop.email === 'demo@shop.com' || 
  1069	            (shop.shop_name && shop.shop_name.includes('데모'))
  1070	        );
  1071	        
  1072	        if (!demoShopExists) {
  1073	            // 데모 업체 생성 (지역별로 여러 개)
  1074	            const demoShops = [
  1075	                {
  1076	                    id: 'demo_shop_seoul_geumcheon',
  1077	                    shop_name: '데모 피부관리실 (금천구점)',
  1078	                    name: '데모 사장님',
  1079	                    email: 'demo@shop.com',
  1080	                    password: 'shop123',
  1081	                    phone: '02-1234-5678',
  1082	                    user_type: 'shop',
  1083	                    business_number: '123-45-67890',
  1084	                    state: '서울특별시',
  1085	                    district: '금천구',
  1086	                    shop_state: '서울특별시',
  1087	                    shop_district: '금천구',
  1088	                    shop_address: '서울특별시 금천구 가산동 123-45 데모빌딩 2층',
  1089	                    address: '서울특별시 금천구 가산동 123-45 데모빌딩 2층',
  1090	                    status: 'approved',
  1091	                    is_active: true,
  1092	                    services: ['여드름관리', '미백관리', '모공관리'],
  1093	                    description: '금천구 지역 전문 피부관리실입니다.',
  1094	                    rating: 4.8,
  1095	                    review_count: 127,
  1096	                    created_at: new Date().toISOString()
  1097	                },
  1098	                {
  1099	                    id: 'demo_shop_seoul_gangnam',
  1100	                    shop_name: '데모 피부관리실 (강남구점)',
  1101	                    name: '데모 원장님',
  1102	                    email: 'demo2@shop.com',
  1103	                    password: 'shop123',
  1104	                    phone: '02-2345-6789',
  1105	                    user_type: 'shop',
  1106	                    business_number: '234-56-78901',
  1107	                    state: '서울특별시',
  1108	                    district: '강남구',
  1109	                    shop_state: '서울특별시',
  1110	                    shop_district: '강남구',
  1111	                    shop_address: '서울특별시 강남구 역삼동 456-78 강남타워 5층',
  1112	                    address: '서울특별시 강남구 역삼동 456-78 강남타워 5층',
  1113	                    status: 'approved',
  1114	                    is_active: true,
  1115	                    services: ['안티에이징', '리프팅', '화이트닝'],
  1116	                    description: '강남구 최고급 피부관리실입니다.',
  1117	                    rating: 4.9,
  1118	                    review_count: 256,
  1119	                    created_at: new Date().toISOString()
  1120	                }
  1121	            ];
  1122	            
  1123	            for (const shop of demoShops) {
  1124	                await fetch('tables/skincare_shops', {
  1125	                    method: 'POST',
  1126	                    headers: {
  1127	                        'Content-Type': 'application/json'
  1128	                    },
  1129	                    body: JSON.stringify(shop)
  1130	                });
  1131	            }
  1132	            
  1133	            console.log('✅ 데모 업체 정보가 생성되었습니다 (지역 정보 포함)');
  1134	        } else {
  1135	            // 기존 데모 업체의 지역 정보 업데이트
  1136	            const demoShops = shopsData.data.filter(shop => 
  1137	                shop.email?.includes('demo') || 
  1138	                (shop.shop_name && shop.shop_name.includes('데모'))
  1139	            );
  1140	            
  1141	            for (const shop of demoShops) {
  1142	                if (!shop.state || !shop.district) {
  1143	                    await fetch(`tables/skincare_shops/${shop.id}`, {
  1144	                        method: 'PATCH',
  1145	                        headers: {
  1146	                            'Content-Type': 'application/json'
  1147	                        },
  1148	                        body: JSON.stringify({
  1149	                            state: '서울특별시',
  1150	                            district: '금천구',
  1151	                            shop_state: '서울특별시',
  1152	                            shop_district: '금천구',
  1153	                            status: 'approved'
  1154	                        })
  1155	                    });
  1156	                }
  1157	            }
  1158	            
  1159	            console.log('✅ 기존 데모 업체 지역 정보를 업데이트했습니다');
  1160	        }
  1161	        
  1162	    } catch (error) {
  1163	        console.error('데모 업체 로드 오류:', error);
  1164	    }
  1165	}
  1166	
  1167	// 알림 메시지 표시
  1168	function showNotification(message, type = 'info', duration = 5000) {
  1169	    const notification = document.createElement('div');
  1170	    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-transform duration-300 translate-x-full`;
  1171	    
  1172	    const bgColor = type === 'success' ? 'bg-green-500' : 
  1173	                   type === 'error' ? 'bg-red-500' : 
  1174	                   type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  1175	    
  1176	    const icon = type === 'success' ? 'fa-check-circle' : 
  1177	                 type === 'error' ? 'fa-exclamation-circle' : 
  1178	                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
  1179	    
  1180	    notification.className += ` ${bgColor} text-white`;
  1181	    
  1182	    notification.innerHTML = `
  1183	        <div class="flex items-start">
  1184	            <i class="fas ${icon} mr-3 mt-1"></i>
  1185	            <div class="flex-1">${message}</div>
  1186	            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
  1187	                <i class="fas fa-times"></i>
  1188	            </button>
  1189	        </div>
  1190	    `;
  1191	    
  1192	    document.body.appendChild(notification);
  1193	    
  1194	    // 애니메이션으로 표시
  1195	    setTimeout(() => {
  1196	        notification.classList.remove('translate-x-full');
  1197	    }, 100);
  1198	    
  1199	    // 자동 제거
  1200	    setTimeout(() => {
  1201	        notification.classList.add('translate-x-full');
  1202	        setTimeout(() => {
  1203	            if (notification.parentElement) {
  1204	                notification.remove();
  1205	            }
  1206	        }, 300);
  1207	    }, duration);
  1208	}
  1209	
  1210	// 데모 계정 정보 토글
  1211	function toggleDemoInfo() {
  1212	    const demoInfo = document.getElementById('demo-info');
  1213	    demoInfo.classList.toggle('hidden');
  1214	}
  1215	
  1216	// 데모 계정 자동 입력
  1217	function fillDemoAccount(type) {
  1218	    const emailInput = document.getElementById('email');
  1219	    const passwordInput = document.getElementById('password');
  1220	    
  1221	    // 사용자 타입 선택
  1222	    const userTypeRadios = document.querySelectorAll('input[name="user_type"]');
  1223	    userTypeRadios.forEach(radio => {
  1224	        if (radio.value === type) {
  1225	            radio.checked = true;
  1226	            // 라디오 버튼 UI 업데이트 트리거
  1227	            radio.dispatchEvent(new Event('change'));
  1228	        }
  1229	    });
  1230	    
  1231	    // 계정 정보 입력
  1232	    const demoAccounts = {
  1233	        'customer': { email: 'demo@customer.com', password: 'customer123' },
  1234	        'shop': { email: 'demo@shop.com', password: 'shop123' },
  1235	        'admin': { email: 'admin@demo.com', password: 'admin123' }
  1236	    };
  1237	    
  1238	    const account = demoAccounts[type];
  1239	    if (account) {
  1240	        emailInput.value = account.email;
  1241	        passwordInput.value = account.password;
  1242	        
  1243	        // 성공 메시지
  1244	        const typeNames = { 'customer': '고객', 'shop': '업체', 'admin': '관리자' };
  1245	        showNotification(`${typeNames[type]} 데모 계정이 입력되었습니다!`, 'info');
  1246	    }
  1247	}
  1248	
  1249	// 사용자 타입 선택 UI 업데이트 (데모 계정에서 호출)
  1250	function updateUserTypeSelection(selectedLabel) {
  1251	    // 모든 라벨 초기화
  1252	    document.querySelectorAll('label[id$="-option"]').forEach(label => {
  1253	        const icon = label.querySelector('.fa-check-circle');
  1254	        label.classList.remove('border-pink-300', 'bg-pink-50', 'border-purple-300', 'bg-purple-50', 'border-blue-300', 'bg-blue-50');
  1255	        label.classList.add('border-gray-200');
  1256	        if (icon) icon.classList.add('hidden');
  1257	    });
  1258	    
  1259	    // 선택된 라벨 활성화
  1260	    const radio = selectedLabel.querySelector('input[type="radio"]');
  1261	    const icon = selectedLabel.querySelector('.fa-check-circle');
  1262	    
  1263	    const colorMap = {
  1264	        'customer': ['border-pink-300', 'bg-pink-50'],
  1265	        'shop': ['border-purple-300', 'bg-purple-50'],
  1266	        'admin': ['border-blue-300', 'bg-blue-50']
  1267	    };
  1268	    
  1269	    selectedLabel.classList.remove('border-gray-200');
  1270	    selectedLabel.classList.add(...colorMap[radio.value]);
  1271	    if (icon) icon.classList.remove('hidden');
  1272	}
  1273	
  1274	// 현재 로그인한 사용자 가져오기
  1275	function getCurrentUser() {
  1276	    try {
  1277	        // 여러 키를 확인하여 호환성 보장
  1278	        let userData = localStorage.getItem('currentUser') || 
  1279	                      localStorage.getItem('user_data') ||
  1280	                      sessionStorage.getItem('currentUser');
  1281	        
  1282	        if (userData) {
  1283	            const user = JSON.parse(userData);
  1284	            
  1285	            // 관리자 권한 보정 (데모 계정 등)
  1286	            if (user.user_type === 'admin' && (!user.permissions || user.permissions.length === 0)) {
  1287	                user.permissions = ['all'];
  1288	                console.log('🔧 관리자 권한 자동 보정:', user.email);
  1289	            }
  1290	            
  1291	            return user;
  1292	        }
  1293	        
  1294	        return null;
  1295	    } catch (error) {
  1296	        console.error('사용자 데이터 파싱 오류:', error);
  1297	        return null;
  1298	    }
  1299	}
  1300	
  1301	// 로그인 상태 확인
  1302	function isLoggedIn() {
  1303	    return !!getCurrentUser();
  1304	}
  1305	
  1306	// 특정 권한 확인
  1307	function hasPermission(permission) {
  1308	    const user = getCurrentUser();
  1309	    if (!user) return false;
  1310	    
  1311	    if (user.permissions.includes('all')) return true;
  1312	    return user.permissions.includes(permission);
  1313	}
  1314	
  1315	// ======= 레벨 1 기본인증 통합 함수들 =======
  1316	
  1317	// 레벨 1 기본인증 사용 여부 확인
  1318	async function askForLevel1Auth(registerData) {
  1319	    return new Promise((resolve) => {
  1320	        // 레벨 1 인증 옵션 모달 표시
  1321	        const modalHTML = `
  1322	            <div id="level1AuthOptionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  1323	                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
  1324	                    <div class="text-center mb-6">
  1325	                        <div class="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
  1326	                            <i class="fas fa-shield-alt text-blue-600 text-xl"></i>
  1327	                        </div>
  1328	                        <h3 class="text-lg font-semibold text-gray-900 mb-2">회원가입 인증 선택</h3>
  1329	                        <p class="text-sm text-gray-600">더 안전한 계정을 위해 레벨 1 기본인증을 추천드립니다</p>
  1330	                    </div>
  1331	                    
  1332	                    <div class="space-y-4 mb-6">
  1333	                        <div class="border border-gray-200 rounded-lg p-4">
  1334	                            <h4 class="font-medium text-gray-900 mb-2">📧 레벨 1 기본인증 (추천)</h4>
  1335	                            <div class="text-sm text-gray-600 mb-2">
  1336	                                • 이메일 인증 (5원) + SMS 인증 (35원)<br>
  1337	                                • 총 비용: 40원<br>
  1338	                                • 계정 보안성 향상<br>
  1339	                                • 빠른 인증 (5분 이내)
  1340	                            </div>
  1341	                            <div class="text-xs text-blue-600">💰 기존 300원 인증 대비 87% 절약</div>
  1342	                        </div>
  1343	                        
  1344	                        <div class="border border-gray-200 rounded-lg p-4">
  1345	                            <h4 class="font-medium text-gray-900 mb-2">🔓 기본 회원가입</h4>
  1346	                            <div class="text-sm text-gray-600">
  1347	                                • 무료<br>
  1348	                                • 즉시 가입 완료<br>
  1349	                                • 기본 보안 수준
  1350	                            </div>
  1351	                        </div>
  1352	                    </div>
  1353	                    
  1354	                    <div class="flex space-x-3">
  1355	                        <button onclick="selectAuthOption(true)" 
  1356	                                class="flex-1 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 font-medium">
  1357	                            레벨 1 인증 사용 (40원)
  1358	                        </button>
  1359	                        <button onclick="selectAuthOption(false)" 
  1360	                                class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 font-medium">
  1361	                            기본 가입
  1362	                        </button>
  1363	                    </div>
  1364	                </div>
  1365	            </div>
  1366	        `;
  1367	        
  1368	        document.body.insertAdjacentHTML('beforeend', modalHTML);
  1369	        
  1370	        // 전역 콜백 함수 설정
  1371	        window.selectAuthOption = (useLevel1) => {
  1372	            document.getElementById('level1AuthOptionModal').remove();
  1373	            delete window.selectAuthOption;
  1374	            resolve(useLevel1);
  1375	        };
  1376	    });
  1377	}
  1378	
  1379	// 회원가입용 레벨 1 기본인증 시작
  1380	async function startLevel1AuthForRegistration(registerData) {
  1381	    try {
  1382	        console.log('🚀 회원가입용 레벨 1 기본인증 시작');
  1383	        
  1384	        // main.js의 level1Auth 인스턴스 사용
  1385	        if (typeof level1Auth === 'undefined') {
  1386	            throw new Error('레벨 1 인증 시스템을 찾을 수 없습니다.');
  1387	        }
  1388	        
  1389	        const authData = {
  1390	            email: registerData.email,
  1391	            phone: registerData.phone,
  1392	            user_id: 'new_user_' + Date.now() // 임시 사용자 ID
  1393	        };
  1394	        
  1395	        // 레벨 1 기본인증 시작
  1396	        const result = await level1Auth.startBasicAuth(authData);
  1397	        
  1398	        if (result.success) {
  1399	            // 인증 완료를 기다림 (Promise로 처리)
  1400	            return await waitForAuthCompletion();
  1401	        } else {
  1402	            throw new Error(result.message);
  1403	        }
  1404	        
  1405	    } catch (error) {
  1406	        console.error('회원가입 인증 오류:', error);
  1407	        return { success: false, message: error.message };
  1408	    }
  1409	}
  1410	
  1411	// 인증 완료 대기
  1412	function waitForAuthCompletion() {
  1413	    return new Promise((resolve, reject) => {
  1414	        const checkInterval = setInterval(() => {
  1415	            // 인증 완료 확인
  1416	            const authResult = localStorage.getItem('level1_auth_result');
  1417	            if (authResult) {
  1418	                clearInterval(checkInterval);
  1419	                const parsedResult = JSON.parse(authResult);
  1420	                
  1421	                // 인증 데이터 정리
  1422	                localStorage.removeItem('level1_auth_result');
  1423	                
  1424	                resolve({
  1425	                    success: true,
  1426	                    data: parsedResult,
  1427	                    message: '레벨 1 기본인증이 완료되었습니다.'
  1428	                });
  1429	            }
  1430	        }, 1000);
  1431	        
  1432	        // 10분 타임아웃
  1433	        setTimeout(() => {
  1434	            clearInterval(checkInterval);
  1435	            reject(new Error('인증 시간이 초과되었습니다.'));
  1436	        }, 600000);
  1437	    });
  1438	}
  1439	
  1440	// 로그인용 레벨 1 기본인증 (선택사항)
  1441	async function offerLevel1AuthForLogin(loginData) {
  1442	    try {
  1443	        const user = await getUserByEmail(loginData.email);
  1444	        if (!user || user.auth_level >= 1) {
  1445	            return null; // 이미 인증된 사용자이거나 존재하지 않는 경우
  1446	        }
  1447	        
  1448	        // 레벨 1 인증 업그레이드 제안
  1449	        const shouldUpgrade = await askForAuthUpgrade();
  1450	        
  1451	        if (shouldUpgrade) {
  1452	            const authData = {
  1453	                email: user.email,
  1454	                phone: user.phone,
  1455	                user_id: user.id
  1456	            };
  1457	            
  1458	            const result = await level1Auth.startBasicAuth(authData);
  1459	            if (result.success) {
  1460	                const authResult = await waitForAuthCompletion();
  1461	                
  1462	                // 사용자 정보 업데이트
  1463	                await updateUserAuthLevel(user.id, authResult.data);
  1464	                
  1465	                return authResult;
  1466	            }
  1467	        }
  1468	        
  1469	        return null;
  1470	        
  1471	    } catch (error) {
  1472	        console.error('로그인 인증 업그레이드 오류:', error);
  1473	        return null;
  1474	    }
  1475	}
  1476	
  1477	// 인증 업그레이드 제안
  1478	function askForAuthUpgrade() {
  1479	    return new Promise((resolve) => {
  1480	        const modalHTML = `
  1481	            <div id="authUpgradeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  1482	                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
  1483	                    <div class="text-center mb-4">
  1484	                        <div class="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
  1485	                            <i class="fas fa-level-up-alt text-yellow-600 text-xl"></i>
  1486	                        </div>
  1487	                        <h3 class="text-lg font-semibold text-gray-900 mb-2">계정 보안 업그레이드</h3>
  1488	                        <p class="text-sm text-gray-600">레벨 1 기본인증으로 계정을 더 안전하게 보호하시겠습니까?</p>
  1489	                        <p class="text-xs text-blue-600 mt-2">비용: 40원 (이메일 5원 + SMS 35원)</p>
  1490	                    </div>
  1491	                    
  1492	                    <div class="flex space-x-3">
  1493	                        <button onclick="selectUpgrade(true)" 
  1494	                                class="flex-1 bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600">
  1495	                            업그레이드
  1496	                        </button>
  1497	                        <button onclick="selectUpgrade(false)" 
  1498	                                class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400">
  1499	                            나중에
  1500	                        </button>
  1501	                    </div>
  1502	                </div>
  1503	            </div>
  1504	        `;
  1505	        
  1506	        document.body.insertAdjacentHTML('beforeend', modalHTML);
  1507	        
  1508	        window.selectUpgrade = (upgrade) => {
  1509	            document.getElementById('authUpgradeModal').remove();
  1510	            delete window.selectUpgrade;
  1511	            resolve(upgrade);
  1512	        };
  1513	    });
  1514	}
  1515	
  1516	// 사용자 인증 레벨 업데이트
  1517	async function updateUserAuthLevel(userId, authData) {
  1518	    try {
  1519	        const response = await fetch(`tables/users/${userId}`, {
  1520	            method: 'PATCH',
  1521	            headers: {
  1522	                'Content-Type': 'application/json'
  1523	            },
  1524	            body: JSON.stringify({
  1525	                auth_level: authData.auth_level,
  1526	                auth_type: authData.auth_type,
  1527	                verified_email: authData.verified_email,
  1528	                verified_phone: authData.verified_phone,
  1529	                auth_time: authData.auth_time
  1530	            })
  1531	        });
  1532	        
  1533	        if (response.ok) {
  1534	            console.log('✅ 사용자 인증 레벨 업데이트 완료');
  1535	        }
  1536	        
  1537	    } catch (error) {
  1538	        console.error('사용자 인증 레벨 업데이트 실패:', error);
  1539	    }
  1540	}
  1541	
  1542	// 이메일로 사용자 조회
  1543	async function getUserByEmail(email) {
  1544	    try {
  1545	        const response = await fetch(`tables/users?search=${encodeURIComponent(email)}`);
  1546	        const data = await response.json();
  1547	        
  1548	        const user = data.data.find(u => u.email === email);
  1549	        return user || null;
  1550	        
  1551	    } catch (error) {
  1552	        console.error('사용자 조회 오류:', error);
  1553	        return null;
  1554	    }
  1555	}
  1556	
  1557	// 전역 함수들
  1558	window.togglePassword = togglePassword;
  1559	window.toggleRegisterPassword = toggleRegisterPassword;
  1560	window.checkEmailDuplicate = checkEmailDuplicate;
  1561	window.logout = logout;
  1562	window.toggleDemoInfo = toggleDemoInfo;
  1563	window.fillDemoAccount = fillDemoAccount;
  1564	window.getCurrentUser = getCurrentUser;
  1565	window.isLoggedIn = isLoggedIn;
  1566	window.hasPermission = hasPermission;
