# BeautyCat - 피부관리실 견적비교 예약 플랫폼

## 🎉 최신 업데이트 (2025-12-31) - v2.8.13.6.121

### ✅ 완료된 작업
- **30,000개 전국 피부관리실 데이터 업로드 완료**
- **동적 샵 페이지 시스템 구축**
- **지역별 샵 검색 페이지 구현**
- **RESTful API 연동**
- **🆕 관리자 대시보드 샵 표시 수정** (API 경로 정상화)
- **🆕 공공 데이터 자동 매칭 시스템 추가** (원장 가입 시 자동 연결)
- **🆕 리뷰 시스템 연동 완료** (matched_shop_id → reviews.shop_id)

---

## 📊 프로젝트 현황

### 데이터베이스
- **총 레코드**: 30,000개
- **데이터베이스 크기**: 11.75 MB
- **테이블**: `public_skincare_data`

### 지역별 분포
| 지역 | 샵 수 | 비율 |
|------|-------|------|
| 경기 | 9,233 | 30.8% |
| 서울 | 3,928 | 13.1% |
| 대구 | 3,188 | 10.6% |
| 충북 | 3,094 | 10.3% |
| 전북 | 2,825 | 9.4% |
| 경북 | 1,487 | 5.0% |
| 광주 | 1,485 | 5.0% |
| 부산 | 1,157 | 3.9% |
| 인천 | 1,059 | 3.5% |
| 경남 | 642 | 2.1% |

---

## 🌐 주요 페이지

### 1. 메인 페이지
- **URL**: https://beautycat.kr/
- **기능**: 메인 랜딩, 상담 신청, AI 매칭

### 2. 지역별 샵 찾기
- **URL**: https://beautycat.kr/region.html
- **기능**: 
  - 지역/시군구 필터링
  - 페이지네이션 (30개씩)
  - 실시간 검색
- **예시 URL**:
  - `https://beautycat.kr/region.html?region=경기`
  - `https://beautycat.kr/region.html?region=경기&district=남양주시`

### 3. 샵 상세 페이지
- **URL**: https://beautycat.kr/shop-detail.html?id={shop_id}
- **기능**:
  - 샵 상세 정보 (주소, 전화번호)
  - 지역 브레드크럼
  - 관련 샵 추천
  - Schema.org 마크업
  - Open Graph 태그

---

## 🔌 RESTful API 엔드포인트

### 베이스 URL
```
https://beautycat.kr/tables/
```

### 엔드포인트

#### 1. 샵 목록 조회
```
GET /tables/public_skincare_data
```
**쿼리 파라미터**:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지 크기 (기본값: 100)
- `search`: 검색어 (예: "경기", "강남")
- `sort`: 정렬 필드

**예시**:
```bash
# 첫 100개 조회
curl https://beautycat.kr/tables/public_skincare_data?page=1&limit=100

# 경기도만 검색
curl https://beautycat.kr/tables/public_skincare_data?search=경기&limit=100
```

#### 2. 샵 상세 조회
```
GET /tables/public_skincare_data/{id}
```

**예시**:
```bash
curl https://beautycat.kr/tables/public_skincare_data/abc123
```

---

## 🗄️ 데이터 스키마

### `public_skincare_data` 테이블

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | TEXT | UUID (Primary Key) |
| `business_id` | TEXT | 사업자 고유번호 (우편번호) |
| `business_name` | TEXT | 사업장명 |
| `address` | TEXT | 도로명 주소 |
| `region` | TEXT | 지역 (예: 경기, 서울) |
| `district` | TEXT | 시/군/구 (예: 남양주시) |
| `town` | TEXT | 동 (예: 다산동) |
| `status` | TEXT | 영업 상태 (기본값: '영업중') |
| `phone` | TEXT | 전화번호 |
| `matched_shop_id` | TEXT | 매칭된 등록 샵 ID (NULL → 자동 매칭 시 업데이트) |
| `data_source` | TEXT | 데이터 출처 (예: '공공데이터_251231') |
| `gs_project_id` | TEXT | 프로젝트 ID |
| `gs_table_name` | TEXT | 테이블명 |
| `created_at` | INTEGER | 생성 시간 (밀리초) |
| `updated_at` | INTEGER | 수정 시간 (밀리초) |
| `deleted` | INTEGER | 삭제 플래그 (0/1) |

---

## 📁 프로젝트 구조

