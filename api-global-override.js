/**
 * API Global Override
 * 전역 API 설정 및 오버라이드 관리
 */

(function() {
    'use strict';

    console.log('🔧 API Global Override 로드됨');

    // 전역 API 설정 객체
    window.apiConfig = window.apiConfig || {
        baseURL: '',
        timeout: 30000,
        retryCount: 3,
        retryDelay: 1000,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // API 엔드포인트 매핑
    window.apiEndpoints = {
        users: 'tables/users',
        shops: 'tables/shops',
        consultations: 'tables/consultations',
        quotes: 'tables/quotes',
        announcements: 'tables/announcements',
        reports: 'tables/reports',
        reviews: 'tables/reviews'
    };

    /**
     * 전역 fetch 래퍼
     * @param {string} url - 요청 URL
     * @param {object} options - fetch 옵션
     * @returns {Promise} - fetch 응답
     */
    window.apiFetch = async function(url, options = {}) {
        const config = {
            ...options,
            headers: {
                ...window.apiConfig.headers,
                ...options.headers
            }
        };

        // 타임아웃 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), window.apiConfig.timeout);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // HTTP 오류 처리
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.response = response;
                throw error;
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);

            // 재시도 로직
            if (options._retryCount === undefined) {
                options._retryCount = 0;
            }

            if (options._retryCount < window.apiConfig.retryCount) {
                console.warn(`⚠️ API 요청 실패, 재시도 중... (${options._retryCount + 1}/${window.apiConfig.retryCount})`);
                await new Promise(resolve => setTimeout(resolve, window.apiConfig.retryDelay));
                options._retryCount++;
                return window.apiFetch(url, options);
            }

            console.error('❌ API 요청 최종 실패:', error);
            throw error;
        }
    };

    /**
     * GET 요청 헬퍼
     */
    window.apiGet = async function(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        const response = await window.apiFetch(url);
        return response.json();
    };

    /**
     * POST 요청 헬퍼
     */
    window.apiPost = async function(endpoint, data = {}) {
        const response = await window.apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.json();
    };

    /**
     * PUT 요청 헬퍼
     */
    window.apiPut = async function(endpoint, data = {}) {
        const response = await window.apiFetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.json();
    };

    /**
     * PATCH 요청 헬퍼
     */
    window.apiPatch = async function(endpoint, data = {}) {
        const response = await window.apiFetch(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return response.json();
    };

    /**
     * DELETE 요청 헬퍼
     */
    window.apiDelete = async function(endpoint) {
        const response = await window.apiFetch(endpoint, {
            method: 'DELETE'
        });
        // DELETE는 보통 204 No Content를 반환하므로 응답이 없을 수 있음
        if (response.status === 204) {
            return { success: true };
        }
        return response.json();
    };

    /**
     * 필드 매핑: DB 스키마와 프론트엔드 코드 호환성
     */
    function mapShopFields(shop) {
        if (!shop) return shop;
        return {
            ...shop,
            shop_name: shop.name || shop.shop_name,     // name → shop_name
            region: shop.state || shop.region,           // state → region
            name: shop.name || shop.shop_name            // 원본 유지
        };
    }

    function mapResponseFields(data) {
        if (!data) return data;
        
        // 단일 객체
        if (data.id && !Array.isArray(data)) {
            return mapShopFields(data);
        }
        
        // 배열 형태의 data
        if (Array.isArray(data)) {
            return data.map(item => mapShopFields(item));
        }
        
        // RESTful API 응답 형태 {data: [], total: ...}
        if (data.data && Array.isArray(data.data)) {
            return {
                ...data,
                data: data.data.map(item => mapShopFields(item))
            };
        }
        
        return data;
    }

    /**
     * 테이블 데이터 조회
     */
    window.getTableData = async function(tableName, params = {}) {
        const endpoint = window.apiEndpoints[tableName] || `tables/${tableName}`;
        const result = await window.apiGet(endpoint, params);
        
        // skincare_shops 테이블인 경우 필드 매핑
        if (tableName === 'skincare_shops' || endpoint.includes('skincare_shops')) {
            return mapResponseFields(result);
        }
        
        return result;
    };

    /**
     * 레코드 조회
     */
    window.getRecord = async function(tableName, recordId) {
        const endpoint = window.apiEndpoints[tableName] || `tables/${tableName}`;
        const result = await window.apiGet(`${endpoint}/${recordId}`);
        
        // skincare_shops 테이블인 경우 필드 매핑
        if (tableName === 'skincare_shops' || endpoint.includes('skincare_shops')) {
            return mapShopFields(result);
        }
        
        return result;
    };

    /**
     * 레코드 생성
     */
    window.createRecord = async function(tableName, data) {
        const endpoint = window.apiEndpoints[tableName] || `tables/${tableName}`;
        
        // skincare_shops 생성 시 필드 역매핑 (shop_name → name)
        if ((tableName === 'skincare_shops' || endpoint.includes('skincare_shops')) && data) {
            const mappedData = {
                ...data,
                name: data.name || data.shop_name,           // shop_name → name
                state: data.state || data.region             // region → state
            };
            // 중복 필드 제거
            delete mappedData.shop_name;
            delete mappedData.region;
            
            const result = await window.apiPost(endpoint, mappedData);
            return mapShopFields(result);
        }
        
        return window.apiPost(endpoint, data);
    };

    /**
     * 레코드 업데이트
     */
    window.updateRecord = async function(tableName, recordId, data) {
        const endpoint = window.apiEndpoints[tableName] || `tables/${tableName}`;
        return window.apiPatch(`${endpoint}/${recordId}`, data);
    };

    /**
     * 레코드 삭제
     */
    window.deleteRecord = async function(tableName, recordId) {
        const endpoint = window.apiEndpoints[tableName] || `tables/${tableName}`;
        return window.apiDelete(`${endpoint}/${recordId}`);
    };

    /**
     * API 상태 확인
     */
    window.checkAPIStatus = async function() {
        try {
            const response = await window.apiFetch('tables/users?limit=1');
            console.log('✅ API 연결 정상');
            return { status: 'online', response };
        } catch (error) {
            console.error('❌ API 연결 실패:', error);
            return { status: 'offline', error };
        }
    };

    console.log('✅ API Global Override 설정 완료');
    console.log('🔄 필드 매핑 활성화: name → shop_name, state → region');
    console.log('📡 사용 가능한 함수:');
    console.log('  - apiFetch(url, options)');
    console.log('  - apiGet(endpoint, params)');
    console.log('  - apiPost(endpoint, data)');
    console.log('  - apiPut(endpoint, data)');
    console.log('  - apiPatch(endpoint, data)');
    console.log('  - apiDelete(endpoint)');
    console.log('  - getTableData(tableName, params)');
    console.log('  - getRecord(tableName, recordId)');
    console.log('  - createRecord(tableName, data)');
    console.log('  - updateRecord(tableName, recordId, data)');
    console.log('  - deleteRecord(tableName, recordId)');
    console.log('  - checkAPIStatus()');

})();
