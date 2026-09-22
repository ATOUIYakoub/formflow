import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', '.jest-cache/**', 'uploads/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Nest DI and Prisma JSON columns make `any` hard to avoid entirely.
      '@typescript-eslint/no-explicit-any': 'off',
      // Decorator-heavy constructors trip this up.
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          // `const { passwordHash, ...rest } = user` is the idiom used to strip
          // secrets before returning a user object.
          ignoreRestSiblings: true,
        },
      ],
      // `import * as x from 'y'` is the documented pattern for cookie-parser et al.
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
);
