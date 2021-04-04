import * as Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import MarkdownIt from 'markdown-it'
import Metalsmith from "metalsmith"
import { MetalsmithFileMeta } from "./metalsmith-metadata"
import wplog from 'webpack-log'

const log = wplog({
  name: 'ms-markdown',
  timestamp: true,
})

export default (options: any) => {
  options.highlight = options.highlight || ((code: string, lang: string) => {
    lang = lang || 'typescript'
    if (!Prism.languages[lang]) {
      console.warn(`prism language ${lang} not enabled. Fallback to javascript`)
      lang = 'javascript'
    }
    return Prism.highlight(code, Prism.languages[lang], lang)
  })

  const md = new MarkdownIt(options)
  applyPathc(md)
  return (files: Record<string, MetalsmithFileMeta>, smith: Metalsmith, done: Function) => {
    for (const file in files) {
      if (!file.endsWith('.md')) {
        continue
      }
      try {
        const content = md.render(files[file].contents.toString())
        files[file].contents = Buffer.from(content)
        files[file.replace(/\.md$/, '.html')] = files[file]
      } catch (e) {
        log.error(e)
      }
      delete files[file]
    }
    done()
  }
}

function applyPathc(md: any) {
  function patch(name, custom) {
    const orig = md.renderer.rules[name] || ((tokens, idx, options, env, self) => {
      return self.renderToken(tokens, idx, options)
    })
    md.renderer.rules[name] = (...args: any[]) => {
      custom(...args)
      return orig(...args)
    }
  }

  patch('link_open', (tokens: any[], idx: number, options, env, self) => {
    const token = tokens[idx]
    const aIndex = token.attrIndex('href')
    if (aIndex >= 0) {
      const value: string = token.attrs[aIndex][1]
      token.attrs[aIndex][1] = value.replace(/\.md$/, '.html')
    }
  })

  patch('heading_open', (tokens: any[], idx: number, options, env, self) => {
    const token = tokens[idx]
    const child = tokens[idx + 1]
    const content: string = child ? child.content : null
    if (content) {
      token.attrJoin('class', content.replace(/\s+/ig, '-').toLowerCase().replace(/[^a-z]+/, '_'))
    }
  })

  patch('table_open', (tokens: any[], idx: number) => {
    tokens[idx].attrJoin('class', 'table table-borderless mb-4')
  })

}
