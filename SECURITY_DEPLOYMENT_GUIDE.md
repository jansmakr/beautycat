# 🔐 pposhop.kr 보안 배포 가이드

## 📋 개요
이 문서는 pposhop.kr의 실제 상용 서비스 배포를 위한 보안 설정 가이드입니다.

---

## 1️⃣ HTTPS SSL 인증서 설정

### 🌐 **도메인 SSL 인증서 발급**

#### **방법 1: Let's Encrypt (무료)**
```bash
# Certbot 설치 (Ubuntu/Debian)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d pposhop.kr -d www.pposhop.kr

# 자동 갱신 설정
sudo crontab -e
# 다음 줄 추가:
0 12 * * * /usr/bin/certbot renew --quiet
```

#### **방법 2: Cloudflare (권장)**
1. **Cloudflare 가입** - https://cloudflare.com
2. **도메인 등록** - pposhop.kr 추가
3. **네임서버 변경** - 도메인 등록업체에서 Cloudflare NS로 변경
4. **SSL 설정** - Crypto 탭에서 "Full (Strict)" 선택
5. **추가 보안** - Security 탭에서 다음 활성화:
   - DDoS Protection
   - Web Application Firewall (WAF)
   - Bot Fight Mode

#### **방법 3: AWS Certificate Manager**
```javascript
// CloudFront + ACM 설정 예시
{
  "ViewerCertificate": {
    "AcmCertificateArn": "arn:aws:acm:us-east-1:123456789012:certificate/certificate-id",
    "SslSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
```

---

## 2️⃣ 웹서버 보안 설정

### 🔧 **Nginx 보안 설정**

```nginx
# /etc/nginx/sites-available/pposhop.kr
server {
    listen 443 ssl http2;
    server_name pposhop.kr www.pposhop.kr;
    
    # SSL 인증서
    ssl_certificate /etc/letsencrypt/live/pposhop.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pposhop.kr/privkey.pem;
    
    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';" always;
    
    # SSL 보안 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 정적 파일 캐싱
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTTP to HTTPS 리다이렉트
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 보안 파일 차단
    location ~ /\\. {
        deny all;
    }
    
    location ~* \\.(md|txt|log)$ {
        deny all;
    }
}

# HTTP to HTTPS 리다이렉트
server {
    listen 80;
    server_name pposhop.kr www.pposhop.kr;
    return 301 https://$server_name$request_uri;
}
```

### 🛡️ **Apache 보안 설정**

```apache
# .htaccess 또는 VirtualHost 설정
<VirtualHost *:443>
    ServerName pposhop.kr
    DocumentRoot /var/www/pposhop
    
    # SSL 설정
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/pposhop.kr/cert.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/pposhop.kr/privkey.pem
    SSLCertificateChainFile /etc/letsencrypt/live/pposhop.kr/chain.pem
    
    # 보안 헤더
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # 파일 보안
    <Files "*.md">
        Require all denied
    </Files>
    
    <Files "*.log">
        Require all denied
    </Files>
</VirtualHost>
```

---

## 3️⃣ 환경변수 및 시크릿 관리

### 🔑 **환경변수 설정**

```javascript
// config/production.js
module.exports = {
    database: {
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
        ssl: true
    },
    
    jwt: {
        secret: process.env.JWT_SECRET, // 최소 32자 랜덤 문자열
        expiresIn: '24h'
    },
    
    encryption: {
        key: process.env.ENCRYPTION_KEY, // 256bit 키
        algorithm: 'aes-256-gcm'
    },
    
    payment: {
        toss: {
            clientKey: process.env.TOSS_CLIENT_KEY,
            secretKey: process.env.TOSS_SECRET_KEY
        },
        kakao: {
            clientId: process.env.KAKAO_CLIENT_ID,
            secretKey: process.env.KAKAO_SECRET_KEY
        }
    },
    
    email: {
        service: 'gmail',
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD
    }
};
```

### 🎯 **필수 환경변수 목록**

```bash
# .env.production
NODE_ENV=production
PORT=3000

# 데이터베이스
DB_HOST=your-database-host
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=pposhop_production

# 보안
JWT_SECRET=your-super-long-random-jwt-secret-key-here
ENCRYPTION_KEY=your-256-bit-encryption-key
BCRYPT_ROUNDS=12

# 결제
TOSS_CLIENT_KEY=live_ck_your-toss-client-key
TOSS_SECRET_KEY=live_sk_your-toss-secret-key
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_SECRET_KEY=your-kakao-secret-key

# 이메일
EMAIL_USER=noreply@pposhop.kr
EMAIL_PASSWORD=your-email-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# 파일 업로드
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=pposhop-uploads
AWS_REGION=ap-northeast-2

# 외부 API
KAKAO_MAP_KEY=your-kakao-map-api-key
NAVER_MAP_CLIENT_ID=your-naver-map-client-id
NAVER_MAP_CLIENT_SECRET=your-naver-map-client-secret

# 도메인
BASE_URL=https://pposhop.kr
CORS_ORIGIN=https://pposhop.kr,https://www.pposhop.kr
```

