let canvas
let context

function detectionContext() {
  if (context) {
    return context
  }

  if (!canvas) {
    canvas = document.createElement('canvas')
  }
  if (!canvas || !canvas.getContext) {
    return null
  }

  context = canvas.getContext('2d')
  return context
}

/**
 * Idea taken from https://github.com/stomita/ios-imagefile-megapixel
 * Detects whether the image has been sub sampled by the browser and does not have its original dimensions.
 * This method unfortunately does not work for images that have transparent background.
 */
export function detectSubsampling(img: HTMLImageElement, width: number, height: number) {

  if (!detectionContext()) {
    return false
  }

  // sub sampling happens on images above 1 megapixel
  if (width * height <= 1024 * 1024) {
    return false
  }

  // set canvas to 1x1 pixel size and fill it with magenta color
  canvas.width = canvas.height = 1
  context.fillStyle = '#FF00FF'
  context.fillRect(0, 0, 1, 1)
  // render the image with a negative offset to the left so that it would
  // fill the canvas pixel with the top right pixel of the image.
  context.drawImage(img, -width + 1, 0)

  // check color value to confirm image is covering edge pixel or not.
  // if color still magenta, the image is assumed to be sub sampled.
  try {
    const dat = context.getImageData(0, 0, 1, 1).data
    return (dat[0] === 255) && (dat[1] === 0) && (dat[2] === 255)
  } catch (err) {
    // avoids cross origin exception for chrome when code runs without a server
    return false
  }
}
