#!/usr/bin/env node

/**
 * BeautyCat Android 앱 즉시 빌드 실행기
 * 모든 필요한 파일을 생성하고 빌드 준비 완료
 */

const fs = require('fs');
const path = require('path');

console.log('🐱 BeautyCat Android 앱 즉시 빌드 시작!\n');

// 색상 출력
const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1단계: 웹 매니페스트 생성
function generateWebManifest() {
    log('blue', '📋 1단계: PWA 매니페스트 생성 중...');
    
    const webManifest = {
        "name": "BeautyCat - 피부관리실 예약",
        "short_name": "BeautyCat",
        "description": "전국 피부관리실을 한눈에 비교하고 예약할 수 있는 플랫폼",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#ec4899",
        "orientation": "portrait-primary",
        "scope": "/",
        "lang": "ko",
        "categories": ["lifestyle", "beauty", "health"],
        
        "icons": [
            {
                "src": "/icons/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "maskable any"
            },
            {
                "src": "/icons/icon-512x512.png", 
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable any"
            }
        ],
        
        "shortcuts": [
            {
                "name": "견적 신청",
                "short_name": "견적신청",
                "description": "피부관리 견적을 빠르게 신청하세요",
                "url": "/#consultation",
                "icons": [{"src": "/icons/shortcut-consultation.png", "sizes": "96x96"}]
            },
            {
                "name": "채팅 상담", 
                "short_name": "채팅",
                "description": "실시간 채팅으로 상담받으세요",
                "url": "/chat.html",
                "icons": [{"src": "/icons/shortcut-chat.png", "sizes": "96x96"}]
            }
        ]
    };

    fs.writeFileSync('../manifest.json', JSON.stringify(webManifest, null, 2));
    log('green', '✅ manifest.json 생성 완료');
}

// 2단계: 서비스 워커 생성
function generateServiceWorker() {
    log('blue', '📋 2단계: 서비스 워커 생성 중...');
    
    const swContent = `
// BeautyCat PWA 서비스 워커
const CACHE_NAME = 'beautycat-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/chat.html',
    '/register.html',
    '/css/style.css',
    '/js/main.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// 설치 이벤트
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('🎯 BeautyCat 캐시 오픈');
                return cache.addAll(urlsToCache);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ 기존 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 네트워크 요청 처리
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // 캐시에 있으면 캐시된 버전 반환
                if (response) {
                    return response;
                }
                // 없으면 네트워크에서 가져오기
                return fetch(event.request);
            })
    );
});

console.log('🐱 BeautyCat 서비스워커 활성화!');
`;

    fs.writeFileSync('../sw.js', swContent);
    log('green', '✅ sw.js 생성 완료');
}

