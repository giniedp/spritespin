module SpriteSpin.Utils {

  /**
   * converts the given number to string and pads it to match at least the given length.
   * The pad value is added in front of the string. This padNumber(4, 5, 0) would convert 4 to '00004'
   */
  function padNumber(num, length, pad) {
    num = String(num)
    while (num.length < length) {
      num = String(pad) + num
    }
    return num
  }

  /**
   * Generates an array of source strings
   * - path is a source string where the frame number of the file name is exposed as '{frame}'
   * - start indicates the first frame number
   * - end indicates the last frame number
   * - digits is the number of digits used in the file name for the frame number
   * @example
   *      sourceArray('http://example.com/image_{frame}.jpg, { frame: [1, 3], digits: 2 })
   *      // -> [ 'http://example.com/image_01.jpg', 'http://example.com/image_02.jpg', 'http://example.com/image_03.jpg' ]
   */
  export function sourceArray(path, opts) {
    let fStart = 0, fEnd = 0, lStart = 0, lEnd = 0
    const digits = opts.digits || 2

    if (opts.frame) {
      fStart = opts.frame[0]
      fEnd = opts.frame[1]
    }
    if (opts.lane) {
      lStart = opts.lane[0]
      lEnd = opts.lane[1]
    }
    let i, j, temp
    const result = []
    for (i = lStart; i <= lEnd; i += 1 ) {
      for (j = fStart; j <= fEnd; j += 1) {
        temp = path.replace('{lane}', padNumber(i, digits, 0))
        temp = temp.replace('{frame}', padNumber(j, digits, 0))
        result.push(temp)
      }
    }
    return result
  }
}
module SpriteSpin {
  export const sourceArray = Utils.sourceArray
}
