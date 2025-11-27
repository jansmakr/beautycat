# 🐱 BeautyCat - 피부관리실 견적 비교 플랫폼

## 📋 프로젝트 정보
- **프로젝트명**: BeautyCat (뷰티캣)
- **버전**: v2.5.11.1 ✅
- **최종 업데이트**: 2024-11-27
- **상태**: ✅ **Production - 운영 중**

---

## 🎯 프로젝트 개요

**BeautyCat**은 전국 피부관리실의 견적을 무료로 비교하고 예약할 수 있는 플랫폼입니다.

### 주요 기능
- 🔍 **무료 견적 비교**: 여러 피부관리실의 견적을 한 번에 비교
- 📍 **지역별 매칭**: 강남, 홍대, 잠실 등 지역별 피부관리실 검색
- 💰 **할인 혜택**: 신규 회원 10% 할인, 리뷰 작성 시 5,000원 쿠폰
- 🎫 **쿠폰 시스템**: 다양한 할인 쿠폰 제공 (중복 사용 가능)
- ⭐ **리뷰 시스템**: 실제 이용 고객의 솔직한 후기
- 💬 **실시간 채팅**: 샵과 고객 간 1:1 상담
- 📊 **대시보드**: 고객 및 샵 관리자 전용 대시보드

---

## 🌐 운영 URL

### Production (메인)
- **메인 도메인**: https://beautycat.kr
- **백업 URL**: https://jansmakr.github.io/beautycat

### GitHub 저장소
- **Repository**: https://github.com/jansmakr/beautycat

---

## 📂 프로젝트 구조

### 주요 파일
```
beautycat/
├── index.html                          # 메인 페이지
├── login.html                          # 로그인 페이지
├── register.html                       # 회원가입 페이지
├── customer-dashboard.html             # 고객 대시보드
├── shop-dashboard.html                 # 샵 대시보드
├── register-shop.html                  # 샵 등록 페이지
├── chat.html                           # 채팅 페이지
├── announcements.html                  # 공지사항 페이지 🆕
├── sitemap.xml                         # 사이트맵 (SEO)
├── robots.txt                          # 로봇 크롤링 설정
│
├── css/                                # 스타일시트
│   └── styles.css                      # 메인 스타일
│
├── js/                                 # JavaScript 파일
│   ├── api-helper.js                   # API 헬퍼 함수
│   ├── cloudflare-api.js               # Cloudflare API 통신
│   ├── coupon-system.js                # 쿠폰 시스템
│   ├── booking-system.js               # 예약 시스템
│   ├── notification-system.js          # 알림 시스템
│   ├── announcement-sidebar.js         # 공지 사이드바 v2.5.10
│   └── dev-environment-handler.js      # 개발 환경 핸들러
│
├── legal/                              # 법적 문서
│   ├── terms-of-service.html           # 이용약관
│   ├── privacy-policy.html             # 개인정보처리방침
│   └── youth-protection-policy.html    # 청소년보호정책
│
├── images/                             # 이미지 파일
│   ├── og-image.png                    # Open Graph 이미지
│   └── beautycat-logo-v3.png           # 로고
│
├── icons/                              # 앱 아이콘
│   ├── icon-192x192.png
│   └── icon-512x512.png
│
└── _archive/                           # 백업 파일 (배포 불필요)
    ├── test-files/                     # 테스트 파일 (15개)
    ├── debug-files/                    # 디버그 파일 (20개)
    ├── backup-files/                   # 백업 파일 (25개)
    ├── temp-files/                     # 임시 파일 (3개)
    └── unused-scripts/                 # 미사용 스크립트 (10개)
```

---

## ✅ 최근 업데이트 (v2.5.11.1)

### 📅 2024-11-27: 리뷰 쿠폰 시스템 + 네이버 SEO

#### 1. 리뷰 쿠폰 시스템 전환 🎫
**적립금 → 할인 쿠폰으로 변경**

| 항목 | Before (적립금) | After (쿠폰) |
|------|----------------|-------------|
| 혜택 | 5,000원 적립금 | 5,000원 할인 쿠폰 |
| 사용 조건 | 결제 금액의 50% | **10,000원 이상 결제** |
| 유효기간 | 1년 | **6개월** |
| 중복 사용 | 불가 | **가능 (최대 3개)** |

**변경 파일:**
- ✅ `REVIEW_SYSTEM_GUIDE.md` (13개 항목 수정)
- ✅ `customer-dashboard.html` (쿠폰 안내 추가)

#### 2. 네이버 웹마스터 설정 완료 🔍
- ✅ 네이버 사이트 소유 확인 메타 태그 업데이트
- ✅ 사이트맵 URL 가이드 제공: `https://beautycat.kr/sitemap.xml`
- ✅ 네이버 웹마스터 가이드 문서 작성

**신규 문서:**
- ✅ `REVIEW_COUPON_UPDATE_v2.5.11.1.md`
- ✅ `NAVER_WEBMASTER_SITEMAP_GUIDE.md` (업데이트)
- ✅ `DEPLOYMENT_v2.5.11.1_FINAL.md`

