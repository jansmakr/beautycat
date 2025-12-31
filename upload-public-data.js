/**
 * 전국 피부관리실 데이터 업로드 스크립트
 * 
 * 파일: upload-public-data.js
 * 버전: v1.0
 * 작성일: 2025-12-30
 * 
 * 기능:
 * - CSV 파일 읽기 (EUC-KR 인코딩 지원)
 * - 주소 파싱 (region, district, town)
 * - 영업중 필터링
 * - 중복 제거
 * - 배치 업로드 (1,000개씩)
 * - 진행률 표시
 * - 에러 핸들링
 */

const fs = require('fs');
const readline = require('readline');

// ============================================
// 설정
// ============================================
const CONFIG = {
  CSV_FILE: '전국피부미용실 현황251231.csv',  // CSV 파일 경로
  API_BASE_URL: '/tables',                    // API 기본 URL (상대 경로)
  TABLE_NAME: 'public_skincare_data',         // 테이블 이름
  BATCH_SIZE: 1000,                           // 배치 크기
  DELAY_MS: 100,                              // 요청 간 대기 시간 (ms)
  MAX_RETRIES: 3,                             // 최대 재시도 횟수
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * UUID 생성
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 대기 함수
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 주소 파싱 함수
 * "서울특별시 강남구 역삼동 123-45" → { region: "서울", district: "강남구", town: "역삼동" }
 */
function parseAddress(fullAddress) {
  if (!fullAddress) {
    return { region: '', district: '', town: '' };
  }

  const regionMap = {
    '서울특별시': '서울',
    '부산광역시': '부산',
    '대구광역시': '대구',
    '인천광역시': '인천',
    '광주광역시': '광주',
    '대전광역시': '대전',
    '울산광역시': '울산',
    '세종특별자치시': '세종',
    '경기도': '경기',
    '강원도': '강원',
    '강원특별자치도': '강원',
    '충청북도': '충북',
    '충청남도': '충남',
    '전라북도': '전북',
    '전북특별자치도': '전북',
    '전라남도': '전남',
    '경상북도': '경북',
    '경상남도': '경남',
    '제주특별자치도': '제주'
  };

  let region = '';
  let district = '';
  let town = '';

  // 시/도 추출
  for (const [full, short] of Object.entries(regionMap)) {
    if (fullAddress.includes(full)) {
      region = short;
      break;
    }
  }

  // 구/군/시 추출
  const districtMatch = fullAddress.match(/([가-힣]+구|[가-힣]+시|[가-힣]+군)/);
  if (districtMatch) {
    district = districtMatch[1];
  }

  // 동/읍/면 추출
  const townMatch = fullAddress.match(/([가-힣]+동|[가-힣]+읍|[가-힣]+면|[가-힣]+리)/);
  if (townMatch) {
    town = townMatch[1];
  }

  return { region, district, town };
}

/**
 * CSV 라인을 객체로 변환
 */
function parseCSVLine(line, headers) {
  // 간단한 CSV 파싱 (따옴표 처리 포함)
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = values[index] || '';
  });

  return obj;
}

/**
 * CSV 파일 읽기 및 파싱
 */
async function readCSV(filePath) {
  console.log(`📂 CSV 파일 읽는 중: ${filePath}`);
  
  // EUC-KR 인코딩 처리
  let content;
  try {
    const iconv = require('iconv-lite');
    const buffer = fs.readFileSync(filePath);
    content = iconv.decode(buffer, 'EUC-KR');
    console.log('✅ EUC-KR 인코딩 변환 완료');
  } catch (error) {
    console.error('❌ 파일 읽기 실패:', error.message);
    throw error;
  }

  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV 파일이 비어있습니다');
  }

  // 헤더 추출
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  console.log(`📋 컬럼: ${headers.join(', ')}`);

  // 데이터 파싱
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    try {
      const row = parseCSVLine(lines[i], headers);
      data.push(row);
    } catch (error) {
      console.error(`⚠️  라인 ${i + 1} 파싱 실패:`, error.message);
    }
  }

  console.log(`✅ 총 ${data.length}개 레코드 읽기 완료`);
  return data;
}

/**
 * 데이터 정제
 */
