import * as fs from 'fs'
import * as ts from 'typescript'
import { MetalsmithFile } from './metalsmith-metadata';
import wplog from 'webpack-log'

const log = wplog({
  name: 'ms-typescript',
  timestamp: true,
})

export default (options?: { keepOriginal?: boolean, compilerOptions?: ts.CompilerOptions }) =>{
  return function(files: Record<string, MetalsmithFile>) {
    for (const file of Object.keys(files)) {
      if (!file.endsWith('.ts')) {
        continue
      }
      try {
        const content = transpileTs(file, files[file].contents.toString(), options?.compilerOptions)
        const data = files[file]
        files[file.replace(/\.ts$/, '.js')] = {
          ...data,
          contents: Buffer.from(content)
        }
      } catch (e) {
        log.error(e)
      }
      if (!options?.keepOriginal) {
        delete files[file]
      }
    }
  };
}

export function transpileTs(file: string, content?: string, options?: ts.CompilerOptions) {
  content = content ?? fs.readFileSync(file).toString()
  const out = ts.transpileModule(content, {
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      ...(options || {}),
    },
  })
  return out.outputText
}
