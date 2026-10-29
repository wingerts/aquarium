// Test the aquarium.js code for syntax errors and basic validation
const fs = require('fs');

console.log('🔍 Testing aquarium.js code...\n');

// Read the aquarium.js file
const code = fs.readFileSync('aquarium.js', 'utf8');

// Check for syntax errors by trying to parse it
try {
  new Function(code);
  console.log('✅ JavaScript syntax is valid\n');
} catch (error) {
  console.log('❌ Syntax error found:');
  console.log(error.message);
  process.exit(1);
}

// Check for key realistic fish features
const features = [
  { name: 'Scale texture generation', pattern: /createScaleTexture|scale.*texture/i },
  { name: 'PBR materials (StandardMaterial)', pattern: /THREE\.MeshStandardMaterial/i },
  { name: 'Metalness property', pattern: /metalness\s*:/i },
  { name: 'Roughness property', pattern: /roughness\s*:/i },
  { name: 'Gill slits', pattern: /gill.*slit|createGill/i },
  { name: 'Lateral line', pattern: /lateral.*line/i },
  { name: 'Enhanced eyes with iris/pupil', pattern: /(iris|pupil).*geometry|create.*eye/i },
  { name: 'Ventral fins', pattern: /ventral.*fin/i },
  { name: 'Fin rays', pattern: /fin.*ray|ray.*fin/i },
  { name: 'Depth preferences', pattern: /preferredDepth|depth.*preference/i },
  { name: 'Pitch movement', pattern: /pitch|rotation\.x.*speed/i },
  { name: 'Roll/banking during turns', pattern: /roll|rotation\.z.*turn/i },
  { name: 'Speed variations', pattern: /speed.*variation|acceleration|deceleration/i },
  { name: 'Body segments (7+)', pattern: /segments.*=.*[7-9]|segments.*=.*\d{2}/i }
];

console.log('📋 Checking for realistic fish features:\n');
let foundCount = 0;

features.forEach(feature => {
  const found = feature.pattern.test(code);
  const icon = found ? '✅' : '❌';
  console.log(`${icon} ${feature.name}`);
  if (found) foundCount++;
});

console.log(`\n📊 Features found: ${foundCount}/${features.length}`);

// Check for common issues
console.log('\n🔍 Checking for potential issues:\n');

const issues = [];

if (code.includes('console.error') || code.includes('console.warn')) {
  issues.push('⚠️  Code contains console.error or console.warn statements');
}

if (code.includes('debugger')) {
  issues.push('⚠️  Code contains debugger statements');
}

if (code.match(/TODO|FIXME|XXX/i)) {
  issues.push('⚠️  Code contains TODO/FIXME comments');
}

if (issues.length === 0) {
  console.log('✅ No obvious issues found');
} else {
  issues.forEach(issue => console.log(issue));
}

// Count lines of code
const lines = code.split('\n').length;
console.log(`\n📏 Total lines of code: ${lines}`);

// Check for Three.js usage
const threeJsUsage = code.match(/THREE\.\w+/g);
if (threeJsUsage) {
  const uniqueClasses = [...new Set(threeJsUsage)].length;
  console.log(`🎨 Three.js classes used: ${uniqueClasses}`);
}

console.log('\n✅ Code validation complete!');
