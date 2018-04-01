function padNumber(num: number, length: number, pad: string): string {
  let result = String(num)
  while (result.length < length) {
    result = String(pad) + num
  }
  return result
}

/**
 * Options for {@link sourceArray} function
 */
export interface SourceArrayOptions {
  /**
   * Minimum number of digits
   */
  digits?: number
  /**
   * Start and end frame numbers
   */
  frame?: number[]
  /**
   * Start and end lane numbers
   */
  lane?: number[]
  /**
   * Variable to be replaced by a frame number e.g. '{frame}'
   */
  framePlacer?: string
  /**
   * Variable to be replaced by a lane number e.g. '{lane}'
   */
  lanePlacer?: string
}

/**
 * Generates an array of source strings
 *
 * @remarks
 * Takes a template string and generates an array of strings by interpolating {lane} and {frame} placeholders.
 *
 * ```
 * sourceArray('http://example.com/image_{frame}.jpg, { frame: [1, 3], digits: 2 })
 * // gives:
 * // [ 'http://example.com/image_01.jpg', 'http://example.com/image_02.jpg', 'http://example.com/image_03.jpg' ]
 *
 * sourceArray('http://example.com/image_FRAME.jpg, { frame: [1, 3], digits: 2, framePlacer: 'FRAME' })
 * // gives:
 * // [ 'http://example.com/image_01.jpg', 'http://example.com/image_02.jpg', 'http://example.com/image_03.jpg' ]
 * ```
 *
 * @param template - The template string
 * @param opts - Interpolation options
 *
 * @public
 */
export function sourceArray(template: string, opts: SourceArrayOptions) {
  const digits = opts.digits || 2
  const lPlacer = opts.lanePlacer || '{lane}'
  const fPlacer = opts.framePlacer || '{frame}'

  let fStart = 0
  let fEnd = 0
  if (opts.frame) {
    fStart = opts.frame[0]
    fEnd = opts.frame[1]
  }
  let lStart = 0
  let lEnd = 0
  if (opts.lane) {
    lStart = opts.lane[0]
    lEnd = opts.lane[1]
  }
  const result = []
  for (let lane = lStart; lane <= lEnd; lane += 1) {
    for (let frame = fStart; frame <= fEnd; frame += 1) {
      result.push(template
        .replace(lPlacer, padNumber(lane, digits, '0'))
        .replace(fPlacer, padNumber(frame, digits, '0'))
      )
    }
  }
  return result
}
