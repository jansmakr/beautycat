# 📦 BeautyCat 프로젝트 파일 정리 계획 v2.8.12.4

## 🎯 목표
프로젝트 루트 디렉토리의 미사용 파일과 이전 버전 파일을 체계적으로 아카이브하여 프로젝트 구조를 깔끔하게 정리

---

## 📊 현재 상태 분석

### 총 파일 수
- **HTML 파일**: 87개 (이미 _archive 내 51개 포함)
- **JavaScript 파일**: 58개 (이미 _archive 내 7개 포함)
- **Markdown 문서**: 320개 (이미 _archive 내 일부 포함)
- **SQL 파일**: 약 15개
- **기타 설정 파일**: 10개

### 아카이브 대상 파일 분류

---

## 🗂️ 아카이브 이동 대상 파일

### 1️⃣ Preview/디자인 테스트 HTML 파일 (4개)
**이동 위치**: `_archive/design-previews/`

```
preview-banner-v2.5.9.html
preview-compact-design.html
preview-ultra-premium-design.html
preview-premium-design.html
```

**사유**: 디자인 프리뷰 파일은 더 이상 필요 없으며, 최종 디자인은 `index.html`에 통합됨

---

### 2️⃣ 임시/배치 파일 (3개)
**이동 위치**: `_archive/temp-files/`

```
QUICK_FIX.txt
QUICK_UPDATE.bat
PUSH_CHECKLIST.txt
QUICK_DB_FIX_COMMANDS.txt
```

**사유**: 일회성 수동 작업용 임시 파일로 현재 미사용

---

### 3️⃣ 오래된 SQL 마이그레이션 파일 (10개)
**이동 위치**: `_archive/old-migrations/`

```
test-announcements.sql
update-announcement-views.sql
DB_QUICK_FIX.sql
naver-login-db-update.sql
DB_UPDATE_KAKAO_LOGIN.sql
CHECK_MISSING_COLUMNS.sql
CHECK_KAKAO_USERS.sql
ADD_SHOP_ANNOUNCEMENTS_COLUMNS.sql
CREATE_DEPOSIT_TABLES.sql
DB_MIGRATION_ADD_USER_COLUMNS_v2.7.3.1.sql
DB_MIGRATION_FIX_SHOP_NULLABLE_v2.7.3.3.sql
DB_MIGRATION_ADD_TOWN_COLUMN_v2.7.4.sql
DB_ADD_SKIN_PHOTOS_COLUMN_v2.8.12.sql
CLEANUP_UNDEFINED_DATA.sql
```

**사유**: 이미 실행된 마이그레이션 스크립트로 재실행 불필요. 최신 스키마는 `cloudflare-d1-schema.sql`에 통합됨

---

### 4️⃣ 오래된 가이드 문서 (50개 이상)
**이동 위치**: `_archive/old-guides/`

#### 초기 설정 가이드 (더 이상 필요 없음)
```
SCALING_GUIDE.md
DEVELOPER_ONBOARDING.md
DESIGN_UPGRADE_GUIDE.md
COLOR_ACCESSIBILITY_UPDATE.md
UNNI_STYLE_GUIDE.md
UPDATE_STATUS.md
SECURITY_DEPLOYMENT_GUIDE.md
EXTERNAL_PAYMENT_GUIDE.md
CAFE24_SETUP_GUIDE.md
SCALING_STRATEGY.md
API_OPTIMIZATION_GUIDE.md
BUSINESS_MODEL_2025.md
MARKETING_STRATEGY_2024.md
COST_EFFECTIVE_AUTH_GUIDE.md
REGIONAL_MATCHING_COMPLETE.md
SHOP_REGISTRATION_COMPLETE.md
MOBILE_APP_GUIDE.md
PRODUCTION_OPTIMIZATION_GUIDE.md
```

#### 배포 관련 초기 가이드 (통합됨)
```
DEPLOYMENT_STEP1_DOMAIN.md
DEPLOYMENT_STEP2_SSL.md
DEPLOYMENT_STEP2_GITHUB_PAGES.md
INSTANT_DEPLOY_GUIDE.md
DOMAIN_TROUBLESHOOT.md
DOMAIN_FORWARDING_GUIDE.md
PLATFORM_REGISTRATION_GUIDE.md
cloudflare-setup-guide.md
CLOUDFLARE_SUCCESS.md
```

