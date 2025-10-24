// Quick test for Taobao parser
const fs = require('fs');

// Read the product info file
const productInfo = fs.readFileSync('./product_info/酸梅湯_taobao', 'utf8');

console.log('=== Lines ===');
const lines = productInfo.split('\n').map(line => line.trim()).filter(line => line.length > 0);
lines.forEach((line, i) => {
  console.log(`${i}: ${line}`);
});

// Find parameters section
const paramsStartIndex = lines.indexOf('参数信息');
console.log('\n=== Parameters Start Index: ' + paramsStartIndex);

if (paramsStartIndex >= 0) {
  console.log('\n=== Parameter Lines (pairs) ===');
  const paramLines = lines.slice(paramsStartIndex + 1);

  for (let i = 0; i < paramLines.length; i += 2) {
    const line1 = paramLines[i];
    const line2 = paramLines[i + 1];
    console.log(`Pair ${i/2}: [${line1}] = [${line2}]`);
  }
}
