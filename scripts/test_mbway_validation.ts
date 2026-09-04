const ptMobileRegex = /^(91|92|93|96)\d{7}$/

const testCases = [
  // Valid Portuguese mobile numbers (9 digits, starts with 91, 92, 93, 96)
  { phone: '912345678', expected: true, desc: 'Vodafone (91)' },
  { phone: '921234567', expected: true, desc: 'TMN/MEO (92)' },
  { phone: '939876543', expected: true, desc: 'NOS (93)' },
  { phone: '965554433', expected: true, desc: 'MEO (96)' },
  { phone: '91 234 5678', clean: '912345678', expected: true, desc: 'Vodafone with spaces' },
  { phone: '+351 92 123 4567', clean: '921234567', expected: true, desc: 'With prefix' },

  // Invalid numbers
  { phone: '951234567', expected: false, desc: 'Invalid prefix (95)' },
  { phone: '941234567', expected: false, desc: 'Invalid prefix (94)' },
  { phone: '212345678', expected: false, desc: 'Landline Lisbon (21)' },
  { phone: '222345678', expected: false, desc: 'Landline Porto (22)' },
  { phone: '91234567', expected: false, desc: 'Too short (8 digits)' },
  { phone: '9123456789', expected: false, desc: 'Too long (10 digits)' },
  { phone: 'abcdefghi', expected: false, desc: 'Letters' },
]

console.log('Testing MB WAY Portuguese Phone Validation Regex:')
let failures = 0

for (const tc of testCases) {
  const clean = (tc.clean || tc.phone).replace(/\D/g, '')
  const result = ptMobileRegex.test(clean)
  if (result === tc.expected) {
    console.log(`  ✅ [PASS] ${tc.desc} ("${tc.phone}") -> ${result}`)
  } else {
    console.error(`  ❌ [FAIL] ${tc.desc} ("${tc.phone}") -> expected ${tc.expected}, got ${result}`)
    failures++
  }
}

if (failures === 0) {
  console.log('\n>>> All MB WAY phone validation tests PASSED successfully!')
} else {
  console.error(`\n>>> ${failures} tests failed!`)
  process.exit(1)
}
