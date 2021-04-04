import * as fs from 'fs'
import * as path from 'path'
import Metalsmith from "metalsmith"
import { MetalsmithFileMeta } from "./metalsmith-metadata"
import minimatch from 'minimatch'

export default (options: {
  match: string | string[],
  template: string
}) => {
  return (files: Record<string, MetalsmithFileMeta>, smith: Metalsmith, done: Function) => {
    let content = fs.readFileSync(path.join(smith.source(), options.template))
    for (const file in files) {
      if (!minimatch(file, options.match)) {
        continue
      }
      files[file].content = files[file].contents.toString()
      files[file].contents = content
      const newFile = file.replace(new RegExp(`${path.extname(file)}$`), path.extname(options.template))
      files[newFile] = files[file]
      delete files[file]
    }
    done()
  }
}