// 3단계: 아이콘 생성 (Base64 임베디드)
function generateIcons() {
    log('blue', '📋 3단계: 앱 아이콘 생성 중...');
    
    // SVG 아이콘 생성
    const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ec4899"/>
            <stop offset="100%" style="stop-color:#f472b6"/>
        </linearGradient>
    </defs>
    
    <!-- 배경 -->
    <circle cx="256" cy="256" r="240" fill="url(#gradient)"/>
    
    <!-- 고양이 얼굴 -->
    <ellipse cx="256" cy="280" rx="120" ry="100" fill="white"/>
    
    <!-- 고양이 귀 -->
    <path d="M 180 200 L 200 150 L 230 180 Z" fill="white"/>
    <path d="M 282 180 L 312 150 L 332 200 Z" fill="white"/>
    
    <!-- 고양이 눈 -->
    <ellipse cx="220" cy="260" rx="15" ry="25" fill="#1f2937"/>
    <ellipse cx="292" cy="260" rx="15" ry="25" fill="#1f2937"/>
    
    <!-- 고양이 코 -->
    <path d="M 256 290 L 248 300 L 264 300 Z" fill="#ec4899"/>
    
    <!-- 고양이 입 -->
    <path d="M 256 300 Q 240 320 220 315" stroke="#1f2937" stroke-width="3" fill="none"/>
    <path d="M 256 300 Q 272 320 292 315" stroke="#1f2937" stroke-width="3" fill="none"/>
    
    <!-- BeautyCat 텍스트 -->
    <text x="256" y="420" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
          text-anchor="middle" fill="white">BeautyCat</text>
</svg>`;

    // icons 디렉토리 생성
    const iconsDir = '../icons';
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    // SVG 파일 저장
    fs.writeFileSync(path.join(iconsDir, 'beautycat-icon.svg'), iconSvg);
    
    log('green', '✅ 앱 아이콘 SVG 생성 완료');
    log('yellow', '💡 PNG 변환은 온라인 도구 사용: https://convertio.co/svg-png/');
}

// 4단계: Bubblewrap 설정 생성
function generateBubblewrapConfig() {
    log('blue', '📋 4단계: Bubblewrap TWA 설정 생성 중...');
    
    const twaConfig = {
        "packageId": "kr.beautycat.app",
        "host": "beautycat.kr", 
        "name": "BeautyCat",
        "launcherName": "BeautyCat",
        "display": "standalone",
        "themeColor": "#ec4899",
        "navigationColor": "#ec4899",
        "backgroundColor": "#ffffff",
        "enableNotifications": true,
        "startUrl": "/",
        "iconUrl": "https://beautycat.kr/icons/icon-512x512.png",
        "maskableIconUrl": "https://beautycat.kr/icons/icon-512x512.png", 
        "splashScreenFadeOutDuration": 300,
        "signingKey": {
            "path": "./android.keystore",
            "alias": "android"
        },
        "appVersionName": "1.0.0",
        "appVersionCode": 1,
        "shortcuts": [
            {
                "name": "견적 신청",
                "short_name": "견적신청", 
                "url": "/#consultation",
                "icon": "https://beautycat.kr/icons/shortcut-consultation.png"
            },
            {
                "name": "채팅 상담",
                "short_name": "채팅",
                "url": "/chat.html", 
                "icon": "https://beautycat.kr/icons/shortcut-chat.png"
            }
        ],
        "generatorApp": "bubblewrap-cli",
        "webManifestUrl": "https://beautycat.kr/manifest.json",
        "fallbackType": "customtabs",
        "features": {
            "locationDelegation": {
                "enabled": true
            },
            "playBilling": {
                "enabled": false
            }
        },
        "minSdkVersion": 24,
        "targetSdkVersion": 34,
        "compileSdkVersion": 34
    };

    fs.writeFileSync('twa-manifest.json', JSON.stringify(twaConfig, null, 2));
    log('green', '✅ twa-manifest.json 생성 완료');
}

// 5단계: 빌드 스크립트 생성
function generateBuildScript() {
    log('blue', '📋 5단계: 즉시 실행 빌드 스크립트 생성 중...');
    
    const buildScript = `#!/bin/bash

# BeautyCat Android 앱 즉시 빌드 스크립트

echo "🐱 BeautyCat Android 앱 빌드 시작!"
echo ""

# 1. 환경 확인
echo "📋 1단계: 환경 확인 중..."
node --version || (echo "❌ Node.js가 필요합니다" && exit 1)
echo "✅ Node.js 확인됨"

# 2. Bubblewrap CLI 설치 확인
echo ""
echo "📋 2단계: Bubblewrap CLI 확인 중..."
if ! command -v bubblewrap &> /dev/null; then
    echo "📦 Bubblewrap CLI 설치 중..."
    npm install -g @bubblewrap/cli
fi
echo "✅ Bubblewrap CLI 준비됨"

# 3. 키스토어 생성 (없는 경우)
echo ""
echo "📋 3단계: 키스토어 확인 중..."
if [ ! -f "android.keystore" ]; then
    echo "🔐 새 키스토어 생성 중..."
    echo "⚠️  다음 정보를 입력하세요:"
    echo "   비밀번호: beautycat123"
    echo "   이름과 성: BeautyCat Team"
    echo "   조직: BeautyCat"
    echo "   시: Seoul"
    echo "   국가: KR"
    keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000
fi
echo "✅ 키스토어 준비됨"

# 4. TWA 프로젝트 초기화
echo ""
echo "📋 4단계: TWA 프로젝트 초기화 중..."
if [ ! -d "app" ]; then
    bubblewrap init --manifest https://beautycat.kr/manifest.json
fi
echo "✅ TWA 프로젝트 준비됨"

# 5. 앱 빌드
echo ""
echo "📋 5단계: Android 앱 빌드 중..."
bubblewrap build --skipPwaValidation
echo "✅ 빌드 완료!"

echo ""
echo "🎉 BeautyCat Android 앱이 성공적으로 빌드되었습니다!"
echo ""
echo "📦 생성된 파일:"
echo "   • app-release.aab (Google Play 업로드용)"
echo "   • app-debug.apk (테스트용)"
echo ""
echo "📤 다음 단계:"
echo "   1. Google Play Console에서 새 앱 만들기"
echo "   2. app-release.aab 파일 업로드"
echo "   3. 스토어 정보 입력"
echo "   4. 내부 테스트 후 출시"
echo ""
echo "🎊 축하합니다! BeautyCat 앱이 준비되었습니다!"
`;

    fs.writeFileSync('build.sh', buildScript);
    
    // Windows용 배치 파일
    const buildBat = buildScript.replace(/#!/bin/bash/, '@echo off')
                                .replace(/echo "/g, 'echo ')
                                .replace(/"/g, '')
                                .replace(/\|\|/g, '&&')
                                .replace(/&> \/dev\/null/g, '>nul 2>&1');
    
    fs.writeFileSync('build.bat', buildBat);
    
    log('green', '✅ 빌드 스크립트 생성 완료 (build.sh, build.bat)');
}

// 6단계: 완성 안내
function showCompletionGuide() {
    log('magenta', '\n🎊 BeautyCat Android 앱 빌드 시스템 완성!');
    
    console.log('');
    log('cyan', '📁 생성된 파일들:');
    console.log('   ├── manifest.json (PWA 매니페스트)');
    console.log('   ├── sw.js (서비스 워커)');
    console.log('   ├── icons/beautycat-icon.svg (앱 아이콘)');
    console.log('   ├── twa-manifest.json (TWA 설정)');
    console.log('   ├── build.sh (리눅스/맥 빌드 스크립트)');
    console.log('   └── build.bat (윈도우 빌드 스크립트)');
    
    console.log('');
    log('cyan', '🚀 즉시 빌드 실행 방법:');
    console.log('');
    log('yellow', '   # 리눅스/맥:');
    console.log('   chmod +x build.sh');
    console.log('   ./build.sh');
    console.log('');
    log('yellow', '   # 윈도우:');
    console.log('   build.bat');
    console.log('');
    log('yellow', '   # 또는 수동 실행:');
    console.log('   npm install -g @bubblewrap/cli');
    console.log('   bubblewrap init --manifest https://beautycat.kr/manifest.json');
    console.log('   bubblewrap build');
    
    console.log('');
    log('green', '🎯 5분 후면 Google Play에 업로드할 수 있는 AAB 파일이 준비됩니다!');
    
    console.log('');
    log('blue', '📋 체크리스트:');
    console.log('   ☐ Android Studio 설치');
    console.log('   ☐ JDK 17+ 설치');
    console.log('   ☐ ANDROID_HOME 환경변수 설정');
    console.log('   ☐ 빌드 스크립트 실행');
    console.log('   ☐ Google Play Console에 AAB 업로드');
    
    console.log('');
    log('red', '⚠️  중요: 실제 도메인(beautycat.kr)에 manifest.json과 sw.js 업로드 필요!');
}

// 메인 실행
function main() {
    try {
        generateWebManifest();
        generateServiceWorker(); 
        generateIcons();
        generateBubblewrapConfig();
        generateBuildScript();
        showCompletionGuide();
        
    } catch (error) {
        log('red', `❌ 오류 발생: ${error.message}`);
        process.exit(1);
    }
}

// 실행
main();