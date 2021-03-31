import Metalsmith from 'metalsmith'
import * as path from 'path'
import chokidar from 'chokidar'
import wplog from 'webpack-log'

const log = wplog({
  name: 'ms-watch',
  timestamp: true,
})

const isWatchmode = process.argv.includes('-w') || process.argv.includes('--watch')
process.env.METALSMITH_WATCH = isWatchmode ? 'true' : null

export default (options: { pattern: string | string[] }) =>{
  let isWatching: boolean
  return function(files, smith: Metalsmith, done) {
    if (!isWatching && isWatchmode) {
      log.info('watching files')
      isWatching = !!watch(options.pattern, smith)
    }
    done()
  };
}

function watch(pattern: string | string[], smith: Metalsmith) {
  const watcher = chokidar.watch(pattern, {
    ignoreInitial: true
  })

  let changes: Record<string, any> = {}
  let time: any
  let mode: 'run' | 'build' = 'run'
  watcher.on('all', (e, file) => {
    file = path.relative(smith.source(), path.join(smith.directory(), file))
    log.info(e, file)
    if (e === 'add' || e === 'change') {
      changed(file)
    }
  })
  function changed(file: string) {
    clearTimeout(time)
    if (path.basename(file).startsWith('_')) {
      mode = 'build'
    }
    const read = smith.readFile.bind(smith) as any
    read(file, (err: Error, ret: any) => {
      if (err) {
        log.error(err)
      } else {
        changes[file] = ret
      }
      time = setTimeout(commit, 1000)
    })
  }
  function commit() {
    const files = {...changes}
    changes = {}
    const doBuild = mode === 'build'
    mode = 'run'
    if (doBuild) {
      build()
    } else {
      run(files)
    }
  }
  function run(files) {
    log.info('run')
    smith.run(files, (err, res) => {
      if (err) {
        log.error(err)
      }
      smith.write(res, smith.destination(), (err, res) => {
        if (err) {
          log.error(err)
        }
        log.info('end')
      })
    })
  }
  function build() {
    log.info('build')
    smith.build((err) => {
      if (err) {
        log.error(err)
      }
      log.info('end')
    })
  }
  return watcher
}
