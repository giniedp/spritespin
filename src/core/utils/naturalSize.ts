let img: HTMLImageElement

/**
 * gets the original width and height of an image element
 */
export function naturalSize(image: HTMLImageElement) {
  // for browsers that support naturalWidth and naturalHeight properties
  if (image.naturalWidth) {
    return {
      height: image.naturalHeight,
      width: image.naturalWidth
    }
  }

  // browsers that do not support naturalWidth and naturalHeight properties have to fall back to the width and
  // height properties. However, the image might have a css style applied so width and height would return the
  // css size. To avoid that create a new Image object that is free of css rules and grab width and height
  // properties
  //
  // assume that the src has already been downloaded, so no onload callback is needed.
  img = img || new Image()
  img.crossOrigin = image.crossOrigin
  img.src = image.src
  return {
    height: img.height,
    width: img.width
  }
}
