// Quick test for Taobao parser
const fs = require('fs');

// Read the product info file
const productInfo = fs.readFileSync('./product_info/酸梅湯_taobao', 'utf8');

console.log('=== Product Info ===');
console.log(productInfo);
console.log('\n=== Lines ===');
const lines = productInfo.split('\n').map(line => line.trim()).filter(line => line.length > 0);
lines.forEach((line, i) => {
  console.log(`${i}: ${line}`);
});

// Find parameters section
const paramsStartIndex = lines.indexOf('参数信息');
console.log('\n=== Parameters Start Index ===');
console.log(paramsStartIndex);

if (paramsStartIndex >= 0) {
  console.log('\n=== Parameter Lines ===');
  const paramLines = lines.slice(paramsStartIndex + 1);
  paramLines.forEach((line, i) => {
    console.log(`${i}: ${line}`);
  });
}
