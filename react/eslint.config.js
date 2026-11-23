// ESLint de la versión React del Atlas 3D.
// Se activan las reglas de hooks porque son las que atrapan los errores reales
// de React: dependencias faltantes en useEffect y efectos con lógica condicional.
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', '*.config.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.worker },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Un `!` sobre una referencia de React puede explotar en el primer render.
      // Se deja como aviso para no romper el código heredado del checkpoint.
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Las pruebas pueden usar `!` y funciones sin tipar: son código de apoyo.
    files: ['**/*.test.{ts,tsx}', 'src/pruebas/**'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
