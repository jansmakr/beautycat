#!/usr/bin/env node

/**
 * BeautyCat Android App 자동 빌드 스크립트
 * PWA를 Android 앱으로 변환하는 자동화 도구
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🐱 BeautyCat Android App Builder 시작...\n');

// 설정
const CONFIG = {
    domain: 'beautycat.kr',
    packageId: 'kr.beautycat.app',
    appName: 'BeautyCat',
    launcherName: 'BeautyCat - 피부관리실 예약',
    manifestUrl: 'https://beautycat.kr/manifest.json',
    themeColor: '#ec4899',
    backgroundColor: '#ffffff',
    version: '1.0.0',
    versionCode: 1
};

// 색상 출력 함수
const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 단계별 실행 함수
function step(title, fn) {
    log('blue', `\n📋 ${title}`);
    try {
        fn();
        log('green', `✅ ${title} 완료`);
    } catch (error) {
        log('red', `❌ ${title} 실패: ${error.message}`);
        process.exit(1);
    }
}

// 필요한 도구 확인
function checkRequirements() {
    const requirements = [
        { cmd: 'node --version', name: 'Node.js' },
        { cmd: 'npm --version', name: 'npm' },
        { cmd: 'java --version', name: 'Java' }
    ];

    requirements.forEach(req => {
        try {
            execSync(req.cmd, { stdio: 'pipe' });
            log('green', `✓ ${req.name} 설치됨`);
        } catch {
            log('red', `✗ ${req.name} 필요 - 설치해주세요`);
            process.exit(1);
        }
    });
}

// Bubblewrap CLI 설치 확인
function checkBubblewrap() {
    try {
        execSync('bubblewrap --version', { stdio: 'pipe' });
        log('green', '✓ Bubblewrap CLI 설치됨');
    } catch {
        log('yellow', '! Bubblewrap CLI 설치 중...');
        execSync('npm install -g @bubblewrap/cli', { stdio: 'inherit' });
        log('green', '✅ Bubblewrap CLI 설치 완료');
    }
}

// TWA 매니페스트 생성
function generateTwaManifest() {
    const twaManifest = {
        packageId: CONFIG.packageId,
        host: CONFIG.domain,
        name: CONFIG.appName,
        launcherName: CONFIG.launcherName,
        display: 'standalone',
        themeColor: CONFIG.themeColor,
        navigationColor: '#000000',
        backgroundColor: CONFIG.backgroundColor,
        enableNotifications: true,
        startUrl: '/',
        iconUrl: `https://${CONFIG.domain}/icons/icon-512x512.png`,
        maskableIconUrl: `https://${CONFIG.domain}/icons/icon-512x512-maskable.png`,
        monochromeIconUrl: `https://${CONFIG.domain}/icons/icon-512x512-monochrome.png`,
        splashScreenFadeOutDuration: 300,
        signingKey: {
            path: './android.keystore',
            alias: 'android'
        },
        appVersionName: CONFIG.version,
        appVersionCode: CONFIG.versionCode,
        shortcuts: [
            {
                name: '견적 신청',
                short_name: '견적신청',
                url: '/#consultation',
                icon: `https://${CONFIG.domain}/icons/shortcut-consultation.png`
            },
            {
                name: '채팅 상담',
                short_name: '채팅',
                url: '/chat.html',
                icon: `https://${CONFIG.domain}/icons/shortcut-chat.png`
            }
        ],
        generatorApp: 'bubblewrap-cli',
        webManifestUrl: CONFIG.manifestUrl,
        fallbackType: 'customtabs',
        features: {
            locationDelegation: {
                enabled: true
            },
            playBilling: {
                enabled: false
            }
        },
        alphaDependencies: {
            enabled: false
        },
        enableSiteSettingsShortcut: true,
        isChromeOSOnly: false,
        isMetaQuest: false,
        minSdkVersion: 24,
        targetSdkVersion: 34,
        compileSdkVersion: 34
    };

    fs.writeFileSync('twa-manifest.json', JSON.stringify(twaManifest, null, 2));
    log('green', '📄 twa-manifest.json 생성 완료');
}

// 키스토어 생성 (존재하지 않는 경우)
function createKeystore() {
    if (fs.existsSync('android.keystore')) {
        log('yellow', '! 키스토어가 이미 존재합니다');
        return;
    }

    log('blue', '🔐 키스토어 생성 중...');
    log('yellow', '⚠️  다음 정보를 입력하세요:');
    console.log('   비밀번호: [안전한 비밀번호]');
    console.log('   이름과 성: BeautyCat Team');
    console.log('   조직 단위: Development');
    console.log('   조직: BeautyCat');
    console.log('   시 또는 지역: Seoul');
    console.log('   시/도: Seoul');
    console.log('   국가 코드: KR');
    
    execSync('keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000', { stdio: 'inherit' });
}

// PWA 유효성 검사
function validatePWA() {
    log('blue', '🔍 PWA 매니페스트 검증 중...');
    execSync(`bubblewrap validate --url https://${CONFIG.domain}`, { stdio: 'inherit' });
}

// Bubblewrap 프로젝트 초기화
function initBubblewrap() {
    if (fs.existsSync('app')) {
        log('yellow', '! Bubblewrap 프로젝트가 이미 존재합니다');
        return;
    }

    execSync(`bubblewrap init --manifest ${CONFIG.manifestUrl}`, { stdio: 'inherit' });
}

// Android 앱 빌드
function buildApp() {
    const buildType = process.argv.includes('--release') ? 'release' : 'debug';
    
    log('blue', `🏗️  ${buildType} 빌드 실행 중...`);
    
    if (buildType === 'release') {
        execSync('bubblewrap build --skipPwaValidation', { stdio: 'inherit' });
        log('green', '🎉 릴리스 AAB/APK 생성 완료!');
        log('blue', '📦 생성된 파일:');
        console.log('   • app-release.aab (Google Play 업로드용)');
        console.log('   • app-release.apk (직접 설치용)');
    } else {
        execSync('bubblewrap build', { stdio: 'inherit' });
        log('green', '🧪 디버그 APK 생성 완료!');
        log('blue', '📦 생성된 파일:');
        console.log('   • app-debug.apk (테스트용)');
    }
}

// 빌드 후 정보 표시
function showBuildInfo() {
    log('blue', '\n📋 빌드 정보:');
    console.log(`   앱 이름: ${CONFIG.launcherName}`);
    console.log(`   패키지 ID: ${CONFIG.packageId}`);
    console.log(`   버전: ${CONFIG.version} (${CONFIG.versionCode})`);
    console.log(`   도메인: ${CONFIG.domain}`);
    console.log(`   매니페스트: ${CONFIG.manifestUrl}`);
    
    log('blue', '\n📤 다음 단계:');
    console.log('   1. Google Play Console에서 새 앱 만들기');
    console.log('   2. app-release.aab 파일 업로드');
    console.log('   3. 스토어 정보 입력 (설명, 스크린샷)');
    console.log('   4. 내부 테스트 후 프로덕션 출시');
    
    log('green', '\n🎊 BeautyCat Android 앱 빌드 완료!');
}

// 메인 실행
function main() {
    step('필수 도구 확인', checkRequirements);
    step('Bubblewrap CLI 확인', checkBubblewrap);
    step('TWA 매니페스트 생성', generateTwaManifest);
    step('키스토어 생성', createKeystore);
    step('PWA 유효성 검사', validatePWA);
    step('Bubblewrap 프로젝트 초기화', initBubblewrap);
    step('Android 앱 빌드', buildApp);
    
    showBuildInfo();
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { main, CONFIG };