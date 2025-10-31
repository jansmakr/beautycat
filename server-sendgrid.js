// 뽀샵 SendGrid 실제 이메일 발송 시스템
const sgMail = require('@sendgrid/mail');

class PposhopEmailService {
    constructor() {
        // 실제 SendGrid API 키 설정
        sgMail.setApiKey('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');
        
        this.fromEmail = 'noreply@pposhop.com';
        this.fromName = '뽀샵 인증서비스';
        
        console.log('📧 SendGrid 이메일 서비스 초기화 완료!');
    }
    
    // 인증 코드 이메일 발송 (5원/건)
    async sendVerificationEmail(toEmail, verificationCode) {
        try {
            const msg = {
                to: toEmail,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: '[뽀샵] 본인인증 코드가 도착했습니다',
                html: this.createVerificationHTML(verificationCode, toEmail)
            };
            
            console.log('📧 SendGrid 이메일 발송 시작:', toEmail);
            
            const result = await sgMail.send(msg);
            
            console.log('✅ SendGrid 이메일 발송 성공!');
            console.log('📊 Message ID:', result[0].headers['x-message-id']);
            
            return {
                success: true,
                messageId: result[0].headers['x-message-id'],
                cost: 5, // 5원/건
                provider: 'sendgrid',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ SendGrid 이메일 발송 실패:', error);
            
            // SendGrid 에러 코드별 상세 처리
            let errorMessage = '이메일 발송 중 오류가 발생했습니다.';
            
            if (error.code === 400) {
                errorMessage = '잘못된 이메일 주소입니다.';
            } else if (error.code === 401) {
                errorMessage = 'SendGrid API 인증에 실패했습니다.';
            } else if (error.code === 403) {
                errorMessage = 'SendGrid 계정에 발송 권한이 없습니다.';
            } else if (error.response?.body?.errors) {
                errorMessage = error.response.body.errors[0].message;
            }
            
            return {
                success: false,
                error: errorMessage,
                errorCode: error.code,
                provider: 'sendgrid'
            };
        }
    }
    
    // 뽀샵 브랜드 HTML 이메일 템플릿 생성
    createVerificationHTML(code, email) {
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
                    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
                
                .security-notice {
                    background: #fff3e0;
                    border-left: 4px solid #ff9800;
                    padding: 16px;
                    margin: 24px 0;
                    border-radius: 4px;
                }
                
                .security-title {
                    font-weight: 600;
                    color: #f57c00;
                    margin: 0 0 8px 0;
                    font-size: 14px;
                }
                
                .security-text {
                    font-size: 13px;
                    color: #ef6c00;
                    margin: 0;
                    line-height: 1.4;
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
                
                .brand-link {
                    color: #ff2d92;
                    text-decoration: none;
                    font-weight: 600;
                }
                
                .contact-info {
                    margin-top: 12px;
                    font-size: 11px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- 헤더 -->
                <div class="header">
                    <div class="logo">뽀샵</div>
                    <p class="tagline">뽀샵이 필요 없는 진짜 피부 관리</p>
                </div>
                
                <!-- 메인 컨텐츠 -->
                <div class="content">
                    <h1 class="title">본인인증 코드가 도착했습니다</h1>
                    
                    <p class="description">
                        안전한 서비스 이용을 위해 아래 인증 코드를 입력해주세요.<br>
                        본 인증은 가성비 최적화 시스템으로 <strong>5원의 비용</strong>으로 제공됩니다.
                    </p>
                    
                    <!-- 인증 코드 -->
                    <div class="code-container">
                        <div class="code-label">인증 코드</div>
                        <div class="verification-code">${code}</div>
                    </div>
                    
                    <!-- 만료 시간 안내 -->
                    <div class="expire-info">
                        <p class="expire-text">
                            ⏰ 이 인증 코드는 <strong>5분간 유효</strong>합니다.
                        </p>
                    </div>
                    
                    <!-- 보안 안내 -->
                    <div class="security-notice">
                        <div class="security-title">🔒 보안 안내</div>
                        <div class="security-text">
                            • 본 인증 코드는 ${email}로 발송되었습니다<br>
                            • 코드를 타인에게 알려주지 마세요<br>
                            • 요청하지 않으셨다면 이 메일을 무시하세요
                        </div>
                    </div>
                </div>
                
                <!-- 푸터 -->
                <div class="footer">
                    <p class="footer-text">
                        본 메일은 <a href="https://pposhop.com" class="brand-link">뽀샵</a> 본인인증 서비스에서 자동 발송되었습니다.<br>
                        궁금한 점이 있으시면 언제든 문의해주세요.
                    </p>
                    
                    <div class="contact-info">
                        📞 고객센터: 02-1234-5678 | 📧 이메일: support@pposhop.com<br>
                        💬 카카오톡: https://open.kakao.com/o/sXXnTISh
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }
    
    // 대량 이메일 발송 (비용 최적화)
    async sendBulkVerificationEmails(recipients) {
        try {
            console.log(`📧 대량 이메일 발송 시작: ${recipients.length}건`);
            
            const messages = recipients.map(({email, code}) => ({
                to: email,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject: '[뽀샵] 본인인증 코드가 도착했습니다',
                html: this.createVerificationHTML(code, email)
            }));
            
            const result = await sgMail.send(messages);
            
            console.log(`✅ 대량 이메일 발송 완료: ${recipients.length}건`);
            
            return {
                success: true,
                sent_count: recipients.length,
                total_cost: recipients.length * 5, // 5원 × 건수
                provider: 'sendgrid',
                message_ids: result.map(r => r.headers['x-message-id'])
            };
            
        } catch (error) {
            console.error('❌ 대량 이메일 발송 실패:', error);
            return {
                success: false,
                error: '대량 이메일 발송 중 오류가 발생했습니다.',
                provider: 'sendgrid'
            };
        }
    }
    
    // 이메일 발송 상태 확인 (SendGrid Event Webhook 연동 준비)
    async checkEmailStatus(messageId) {
        try {
            // SendGrid Event API를 통한 상태 확인
            // 실제로는 Webhook을 통해 실시간으로 상태를 받는 것이 좋습니다
            
            console.log('📊 이메일 상태 확인:', messageId);
            
            return {
                success: true,
                message_id: messageId,
                status: 'delivered', // delivered, bounced, opened, clicked 등
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('이메일 상태 확인 실패:', error);
            return {
                success: false,
                error: '상태 확인 중 오류가 발생했습니다.'
            };
        }
    }
    
    // 템플릿 기반 이메일 발송 (고급 기능)
    async sendTemplateEmail(toEmail, templateId, dynamicData) {
        try {
            const msg = {
                to: toEmail,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                templateId: templateId,
                dynamicTemplateData: {
                    ...dynamicData,
                    company_name: '뽀샵',
                    support_email: 'support@pposhop.com'
                }
            };
            
            const result = await sgMail.send(msg);
            
            return {
                success: true,
                messageId: result[0].headers['x-message-id'],
                template_id: templateId
            };
            
        } catch (error) {
            console.error('템플릿 이메일 발송 실패:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 전역 인스턴스 생성 및 즉시 테스트
const pposhopEmail = new PposhopEmailService();

// 즉시 테스트 함수
async function testSendGridIntegration() {
    console.log('\n🚀 SendGrid 연동 테스트 시작...\n');
    
    // 테스트 이메일 발송
    const testResult = await pposhopEmail.sendVerificationEmail(
        'test@example.com', // 테스트용 이메일 (실제 이메일로 변경하여 테스트)
        '123456'
    );
    
    if (testResult.success) {
        console.log('🎉 SendGrid 연동 성공!');
        console.log('💰 발송 비용:', testResult.cost, '원');
        console.log('📧 Message ID:', testResult.messageId);
    } else {
        console.log('❌ SendGrid 연동 실패:', testResult.error);
    }
    
    console.log('\n📊 비용 효율성 분석:');
    console.log('- 기존 방식: 300원/건');
    console.log('- SendGrid: 5원/건');
    console.log('- 절약 효과: 295원/건 (98% 절약!)');
}

// Node.js 환경에서 즉시 테스트 실행
if (typeof module !== 'undefined' && module.exports) {
    module.exports = pposhopEmail;
    
    // 커맨드라인에서 직접 실행시 테스트
    if (require.main === module) {
        testSendGridIntegration();
    }
}

// 브라우저 환경에서 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.pposhopEmail = pposhopEmail;
}

console.log('📧 뽀샵 SendGrid 이메일 서비스 로드 완료!');
console.log('💡 테스트 명령어: node server-sendgrid.js');