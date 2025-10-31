// 뽀샵 이메일 API 서버 - SendGrid 완전 연동
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const sgMail = require('@sendgrid/mail');

const app = express();

// SendGrid API 키 설정
sgMail.setApiKey('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');

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 현재 디렉토리의 HTML 파일 서빙

// 레이트 리미팅 (이메일 발송 제한)
const emailRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5분
    max: 3, // 최대 3회
    message: {
        success: false,
        error: '너무 많은 요청입니다. 5분 후 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// 인메모리 저장소 (실제로는 Redis 사용)
const verificationCodes = new Map();

// 인증 코드 생성
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 뽀샵 브랜드 HTML 템플릿
function createEmailTemplate(code, email) {
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>뽀샵 본인인증</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;700&display=swap');
            
            body {
                margin: 0;
                padding: 0;
                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #f5f5f5;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #ff2d92 0%, #ff6b9d 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            
            .logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            
            .tagline {
                font-size: 14px;
                opacity: 0.9;
                margin: 0;
            }
            
            .content {
                padding: 40px 20px;
                text-align: center;
            }
            
            .title {
                font-size: 24px;
                font-weight: 600;
                color: #333;
                margin-bottom: 16px;
            }
            
            .description {
                font-size: 16px;
                color: #666;
                line-height: 1.5;
                margin-bottom: 32px;
            }
            
            .code-container {
                background: #f8f9fa;
                border: 2px dashed #ff2d92;
                border-radius: 12px;
                padding: 24px;
                margin: 24px 0;
            }
            
            .code-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 8px;
            }
            
            .verification-code {
                font-size: 36px;
                font-weight: 700;
                color: #ff2d92;
                letter-spacing: 4px;
                margin: 0;
                font-family: 'Courier New', monospace;
            }
            
            .cost-info {
                background: #e8f5e8;
                border-left: 4px solid #4caf50;
                padding: 16px;
                margin: 24px 0;
                border-radius: 4px;
            }
            
            .cost-text {
                font-size: 14px;
                color: #2e7d32;
                margin: 0;
                font-weight: 600;
            }
            
            .expire-info {
                background: #e3f2fd;
                border-left: 4px solid #2196f3;
                padding: 16px;
                margin: 24px 0;
                border-radius: 4px;
            }
            
            .expire-text {
                font-size: 14px;
                color: #1976d2;
                margin: 0;
            }
            
            .footer {
                background: #f8f9fa;
                padding: 24px 20px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            
            .footer-text {
                font-size: 12px;
                color: #666;
                margin: 0;
                line-height: 1.4;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">뽀샵</div>
                <p class="tagline">뽀샵이 필요 없는 진짜 피부 관리</p>
            </div>
            
            <div class="content">
                <h1 class="title">본인인증 코드가 도착했습니다</h1>
                
                <p class="description">
                    안전한 서비스 이용을 위해 아래 인증 코드를 입력해주세요.
                </p>
                
                <div class="code-container">
                    <div class="code-label">인증 코드</div>
                    <div class="verification-code">${code}</div>
                </div>
                
                <div class="cost-info">
                    <p class="cost-text">
                        💰 가성비 최적화: 기존 300원 → 5원 (98% 절약!)
                    </p>
                </div>
                
                <div class="expire-info">
                    <p class="expire-text">
                        ⏰ 이 인증 코드는 <strong>5분간 유효</strong>합니다.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p class="footer-text">
                    본 메일은 뽀샵 가성비 인증 서비스에서 발송되었습니다.<br>
                    © 2024 뽀샵. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// 📧 이메일 인증 코드 발송 API
app.post('/api/auth/email/send', emailRateLimit, async (req, res) => {
    try {
        const { email } = req.body;
        
        // 이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: '올바른 이메일 주소를 입력해주세요.'
            });
        }
        
        // 인증 코드 생성
        const verificationCode = generateVerificationCode();
        
        // SendGrid로 이메일 발송
        const msg = {
            to: email,
            from: {
                email: 'noreply@pposhop.com',
                name: '뽀샵 인증서비스'
            },
            subject: '[뽀샵] 본인인증 코드 (가성비 최적화 - 5원)',
            html: createEmailTemplate(verificationCode, email)
        };
        
        console.log('📧 SendGrid 이메일 발송 시작:', email);
        
        const result = await sgMail.send(msg);
        
        // 인증 코드 저장 (5분 후 만료)
        verificationCodes.set(email, {
            code: verificationCode,
            expiresAt: Date.now() + 5 * 60 * 1000
        });
        
        console.log('✅ SendGrid 이메일 발송 성공!');
        console.log('📊 Message ID:', result[0].headers['x-message-id']);
        
        res.json({
            success: true,
            message: '인증 코드를 이메일로 발송했습니다.',
            expires_in: 300, // 5분
            cost: 5, // 5원
            provider: 'sendgrid',
            message_id: result[0].headers['x-message-id']
        });
        
    } catch (error) {
        console.error('❌ SendGrid 이메일 발송 실패:', error);
        
        let errorMessage = '이메일 발송 중 오류가 발생했습니다.';
        
        if (error.code === 400) {
            errorMessage = '잘못된 이메일 주소입니다.';
        } else if (error.code === 401) {
            errorMessage = 'SendGrid API 인증에 실패했습니다.';
        } else if (error.code === 403) {
            errorMessage = '이메일 발송 권한이 없습니다.';
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            provider: 'sendgrid'
        });
    }
});

