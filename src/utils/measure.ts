namespace SpriteSpin.Utils {

  export interface Sheet {
    source: string
    frames: number
    framesX: number
  }

  export interface SheetSpec extends Sheet {
    image: HTMLImageElement
    loaded: boolean

    frameWidth?: number
    frameHeight?: number

    sourceWidth?: number
    sourceHeight?: number
    isSubsampled?: boolean
  }

  /**
   * Measures the image frames that are used in the given data object
   */
  export function measure(images: HTMLImageElement[], sheet: SheetSpec, dss: boolean) {
    if (images.length === 1) {
      measureSheet(images[0], sheet, dss)
    } else {
      measureFrames(images, sheet, dss)
    }
  }

  function measureSheet(image: HTMLImageElement, sheet: SheetSpec, dss: boolean) {
    measureFrame(image, sheet, dss)
    const framesY = Math.ceil(sheet.frames / sheet.framesX)
    sheet.frameWidth = Math.floor(sheet.sourceWidth / sheet.framesX)
    sheet.frameHeight = Math.floor(sheet.sourceHeight / framesY)
  }

  function measureFrames(images: HTMLImageElement[], sheet: SheetSpec, dss: boolean) {
    measureFrame(images[0], sheet, dss)
    sheet.frameWidth = sheet.sourceWidth
    sheet.frameHeight = sheet.sourceHeight
    sheet.framesX = 1
  }

  function measureFrame(image: HTMLImageElement, sheet: SheetSpec, dss: boolean) {
    const size = naturalSize(image)
    sheet.isSubsampled = dss && detectSubsampling(image, size)
    sheet.sourceWidth = size.width / (sheet.isSubsampled ? 2 : 1)
    sheet.sourceHeight = size.height / (sheet.isSubsampled ? 2 : 1)
  }
}
