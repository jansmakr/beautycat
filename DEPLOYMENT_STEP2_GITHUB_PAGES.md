# 🚀 beautycat GitHub Pages 배포 가이드

## 🎯 목표
예스닉 도메인 → GitHub Pages 연결하여 SSL과 함께 즉시 서비스 시작

## ✅ 1단계: GitHub Repository 생성

### 1️⃣ GitHub 계정 준비
- GitHub.com 회원가입 (무료)
- 새 Repository 생성: `beautycat-website`

### 2️⃣ 프로젝트 파일 업로드
현재 프로젝트의 모든 파일을 GitHub에 업로드:

```
📁 beautycat-website/
├── 📄 index.html
├── 📁 js/
│   ├── main.js
│   ├── auth.js
│   ├── shop-dashboard.js
│   └── ...
├── 📁 css/
├── 📄 manifest.json  
├── 📄 sw.js
└── 기타 모든 파일들
```

## 🔧 2단계: GitHub Pages 활성화

### 1️⃣ Repository Settings
1. Repository → **Settings** 클릭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. **Source**: Deploy from a branch
4. **Branch**: main (또는 master)
5. **Folder**: / (root)
6. **Save** 클릭

### 2️⃣ 자동 생성되는 주소 확인
- `https://yourusername.github.io/beautycat-website/`
- 5-10분 후 접속 가능

## 🌐 3단계: 예스닉 도메인 연결

### 1️⃣ GitHub에서 커스텀 도메인 설정
1. Repository Settings → Pages
2. **Custom domain**에 `beautycat.kr` 입력
3. **Enforce HTTPS** 체크 (중요!)
4. **Save** 클릭

### 2️⃣ 예스닉에서 DNS 설정 변경
기존 포워딩 삭제하고 DNS 레코드 설정:

**A 레코드 (권장):**
```
이름: @ (또는 공백)
유형: A
값: 185.199.108.153
값: 185.199.109.153  
값: 185.199.110.153
값: 185.199.111.153
```

**또는 CNAME 레코드:**
```
이름: www
유형: CNAME  
값: yourusername.github.io
```

### 3️⃣ CNAME 파일 생성
Repository에 `CNAME` 파일 생성 (확장자 없음):
```
beautycat.kr
```

## ⏰ 예상 완료 시간
- GitHub 업로드: 30분
- Pages 활성화: 10분  
- DNS 적용: 1-24시간
- SSL 인증서 자동 생성: 1-2시간

## 🎉 완료 후 확인사항
- [ ] https://beautycat.kr 접속 가능
- [ ] SSL 인증서 자동 적용됨 (🔒 표시)
- [ ] 모든 페이지 정상 작동
- [ ] 모바일에서도 정상 접속

## 💰 비용
- **GitHub Pages**: 완전 무료
- **SSL 인증서**: 자동 무료 적용
- **트래픽**: 무제한 (합리적 사용 범위)

## 🔄 다음 단계 준비
GitHub Pages 배포가 완료되면:
- **3단계**: 환경 설정을 프로덕션으로 변경
- **4단계**: 실제 데이터베이스 연동
- **5단계**: 결제 시스템 연동

즉시 시작할 수 있도록 단계별로 안내드리겠습니다!