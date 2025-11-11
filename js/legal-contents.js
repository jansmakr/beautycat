// 법적 문서 콘텐츠
// index.html 파일 크기 감소를 위해 별도 파일로 분리

const legalContents = {
    // 이용약관 내용
    terms: `
        <div class="space-y-6">
            <p class="text-sm text-gray-500">최종 수정일: 2025년 1월 1일 | 시행일: 2025년 1월 1일</p>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제1조 (목적)</h3>
                <p>본 약관은 k-beautics(이하 "회사")가 운영하는 beautycat 플랫폼(이하 "서비스")의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제2조 (용어의 정의)</h3>
                <p class="mb-2">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
                <ul class="list-disc pl-6 space-y-1">
                    <li><strong>"서비스":</strong> 회사가 제공하는 피부관리실 검색, 상담, 예약 등의 온라인 플랫폼 서비스</li>
                    <li><strong>"회원":</strong> 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자</li>
                    <li><strong>"고객":</strong> 피부관리 서비스를 이용하고자 하는 일반 소비자 회원</li>
                    <li><strong>"업체":</strong> 피부관리실을 운영하며 플랫폼에 입점한 사업자 회원</li>
                    <li><strong>"아이디(ID)":</strong> 회원의 식별과 서비스 이용을 위해 회원이 설정하고 회사가 승인한 이메일 주소</li>
                </ul>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제3조 (약관의 효력 및 변경)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.</li>
                    <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
                    <li>약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 공지합니다.</li>
                    <li>회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제4조 (회원가입)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>회원가입은 이용자가 약관의 내용에 동의하고 회원가입 신청을 한 후 회사가 이를 승낙함으로써 체결됩니다.</li>
                    <li>회원가입 시 제공하는 모든 정보는 실제 데이터로 작성해야 하며, 허위 정보 기재 시 법적 보호를 받을 수 없습니다.</li>
                    <li>만 14세 미만은 회원가입이 제한되며, 법정대리인의 동의가 필요합니다.</li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제5조 (서비스의 제공)</h3>
                <p class="mb-2">회사는 다음과 같은 서비스를 제공합니다.</p>
                <ul class="list-disc pl-6 space-y-1">
                    <li>피부관리실 정보 검색 및 비교</li>
                    <li>피부관리실 상담 신청 및 견적 비교</li>
                    <li>고객과 업체 간 매칭 서비스</li>
                    <li>리뷰 및 평가 서비스</li>
                    <li>기타 회사가 정하는 부가 서비스</li>
                </ul>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제6조 (회원의 의무)</h3>
                <p class="mb-2">회원은 다음 행위를 하여서는 안 됩니다.</p>
                <ul class="list-disc pl-6 space-y-1">
                    <li>신청 또는 변경 시 허위내용 등록</li>
                    <li>타인의 정보 도용</li>
                    <li>회사가 게시한 정보의 변경</li>
                    <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 송신 또는 게시</li>
                    <li>회사와 기타 제3자의 저작권 등 지적재산권 침해</li>
                    <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                </ul>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제7조 (서비스 이용의 제한)</h3>
                <p>회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</p>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제8조 (면책조항)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
                    <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
                    <li>회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다.</li>
                    <li>회사는 고객과 업체 간 발생한 분쟁에 대해 중재 의무는 없으며, 이로 인한 손해를 배상할 책임이 없습니다.</li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제9조 (분쟁 해결)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>회사는 회원으로부터 제출되는 불만사항 및 의견을 우선적으로 처리합니다.</li>
                    <li>회사와 회원 간 발생한 분쟁은 전자문서 및 전자거래 기본법에 따른 전자문서·전자거래분쟁조정위원회에 조정을 신청할 수 있습니다.</li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제10조 (준거법 및 재판관할)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>회사와 회원 간 제기된 소송은 대한민국법을 준거법으로 합니다.</li>
                    <li>회사와 회원 간 발생한 분쟁에 관한 소송은 서울중앙지방법원을 관할 법원으로 합니다.</li>
                </ol>
            </section>
            
            <div class="mt-8 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-500">부칙: 본 약관은 2025년 1월 1일부터 시행합니다.</p>
            </div>
        </div>
    `,

    // 개인정보처리방침 내용
    privacy: `
        <div class="space-y-6">
            <p class="text-sm text-gray-500">최종 수정일: 2025년 1월 1일 | 시행일: 2025년 1월 1일</p>
            
            <section>
                <p class="font-semibold mb-2">k-beautics(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제1조 (개인정보의 처리 목적)</h3>
                <p class="mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                
                <div class="ml-4 space-y-3">
                    <div>
                        <p class="font-semibold">1. 회원가입 및 관리</p>
                        <p class="text-sm">회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적</p>
                    </div>
                    
                    <div>
                        <p class="font-semibold">2. 피부관리 상담 및 매칭 서비스 제공</p>
                        <p class="text-sm">고객과 피부관리실 간 상담 신청, 견적 비교, 업체 매칭, 서비스 이용 내역 관리</p>
                    </div>
                    
                    <div>
                        <p class="font-semibold">3. 고충처리</p>
                        <p class="text-sm">민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보</p>
                    </div>
                    
                    <div>
                        <p class="font-semibold">4. 마케팅 및 광고 활용</p>
                        <p class="text-sm">신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 (선택적 동의 사항)</p>
                    </div>
                </div>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제2조 (개인정보의 처리 및 보유 기간)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
                    <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
                        <ul class="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>회원정보:</strong> 회원 탈퇴 시까지 (단, 관계법령 위반에 따른 수사·조사 등이 진행중인 경우 해당 수사·조사 종료 시까지)</li>
                            <li><strong>상담 및 견적 정보:</strong> 서비스 이용 종료 후 5년</li>
                            <li><strong>대금결제 및 재화 등의 공급에 관한 기록:</strong> 5년 (전자상거래법)</li>
                            <li><strong>소비자 불만 또는 분쟁처리 기록:</strong> 3년 (전자상거래법)</li>
                        </ul>
                    </li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제3조 (처리하는 개인정보의 항목)</h3>
                
                <div class="space-y-3">
                    <div>
                        <p class="font-semibold">1. 필수 항목 (고객 회원)</p>
                        <p class="text-sm">이메일 주소, 비밀번호, 이름, 휴대전화번호</p>
                    </div>
                    
                    <div>
                        <p class="font-semibold">2. 필수 항목 (업체 회원)</p>
                        <p class="text-sm">이메일 주소, 비밀번호, 업체명, 대표자명, 사업자등록번호, 주소, 전화번호</p>
                    </div>
                    
                    <div>
                        <p class="font-semibold">3. 선택 항목</p>
                        <p class="text-sm">마케팅 수신 동의 여부</p>
                    </div>
                    
                    <div>
                        <p class="font-semibold">4. 자동 수집 항목</p>
                        <p class="text-sm">IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</p>
                    </div>
                </div>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제4조 (개인정보의 제3자 제공)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</li>
                    <li>회사는 다음과 같이 개인정보를 제3자에게 제공하고 있습니다:
                        <ul class="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>제공받는 자:</strong> 상담 신청한 피부관리실</li>
                            <li><strong>제공 목적:</strong> 고객 상담 및 견적 제공</li>
                            <li><strong>제공 항목:</strong> 이름, 휴대전화번호, 상담 희망 지역</li>
                            <li><strong>보유 기간:</strong> 상담 종료 후 1년</li>
                        </ul>
                    </li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제5조 (개인정보의 파기)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</li>
                    <li>파기 절차 및 방법은 다음과 같습니다:
                        <ul class="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>파기절차:</strong> 불필요한 개인정보는 개인정보 보호책임자의 승인 후 파기합니다.</li>
                            <li><strong>파기방법:</strong> 전자적 파일 형태는 복구 불가능한 방법으로 영구 삭제하고, 종이 문서는 분쇄기로 분쇄하거나 소각합니다.</li>
                        </ul>
                    </li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제6조 (정보주체의 권리·의무 및 행사방법)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</li>
                    <li>권리 행사는 회사에 대해 「개인정보 보호법」 시행규칙 별지 제8호 서식에 따라 서면, 전자우편 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</li>
                    <li>정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제7조 (개인정보 보호책임자)</h3>
                <p class="mb-2">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                
                <div class="bg-gray-50 p-4 rounded-lg mt-3">
                    <p class="font-semibold mb-2">개인정보 보호책임자</p>
                    <ul class="text-sm space-y-1">
                        <li><strong>성명:</strong> 박지원</li>
                        <li><strong>연락처:</strong> 0507-1310-5873</li>
                        <li><strong>이메일:</strong> utuber@kakao.com</li>
                    </ul>
                </div>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제8조 (권익침해 구제방법)</h3>
                <p class="mb-2">정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
                
                <ul class="space-y-2 text-sm">
                    <li>• 개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                    <li>• 개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
                    <li>• 대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
                    <li>• 경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
                </ul>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제9조 (개인정보 처리방침 변경)</h3>
                <p>이 개인정보처리방침은 2025년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
            </section>
            
            <div class="mt-8 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-500">부칙: 본 방침은 2025년 1월 1일부터 시행합니다.</p>
            </div>
        </div>
    `,

    // 청소년보호정책 내용
    youth: `
        <div class="space-y-6">
            <p class="text-sm text-gray-500">최종 수정일: 2025년 1월 1일 | 시행일: 2025년 1월 1일</p>
            
            <section>
                <p class="font-semibold mb-2">k-beautics(이하 "회사")는 청소년이 건전한 인격체로 성장할 수 있도록 「청소년 보호법」에 근거하여 청소년보호정책을 수립·시행하고 있습니다.</p>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제1조 (목적)</h3>
                <p>본 정책은 청소년(만 19세 미만의 자)이 유해정보로부터 보호받고 건전한 인터넷 이용 환경을 조성하기 위한 회사의 청소년보호 관련 제반 활동을 규정함을 목적으로 합니다.</p>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제2조 (청소년 유해정보 차단)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>회사는 청소년에게 유해한 정보가 노출되지 않도록 다음과 같은 조치를 취합니다:
                        <ul class="list-disc pl-6 mt-2 space-y-1">
                            <li>청소년 유해 매체물에 대한 필터링 시스템 운영</li>
                            <li>회원 게시물에 대한 모니터링 및 유해정보 삭제</li>
                            <li>유해정보 신고센터 운영</li>
                        </ul>
                    </li>
                    <li>회사는 정보통신망을 통하여 유통되는 청소년 유해정보에 대하여 청소년 접근을 제한하는 조치를 취합니다.</li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제3조 (청소년 유해정보의 범위)</h3>
                <p class="mb-2">회사는 다음과 같은 정보를 청소년 유해정보로 규정합니다:</p>
                <ul class="list-disc pl-6 space-y-1">
                    <li>청소년에게 성적인 욕구를 자극하는 선정적이거나 음란한 내용의 정보</li>
                    <li>청소년에게 포악성이나 범죄의 충동을 일으킬 수 있는 내용의 정보</li>
                    <li>성폭력, 학대, 약물 등을 미화하거나 조장하는 내용의 정보</li>
                    <li>청소년의 건전한 인격과 시민의식 형성을 저해하는 내용의 정보</li>
                    <li>기타 청소년의 정신적·신체적 건강에 해를 끼칠 우려가 있는 내용의 정보</li>
                </ul>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제4조 (청소년 회원가입 제한)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>본 서비스는 만 14세 이상만 회원가입이 가능합니다.</li>
                    <li>만 14세 미만 청소년의 경우 법정대리인(부모 등)의 동의를 받아야 회원가입이 가능합니다.</li>
                    <li>회사는 청소년 회원의 개인정보 수집 시 법정대리인의 동의 여부를 확인합니다.</li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제5조 (청소년보호책임자)</h3>
                <p class="mb-2">회사는 청소년보호 업무를 담당하는 청소년보호책임자를 다음과 같이 지정합니다:</p>
                
                <div class="bg-gray-50 p-4 rounded-lg mt-3">
                    <p class="font-semibold mb-2">청소년보호책임자</p>
                    <ul class="text-sm space-y-1">
                        <li><strong>성명:</strong> 박지원</li>
                        <li><strong>소속/직위:</strong> 개인정보처리담당자</li>
                        <li><strong>연락처:</strong> 0507-1310-5873</li>
                        <li><strong>이메일:</strong> utuber@kakao.com</li>
                    </ul>
                </div>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제6조 (유해정보 신고)</h3>
                <ol class="list-decimal pl-6 space-y-2">
                    <li>청소년 유해정보를 발견하신 경우 아래의 방법으로 신고해 주시기 바랍니다:
                        <ul class="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>이메일:</strong> utuber@kakao.com</li>
                            <li><strong>전화:</strong> 0507-1310-5873</li>
                        </ul>
                    </li>
                    <li>신고된 유해정보는 24시간 이내에 검토 후 삭제 등의 조치를 취합니다.</li>
                </ol>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제7조 (청소년 보호를 위한 교육)</h3>
                <p>회사는 청소년보호책임자 및 담당자에게 청소년보호 관련 법령 및 제도에 대한 교육을 정기적으로 실시합니다.</p>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제8조 (청소년보호정책 시행 및 변경)</h3>
                <p>본 청소년보호정책은 2025년 1월 1일부터 시행되며, 법령 및 정책에 따라 변경사항이 있을 경우 웹사이트를 통해 공지합니다.</p>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">제9조 (청소년보호 관련 기관)</h3>
                <p class="mb-2">청소년보호와 관련하여 상담이 필요한 경우 아래 기관에 문의하실 수 있습니다:</p>
                <ul class="space-y-2 text-sm">
                    <li>• 방송통신심의위원회 (www.kocsc.or.kr / 02-3219-5000)</li>
                    <li>• 한국인터넷진흥원 (www.kisa.or.kr / 국번없이 118)</li>
                    <li>• 청소년사이버상담센터 (www.cyber1388.kr / 국번없이 1388)</li>
                    <li>• 경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)</li>
                </ul>
            </section>
            
            <div class="mt-8 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-500">부칙: 본 정책은 2025년 1월 1일부터 시행합니다.</p>
            </div>
        </div>
    `,

    // 사업자정보확인 내용
    business: `
        <div class="space-y-6">
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">사업자 정보</h3>
                
                <div class="bg-gray-50 p-6 rounded-lg space-y-3">
                    <div class="flex border-b border-gray-200 pb-3">
                        <span class="font-semibold text-gray-900 w-48">상호(법인명)</span>
                        <span class="text-gray-700">k-beautics</span>
                    </div>
                    
                    <div class="flex border-b border-gray-200 pb-3">
                        <span class="font-semibold text-gray-900 w-48">사업자등록번호</span>
                        <span class="text-gray-700">693-47-00786</span>
                    </div>
                    
                    <div class="flex border-b border-gray-200 pb-3">
                        <span class="font-semibold text-gray-900 w-48">통신판매업 신고번호</span>
                        <span class="text-gray-700">제 2025-서울강서-2423호</span>
                    </div>
                    
                    <div class="flex border-b border-gray-200 pb-3">
                        <span class="font-semibold text-gray-900 w-48">대표자명</span>
                        <span class="text-gray-700">박지원</span>
                    </div>
                    
                    <div class="flex border-b border-gray-200 pb-3">
                        <span class="font-semibold text-gray-900 w-48">사업장 소재지</span>
                        <span class="text-gray-700">서울 강서구 허준로198, 가양프라자 4층 406-03호 10호</span>
                    </div>
                    
                    <div class="flex border-b border-gray-200 pb-3">
                        <span class="font-semibold text-gray-900 w-48">대표전화</span>
                        <span class="text-gray-700">0507-1310-5873</span>
                    </div>
                    
                    <div class="flex border-b border-gray-200 pb-3">
                        <span class="font-semibold text-gray-900 w-48">이메일</span>
                        <span class="text-gray-700">utuber@kakao.com</span>
                    </div>
                    
                    <div class="flex">
                        <span class="font-semibold text-gray-900 w-48">개인정보처리담당자</span>
                        <span class="text-gray-700">박지원</span>
                    </div>
                </div>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">사업 내용</h3>
                <div class="bg-gray-50 p-6 rounded-lg">
                    <ul class="space-y-2 text-gray-700">
                        <li>• 피부관리실 정보 제공 및 상담 중개 서비스</li>
                        <li>• 피부관리 예약 및 견적 비교 플랫폼 운영</li>
                        <li>• 피부관리 관련 정보 제공 서비스</li>
                        <li>• 온라인 마케팅 및 광고 대행</li>
                    </ul>
                </div>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">사업자 등록 확인</h3>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p class="text-sm text-gray-700 mb-3">
                        사업자등록번호의 진위 여부는 국세청 홈택스에서 확인하실 수 있습니다.
                    </p>
                    <a href="https://www.hometax.go.kr" target="_blank" rel="noopener noreferrer" 
                       class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                        국세청 홈택스 바로가기
                    </a>
                </div>
            </section>
            
            <section>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">통신판매업 신고 확인</h3>
                <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p class="text-sm text-gray-700 mb-3">
                        통신판매업 신고번호는 공정거래위원회 전자문서·전자거래분쟁조정위원회에서 확인하실 수 있습니다.
                    </p>
                    <a href="https://www.ftc.go.kr" target="_blank" rel="noopener noreferrer" 
                       class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                        공정거래위원회 바로가기
                    </a>
                </div>
            </section>
            
            <section class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">📌 고객센터 안내</h4>
                <p class="text-sm text-gray-700 mb-2">
                    사업자 정보 관련 문의사항이나 분쟁이 발생한 경우 아래로 연락 주시기 바랍니다.
                </p>
                <ul class="text-sm text-gray-700 space-y-1">
                    <li><strong>전화:</strong> 0507-1310-5873</li>
                    <li><strong>이메일:</strong> utuber@kakao.com</li>
                </ul>
            </section>
            
            <div class="mt-8 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-500">최종 업데이트: 2025년 1월 1일</p>
            </div>
        </div>
    `
};

// 전역에서 접근 가능하도록 export
if (typeof window !== 'undefined') {
    window.legalContents = legalContents;
}