#### BeautyCat 초기 기획 문서 (레퍼런스용)
```
BEAUTYCAT_MARKET_RESEARCH.md
BEAUTYCAT_ACTION_PLAN.md
BEAUTYCAT_PREPARATION_ASSESSMENT.md
BEAUTYCAT_LEGAL_SETUP.md
BEAUTYCAT_LEGAL_COMPLETE.md
BEAUTYCAT_BETA_TEST_PLAN.md
BEAUTYCAT_MARKETING_LAUNCH.md
BEAUTYCAT_PARTNER_STRATEGY.md
BEAUTYCAT_EXECUTION_CHECKLIST.md
BEAUTYCAT_EXISTING_CHANNELS_STRATEGY.md
BEAUTYCAT_DATA_SYSTEM_ANALYSIS.md
BEAUTYCAT_SYSTEM_STABILITY_UPDATE.md
BEAUTYCAT_APP_REGISTRATION_CHECKLIST.md
BEAUTYCAT_BETA_LAUNCH_FINAL_CHECKLIST.md
BEAUTYCAT_SEO_OPTIMIZATION_REPORT.md
BEAUTYCAT_ADDITIONAL_FEATURES_ANALYSIS.md
BEAUTYCAT_FEATURES_IMPLEMENTATION_SUMMARY.md
BEAUTYCAT_SHOP_RECRUITMENT_STRATEGY.md
BEAUTYCAT_BUSINESS_PROPOSAL.md
BEAUTYCAT_BUSINESS_BROCHURE.md
BEAUTYCAT_BETA_PARTNERSHIP_CONTRACT.md
BEAUTYCAT_PHONE_SCRIPT.md
BEAUTYCAT_ONBOARDING_CHECKLIST.md
BEAUTYCAT_IMMEDIATE_ACTION_PLAN.md
```

#### Checkpoint -222 복구 관련 (이미 해결됨)
```
HTTPS_CONNECTION_GUIDE.md
CHECKPOINT_-222_STATUS_REPORT.md
EXTERNAL_SITES_RESTORATION_GUIDE.md
CLOUDFLARE_CURRENT_STATUS.md
CLOUDFLARE_CLEANUP_GUIDE.md
CLOUDFLARE_URGENT_ACTION_SUMMARY.md
CLOUDFLARE_DB_VERSION_CHECK.md
CLOUDFLARE_CORRECT_RESTORATION_GUIDE.md
EXTERNAL_SERVICES_CHECKPOINT_222.md
QUICK_RESTORATION_CHECKLIST.md
CHECKPOINT_-222_FINAL_VERIFICATION.md
API_TEST_GUIDE.md
API_TEST_RESULTS.md
WORKERS_DEPLOYMENT_SOLUTION.md
API_TEST_SUMMARY.md
DEPLOYMENT_SUCCESS_REPORT.md
CHECKPOINT_-222_RESTORATION_COMPLETE.md
PRODUCTION_DATA_SETUP_GUIDE.md
PRODUCTION_FRONTEND_INTEGRATION.md
PRODUCTION_LAUNCH_CHECKLIST.md
PRODUCTION_QUICK_START.md
```

#### 긴급 수정 관련 (이미 해결됨)
```
URGENT_DEPLOYMENT_FIX.md
URGENT_API_FIX_DEPLOYED.md
URGENT_FIX_REDIRECTS_UPDATE.md
URGENT_FUNCTIONS_SOLUTION.md
WRANGLER_TOML_SETUP.md
FINAL_DEPLOYMENT_SOLUTION.md
CURRENT_SITUATION_SUMMARY.md
D1_BINDING_CHECKLIST.md
URGENT_ACTION_REQUIRED.md
SERVICE_WORKER_PROBLEM_ANALYSIS.md
IMMEDIATE_TEST_GUIDE.md
COMPLETE_ANALYSIS_SUMMARY.md
COMPREHENSIVE_FIX_PLAN.md
FINAL_COMPREHENSIVE_SOLUTION.md
EXECUTE_NOW.md
FILE_SYSTEM_AUDIT.md
CLEANUP_COMPLETE.md
FINAL_STATUS_REPORT.md
CURRENT_FILE_STATUS.md
FINAL_ERROR_CHECK_REPORT.md
DEPLOYMENT_FIX_COMPLETE.md
INDEX_HTML_FIX_COMPLETE.md
CONSOLE_FILTER_REMOVAL_COMPLETE.md
MANUAL_UPDATE_GUIDE.md
DEPLOYMENT-STATUS.md
CRITICAL_FIX_REQUIRED.md
test-edge-cases.md
DETAILED_ERROR_ANALYSIS.md
```

