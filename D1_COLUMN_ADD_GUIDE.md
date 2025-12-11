# 🔧 Cloudflare D1 컬럼 추가 가이드

**버전**: v2.6.4.9.2  
**날짜**: 2025-12-11  
**작업**: `shop_announcements` 테이블에 4개 컬럼 추가  

---

## 📋 문제 상황

### 에러 메시지:
```
공지사항 등록 실패 (500): 
{"error":"Database operation failed","message":"D1_ERROR: table shop_announcements has no column named category: SQLITE_ERROR"}
```

### 원인:
- 프론트엔드 스키마 정의와 실제 D1 데이터베이스가 불일치
- `shop_announcements` 테이블에 `category`, `event_type`, `slots_info`, `discount_rate` 컬럼이 없음

---

## 🎯 해결 방법: Cloudflare Workers에서 D1 컬럼 추가

### 방법 1: Cloudflare Dashboard 사용 (권장)

#### 1단계: D1 콘솔 접속
```
1. https://dash.cloudflare.com 로그인
2. Workers & Pages → D1 SQL Database 선택
3. beautycat-db 선택
4. "Console" 탭 클릭
```

#### 2단계: SQL 실행
아래 SQL을 콘솔에 **하나씩** 실행:

```sql
-- 1. category 컬럼 추가
ALTER TABLE shop_announcements 
ADD COLUMN category TEXT DEFAULT '일반공지';

-- 2. event_type 컬럼 추가
ALTER TABLE shop_announcements 
ADD COLUMN event_type TEXT DEFAULT 'normal';

-- 3. slots_info 컬럼 추가
ALTER TABLE shop_announcements 
ADD COLUMN slots_info TEXT DEFAULT '';

-- 4. discount_rate 컬럼 추가
ALTER TABLE shop_announcements 
ADD COLUMN discount_rate INTEGER DEFAULT 0;
```

#### 3단계: 검증
```sql
-- 테이블 구조 확인
PRAGMA table_info(shop_announcements);

-- 예상 결과: category, event_type, slots_info, discount_rate 컬럼이 보여야 함
```

---

### 방법 2: Wrangler CLI 사용

#### 1단계: wrangler 설치 확인
```bash
wrangler --version
```

#### 2단계: D1 데이터베이스 확인
```bash
wrangler d1 list
```

#### 3단계: SQL 파일 실행
```bash
wrangler d1 execute beautycat-db --file=ADD_SHOP_ANNOUNCEMENTS_COLUMNS.sql
```

---

## 📊 컬럼 정의

| 컬럼명 | 타입 | 기본값 | 설명 |
|--------|------|--------|------|
| `category` | TEXT | '일반공지' | 공지 카테고리 (일반공지, 빈자리알림, 이벤트, 할인) |
| `event_type` | TEXT | 'normal' | 긴급도 (urgent, today, thisweek, normal) |
| `slots_info` | TEXT | '' | 빈 시간 정보 (예: "2025-12-11 14:00 ~ 16:00 (20%)") |
| `discount_rate` | INTEGER | 0 | 할인율 (%) |

---

## ✅ 검증 체크리스트

### 1. 컬럼 추가 확인
```sql
PRAGMA table_info(shop_announcements);
```

**예상 결과**: 4개의 새 컬럼이 표시되어야 함

### 2. 기존 데이터 확인
```sql
SELECT id, shop_name, category, event_type, slots_info, discount_rate 
FROM shop_announcements 
LIMIT 5;
```

**예상 결과**: 
- 기존 데이터의 새 컬럼은 기본값으로 채워짐
- category: '일반공지'
- event_type: 'normal'
- slots_info: ''
- discount_rate: 0

### 3. 테스트 삽입
```sql
INSERT INTO shop_announcements 
(shop_id, shop_name, title, content, category, event_type, slots_info, discount_rate, is_published, views, state, district)
VALUES 
('test_shop', '테스트 샵', '테스트 빈자리', '테스트 내용', '빈자리알림', 'today', '2025-12-11 14:00 ~ 16:00 (20%)', 20, 1, 0, '서울', '강남구');
```

**예상 결과**: 성공적으로 삽입

### 4. 웹 UI 테스트
```
1. https://beautycat.kr/shop-dashboard.html
2. 업체 소식 작성 → 빈자리 알림 선택
3. 날짜/시간/긴급도/할인율 입력
4. 등록 클릭
```

**예상 결과**: ✅ "고객 소식이 등록되었습니다!" 메시지

---

## 🚨 주의사항

### ALTER TABLE 제약사항
SQLite/D1에서 `ALTER TABLE`은 제한적입니다:
- ✅ `ADD COLUMN`: 지원됨
- ❌ `DROP COLUMN`: 지원 안 됨
- ❌ `MODIFY COLUMN`: 지원 안 됨

### 기본값 설정
- 새 컬럼에는 항상 `DEFAULT` 값 설정 권장
- 기존 데이터가 있을 경우 `NOT NULL` 제약 없이 추가

---

## 🔄 롤백 방법 (필요 시)

SQLite는 `DROP COLUMN`을 지원하지 않으므로, 롤백이 필요하면:

### 옵션 1: 테이블 재생성 (위험)
```sql
-- 백업
CREATE TABLE shop_announcements_backup AS 
SELECT id, shop_id, shop_name, title, content, is_published, views, state, district 
FROM shop_announcements;

-- 삭제
DROP TABLE shop_announcements;

-- 재생성 (원래 구조)
CREATE TABLE shop_announcements (
    id TEXT PRIMARY KEY,
    shop_id TEXT,
    shop_name TEXT,
    title TEXT,
    content TEXT,
    is_published INTEGER,
    views INTEGER,
    state TEXT,
    district TEXT
);

-- 복원
INSERT INTO shop_announcements 
SELECT * FROM shop_announcements_backup;

-- 백업 삭제
DROP TABLE shop_announcements_backup;
```

### 옵션 2: 새 컬럼 무시 (JavaScript 수정)
애플리케이션 코드에서 새 필드를 전송하지 않도록 수정 (권장하지 않음)

---

## 🎯 다음 단계

### 1. D1 컬럼 추가 (즉시)
- Cloudflare Dashboard 또는 Wrangler 사용
- 위의 4개 ALTER TABLE 실행

### 2. 검증
- PRAGMA table_info() 실행
- 테스트 데이터 삽입

### 3. 웹 UI 테스트
- 캐시 클리어 후 재접속
- 빈자리 알림 등록 테스트

### 4. 배포 완료 확인
- 에러 없이 등록 성공
- F12 Console에서 "Shop announcement created" 로그 확인

---

## 📞 문의

### Cloudflare Dashboard 접속 정보
- URL: https://dash.cloudflare.com
- D1 Database: beautycat-db
- Worker: beautycat-api

### SQL 파일
- `ADD_SHOP_ANNOUNCEMENTS_COLUMNS.sql`

---

**작업 완료 후 반드시 웹 UI에서 테스트해주세요!** ✅