```
beautycat/
├── index.html                      # 메인 페이지
├── shop-detail.html                # 샵 상세 페이지 (동적)
├── region.html                     # 지역별 샵 목록 (동적)
├── matching.html                   # AI 매칭 페이지
├── contact.html                    # 상담 신청
├── css/
│   └── style.css                   # 전역 스타일
├── js/
│   ├── main.js                     # 메인 로직
│   ├── auth.js                     # 인증
│   ├── config.js                   # 설정
│   ├── logger.js                   # 로거
│   └── regional-matching.js        # 지역 매칭
├── migrations/
│   └── 0002_create_public_skincare_data.sql  # DB 마이그레이션
├── sql-batches/                    # SQL 배치 파일 (30개)
│   ├── batch-001.sql
│   ├── batch-002.sql
│   └── ...
├── generate-sql-batches.js         # SQL 배치 생성 스크립트
├── upload-all-batches.bat          # 자동 업로드 스크립트
├── sitemap.xml                     # 사이트맵
├── robots.txt                      # 로봇 설정
└── README.md                       # 이 파일
```

---

## 🚀 배포 정보

### 도메인
- **메인**: https://beautycat.kr
- **백업**: https://beautyket.com

### 호스팅
- **플랫폼**: Cloudflare Pages
- **데이터베이스**: Cloudflare D1
- **Workers**: Cloudflare Workers

### CDN
- **Tailwind CSS**: https://cdn.tailwindcss.com
- **Font Awesome**: https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free

---

## 🛠️ 로컬 개발

### 필수 요구사항
- Node.js v16 이상
- Wrangler CLI
- Git

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/jansmakr/beautycat.git
cd beautycat

# 의존성 설치
npm install

# Wrangler 로그인
wrangler login

# D1 데이터베이스 확인
wrangler d1 list

# 로컬 개발 서버 실행
npx wrangler pages dev .

# 로컬에서 http://localhost:8788 접속
```

### 데이터 업로드

```bash
# SQL 배치 파일 생성
node generate-sql-batches.js

# 자동 업로드 (Windows)
upload-all-batches.bat

# 수동 업로드 (Linux/Mac)
for i in {001..030}; do
  wrangler d1 execute beautycat-db --remote --file=sql-batches/batch-$i.sql
done
```

---

## 📊 SEO 최적화

### 완료된 작업
- ✅ **메타 태그 최적화** (title, description, keywords)
- ✅ **Open Graph 태그**
- ✅ **Schema.org 구조화 데이터** (BeautySalon)
- ✅ **Sitemap.xml** 생성
- ✅ **Robots.txt** 설정
- ✅ **RSS Feed** 추가
- ✅ **네이버 사이트 등록** (beautycat.kr, beautyket.com)
- ✅ **구글 Search Console 대기**

### 네이버 SEO
- **사이트맵**: https://beautycat.kr/sitemap.xml
- **RSS**: https://beautycat.kr/rss.xml
- **Robots.txt**: https://beautycat.kr/robots.txt
- **등록 상태**: beautyket.com 제출 완료, beautycat.kr 대기

### 구글 SEO
- **Search Console**: 설정 필요
- **Sitemap 제출**: 대기 중

---

## 🎯 다음 단계 (우선순위)

### 높음 🔴
1. **구글 Search Console 등록**
   - beautycat.kr 소유 확인
   - sitemap.xml 제출
   
2. **샵 데이터 검증**
   - 중복 제거 확인
   - 주소 파싱 정확도 검증
   - 전화번호 형식 통일

3. **사이트맵 확장**
   - 현재: 13개 URL
   - 목표: 30,000+ URL (동적 페이지 포함)
   - 방법: Sitemap Index 사용

### 중간 🟡
4. **지역 페이지 자동 생성**
   - 경기 남양주시 페이지
   - 서울 강남구 페이지
   - 총 약 300~500개 지역 페이지

5. ~~**샵 리뷰 시스템**~~ ✅ **완료 (v2.8.13.6.121)**
   - ✅ 자동 매칭 시스템 구현
   - ✅ matched_shop_id → reviews.shop_id 연동
   - ✅ 관리자 승인 시 자동 매칭
   - 📝 대기: 사용자 리뷰 UI 개선

6. **샵 사진 추가**
   - 이미지 업로드
   - CDN 연동
   - 썸네일 생성

### 낮음 🟢
7. **지도 연동**
   - 카카오맵 API
   - 네이버 지도 API
   - 위치 기반 검색

8. **예약 시스템**
   - 실시간 예약
   - 예약 관리
   - 알림 기능

9. ~~**관리자 대시보드**~~ ✅ **개선 완료 (v2.8.13.6.121)**
   - ✅ 샵 목록 표시 수정 (API 경로 정상화)
   - ✅ 공공 데이터 샵 수 표시
   - ✅ 자동 매칭 시스템 통합
   - 📝 대기: 통계 대시보드 확장

---

## 🔄 자동 매칭 시스템

### 개요
원장님이 샵을 등록하면 공공 데이터와 자동으로 매칭하여 리뷰 작성을 가능하게 합니다.

### 작동 원리
1. **원장 가입** → 샵 등록 (status: `pending`)
2. **관리자 승인** → status 변경 (`pending` → `active`)
3. **자동 매칭 시도**:
   - 이름 유사도 검사 (80% 이상)
   - 주소 유사도 검사 (60% 이상)
   - 전화번호 일치 여부 확인
4. **매칭 성공 시**:
   - `public_skincare_data.matched_shop_id` ← 등록 샵 ID 저장
   - 리뷰 작성 가능 (`reviews.shop_id` = 등록 샵 ID)
5. **매칭 실패 시**:
   - 관리자 수동 매칭 필요 (향후 구현)

### 데이터 흐름
```
공공 데이터 (public_skincare_data)
  ├── id: "d273c494-xxx"
  ├── business_name: "헤버구떼 압구정"
  └── matched_shop_id: "shop_001" ← 자동 매칭

