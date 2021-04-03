import * as fs from 'fs'
import * as path from 'path'
import Metalsmith from 'metalsmith'

export interface MetalsmithFile {
  contents: Buffer,
  mode: string,
  stats: fs.Stats
}

export interface MetalsmithFileMeta extends MetalsmithFile {
  aliases?: string[]
  createdAt?: string
  updatedAt?: string
  expiresAt?: string
  publishAt?: string
  draft?: boolean
  description?: string
  keywords?: string[]
  type?: string
  slug?: string
  title?: string
  linkTitle?: string
  weight?: string | number
  urlPath?: string
  file?: string
  fileExt?: string
  children?: MetalsmithFileMeta[]
  template?: string
  content?: string
}

export function augmentFile(filePath: string, file: MetalsmithFile, smith: Metalsmith) {
  const stats = file.stats
  const meta = file as MetalsmithFileMeta
  meta.aliases = meta.aliases || []
  meta.createdAt = meta.createdAt || stats.ctime.toISOString()
  meta.updatedAt = meta.updatedAt || stats.mtime.toISOString()
  meta.draft = meta.draft || false
  meta.description = meta.description || ''
  meta.keywords = meta.keywords || []
  meta.slug = meta.slug || path.basename(filePath, path.extname(filePath))
  if (meta.slug === 'index') {
    meta.slug = ''
  }
  meta.title = meta.title || meta.slug.replace(/-/g, ' ')
  meta.linkTitle = meta.linkTitle || meta.title
  meta.urlPath = '/' + path.join(path.dirname(filePath), meta.slug)
  meta.file = filePath
  meta.fileExt = path.extname(filePath)
  if (meta.template) {
    meta.template = path.join(path.dirname(filePath), meta.template)
  }
  meta.weight = Number(meta.weight) || meta.weight || path.basename(filePath)
}

export default () => {
  return (files: Metalsmith.Files, smith: Metalsmith, done: Function) => {
    for (const file in files) {
      augmentFile(file, files[file], smith)
    }
    done()
  }
}