#### v2.1.0 ~ v2.5.x 버전 문서 (이미 v2.8.x로 업그레이드됨)
```
RECENT_CHANGES.md
VERSION_2.1.0_CHANGELOG.md
DEPLOY_NOW.md
COPY_PASTE_GUIDE.md
LOGIN_BORDER_UPDATE_COMPLETE.md
VERSION_2.2.2_CHANGELOG.md
MOBILE_UI_UPDATE_COMPLETE.md
LOGO_UPDATE_v2.2.2.md
PRODUCTION_OPTIMIZATION_v2.3.0.md
DEPLOY_v2.3.0_GUIDE.md
ADMIN_REPRESENTATIVE_SHOP_FEATURE.md
RESTORE_v2.2.2_COMPLETE.md
GOLDEN_CAT_BANNER_UPDATE.md
SNS_BANNER_GOLDEN_CAT_UPDATE.md
GOLDEN_CAT_BACKGROUND_REMOVE.md
NEW_GOLDEN_CAT_IMAGE_UPDATE.md
TRANSPARENT_CAT_IMAGE_UPDATE_v2.2.7.md
BLACK_BACKGROUND_REMOVAL_v2.2.8.md
BEAUTYCAT_LOGO_UNIFICATION_v2.2.9.md
DEPLOYMENT_CHECKLIST_v2.2.3.md
```

---

### 5️⃣ 유지할 중요 파일

#### 핵심 HTML 페이지
```
index.html
shop-dashboard.html
admin-dashboard.html
customer-dashboard.html
register.html
shop-register.html
shop-register-full.html
chat.html
login.html
announcements.html
shop-registration.html
```

#### 핵심 JavaScript 파일
```
js/main.js
js/auth.js
js/shop-dashboard.js
js/admin-dashboard.js
js/customer-dashboard.js
js/chat.js
기타 js/ 디렉토리 내 모든 활성 모듈
```

#### 핵심 설정 파일
```
cloudflare-workers-beautycat.js
cloudflare-d1-schema.sql (최신 통합 스키마)
wrangler.toml
manifest.json
robots.txt
sitemap.xml
package.json
sw.js
sw-unregister.js
api-global-override.js
_redirects
_headers
.gitignore
```

