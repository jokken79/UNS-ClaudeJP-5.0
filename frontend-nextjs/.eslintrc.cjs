module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  ignorePatterns: [
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'components/RirekishoPrintView.tsx',
    'components/legacy/**',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
  },
};
