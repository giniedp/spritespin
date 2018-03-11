'use strict'

const fs = require('fs')
const del = require('del')
const gulp = require('gulp')
const gutil = require('gulp-util')
const path = require('path')
const shell = require('shelljs')
const ts = require('typescript')
const through = require('through-gulp')

gulp.task('clean', () => del([ 'release' ]))

gulp.task('tsc', ['clean'], (cb) => {
  shell
    .exec('tsc -p tsconfig.json', { async: true })
    .on('exit', (code) => cb(code === 0 ? null : code))
})

gulp.task('tsc:2015', ['clean'], (cb) => {
  shell
    .exec('tsc -p tsconfig.es2015.json', { async: true })
    .on('exit', (code) => cb(code === 0 ? null : code))
})

gulp.task('docs', ['tsc:2015'], () => {
  gulp
    .src(['release/es2015/*.d.ts'])
    .pipe(through(function(file, enc, cb) {
      const data = {}
      const source = file.contents.toString()
      const node = ts.createSourceFile(file.path, source, ts.ScriptTarget.ES2015, true)
      inspect(node, source, data)
      const result = new gutil.File({
        cwd: file.cwd,
        base: file.base,
        path: path.join(path.dirname(file.path), path.basename(file.path, '.d.ts') + '.json'),
        contents: new Buffer(JSON.stringify(data, null, '  '))
      })
      cb(null, result)
    }))
    .pipe(gulp.dest('doc'))
})

function inspect(node, source, data) {
  if (node.kind === ts.SyntaxKind.ModuleDeclaration || node.kind === ts.SyntaxKind.InterfaceDeclaration) {
    const name = node.name.escapedText
    const subData = data[name] || {}
    data[name] = subData
    node.getChildren().forEach((it) => {
      inspect(it, source, subData)
    });
    return
  }

  if (node.kind === ts.SyntaxKind.Identifier) {
    const name = node.escapedText
    const comments = ts.getLeadingCommentRanges(source, node.getFullStart())
    if (comments) {
      data[name] = comments
          .map((it) => source.substring(it.pos, it.end) || '')
          .map((it) => it.replace(/(^\s*\/\/)|(^\s*\/\*\*)|(^\s*\*\/)|(^\s*\*)/gm, '').trim())
          .join('\n')
    }
  }

  node.getChildren().forEach((it) => inspect(it, source, data));
}