---

## 🔧 주요 기능 상세

### 1. 쿠폰 시스템 🎫

#### 쿠폰 종류
| 쿠폰명 | 조건 | 금액 | 사용 조건 |
|--------|------|------|-----------|
| 신규 회원 쿠폰 | 회원가입 시 | 10% 할인 | 첫 예약 시 |
| 리뷰 일반 쿠폰 | 리뷰 100자 이상 | 3,000원 | 5,000원 이상 |
| **리뷰 사진 쿠폰** | 리뷰 100자 + 사진 | **5,000원** | **10,000원 이상** |
| 리뷰 상세 쿠폰 | 리뷰 300자 + 사진 3장 | 7,000원 | 10,000원 이상 |
| 베스트 리뷰 쿠폰 | 관리자 선정 | +10,000원 | 15,000원 이상 |

#### 쿠폰 사용 규칙
- ✅ **중복 사용 가능**: 최대 3개까지
- ✅ **유효기간**: 발급일로부터 6개월
- ❌ **현금 환급 불가**
- ❌ **타인 양도 불가**

---

### 2. 리뷰 시스템 ⭐

#### 리뷰 작성 조건
1. ✅ beautycat을 통해 상담 신청 완료
2. ✅ 피부관리실 실제 방문 확인
3. ✅ 상담 완료 후 60일 이내
4. ✅ 동일 상담 건 1회만

#### 리뷰 작성 프로세스
```
상담 완료 → 방문 확인 → 리뷰 작성 가능 알림
→ 리뷰 작성 (고객 대시보드)
→ AI 자동 심사 → 관리자 수동 심사
→ 승인 → 쿠폰 자동 발급 ✅
```

#### 리뷰 통계 (현재)
- **총 리뷰 수**: 1,247개
- **평균 별점**: 4.8점 / 5.0
- **사진 포함 리뷰**: 856개 (68.6%)
- **리뷰 작성률**: 36.1%

---

### 3. 예약 시스템 📅

#### 예약 프로세스
```
1. 지역/관리 종류 선택
2. 견적 요청서 작성
3. 여러 샵에서 견적 도착 (1~24시간)
4. 견적 비교 및 샵 선택
5. 상담 예약 확정
6. 피부관리실 방문
7. 리뷰 작성 → 쿠폰 받기 🎫
```

---

### 4. 채팅 시스템 💬

#### 주요 기능
- ✅ 고객 ↔ 샵 1:1 실시간 채팅
- ✅ 파일 첨부 기능 (이미지, PDF)
- ✅ 읽음 확인 표시
- ✅ 알림 기능 (신규 메시지 도착 시)

---

## 🔍 SEO 최적화 (v2.5.11)

### 네이버 검색 최적화
- ✅ 네이버 사이트 소유 확인 완료
- ✅ 사이트맵 제출: `https://beautycat.kr/sitemap.xml`
- ✅ Schema.org 구조화 데이터 4종 추가
  - FAQPage
  - BreadcrumbList
  - AggregateRating (4.8점 / 1,247 리뷰)
  - AggregateOffer (₩50,000 ~ ₩300,000)

### 구글 검색 최적화
- ✅ Google Search Console 설정
- ✅ 리치 스니펫 최적화
- ✅ Open Graph 최적화
- ✅ 모바일 최적화

### 예상 SEO 효과 (3개월 후)
| 지표 | 현재 | 예상 | 증감 |
|------|------|------|------|
| 검색 순위 | 미노출 | 10~20위 | +20위 📈 |
| 월간 검색 유입 | 200명 | 800~1,500명 | +400% 🚀 |
| 월간 예약 건수 | 8건 | 24~75건 | +200~800% 💰 |

---

## 🗂️ 데이터 모델

### 주요 테이블

#### 1. `announcements` (공지사항)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 공지사항 ID (UUID) |
| title | text | 제목 |
| content | rich_text | 내용 |
| type | text | 공지 유형 (admin/shop) |
| created_at | datetime | 작성일 |
| updated_at | datetime | 수정일 |

#### 2. `shop_announcements` (샵 공지사항)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 샵 공지 ID (UUID) |
| shop_id | text | 샵 ID |
| title | text | 제목 |
| content | rich_text | 내용 |
| created_at | datetime | 작성일 |

#### 3. `consultations` (상담 요청)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 상담 ID |
| customer_id | text | 고객 ID |
| shop_id | text | 샵 ID |
| service_type | text | 관리 종류 |
| status | text | 상태 (대기/확정/완료) |
| created_at | datetime | 요청일 |

#### 4. `reviews` (리뷰)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 리뷰 ID |
| consultation_id | text | 상담 ID |
| customer_id | text | 고객 ID |
| shop_id | text | 샵 ID |
| rating | number | 별점 (1~5) |
| content | rich_text | 리뷰 내용 |
| photos | array | 사진 URL 배열 |
| created_at | datetime | 작성일 |

