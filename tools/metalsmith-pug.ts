import * as path from 'path'
import Metalsmith from "metalsmith"
import { MetalsmithFileMeta } from "./metalsmith-metadata"
import wplog from 'webpack-log'

const log = wplog({
  name: 'ms-pug',
  timestamp: true,
})
export type LocalsRecolver = (file: string, data: Record<string, any>, smith: Metalsmith) => Record<string, any>
export interface MetalsmithPugOptions {
  cwd?: string,
  pug?: any,
  locals?: Record<string, any> | LocalsRecolver,
  compileOptions?: any,
}

export default (options: MetalsmithPugOptions) => {
  let memo: Record<string, MetalsmithFileMeta> = {}
  return (files: Record<string, MetalsmithFileMeta>, smith: Metalsmith, done: Function) => {
    memo = {
      ...memo,
      ...files
    }
    for (const file in files) {
      if (!file.endsWith('.pug')) {
        continue
      }
      try {
        const content = compile(options, file, memo, smith)
        files[file].contents = Buffer.from(content)
        files[file.replace(/\.pug$/, '.html')] = files[file]
      } catch (e) {
        log.error(e)
      }
      delete files[file]
    }
    done()
  }
}

function compile(config: MetalsmithPugOptions, file: string, files: Record<string, MetalsmithFileMeta>, smith: Metalsmith): string {
  const data = files[file]
  const pug = config.pug || require('pug')
  const cwd = config.cwd || smith.source()
  const cOpts = config.compileOptions || {}
  const template = pug.compile(data.contents.toString(), {
    doctype: 'html',
    pretty: true,
    basedir: cwd,
    ...cOpts,
    filename: path.join(smith.source(), file)
  })
  const locals = (typeof config.locals === 'function' ? config.locals(file, data, smith) : config.locals) || {}
  return template({
    meta: data,
    childrenOf: (file: string, ext?: string[]) => childrenOf(file, files, ext),
    ...locals,
  })
}

function childrenOf(file: string, files: Record<string, MetalsmithFileMeta>, ext?: string[]) {
  const dirname = path.dirname(file)
  let result = Object.keys(files)
    .filter((it) => it.startsWith(dirname))
    .filter((it) => it.substring(dirname.length + 1).match(/[/]/g)?.length === 1)
    .map((it) => files[it])
  if (ext) {
    result = result.filter((it) => ext.includes(it.fileExt))
  }
  return result
}