// 📧 이메일 인증 코드 검증 API
app.post('/api/auth/email/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: '이메일과 인증코드를 입력해주세요.'
            });
        }
        
        // 저장된 코드 확인
        const storedData = verificationCodes.get(email);
        
        if (!storedData) {
            return res.status(400).json({
                success: false,
                error: '인증 코드가 만료되었거나 존재하지 않습니다.'
            });
        }
        
        // 만료 시간 확인
        if (Date.now() > storedData.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({
                success: false,
                error: '인증 코드가 만료되었습니다.'
            });
        }
        
        // 코드 일치 확인
        if (storedData.code !== code) {
            return res.status(400).json({
                success: false,
                error: '인증 코드가 일치하지 않습니다.'
            });
        }
        
        // 인증 성공 - 코드 삭제
        verificationCodes.delete(email);
        
        console.log('✅ 이메일 인증 성공:', email);
        
        res.json({
            success: true,
            message: '이메일 인증이 완료되었습니다.',
            verified_email: email,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('이메일 인증 검증 오류:', error);
        res.status(500).json({
            success: false,
            error: '인증 검증 중 오류가 발생했습니다.'
        });
    }
});

// 📊 비용 통계 API
app.get('/api/stats/email', (req, res) => {
    const totalSent = verificationCodes.size;
    const estimatedCost = totalSent * 5;
    const traditionalCost = totalSent * 300;
    const savings = traditionalCost - estimatedCost;
    const savingsRate = traditionalCost > 0 ? Math.round((savings / traditionalCost) * 100) : 0;
    
    res.json({
        success: true,
        data: {
            total_emails_sent: totalSent,
            current_cost: estimatedCost,
            traditional_cost: traditionalCost,
            savings_amount: savings,
            savings_rate: savingsRate,
            cost_per_email: 5,
            provider: 'sendgrid'
        }
    });
});

// 🧪 테스트 이메일 발송 API
app.post('/api/test/email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: '테스트할 이메일 주소를 입력해주세요.'
            });
        }
        
        const testCode = '123456';
        
        const msg = {
            to: email,
            from: {
                email: 'noreply@pposhop.com',
                name: '뽀샵 테스트'
            },
            subject: '[뽀샵] SendGrid 연동 테스트',
            html: createEmailTemplate(testCode, email)
        };
        
        const result = await sgMail.send(msg);
        
        res.json({
            success: true,
            message: '테스트 이메일을 발송했습니다.',
            test_code: testCode,
            message_id: result[0].headers['x-message-id']
        });
        
    } catch (error) {
        console.error('테스트 이메일 발송 실패:', error);
        res.status(500).json({
            success: false,
            error: '테스트 이메일 발송에 실패했습니다.'
        });
    }
});

// 메인 페이지
app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 뽀샵 SendGrid 이메일 API 서버</h1>
        <p><strong>87% 비용 절약</strong> 가성비 최적화 이메일 인증 시스템</p>
        
        <h2>📧 API 엔드포인트</h2>
        <ul>
            <li><code>POST /api/auth/email/send</code> - 인증 이메일 발송 (5원/건)</li>
            <li><code>POST /api/auth/email/verify</code> - 인증 코드 검증</li>
            <li><code>POST /api/test/email</code> - 테스트 이메일 발송</li>
            <li><code>GET /api/stats/email</code> - 비용 통계 조회</li>
        </ul>
        
        <h2>🎯 테스트 방법</h2>
        <p>1. <a href="/cost-effective-auth.html">가성비 인증 시스템</a> 페이지에서 테스트</p>
        <p>2. 또는 직접 API 호출:</p>
        <pre>
curl -X POST http://localhost:3000/api/test/email \\
  -H "Content-Type: application/json" \\
  -d '{"email": "your-email@example.com"}'
        </pre>
        
        <h2>💰 비용 효율성</h2>
        <ul>
            <li>기존 방식: <strong>300원/건</strong></li>
            <li>SendGrid: <strong>5원/건</strong></li>
            <li>절약 효과: <strong>98% 절약!</strong></li>
        </ul>
    `);
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n🚀 뽀샵 SendGrid 이메일 API 서버 시작!');
    console.log(`📍 서버 주소: http://localhost:${PORT}`);
    console.log('💰 비용 효율성: 기존 300원 → SendGrid 5원 (98% 절약)');
    console.log('\n📧 SendGrid API 키 연동 완료!');
    console.log('🎯 테스트 페이지: http://localhost:3000/cost-effective-auth.html');
    console.log('\n📊 API 테스트 명령어:');
    console.log('curl -X POST http://localhost:3000/api/test/email -H "Content-Type: application/json" -d \'{"email": "your-email@example.com"}\'');
});

module.exports = app;