등록 샵 (skincare_shops)
  ├── id: "shop_001"
  ├── name: "헤버구떼 압구정"
  └── status: "active"

리뷰 (reviews)
  ├── shop_id: "shop_001" ← 등록 샵 참조
  ├── customer_id: "user_123"
  └── rating: 5
```

### 알고리즘
- **Levenshtein Distance**: 문자열 유사도 계산
- **임계값**:
  - 이름: 80% 이상
  - 주소: 60% 이상
  - 전화번호: 완전 일치

---

## 📈 성능 최적화

### Lighthouse 점수
- **현재**: 57/100
- **목표**: 90+ /100

### 병목 요인
- ❌ 렌더링 차단 리소스: 3,110ms
- ❌ 글꼴 로딩: 810ms
- ❌ 이미지 전송: 632KB

### 개선 필요
- [ ] 이미지 최적화 (WebP 변환)
- [ ] CSS/JS 최소화
- [ ] 레이지 로딩
- [ ] 캐싱 정책

---

## 🐛 알려진 이슈

1. **주소 파싱 정확도**
   - 일부 주소에서 region/district 파싱 오류
   - 예: "서울특별시" → "서울" vs "서울특별시"

2. **전화번호 누락**
   - 약 70% 샵에서 전화번호 없음
   - 공공데이터 한계

3. **중복 데이터**
   - 사업장명 + 주소로 중복 제거했지만 일부 남아있을 수 있음

---

## 📞 연락처

- **이메일**: utuber@kakao.com
- **GitHub**: https://github.com/jansmakr/beautycat
- **사이트**: https://beautycat.kr

---

## 📄 라이선스

Copyright © 2025 케이뷰틱스 (K-Beautyx). All rights reserved.

---

## 🎉 기여자

- **개발**: jansmakr
- **데이터**: 공공데이터포털 (전국피부미용실 현황 251231)
- **디자인**: BeautyCat 팀

---

## 📝 변경 이력

### v2.8.13.6.118 (2025-12-31)
- ✅ 30,000개 전국 피부관리실 데이터 업로드
- ✅ 동적 샵 페이지 시스템 구축
- ✅ 지역별 샵 검색 페이지
- ✅ RESTful API 연동
- ✅ 모바일 네비게이션에 "샵찾기" 버튼 추가

### v2.8.13.6.117 (2025-12-30)
- ✅ 듀얼 도메인 SEO 완성
- ✅ 사이트맵/RSS 분리
- ✅ 네이버 등록 완료

### v2.8.13.6.75 (2025-12-23)
- ✅ 로고 배경 투명화
- ✅ UI 개선

---

**🚀 Next Steps**: 구글 Search Console 등록 및 사이트맵 제출!
