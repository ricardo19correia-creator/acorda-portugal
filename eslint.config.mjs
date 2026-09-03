import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-location-assign-relative-destination': 'warn',
      '@next/next/no-img-element': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'android/**', 'ios/**', 'next-env.d.ts']),
])

export default eslintConfig
