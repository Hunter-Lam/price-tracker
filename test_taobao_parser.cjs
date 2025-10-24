const fs = require('fs');

// Simulate the parser logic
const productInfo = fs.readFileSync('./product_info/酸梅湯_taobao', 'utf8');
const lines = productInfo.split('\n').map(line => line.trim()).filter(line => line.length > 0);

const paramsStartIndex = lines.indexOf('参数信息');
const paramLines = lines.slice(paramsStartIndex + 1);

const commonKeys = [
  '品牌', '产地', '型号', '规格', '颜色分类', '材质', '款式', '货号',
  '大小', '适用年龄段', '功能', '包装', '包装规格',
  '系列', '省份', '城市', '规格描述', '是否进口', '总净含量',
  '生产许可证编号', '厂名', '厂址', '厂家联系方式', '配料表',
  '保质期', '净含量', '成分', '特性', '用途', '特殊添加成分',
  '适用对象', '流行元素', '风格', '元素年代', '套件种类',
  '适用空间', '个数', '适用场景', '适用群体', '单件净含量',
  '酒精度数', '香型', '包装方式', '售卖规格', '生产企业',
  '贴膜特点', '贴膜工艺', '适用手机型号', '适用品牌',
  '适用机型', '屏幕尺寸', '颜色', '容量', '版本', '套餐',
  '尺码', '重量', '产品名称', '适用性别', '适用季节',
  '生产日期', '产品标准号', '储藏方法', '食品添加剂', '套餐类型'
];

console.log('=== Format Detection ===');
// Detect format change
let formatChangeIndex = -1;
for (let j = 0; j < paramLines.length - 1; j++) {
  if (commonKeys.includes(paramLines[j]) && commonKeys.includes(paramLines[j + 1])) {
    console.log(`Found consecutive keys at j=${j}: "${paramLines[j]}" and "${paramLines[j + 1]}"`);
    formatChangeIndex = j + 1;
    break;
  }
}

if (formatChangeIndex === -1) {
  console.log('No consecutive keys found, determining format...');
  let valueKeyCount = 0;
  let keyValueCount = 0;

  for (let j = 0; j < paramLines.length - 1; j += 2) {
    const isFirstKey = commonKeys.includes(paramLines[j]);
    const isSecondKey = j + 1 < paramLines.length && commonKeys.includes(paramLines[j + 1]);

    if (!isFirstKey && isSecondKey) {
      valueKeyCount++;
    } else if (isFirstKey && !isSecondKey) {
      keyValueCount++;
    }
  }

  console.log(`valueKeyCount: ${valueKeyCount}, keyValueCount: ${keyValueCount}`);

  if (valueKeyCount > keyValueCount) {
    formatChangeIndex = paramLines.length;
    console.log('Format: All VALUE-KEY');
  } else {
    formatChangeIndex = 0;
    console.log('Format: All KEY-VALUE');
  }
}

console.log(`\nformatChangeIndex: ${formatChangeIndex}\n`);

// Parse KEY-VALUE section
console.log('=== Parsing ===');
const specs = new Map();
const startIndex = formatChangeIndex > 0 ? formatChangeIndex : 0;
let i = startIndex;

while (i < paramLines.length) {
  const currentLine = paramLines[i];
  const nextLine = i + 1 < paramLines.length ? paramLines[i + 1] : null;

  console.log(`\ni=${i}: currentLine="${currentLine}"`);
  console.log(`  nextLine="${nextLine}"`);
  console.log(`  isCurrentKey=${commonKeys.includes(currentLine)}`);
  console.log(`  isNextKey=${nextLine && commonKeys.includes(nextLine)}`);

  if (commonKeys.includes(currentLine)) {
    if (i + 1 < paramLines.length && !commonKeys.includes(paramLines[i + 1])) {
      console.log(`  → KEY-VALUE: "${currentLine}" = "${paramLines[i + 1]}"`);
      specs.set(currentLine, paramLines[i + 1]);
      i += 2;
    } else {
      console.log(`  → Orphaned key, skip`);
      i += 1;
    }
  } else if (formatChangeIndex === 0 && i + 1 < paramLines.length && commonKeys.includes(paramLines[i + 1])) {
    console.log(`  → VALUE-KEY fallback: "${paramLines[i + 1]}" = "${currentLine}"`);
    specs.set(paramLines[i + 1], currentLine);
    i += 2;
  } else {
    console.log(`  → Unknown pattern, using heuristic`);
    i += 2;
  }
}

console.log('\n=== Final Specs ===');
for (const [key, value] of specs) {
  console.log(`${key}: ${value}`);
}