function cleanData(rawData) {
  console.log('\n🧹 데이터 정제 시작...');
  
  // 1. 필수 필드 있는 것만 (CSV에 상태 컬럼이 없으므로 모두 허용)
  const withRequired = rawData.filter(row => {
    const name = row['사업장명'] || '';
    const address = row['도로명전체주소'] || '';
    return name && address;
  });
  
  console.log(`  ✓ 필수 필드 확인: ${rawData.length}개 → ${withRequired.length}개`);

  // 2. 피부관리실/미용실만 필터링
  const skincare = withRequired.filter(row => {
    const type = row['위생업태명'] || '';
    return type.includes('피부') || type.includes('미용') || type.includes('화장품');
  });
  
  console.log(`  ✓ 피부/미용 필터링: ${withRequired.length}개 → ${skincare.length}개`);

  // 3. 데이터 변환
  const transformed = skincare.map(row => {
    const businessName = row['사업장명'] || '';
    const fullAddress = row['도로명전체주소'] || '';
    const { region, district, town } = parseAddress(fullAddress);

    return {
      id: generateUUID(),
      business_id: row['도로명우편번호'] || '',
      business_name: businessName,
      address: fullAddress,
      region: region,
      district: district,
      town: town,
      status: '영업중',
      phone: '', // CSV에 전화번호 없음
      matched_shop_id: null,
      data_source: '공공데이터_251231'
    };
  });

  // 4. 중복 제거 (업체명 + 주소 기준)
  const uniqueMap = new Map();
  transformed.forEach(item => {
    const key = `${item.business_name}_${item.address}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });
  
  const unique = Array.from(uniqueMap.values());
  console.log(`  ✓ 중복 제거: ${transformed.length}개 → ${unique.length}개`);

  console.log(`✅ 정제 완료: 최종 ${unique.length}개\n`);
  return unique;
}

/**
 * 배치 업로드
 */
async function uploadBatch(batch, batchNumber, totalBatches) {
  const url = `${CONFIG.API_BASE_URL}/${CONFIG.TABLE_NAME}`;
  
  console.log(`📤 배치 ${batchNumber}/${totalBatches} 업로드 중... (${batch.length}개)`);

  let successCount = 0;
  let failCount = 0;

  for (const item of batch) {
    let retries = 0;
    let success = false;

    while (retries < CONFIG.MAX_RETRIES && !success) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item)
        });

        if (response.ok) {
          successCount++;
          success = true;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }

        // API 부하 방지
        await delay(CONFIG.DELAY_MS);

      } catch (error) {
        retries++;
        if (retries >= CONFIG.MAX_RETRIES) {
          console.error(`  ❌ 업로드 실패 (${item.business_name}): ${error.message}`);
          failCount++;
        } else {
          console.log(`  ⚠️  재시도 ${retries}/${CONFIG.MAX_RETRIES}: ${item.business_name}`);
          await delay(1000); // 재시도 전 1초 대기
        }
      }
    }
  }

  console.log(`  ✅ 배치 ${batchNumber} 완료: 성공 ${successCount}, 실패 ${failCount}`);
  
  return { success: successCount, fail: failCount };
}

/**
 * 전체 데이터 업로드
 */
async function uploadAll(data) {
  console.log(`\n🚀 업로드 시작: 총 ${data.length}개`);
  console.log(`📦 배치 크기: ${CONFIG.BATCH_SIZE}개`);
  
  const batches = [];
  for (let i = 0; i < data.length; i += CONFIG.BATCH_SIZE) {
    batches.push(data.slice(i, i + CONFIG.BATCH_SIZE));
  }
  
  console.log(`📊 총 ${batches.length}개 배치\n`);

  let totalSuccess = 0;
  let totalFail = 0;
  const startTime = Date.now();

  for (let i = 0; i < batches.length; i++) {
    const result = await uploadBatch(batches[i], i + 1, batches.length);
    totalSuccess += result.success;
    totalFail += result.fail;

    // 진행률 표시
    const progress = ((i + 1) / batches.length * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    const estimated = (elapsed / (i + 1) * batches.length).toFixed(1);
    
    console.log(`📈 진행률: ${progress}% | 경과: ${elapsed}분 | 예상: ${estimated}분\n`);
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log(`\n🎉 업로드 완료!`);
  console.log(`✅ 성공: ${totalSuccess}개`);
  console.log(`❌ 실패: ${totalFail}개`);
  console.log(`⏱️  소요 시간: ${totalTime}분`);

  return { success: totalSuccess, fail: totalFail };
}

/**
 * 메인 실행
 */
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  전국 피부관리실 데이터 업로드');
  console.log('  버전: v1.0');
  console.log('  날짜: 2025-12-30');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // 1. CSV 파일 존재 확인
    if (!fs.existsSync(CONFIG.CSV_FILE)) {
      throw new Error(`CSV 파일을 찾을 수 없습니다: ${CONFIG.CSV_FILE}`);
    }

    // 2. CSV 읽기
    const rawData = await readCSV(CONFIG.CSV_FILE);

    // 3. 데이터 정제
    const cleanedData = cleanData(rawData);

    // 4. 사용자 확인
    console.log(`\n⚠️  ${cleanedData.length}개 데이터를 업로드하시겠습니까?`);
    console.log(`   예상 시간: 약 ${(cleanedData.length / CONFIG.BATCH_SIZE * 1.5).toFixed(0)}분`);
    console.log(`\n   계속하려면 엔터를 누르세요 (취소: Ctrl+C)`);

    // 엔터 대기
    await new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question('', () => {
        rl.close();
        resolve();
      });
    });

    // 5. 업로드
    const result = await uploadAll(cleanedData);

    // 6. 결과 저장
    const summary = {
      timestamp: new Date().toISOString(),
      total: cleanedData.length,
      success: result.success,
      fail: result.fail,
      successRate: (result.success / cleanedData.length * 100).toFixed(2) + '%'
    };

    fs.writeFileSync(
      'upload-result.json',
      JSON.stringify(summary, null, 2)
    );

    console.log(`\n📄 결과 저장: upload-result.json`);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = { parseAddress, cleanData };
