namespace SpriteSpin.Utils {

  /**
   *
   */
  export interface MeasureSheetOptions {
    frames: number
    framesX?: number
    detectSubsampling?: boolean
  }

  /**
   *
   */
  export interface SheetSpec {
    id: number
    width: number
    height: number
    sprites: SpriteSpec[]

    sampledWidth?: number
    sampledHeight?: number
    isSubsampled?: boolean
  }

  /**
   *
   */
  export interface SpriteSpec {
    id: number
    x: number
    y: number
    width: number
    height: number

    sampledX?: number
    sampledY?: number
    sampledWidth?: number
    sampledHeight?: number
  }

  /**
   * Measures the image frames that are used in the given data object
   */
  export function measure(images: HTMLImageElement[], options: MeasureSheetOptions): SheetSpec[] {
    if (images.length === 1) {
      return [measureSheet(images[0], options)]
    } else {
      return measureFrames(images, options)
    }
  }

  function measureSheet(image: HTMLImageElement, options: MeasureSheetOptions): SheetSpec {
    const result: SheetSpec = { id: 0, sprites: [] } as any
    measureImage(image, options, result)
    const frames = options.frames
    const framesX = Number(options.framesX) || frames
    const framesY = Math.ceil(frames / framesX)
    const frameWidth = Math.floor(result.width / framesX)
    const frameHeight = Math.floor(result.height / framesY)
    const divisor = result.isSubsampled ? 2 : 1
    for (let i = 0; i < frames; i++) {
      const x = (i % framesX) * frameWidth
      const y = Math.floor(i / framesX) * frameHeight
      result.sprites.push({
        id: i,
        x: x, y: y,
        width: frameWidth,
        height: frameHeight,
        sampledX: x / divisor,
        sampledY: y / divisor,
        sampledWidth: frameWidth / divisor,
        sampledHeight: frameHeight / divisor
      })
    }
    return result
  }

  function measureFrames(images: HTMLImageElement[], options: MeasureSheetOptions): SheetSpec[] {
    const result: SheetSpec[] = []
    for (let id = 0; id < images.length; id++) {
      // TODO: optimize
      // dont measure images with same size twice
      const sheet = measureSheet(images[id], { frames: 1, framesX: 1, detectSubsampling: options.detectSubsampling })
      sheet.id = id
      result.push(sheet)
    }
    return result
  }

  function measureImage(image: HTMLImageElement, options: MeasureSheetOptions, result: SheetSpec): SheetSpec {
    const size = Utils.naturalSize(image)
    result.isSubsampled = options.detectSubsampling && Utils.detectSubsampling(image, size.width, size.height)
    result.width = size.width
    result.height = size.height
    result.sampledWidth = size.width / (result.isSubsampled ? 2 : 1)
    result.sampledHeight = size.height / (result.isSubsampled ? 2 : 1)
    return result
  }

  export function findSpecs(metrics: SheetSpec[], frames: number, frame: number, lane: number) {
    let spriteId = lane * frames + frame
    let sheetId = 0
    let sprite: SpriteSpin.Utils.SpriteSpec = null
    let sheet: SpriteSpin.Utils.SheetSpec = null

    while (true) {
      sheet = metrics[sheetId]
      if (!sheet) { break }

      if (spriteId >= sheet.sprites.length) {
        spriteId -= sheet.sprites.length
        sheetId++
        continue
      }

      sprite = sheet.sprites[spriteId]
      break
    }
    return { sprite, sheet }
  }
}
