import { babel } from '@rollup/plugin-babel'

export default {
  input: 'index.js',
  output: {
    dir: 'dist',
    format: 'commonjs'
  },
  plugins: [babel({ babelHelpers: 'runtime' })]
}
