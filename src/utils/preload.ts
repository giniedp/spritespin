namespace SpriteSpin.Utils {

  function indexOf(element: any, arr: any[]) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === element) {
        return i
      }
    }
  }

  function noop() {
    //
  }

  export interface PreloadOptions {
    source: string|string[]
    preloadCount?: number
    initiated?: (images: HTMLImageElement[]) => void
    progress?: (p: PreloadProgress) => void
    complete?: (images: HTMLImageElement[]) => void
  }

  export interface PreloadProgress {
    index: number
    loaded: number
    total: number
    percent: number
  }

  export function preload(opts: PreloadOptions) {
    let src: string[]
    const input = opts.source
    if (typeof input === 'string') {
      src = [input]
    } else {
      src = input
    }
    // const src: string[] =  ? [opts.source] : opts.source

    const images = []
    const targetCount = (opts.preloadCount || src.length)
    const onInitiated = opts.initiated || noop
    const onProgress = opts.progress || noop
    const onComplete = opts.complete || noop

    let count = 0
    let completed = false
    let firstLoaded = false

    const tick = function () { // tslint:disable-line
      count += 1

      onProgress({
        index: indexOf(this, images),
        loaded: count,
        total: src.length,
        percent: Math.round((count / src.length) * 100)
      })

      firstLoaded = firstLoaded || (this === images[0])

      if (firstLoaded && !completed && (count >= targetCount)) {
        completed = true
        onComplete(images)
      }
    }

    for (let i = 0; i < src.length; i += 1 ) {
      const img = new Image()
      // push result
      images.push(img)
      // bind logic, dont care about abort/errors
      img.onload = img.onabort = img.onerror = tick
      // begin load
      img.src = src[i]
    }

    onInitiated(images)
  }
}
