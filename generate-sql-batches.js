/**
 * SQL INSERT 문 생성기 (배치 분할)
 */

const fs = require('fs');

const CONFIG = {
  CSV_FILE: '전국피부미용실 현황251231.csv',
  OUTPUT_DIR: 'sql-batches',
  BATCH_SIZE: 1000,
  MAX_RECORDS: 30000
};

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function parseAddress(fullAddress) {
  if (!fullAddress) return { region: '', district: '', town: '' };
  const regionMap = {
    '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구',
    '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전',
    '울산광역시': '울산', '세종특별자치시': '세종', '경기도': '경기',
    '강원도': '강원', '강원특별자치도': '강원', '충청북도': '충북',
    '충청남도': '충남', '전라북도': '전북', '전북특별자치도': '전북',
    '전라남도': '전남', '경상북도': '경북', '경상남도': '경남',
    '제주특별자치도': '제주'
  };
  let region = '', district = '', town = '';
  for (const [full, short] of Object.entries(regionMap)) {
    if (fullAddress.includes(full)) {
      region = short;
      break;
    }
  }
  const districtMatch = fullAddress.match(/([가-힣]+구|[가-힣]+시|[가-힣]+군)/);
  if (districtMatch) district = districtMatch[1];
  const townMatch = fullAddress.match(/([가-힣]+동|[가-힣]+읍|[가-힣]+면|[가-힣]+리)/);
  if (townMatch) town = townMatch[1];
  return { region, district, town };
}

function parseCSVLine(line, headers) {
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

function escapeSQL(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  SQL 배치 파일 생성기');
  console.log('═══════════════════════════════════════════════\n');

  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR);
  }

  console.log(`📂 CSV 파일 읽는 중: ${CONFIG.CSV_FILE}`);
  const iconv = require('iconv-lite');
  const buffer = fs.readFileSync(CONFIG.CSV_FILE);
  const content = iconv.decode(buffer, 'EUC-KR');
  console.log('✅ EUC-KR 인코딩 변환 완료');

  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  console.log(`📋 컬럼: ${headers.join(', ')}\n`);

  console.log('🧹 데이터 정제 중...');
  const data = [];
  for (let i = 1; i < lines.length && data.length < CONFIG.MAX_RECORDS; i++) {
    try {
      const row = parseCSVLine(lines[i], headers);
      const name = row['사업장명'] || '';
      const address = row['도로명전체주소'] || '';
      if (name && address) {
        const { region, district, town } = parseAddress(address);
        data.push({
          id: generateUUID(),
          business_id: row['도로명우편번호'] || '',
          business_name: name,
          address: address,
          region, district, town,
          status: '영업중',
          phone: '',
          matched_shop_id: null,
          data_source: '공공데이터_251231'
        });
      }
    } catch (error) {}
  }

  console.log(`✅ ${data.length}개 레코드 준비 완료\n`);

  const totalBatches = Math.ceil(data.length / CONFIG.BATCH_SIZE);
  console.log(`📦 ${totalBatches}개 배치 파일 생성 중...\n`);

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const start = batchNum * CONFIG.BATCH_SIZE;
    const end = Math.min(start + CONFIG.BATCH_SIZE, data.length);
    const batch = data.slice(start, end);

    let sql = `-- 배치 ${batchNum + 1}/${totalBatches}\n`;
    sql += `-- 레코드: ${start + 1}~${end}\n\n`;

    for (let i = 0; i < batch.length; i += 100) {
      const chunk = batch.slice(i, i + 100);
      const values = chunk.map(item => 
        `(${escapeSQL(item.id)}, ${escapeSQL(item.business_id)}, ${escapeSQL(item.business_name)}, ` +
        `${escapeSQL(item.address)}, ${escapeSQL(item.region)}, ${escapeSQL(item.district)}, ` +
        `${escapeSQL(item.town)}, ${escapeSQL(item.status)}, ${escapeSQL(item.phone)}, ` +
        `${escapeSQL(item.matched_shop_id)}, ${escapeSQL(item.data_source)})`
      ).join(',\n  ');

      sql += `INSERT INTO public_skincare_data (id, business_id, business_name, address, region, district, town, status, phone, matched_shop_id, data_source) VALUES\n  ${values};\n\n`;
    }

    const filename = `${CONFIG.OUTPUT_DIR}/batch-${String(batchNum + 1).padStart(3, '0')}.sql`;
    fs.writeFileSync(filename, sql);
    console.log(`✅ ${filename} (${batch.length}개)`);
  }

  console.log(`\n🎉 완료! ${totalBatches}개 배치 파일 생성됨`);
  console.log(`\n📁 위치: ${CONFIG.OUTPUT_DIR}/`);
  console.log(`\n🎯 다음 단계:`);
  console.log(`wrangler d1 execute beautycat-db --remote --file=sql-batches/batch-001.sql`);
}

main().catch(console.error);