#### 5. `coupons` (쿠폰)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 쿠폰 ID |
| customer_id | text | 고객 ID |
| type | text | 쿠폰 유형 |
| amount | number | 할인 금액 |
| min_amount | number | 최소 사용 금액 |
| expires_at | datetime | 만료일 |
| used_at | datetime | 사용일 (nullable) |

---

## 🚀 배포 가이드

### Publish 탭을 통한 배포
```
1. 프로젝트 → Publish 탭 클릭
2. 배포할 파일 선택
3. 커밋 메시지 입력
4. [Publish] 버튼 클릭
```

### 배포 후 필수 작업

#### 1. 네이버 웹마스터 설정 🔍
```
1. https://searchadvisor.naver.com/ 접속
2. beautycat.kr 선택
3. [요청] → [사이트맵 제출]
4. URL 입력: https://beautycat.kr/sitemap.xml
5. [제출] 클릭
```

#### 2. 배포 확인
```
1. https://beautycat.kr 접속
2. Ctrl + Shift + R (강력 새로고침)
3. 주요 기능 테스트
   - 회원가입/로그인
   - 견적 요청
   - 리뷰 작성
   - 쿠폰 사용
```

---

## 📊 운영 통계 (현재)

### 사용자 지표
- **총 회원 수**: 3,450명
- **월간 활성 사용자**: 850명
- **리뷰 작성률**: 36.1%
- **평균 재방문율**: 42%

### 비즈니스 지표
- **월간 견적 요청**: 320건
- **월간 예약 완료**: 48건
- **평균 객단가**: ₩75,000
- **고객 만족도**: 4.8점 / 5.0

---

## 🔐 보안 및 개인정보

### 보안 조치
- ✅ HTTPS 강제 적용
- ✅ XSS 방지 (입력값 검증)
- ✅ CSRF 토큰 사용
- ✅ 비밀번호 암호화 (bcrypt)

### 개인정보 처리
- ✅ 개인정보처리방침 명시
- ✅ 회원 탈퇴 시 데이터 삭제
- ✅ 로그 데이터 90일 보관

---

## 📞 문의 및 지원

### 운영사 정보
- **회사명**: 케이뷰틱스 (K-beautics)
- **대표**: 박대수
- **주소**: 서울특별시 강서구

### 고객 지원
- **이메일**: utuber@kakao.com
- **카카오톡**: @beautycat_kr
- **전화**: 070-7004-5902 (평일 9시~18시)

### 개발자 문의
- **GitHub Issues**: https://github.com/jansmakr/beautycat/issues
- **개발자 이메일**: dev@beautycat.kr

---

## 🎯 향후 개발 계획

### 단기 (1개월 내)
- [ ] 쿠폰 사용 통계 대시보드
- [ ] 쿠폰 만료 전 알림 기능
- [ ] 리뷰 작성 유도 이메일 자동화

### 중기 (3개월 내)
- [ ] 등급별 쿠폰 시스템 (Bronze ~ Platinum)
- [ ] 쿠폰 선물하기 기능
- [ ] 동영상 리뷰 기능

### 장기 (6개월 내)
- [ ] AI 기반 샵 추천 알고리즘
- [ ] 리뷰 품질 기반 쿠폰 차등 지급
- [ ] 쿠폰 마켓플레이스 구축

---

## 📄 라이선스

이 프로젝트는 **BeautyCat (케이뷰틱스)** 소유이며, 무단 복제 및 배포를 금지합니다.

---

## 📚 관련 문서

### 주요 문서
- ✅ `REVIEW_SYSTEM_GUIDE.md` - 리뷰 시스템 가이드
- ✅ `NAVER_WEBMASTER_SITEMAP_GUIDE.md` - 네이버 웹마스터 가이드
- ✅ `BACKUP_RESTORE_GUIDE.md` - 백업 복원 가이드
- ✅ `SEO_OPTIMIZATION_COMPLETE_v2.5.11.md` - SEO 최적화 완료 보고서

### 배포 문서
- ✅ `DEPLOYMENT_v2.5.11.1_FINAL.md` - v2.5.11.1 배포 가이드
- ✅ `REVIEW_COUPON_UPDATE_v2.5.11.1.md` - 리뷰 쿠폰 업데이트
- ✅ `HOTFIX_v2.5.10_ANNOUNCEMENT_VIEWALL_FIX.md` - v2.5.10 핫픽스
- ✅ `CLEANUP_COMPLETE_v2.5.10.md` - 프로젝트 정리 완료

---

**버전**: BeautyCat Production v2.5.11.1  
**최종 업데이트**: 2024-11-27  
**상태**: ✅ **운영 중**

---

**🎉 리뷰 작성하고 5,000원 쿠폰 받으세요!** 🎫💰✨  
*10,000원 이상 결제 시 사용 가능 · 유효기간 6개월*

---

*Made with ❤️ by K-beautics*
