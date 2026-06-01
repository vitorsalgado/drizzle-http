import { babel } from '@rollup/plugin-babel'

export default {
  input: 'index.js',
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [babel({ babelHelpers: 'runtime' })]
}
