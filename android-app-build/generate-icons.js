#!/usr/bin/env node

/**
 * BeautyCat Android 앱 아이콘 생성기
 * 512x512 마스터 아이콘에서 모든 크기의 아이콘을 자동 생성
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 아이콘 크기 정의
const ICON_SIZES = [
    { size: 72, name: 'icon-72x72.png', density: 'mdpi' },
    { size: 96, name: 'icon-96x96.png', density: 'hdpi' },
    { size: 128, name: 'icon-128x128.png', density: 'xhdpi' },
    { size: 144, name: 'icon-144x144.png', density: 'xxhdpi' },
    { size: 152, name: 'icon-152x152.png', density: 'xxhdpi' },
    { size: 192, name: 'icon-192x192.png', density: 'xxxhdpi' },
    { size: 384, name: 'icon-384x384.png', density: 'xxxhdpi' },
    { size: 512, name: 'icon-512x512.png', density: 'xxxhdpi' }
];

// Android 런처 아이콘 크기
const LAUNCHER_ICONS = [
    { size: 48, folder: 'mipmap-mdpi' },
    { size: 72, folder: 'mipmap-hdpi' },
    { size: 96, folder: 'mipmap-xhdpi' },
    { size: 144, folder: 'mipmap-xxhdpi' },
    { size: 192, folder: 'mipmap-xxxhdpi' }
];

// 색상 정의
const COLORS = {
    primary: '#ec4899',
    background: '#ffffff',
    text: '#1f2937'
};

class IconGenerator {
    constructor() {
        this.outputDir = './icons';
        this.androidDir = './android-icons';
        this.masterIconPath = './beautycat-master-icon.svg';
        
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.outputDir, this.androidDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // SVG 마스터 아이콘 생성
    async generateMasterIcon() {
        const svg = `
        <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#f472b6;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow">
                    <feDropShadow dx="4" dy="4" stdDeviation="8" flood-opacity="0.3"/>
                </filter>
            </defs>
            
            <!-- 배경 원 -->
            <circle cx="256" cy="256" r="240" fill="url(#gradient)" filter="url(#shadow)"/>
            
            <!-- 고양이 얼굴 -->
            <ellipse cx="256" cy="280" rx="120" ry="100" fill="${COLORS.background}"/>
            
            <!-- 고양이 귀 -->
            <path d="M 180 200 L 200 150 L 230 180 Z" fill="${COLORS.background}"/>
            <path d="M 282 180 L 312 150 L 332 200 Z" fill="${COLORS.background}"/>
            <path d="M 190 175 L 205 160 L 215 180 Z" fill="${COLORS.primary}"/>
            <path d="M 297 180 L 307 160 L 322 175 Z" fill="${COLORS.primary}"/>
            
            <!-- 고양이 눈 -->
            <ellipse cx="220" cy="260" rx="15" ry="25" fill="${COLORS.text}"/>
            <ellipse cx="292" cy="260" rx="15" ry="25" fill="${COLORS.text}"/>
            <ellipse cx="220" cy="255" rx="8" ry="15" fill="${COLORS.background}"/>
            <ellipse cx="292" cy="255" rx="8" ry="15" fill="${COLORS.background}"/>
            
            <!-- 고양이 코 -->
            <path d="M 256 290 L 248 300 L 264 300 Z" fill="${COLORS.primary}"/>
            
            <!-- 고양이 입 -->
            <path d="M 256 300 Q 240 320 220 315" stroke="${COLORS.text}" stroke-width="3" fill="none"/>
            <path d="M 256 300 Q 272 320 292 315" stroke="${COLORS.text}" stroke-width="3" fill="none"/>
            
            <!-- 수염 -->
            <line x1="180" y1="285" x2="140" y2="280" stroke="${COLORS.text}" stroke-width="2"/>
            <line x1="180" y1="300" x2="140" y2="305" stroke="${COLORS.text}" stroke-width="2"/>
            <line x1="332" y1="285" x2="372" y2="280" stroke="${COLORS.text}" stroke-width="2"/>
            <line x1="332" y1="300" x2="372" y2="305" stroke="${COLORS.text}" stroke-width="2"/>
            
            <!-- BeautyCat 텍스트 -->
            <text x="256" y="420" font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
                  text-anchor="middle" fill="${COLORS.background}">BeautyCat</text>
        </svg>`;

        fs.writeFileSync(this.masterIconPath, svg);
        console.log('✅ 마스터 SVG 아이콘 생성 완료');
    }

    // PWA 아이콘 생성
    async generatePWAIcons() {
        console.log('🎨 PWA 아이콘 생성 중...');

        for (const icon of ICON_SIZES) {
            const outputPath = path.join(this.outputDir, icon.name);
            
            await sharp(this.masterIconPath)
                .resize(icon.size, icon.size)
                .png()
                .toFile(outputPath);
                
            console.log(`✓ ${icon.name} (${icon.size}x${icon.size}) 생성됨`);
        }
    }

    // Maskable 아이콘 생성 (Safe area 고려)
    async generateMaskableIcon() {
        console.log('🎭 Maskable 아이콘 생성 중...');
        
        const maskableSvg = `
        <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" fill="${COLORS.primary}"/>
            <circle cx="256" cy="256" r="180" fill="${COLORS.background}"/>
            
            <!-- 고양이 얼굴 (축소) -->
            <ellipse cx="256" cy="270" rx="90" ry="75" fill="${COLORS.primary}"/>
            
            <!-- 고양이 귀 -->
            <path d="M 200 220 L 215 180 L 235 210 Z" fill="${COLORS.primary}"/>
            <path d="M 277 210 L 297 180 L 312 220 Z" fill="${COLORS.primary}"/>
            
            <!-- 고양이 눈 -->
            <ellipse cx="230" cy="255" rx="12" ry="18" fill="${COLORS.background}"/>
            <ellipse cx="282" cy="255" rx="12" ry="18" fill="${COLORS.background}"/>
            
            <!-- 고양이 코 -->
            <path d="M 256 275 L 250 285 L 262 285 Z" fill="${COLORS.background}"/>
            
            <!-- 고양이 입 -->
            <path d="M 256 285 Q 245 300 230 297" stroke="${COLORS.background}" stroke-width="2" fill="none"/>
            <path d="M 256 285 Q 267 300 282 297" stroke="${COLORS.background}" stroke-width="2" fill="none"/>
        </svg>`;

        fs.writeFileSync('./beautycat-maskable.svg', maskableSvg);
        
        await sharp('./beautycat-maskable.svg')
            .resize(512, 512)
            .png()
            .toFile(path.join(this.outputDir, 'icon-512x512-maskable.png'));
            
        console.log('✅ Maskable 아이콘 생성 완료');
    }

    // Monochrome 아이콘 생성
    async generateMonochromeIcon() {
        console.log('⚫ Monochrome 아이콘 생성 중...');
        
        const monoSvg = `
        <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <!-- 고양이 얼굴 -->
            <ellipse cx="256" cy="280" rx="120" ry="100" fill="currentColor"/>
            
            <!-- 고양이 귀 -->
            <path d="M 180 200 L 200 150 L 230 180 Z" fill="currentColor"/>
            <path d="M 282 180 L 312 150 L 332 200 Z" fill="currentColor"/>
            
            <!-- 고양이 눈 (흰색 구멍) -->
            <ellipse cx="220" cy="260" rx="15" ry="25" fill="white"/>
            <ellipse cx="292" cy="260" rx="15" ry="25" fill="white"/>
            
            <!-- 고양이 코 -->
            <path d="M 256 290 L 248 300 L 264 300 Z" fill="white"/>
        </svg>`;

        fs.writeFileSync('./beautycat-monochrome.svg', monoSvg);
        
        await sharp('./beautycat-monochrome.svg')
            .resize(512, 512)
            .png()
            .toFile(path.join(this.outputDir, 'icon-512x512-monochrome.png'));
            
        console.log('✅ Monochrome 아이콘 생성 완료');
    }

    // Android 런처 아이콘 생성
    async generateAndroidIcons() {
        console.log('🤖 Android 런처 아이콘 생성 중...');

        for (const icon of LAUNCHER_ICONS) {
            const folderPath = path.join(this.androidDir, icon.folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            
            const outputPath = path.join(folderPath, 'ic_launcher.png');
            
            await sharp(this.masterIconPath)
                .resize(icon.size, icon.size)
                .png()
                .toFile(outputPath);
                
            console.log(`✓ Android ${icon.folder}/ic_launcher.png (${icon.size}x${icon.size})`);
        }
    }

    // 바로가기 아이콘 생성
    async generateShortcutIcons() {
        console.log('🔗 바로가기 아이콘 생성 중...');

        const shortcuts = [
            { name: 'shortcut-consultation.png', emoji: '💬', color: '#3b82f6' },
            { name: 'shortcut-chat.png', emoji: '💭', color: '#10b981' },
            { name: 'shortcut-phone.png', emoji: '📞', color: '#f59e0b' }
        ];

        for (const shortcut of shortcuts) {
            const svg = `
            <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                <circle cx="48" cy="48" r="44" fill="${shortcut.color}"/>
                <text x="48" y="58" font-size="40" text-anchor="middle">${shortcut.emoji}</text>
            </svg>`;
            
            const tempSvg = `./temp-${shortcut.name}.svg`;
            fs.writeFileSync(tempSvg, svg);
            
            await sharp(tempSvg)
                .resize(96, 96)
                .png()
                .toFile(path.join(this.outputDir, shortcut.name));
                
            fs.unlinkSync(tempSvg);
            console.log(`✓ ${shortcut.name} 생성됨`);
        }
    }

    // 전체 실행
    async generate() {
        console.log('🎨 BeautyCat 아이콘 생성기 시작...\n');

        try {
            await this.generateMasterIcon();
            await this.generatePWAIcons();
            await this.generateMaskableIcon();
            await this.generateMonochromeIcon();
            await this.generateAndroidIcons();
            await this.generateShortcutIcons();
            
            console.log('\n🎉 모든 아이콘 생성 완료!');
            console.log('\n📁 생성된 파일:');
            console.log('├── icons/ (PWA 아이콘)');
            console.log('└── android-icons/ (Android 런처 아이콘)');
            
        } catch (error) {
            console.error('❌ 아이콘 생성 실패:', error.message);
            process.exit(1);
        } finally {
            // 임시 파일 정리
            [this.masterIconPath, './beautycat-maskable.svg', './beautycat-monochrome.svg']
                .forEach(file => {
                    if (fs.existsSync(file)) {
                        fs.unlinkSync(file);
                    }
                });
        }
    }
}

// 스크립트 실행
if (require.main === module) {
    const generator = new IconGenerator();
    generator.generate();
}

module.exports = IconGenerator;