/**
     2	 * API 오류 처리 및 개발 환경 감지 유틸리티
     3	 * BeautyCat API 오류 처리 전용 모듈
     4	 */
     5	
     6	// 환경 감지
     7	const Environment = {
     8	    isDevelopment() {
     9	        return location.hostname.includes('localhost') || 
    10	               location.hostname.includes('127.0.0.1') || 
    11	               location.hostname.includes('genspark.ai') ||
    12	               location.protocol === 'file:';
    13	    },
    14	    
    15	    isProduction() {
    16	        return !this.isDevelopment();
    17	    },
    18	    
    19	    getEnvironmentName() {
    20	        return this.isProduction() ? 'Production' : 'Development';
    21	    }
    22	};
    23	
    24	// API 응답 검증
    25	const ApiValidator = {
    26	    /**
    27	     * API 응답이 유효한 JSON인지 확인
    28	     */
    29	    async validateJsonResponse(response, apiName = 'API') {
    30	        try {
    31	            // HTTP 상태 확인
    32	            if (!response.ok) {
    33	                console.warn(`⚠️ ${apiName} 요청 실패:`, response.status, response.statusText);
    34	                return { isValid: false, error: `HTTP ${response.status}` };
    35	            }
    36	            
    37	            // Content-Type 확인
    38	            const contentType = response.headers.get('content-type');
    39	            if (!contentType || !contentType.includes('application/json')) {
    40	                console.warn(`⚠️ ${apiName} 응답이 JSON이 아닙니다. Content-Type:`, contentType);
    41	                
    42	                // HTML 응답인 경우 (404 페이지 등)
    43	                if (contentType && contentType.includes('text/html')) {
    44	                    const htmlText = await response.text();
    45	                    if (htmlText.includes('<!DOCTYPE')) {
    46	                        return { 
    47	                            isValid: false, 
    48	                            error: 'HTML 페이지 반환됨 (API 엔드포인트 없음)' 
    49	                        };
    50	                    }
    51	                }
    52	                
    53	                return { isValid: false, error: 'JSON이 아닌 응답' };
    54	            }
    55	            
    56	            return { isValid: true };
    57	            
    58	        } catch (error) {
    59	            console.warn(`⚠️ ${apiName} 응답 검증 오류:`, error.message);
    60	            return { isValid: false, error: error.message };
    61	        }
    62	    },
    63	    
    64	    /**
    65	     * 안전한 JSON 파싱
    66	     */
    67	    async safeJsonParse(response, apiName = 'API') {
    68	        try {
    69	            const validation = await this.validateJsonResponse(response, apiName);
    70	            if (!validation.isValid) {
    71	                return { success: false, error: validation.error, data: null };
    72	            }
    73	            
    74	            const data = await response.json();
    75	            return { success: true, data };
    76	            
    77	        } catch (error) {
    78	            console.warn(`⚠️ ${apiName} JSON 파싱 오류:`, error.message);
    79	            return { success: false, error: error.message, data: null };
    80	        }
    81	    }
    82	};
    83	
    84	// API 요청 래퍼
    85	const ApiRequest = {
    86	    /**
    87	     * 안전한 API 요청 (GET)
    88	     */
    89	    async safeGet(url, options = {}) {
    90	        const apiName = options.name || url.split('/').pop();
    91	        
    92	        try {
    93	            console.log(`🔄 ${apiName} API 요청:`, url);
    94	            
    95	            const response = await fetch(url, {
    96	                method: 'GET',
    97	                ...options
    98	            });
    99	            
   100	            const result = await ApiValidator.safeJsonParse(response, apiName);
   101	            
   102	            if (result.success) {
   103	                console.log(`✅ ${apiName} API 성공:`, result.data);
   104	                return result.data;
   105	            } else {
   106	                console.warn(`❌ ${apiName} API 실패:`, result.error);
   107	                return null;
   108	            }
   109	            
   110	        } catch (error) {
   111	            console.warn(`🚫 ${apiName} API 네트워크 오류:`, error.message);
   112	            return null;
   113	        }
   114	    },
   115	    
   116	    /**
   117	     * 안전한 API 요청 (POST)
   118	     */
   119	    async safePost(url, data, options = {}) {
   120	        const apiName = options.name || url.split('/').pop();
   121	        
   122	        try {
   123	            console.log(`🔄 ${apiName} POST 요청:`, url);
   124	            
   125	            const response = await fetch(url, {
   126	                method: 'POST',
   127	                headers: {
   128	                    'Content-Type': 'application/json',
   129	                    ...options.headers
   130	                },
   131	                body: JSON.stringify(data),
   132	                ...options
   133	            });
   134	            
   135	            const result = await ApiValidator.safeJsonParse(response, apiName);
   136	            
   137	            if (result.success) {
   138	                console.log(`✅ ${apiName} POST 성공:`, result.data);
   139	                return result.data;
   140	            } else {
   141	                console.warn(`❌ ${apiName} POST 실패:`, result.error);
   142	                return null;
   143	            }
   144	            
   145	        } catch (error) {
   146	            console.warn(`🚫 ${apiName} POST 네트워크 오류:`, error.message);
   147	            return null;
   148	        }
   149	    }
   150	};
   151	
   152	// 전역 오류 처리기
   153	const GlobalErrorHandler = {
   154	    initialize() {
   155	        // 전역 fetch 오류 감지
   156	        const originalFetch = window.fetch;
   157	        
   158	        window.fetch = async function(...args) {
   159	            try {
   160	                const response = await originalFetch.apply(this, args);
   161	                
   162	                // API 요청인 경우만 체크
   163	                if (args[0] && args[0].includes('tables/')) {
   164	                    const validation = await ApiValidator.validateJsonResponse(
   165	                        response.clone(), 
   166	                        args[0].split('/').pop()
   167	                    );
   168	                    
   169	                    if (!validation.isValid) {
   170	                        console.warn('🚨 API 오류 감지:', args[0], validation.error);
   171	                    }
   172	                }
   173	                
   174	                return response;
   175	            } catch (error) {
   176	                console.error('🚨 Fetch 오류:', error);
   177	                throw error;
   178	            }
   179	        };
   180	        
   181	        console.log('🛡️ API 오류 처리기 활성화됨');
   182	    }
   183	};
   184	
   185	// 환경별 설정
   186	const EnvironmentConfig = {
   187	    development: {
   188	        enableApiValidation: true,
   189	        logLevel: 'verbose',
   190	        skipDemoData: false
   191	    },
   192	    
   193	    production: {
   194	        enableApiValidation: true,
   195	        logLevel: 'warn',
   196	        skipDemoData: true
   197	    },
   198	    
   199	    get() {
   200	        return Environment.isProduction() ? this.production : this.development;
   201	    }
   202	};
   203	
   204	// 모듈 초기화
   205	if (typeof window !== 'undefined') {
   206	    // 전역 객체로 노출
   207	    window.BeautyCatApi = {
   208	        Environment,
   209	        ApiValidator,
   210	        ApiRequest,
   211	        GlobalErrorHandler,
   212	        EnvironmentConfig
   213	    };
   214	    
   215	    // 자동 초기화
   216	    GlobalErrorHandler.initialize();
   217	    
   218	    console.log(`🌍 BeautyCat API 오류 처리기 로드됨 (${Environment.getEnvironmentName()})`);
   219	}
   220	
   221	// ES6 모듈로도 사용 가능
   222	if (typeof module !== 'undefined' && module.exports) {
   223	    module.exports = {
   224	        Environment,
   225	        ApiValidator,
   226	        ApiRequest,
   227	        GlobalErrorHandler,
   228	        EnvironmentConfig
   229	    };
   230	}