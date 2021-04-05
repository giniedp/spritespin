
'use strict'

import config from './rollup.base'

export default Object.assign({}, config, {
  output: {
    name: 'SpriteSpin',
    file: 'dist/release/spritespin.module.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: config.plugins.filter((it) => {
    return it.name !== 'commonjs'
  }),
})
