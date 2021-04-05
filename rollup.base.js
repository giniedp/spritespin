import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import sourcemaps from 'rollup-plugin-sourcemaps'
import packageJson from 'rollup-plugin-generate-package-json'
import copy from 'rollup-plugin-copy'

import pkg from './package.json'

export default {
  input: 'lib/src/spritespin.ts',
  watch: {
    include: 'lib/**',
  },
  plugins: [
    resolve(),
    sourcemaps(),
    typescript({
      tsconfig: 'lib/tsconfig.rollup.json',
    }),
    replace({
      preventAssignment: true,
      VERSION_STRING: JSON.stringify(pkg.version),
    }),
    packageJson({
      outputFolder: 'dist',
      baseContents: {
        scripts: {},
        dependencies: {},
        peerDependencies: {},
        devDependencies: {},
        private: false,
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        author: pkg.author,
        license: pkg.license,
        keywords: pkg.keywords,
        repository: pkg.repository,
        bugs: pkg.bugs,

        main: 'release/spritespin.js',
        module: 'release/spritespin.module.js',
        typings: 'release/spritespin.d.ts',
        files: ['release', 'README.md', 'LICENSE', 'package.json'],
      },
    }),
    copy({
      targets: [
        { src: 'README.md', dest: 'dist' },
        { src: 'LICENSE', dest: 'dist' },
      ]
    }),
  ],
}
