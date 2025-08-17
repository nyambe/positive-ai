// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      // Disallow `any` 
      '@typescript-eslint/no-explicit-any': ['error'],

      // Discourage sweeping things under the rug
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],

      // Disallow unused variables
      '@typescript-eslint/no-unused-vars': ['error'],

      
    }
  }
)
