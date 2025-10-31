#!/usr/bin/env node

/**
 * BeautyCat Android 앱 스크린샷 생성기
 * Google Play Store용 스크린샷 자동 생성
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 스크린샷 설정
const SCREENSHOT_CONFIG = {
    baseUrl: 'https://beautycat.kr',
    outputDir: './screenshots',
    devices: [
        {
            name: 'mobile',
            width: 390,
            height: 844,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true
        },
        {
            name: 'tablet-7',
            width: 800,
            height: 1280,
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true
        },
        {
            name: 'tablet-10',
            width: 1200,
            height: 1920,
            deviceScaleFactor: 1.5,
            isMobile: false,
            hasTouch: true
        }
    ],
    pages: [
        {
            path: '/',
            name: 'home',
            title: '메인 홈',
            delay: 2000,
            interactions: [
                { type: 'scroll', value: 200 }
            ]
        },
        {
            path: '/#consultation',
            name: 'consultation',
            title: '견적 신청',
            delay: 1500,
            interactions: [
                { type: 'click', selector: '#customerName', value: '김미영' },
                { type: 'click', selector: '#customerPhone', value: '010-1234-5678' }
            ]
        },
        {
            path: '/chat.html',
            name: 'chat',
            title: '실시간 채팅',
            delay: 2000,
            interactions: [
                { type: 'scroll', value: 300 }
            ]
        },
        {
            path: '/register.html',
            name: 'register',
            title: '회원가입',
            delay: 1500,
            interactions: []
        },
        {
            path: '/shop-registration.html',
            name: 'shop-registration',
            title: '업체 등록',
            delay: 1500,
            interactions: []
        }
    ]
};

class ScreenshotGenerator {
    constructor() {
        this.outputDir = SCREENSHOT_CONFIG.outputDir;
        this.ensureDirectory();
    }

    ensureDirectory() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    // 브라우저 시작
    async startBrowser() {
        console.log('🚀 브라우저 시작 중...');
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
    }

    // 페이지 스크린샷 생성
    async capturePageScreenshot(device, pageConfig) {
        const page = await this.browser.newPage();
        
        try {
            // 디바이스 설정
            await page.setViewport({
                width: device.width,
                height: device.height,
                deviceScaleFactor: device.deviceScaleFactor,
                isMobile: device.isMobile,
                hasTouch: device.hasTouch
            });

            // User Agent 설정
            if (device.isMobile) {
                await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1');
            }

            // 페이지 로드
            const url = `${SCREENSHOT_CONFIG.baseUrl}${pageConfig.path}`;
            console.log(`📸 ${pageConfig.title} (${device.name}) 캡처 중: ${url}`);

            await page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // 페이지 로딩 대기
            await page.waitForTimeout(pageConfig.delay);

            // 상호작용 실행
            for (const interaction of pageConfig.interactions || []) {
                await this.executeInteraction(page, interaction);
            }

            // 스크린샷 캡처
            const filename = `${device.name}-${pageConfig.name}.png`;
            const outputPath = path.join(this.outputDir, filename);

            await page.screenshot({
                path: outputPath,
                fullPage: false,
                type: 'png',
                quality: 100
            });

            console.log(`✅ ${filename} 저장됨`);

        } catch (error) {
            console.error(`❌ ${pageConfig.title} (${device.name}) 캡처 실패:`, error.message);
        } finally {
            await page.close();
        }
    }

    // 페이지 상호작용 실행
    async executeInteraction(page, interaction) {
        try {
            switch (interaction.type) {
                case 'click':
                    if (interaction.selector) {
                        await page.waitForSelector(interaction.selector, { timeout: 5000 });
                        await page.click(interaction.selector);
                        if (interaction.value) {
                            await page.type(interaction.selector, interaction.value);
                        }
                    }
                    break;

                case 'scroll':
                    await page.evaluate((scrollValue) => {
                        window.scrollBy(0, scrollValue);
                    }, interaction.value);
                    await page.waitForTimeout(1000);
                    break;

                case 'wait':
                    await page.waitForTimeout(interaction.value);
                    break;
            }
        } catch (error) {
            console.warn(`⚠️ 상호작용 실패: ${interaction.type}`, error.message);
        }
    }

    // 특수 스크린샷 생성 (로딩 상태, 성공 메시지 등)
    async captureSpecialScreenshots() {
        console.log('🎭 특수 상황 스크린샷 생성 중...');

        const page = await this.browser.newPage();
        const device = SCREENSHOT_CONFIG.devices[0]; // 모바일 사용

        await page.setViewport({
            width: device.width,
            height: device.height,
            deviceScaleFactor: device.deviceScaleFactor,
            isMobile: device.isMobile,
            hasTouch: device.hasTouch
        });

        try {
            // 성공 알림 메시지 스크린샷
            await page.goto(`${SCREENSHOT_CONFIG.baseUrl}/`, { waitUntil: 'networkidle0' });
            
            // JavaScript로 성공 메시지 표시
            await page.evaluate(() => {
                const notification = document.createElement('div');
                notification.className = 'fixed top-16 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm bg-green-100 text-green-700 border border-green-300';
                notification.innerHTML = `
                    <div class="flex items-center">
                        <i class="fas fa-check-circle mr-2"></i>
                        견적 신청이 완료되었습니다!
                    </div>
                `;
                document.body.appendChild(notification);
            });

            await page.waitForTimeout(1000);
            await page.screenshot({
                path: path.join(this.outputDir, 'mobile-success-notification.png'),
                type: 'png'
            });

            // 채팅 메시지가 있는 상태
            await page.goto(`${SCREENSHOT_CONFIG.baseUrl}/chat.html`, { waitUntil: 'networkidle0' });
            
            // 가상 채팅 메시지 추가
            await page.evaluate(() => {
                const messagesContainer = document.querySelector('#messages') || document.querySelector('.messages');
                if (messagesContainer) {
                    messagesContainer.innerHTML = `
                        <div class="message received">
                            <div class="bg-gray-100 p-3 rounded-lg mb-2">
                                <p>안녕하세요! 피부관리 상담 도움을 드릴게요 😊</p>
                                <span class="text-xs text-gray-500">강남구 뷰티살롱 • 방금전</span>
                            </div>
                        </div>
                        <div class="message sent">
                            <div class="bg-pink-500 text-white p-3 rounded-lg mb-2 ml-12">
                                <p>트러블 케어 받고 싶은데 가격이 어떻게 되나요?</p>
                                <span class="text-xs opacity-75">방금전</span>
                            </div>
                        </div>
                    `;
                }
            });

            await page.waitForTimeout(1000);
            await page.screenshot({
                path: path.join(this.outputDir, 'mobile-chat-conversation.png'),
                type: 'png'
            });

            console.log('✅ 특수 스크린샷 생성 완료');

        } catch (error) {
            console.error('❌ 특수 스크린샷 생성 실패:', error.message);
        } finally {
            await page.close();
        }
    }

    // Play Store용 제목 이미지 생성
    async generateFeatureGraphic() {
        console.log('🎨 Play Store 제목 이미지 생성 중...');

        const page = await this.browser.newPage();
        
        await page.setViewport({
            width: 1024,
            height: 500,
            deviceScaleFactor: 1
        });

        // HTML로 제목 이미지 생성
        await page.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        width: 1024px;
                        height: 500px;
                        background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbbf24 100%);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        position: relative;
                        overflow: hidden;
                    }
                    .container {
                        text-align: center;
                        z-index: 2;
                    }
                    .logo {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }
                    .title {
                        font-size: 56px;
                        font-weight: bold;
                        margin-bottom: 12px;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    }
                    .subtitle {
                        font-size: 24px;
                        opacity: 0.9;
                        margin-bottom: 20px;
                    }
                    .description {
                        font-size: 18px;
                        opacity: 0.8;
                    }
                    .decoration {
                        position: absolute;
                        opacity: 0.1;
                    }
                    .cat1 { top: 50px; left: 100px; font-size: 80px; }
                    .cat2 { bottom: 60px; right: 120px; font-size: 60px; transform: rotate(-15deg); }
                    .cat3 { top: 120px; right: 200px; font-size: 40px; }
                </style>
            </head>
            <body>
                <div class="decoration cat1">🐱</div>
                <div class="decoration cat2">💄</div>
                <div class="decoration cat3">✨</div>
                
                <div class="container">
                    <div class="logo">🐱</div>
                    <div class="title">BeautyCat</div>
                    <div class="subtitle">피부관리실 예약 플랫폼</div>
                    <div class="description">전국 피부관리실을 한눈에 비교하고 예약하세요</div>
                </div>
            </body>
            </html>
        `);

        await page.waitForTimeout(1000);
        await page.screenshot({
            path: path.join(this.outputDir, 'feature-graphic.png'),
            type: 'png',
            fullPage: true
        });

        await page.close();
        console.log('✅ Play Store 제목 이미지 생성 완료');
    }

    // 전체 스크린샷 생성
    async generateAll() {
        console.log('📸 BeautyCat 스크린샷 생성기 시작...\n');

        try {
            await this.startBrowser();

            // 각 디바이스별, 페이지별 스크린샷 생성
            for (const device of SCREENSHOT_CONFIG.devices) {
                console.log(`\n📱 ${device.name} (${device.width}x${device.height}) 스크린샷 생성 중...`);
                
                for (const pageConfig of SCREENSHOT_CONFIG.pages) {
                    await this.capturePageScreenshot(device, pageConfig);
                }
            }

            // 특수 스크린샷 생성
            await this.captureSpecialScreenshots();
            
            // Play Store 제목 이미지 생성
            await this.generateFeatureGraphic();

            console.log('\n🎉 모든 스크린샷 생성 완료!');
            this.showGeneratedFiles();

        } catch (error) {
            console.error('❌ 스크린샷 생성 실패:', error.message);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    // 생성된 파일 목록 표시
    showGeneratedFiles() {
        console.log('\n📁 생성된 스크린샷:');
        
        const files = fs.readdirSync(this.outputDir);
        files.forEach(file => {
            const stats = fs.statSync(path.join(this.outputDir, file));
            const sizeKB = Math.round(stats.size / 1024);
            console.log(`├── ${file} (${sizeKB}KB)`);
        });

        console.log('\n📋 Google Play Console 업로드 가이드:');
        console.log('├── 휴대전화 스크린샷: mobile-*.png (최소 2개)');
        console.log('├── 7인치 태블릿: tablet-7-*.png (최소 1개)');
        console.log('├── 10인치 태블릿: tablet-10-*.png (최소 1개)');
        console.log('└── 제목 이미지: feature-graphic.png (1024x500)');
    }
}

// 스크립트 실행
if (require.main === module) {
    const generator = new ScreenshotGenerator();
    generator.generateAll();
}

module.exports = ScreenshotGenerator;