---

## 4️⃣ 데이터베이스 보안

### 🗄️ **MySQL/PostgreSQL 보안 설정**

```sql
-- 1. 전용 데이터베이스 사용자 생성
CREATE USER 'pposhop_user'@'%' IDENTIFIED BY 'very-secure-password';

-- 2. 최소 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON pposhop.* TO 'pposhop_user'@'%';

-- 3. 불필요한 권한 제거
REVOKE ALL ON mysql.* FROM 'pposhop_user'@'%';

-- 4. SSL 연결 강제
ALTER USER 'pposhop_user'@'%' REQUIRE SSL;

-- 5. 비밀번호 정책 적용
SET GLOBAL validate_password.policy = STRONG;
```

### 🔐 **MongoDB 보안 설정**

```javascript
// MongoDB 연결 설정
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: true,
    authSource: 'admin',
    retryWrites: true,
    w: 'majority'
};

// 사용자 생성
db.createUser({
    user: 'pposhop_user',
    pwd: 'very-secure-password',
    roles: [
        { role: 'readWrite', db: 'pposhop' }
    ]
});
```

---

## 5️⃣ 모니터링 및 로깅

### 📊 **보안 로깅 설정**

```javascript
// logger.js
const winston = require('winston');

const securityLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ 
            filename: 'logs/security.log',
            level: 'warn'
        }),
        new winston.transports.File({ 
            filename: 'logs/audit.log' 
        })
    ]
});

// 보안 이벤트 로깅
function logSecurityEvent(event, userId, details) {
    securityLogger.warn({
        timestamp: new Date().toISOString(),
        event: event,
        userId: userId,
        ip: details.ip,
        userAgent: details.userAgent,
        details: details
    });
}
```

### 🚨 **침입 탐지 설정**

```bash
# Fail2Ban 설정 (로그인 브루트포스 방지)
sudo apt install fail2ban

# /etc/fail2ban/jail.local
[sshd]
enabled = true
maxretry = 3
findtime = 300
bantime = 3600

[nginx-login]
enabled = true
filter = nginx-login
logpath = /var/log/nginx/access.log
maxretry = 5
findtime = 300
bantime = 1800
```

---

## 6️⃣ 백업 및 복구

### 💾 **자동 백업 설정**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/pposhop"

# 데이터베이스 백업
mysqldump -u backup_user -p pposhop_production > $BACKUP_DIR/db_$DATE.sql

# 파일 백업
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/pposhop

# AWS S3 업로드
aws s3 cp $BACKUP_DIR/ s3://pposhop-backups/$DATE/ --recursive

# 7일 이상된 백업 삭제
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Crontab 설정: 매일 새벽 2시 백업
# 0 2 * * * /home/pposhop/scripts/backup.sh
```

---

## 7️⃣ 성능 최적화

### ⚡ **CDN 설정 (Cloudflare)**

```javascript
// Cloudflare Workers 캐싱 규칙
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    
    // 캐시된 응답 확인
    let response = await cache.match(cacheKey);
    
    if (!response) {
        response = await fetch(request);
        
        // 정적 파일 캐싱 (1년)
        if (request.url.match(/\\.(js|css|png|jpg|gif|ico)$/)) {
            response = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    ...response.headers,
                    'Cache-Control': 'public, max-age=31536000',
                    'Expires': new Date(Date.now() + 31536000000).toUTCString()
                }
            });
        }
        
        event.waitUntil(cache.put(cacheKey, response.clone()));
    }
    
    return response;
}
```

---

## 8️⃣ 배포 체크리스트

### ✅ **상용 배포 전 필수 점검사항**

- [ ] **SSL 인증서 설정 완료**
- [ ] **도메인 DNS 설정 완료**
- [ ] **환경변수 보안 설정**
- [ ] **데이터베이스 접근 권한 최소화**
- [ ] **결제 모듈 실제 API 키 적용**
- [ ] **이메일 발송 서비스 연동**
- [ ] **파일 업로드 AWS S3 연동**
- [ ] **모니터링 및 로깅 설정**
- [ ] **백업 시스템 구축**
- [ ] **성능 테스트 완료**
- [ ] **보안 취약점 스캔 완료**
- [ ] **개인정보처리방침 업데이트**
- [ ] **이용약관 법무 검토 완료**
- [ ] **사업자등록 및 통신판매업 신고**

---

## 🚨 보안 연락처

**보안 이슈 신고**: security@pposhop.kr
**긴급 상황**: +82-10-XXXX-XXXX

---

## 📚 추가 참고자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [한국인터넷진흥원 웹사이트 보안 가이드](https://www.kisa.or.kr/)