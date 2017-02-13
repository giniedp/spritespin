module SpriteSpin.Utils {

  /**
   * Measures the image frames that are used in the given data object
   */
  export function measureSource(data) {
    const img = data.images[0]
    const size = naturalSize(img)

    if (data.images.length === 1) {
      data.sourceWidth = size.width
      data.sourceHeight = size.height
      if (data.detectSubsampling && detectSubsampling(img, size)) {
        data.sourceWidth /= 2
        data.sourceHeight /= 2
      }

      // calculate the number of frames packed in a row
      // assume tightly packed images without any padding pixels
      data.framesX = data.framesX || data.frames

      // calculate size of a single frame
      if (!data.frameWidth || !data.frameHeight) {
        if (data.framesX) {
          data.frameWidth = Math.floor(data.sourceWidth / data.framesX)
          const framesY = Math.ceil((data.frames * data.lanes) / data.framesX)
          data.frameHeight = Math.floor(data.sourceHeight / framesY)
        } else {
          data.frameWidth = size.width
          data.frameHeight = size.height
        }
      }
    } else {
      data.sourceWidth = data.frameWidth = size.width
      data.sourceHeight = data.frameHeight = size.height
      if (detectSubsampling(img, size)) {
        data.sourceWidth = data.frameWidth = size.width / 2
        data.sourceHeight = data.frameHeight = size.height / 2
      }
      data.frames = data.frames || data.images.length
    }
  }
}