#### 최신 문서 (v2.7.x ~ v2.8.x)
```
README.md
START_HERE_COMMERCIAL_LAUNCH.md
COMMERCIAL_LAUNCH_ACTION_PLAN.md
COMMERCIAL_READINESS_REPORT_v2.7.5.md
BETA_TEST_LAUNCH_IMMEDIATE_ACTION.md
BEAUTYCAT_SYSTEM_OPTIMIZATION.md
SHOP_OWNER_MANUAL.md
CUSTOMER_USER_MANUAL.md
ADMIN_MANUAL.md
TEST_ACCOUNTS.md

# v2.8.x Hotfix 문서 (최근 3개월)
HOTFIX_v2.8.12.4_URGENT_RESERVATION_FIX.md
PROJECT_COMPLETION_v2.8.12.3.md
HOTFIX_v2.8.12.3_INDEX_HTML_RESIZE_FIX.md
HOTFIX_v2.8.12.3_IMAGE_RESIZE_FIX.md
HOTFIX_v2.8.12.2_CONSULTATION_FORM_FIX.md
HOTFIX_API_CONSULTATIONS_SCHEMA_v2.8.12.1.md
FEATURE_SKIN_PHOTO_UPLOAD_v2.8.12.md
FEATURE_CONSULTATION_DISPLAY_v2.8.11.md
FEATURE_BUSINESS_NUMBER_FORMAT_v2.8.10.md
HOTFIX_JSON_PARSE_v2.8.9.md
UI_UX_IMPROVEMENTS_v2.8.8.md
ENFORCE_REGION_REQUIRED_v2.8.7.md
FIX_CONSULTATION_DISPLAY_v2.8.6.md
FIX_REGIONAL_FILTER_v2.8.5.md
REMOVE_COUPON_PROMOTION_v2.8.4.md
FIX_QUOTE_VIEW_v2.8.3.md
FIX_SHOP_ANNOUNCEMENT_v2.8.2.md

# v2.7.x 핵심 문서 (베타 런칭)
FINAL_FIX_v2.7.6.md
FIX_UNDEFINED_DATA_GUIDE.md
EMERGENCY_CACHE_CLEAR.md
FEATURE_UPDATE_v2.7.4_TOWN_LEVEL_REPRESENTATIVE.md
CRITICAL_FIX_v2.7.3.3_SHOP_REGISTRATION.md
TEST_GUIDE_v2.7.3.3.md
CRITICAL_FIX_v2.7.3.2_CACHE_BUSTING.md
HOTFIX_v2.7.3.2_API_URL_STANDARDIZATION.md
POST_PUSH_VERIFICATION_v2.7.3.1.md
CRITICAL_FIX_SUMMARY_v2.7.3.1.md
DB_MIGRATION_REPORT_v2.7.3.1.md
HOTFIX_v2.7.3.1_REGISTER_SHOP_FORM.md
SYSTEM_CLARIFICATION_v2.7.3.md
COMPREHENSIVE_ERROR_CHECK_REPORT_v2.7.2.md
DEPLOYMENT_READY_v2.7.1.2.md
FIX_REPORT_SHOP_REGISTRATION_FLOW_v2.7.1.1.md
FEATURE_v2.7.1_SIMPLE_SHOP_REGISTRATION.md
HOTFIX_v2.7.0.1_REGISTER_ERRORS.md
POST_DEPLOYMENT_VERIFICATION_v2.7.0.md
SYSTEM_TEST_REPORT_v2.7.0.md
DEPOSIT_SYSTEM_TEST_REPORT.md

# 최신 분석/점검 문서
COMPREHENSIVE_ERROR_CHECK_v2.8.12.4.md
READY_FOR_PUSH_v2.8.12.4.md
```

---

## ✅ 실행 계획

### Step 1: 아카이브 디렉토리 구조 정리
```
_archive/
├── design-previews/       # Preview HTML 파일
├── temp-files/            # 임시/배치 파일 (기존 활용)
├── old-migrations/        # 오래된 SQL 파일 (신규)
├── old-guides/            # 초기 가이드 문서 (신규)
├── checkpoint-222-docs/   # Checkpoint 복구 관련 (신규)
├── v2.1-v2.6-docs/        # v2.1~v2.6 버전 문서 (신규)
├── backup-files/          # 기존 백업 HTML/JS
├── unused-scripts/        # 기존 미사용 스크립트
├── debug-files/           # 기존 디버그 파일
└── test-files/            # 기존 테스트 파일
```

### Step 2: 파일 이동 실행 (약 100+ 파일)

### Step 3: 정리 완료 보고서 작성
- 이동된 파일 목록
- 현재 활성 파일 목록
- 아카이브 위치 가이드

---

## ⚠️ 주의사항

1. **삭제 금지**: 모든 파일은 삭제하지 않고 `_archive/`로 이동
2. **최신 핫픽스 유지**: v2.7.x 이상, 특히 v2.8.x 문서는 루트에 유지
3. **핵심 문서 유지**: README.md, 매뉴얼, 최신 배포 가이드는 절대 이동 금지
4. **Git 커밋 권장**: 파일 이동 후 별도 커밋하여 히스토리 보존

---

## 📈 기대 효과

1. **루트 디렉토리 정리**: 320개 → 약 100개 이하로 감소
2. **프로젝트 가독성 향상**: 최신 문서만 루트에 유지
3. **아카이브 체계화**: 목적별 폴더 구조로 과거 파일 쉽게 검색 가능
4. **개발 효율 증가**: 불필요한 파일 스캔 시간 단축

---

**작성일**: 2025-12-16  
**버전**: v2.8.12.4  
**상태**: 계획 수립 완료 → 실행 대기 중
