// ESLint de la versión Angular del Atlas 3D.
// angular-eslint añade las reglas propias del framework: uso correcto de
// señales, inject() frente a constructores, y plantillas sin errores comunes.
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import angular from 'angular-eslint'

export default tseslint.config(
  { ignores: ['dist', 'dist-pruebas', 'node_modules', 'coverage', '*.config.js', 'scripts/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.worker },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // El espacio de nombres @angular-eslint exige esta regla para las clases
      // decoradas con @Component/@Injectable.
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: '', style: 'kebab-case' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
  },
  {
    files: ['**/*.spec.ts', 'src/pruebas/**'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
