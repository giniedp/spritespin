import Metalsmith from 'metalsmith'

// import msMarkdown from 'metalsmith-markdown'
import msSass from 'metalsmith-sass'
import filter from 'metalsmith-filter'
import msMetadata from './tools/metalsmith-metadata'
import msPug from './tools/metalsmith-pug'
import msTypescript from './tools/metalsmith-typescript'
import msBrowserSync from './tools/metalsmith-browsersync'
import msMarkdown from './tools/metalsmith-markdown'
import msWatch from './tools/metalsmith-watch'
import msRelayout from './tools/metalsmith-relayout'

require('jstransformer')(require('jstransformer-markdown-it'))

Metalsmith(__dirname)
  .metadata({
    sitename: 'My Static Site & Blog',
    siteurl: 'http://example.com/',
    description: "It's about saying »Hello« to the world.",
  })
  .frontmatter(true)
  .clean(false)
  .source('./page')
  .destination('./dist')
  .use(filter(['**/*.pug', '**/*.md', '**/*.ts', '**/*.scss', '!**/_*.*']))
  .use(msMetadata())
  .use(msSass({
    includePaths: ['node_modules'],
  }))
  .use(msMarkdown({
    html: true,
    linkify: true,
  }))
  .use(msRelayout({
    match: '**/docs/*',
    template: '_layouts/_docs.pug'
  }))
  .use(msPug({
    locals: () => {
      return {
        spritespinCdn: 'https://unpkg.com/spritespin@beta/release/spritespin.js',
        spritespinSrc: '/release/spritespin.js',
      }
    }
  }))
  .use(msTypescript({ keepOriginal: true }))
  .use(msBrowserSync({ name: 'spritespin', config: require(`${__dirname}/browser-sync`) }))
  .use(msWatch({ pattern: './page/**/*' }))
  .build((err) => {
    if (err) {
      console.error(err)
    }
  })
