import { noop } from "./utils"

export interface PreloadOptions {
  source: string | string[]
  crossOrigin?: string
  preloadCount?: number
  initiated?: (images: HTMLImageElement[]) => void
  progress?: (p: PreloadProgress) => void
  complete?: (images: HTMLImageElement[]) => void
}

export interface PreloadProgress {
  // The image index that currently has been loaded
  index: number
  // The number of images that have been loaded so far
  loaded: number
  // The total number of images to load
  total: number
  // Percentage value
  percent: number
}

export function preload(opts: PreloadOptions) {
  const src = typeof opts.source === 'string' ? [opts.source] : opts.source

  const images: HTMLImageElement[] = []
  const targetCount = (opts.preloadCount || src.length)
  const onInitiated = opts.initiated || noop
  const onProgress = opts.progress || noop
  const onComplete = opts.complete || noop

  let count = 0
  let completed = false
  let firstLoaded = false

  const tick = function (this: HTMLImageElement) {
    count += 1

    onProgress({
      index: images.indexOf(this),
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

  for (const url of src) {
    const img = new Image()
    // push result
    images.push(img)
    // https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
    img.crossOrigin = opts.crossOrigin
    // bind logic, don't care about abort/errors
    img.onload = img.onabort = img.onerror = tick
    // begin load
    img.src = url
  }

  onInitiated(images)
}
