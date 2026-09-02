// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.d.ts',
      '**/coverage/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // No project-specific overrides yet. Add rules with a one-line
      // justification as later phases surface real needs — do not carry
      // silent blanket disables.
    },
  },
  {
    // Plain Node ESM tooling scripts (not part of a package's TS build):
    // the markdown-clipping skill verifier and any future repo scripts.
    files: ['**/*.mjs', 'scripts/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
);
