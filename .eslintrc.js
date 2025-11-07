module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: {
    'custom': require('./eslint-plugin-custom.js')
  },
  rules: {
    'custom/no-hardcoded-strings': ['error', {
      allowedStrings: [
        'use client',
        'utf-8',
        'application/json',
        'text/html',
        'image/png',
        'localhost',
        'https://',
        'http://',
        '/',
        'vi',
        'en',
        'M', // Logo letter
        '✓', // Checkmark
        '••••••••', // Password placeholder fallback
      ],
      ignoreAttributes: [
        'className',
        'id',
        'key',
        'data-testid',
        'aria-label',
        'role',
        'type',
        'name',
        'value',
        'href',
        'src',
        'alt',
        'data-locale',
        'placeholder',
      ],
    }],
  }
};
