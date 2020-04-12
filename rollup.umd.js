import config from './rollup.base'

export default Object.assign({}, config, {
  output: {
    name: 'SpriteSpin',
    file: 'release/sprite-spin.umd.js',
    format: 'umd',
    sourcemap: true,
  }
})
