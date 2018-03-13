import { PreloadProgress, SheetSpec } from '../utils'

export type Callback = (e: any, data: Data) => void

export interface CallbackOptions {
  /**
   * Occurs when the plugin has been initialized, but before loading the source files.
   */
  onInit?: Callback
  /**
   * Occurs when any source file has been loaded and the progress has changed.
   */
  onProgress?: Callback
  /**
   * Occurs when all source files have been loaded and spritespin is ready to update and draw.
   */
  onLoad?: Callback
  /**
   * Occurs when the frame number has been updated (e.g. during animation)
   */
  onFrame?: Callback
  /**
   * Occurs when the frame number has changed.
   */
  onFrameChanged?: Callback
  /**
   * Occurs when all update is complete and frame can be drawn
   */
  onDraw?: Callback
  /**
   * Occurs when spritespin has been loaded and the first draw operation is complente
   */
  onComplete?: Callback
}

export type SizeMode = 'original' | 'fit' | 'fill' | 'stretch'
export type RenderMode = 'canvas' | 'image' | 'background'
export type Orientation = 'horizontal' | 'vertical'

export interface Options extends CallbackOptions {
  /**
   * The target element which should hold the spritespin instance. This is usually aready specified by the jQuery selector but can be overridden here.
   */
  target?: any,

  /**
   * Image URL or array of urls that should be used.
   */
  source: string | string[]

  /**
   * The display width in pixels. Width and height should match the aspect ratio of the frames.
   */
  width?: number

  /**
   * The display height in pixels. Width and height should match the aspect ratio of the frames.
   */
  height?: number

  /**
   * This is the number of frames for a full 360 rotation. If multiple lanes are used, each lane must have this amount of frames.
   */
  frames: number

  /**
   * Number of frames in one row of a single sprite sheet.
   */
  framesX?: number

  /**
   * Number of sequences.
   */
  lanes?: number

  /**
   * Specifies how the frames are sized and scaled if it does not match the given
   * width and height dimensions.
   */
  sizeMode?: SizeMode

  /**
   * The presentation module to use
   *
   * @deprecated please use plugins option instead
   */
  module?: string
  /**
   * The interaction module to use
   *
   * @deprecated please use plugins option instead
   */
  behavior?: string

  /**
   * Specifies the rendering mode.
   */
  renderer?: RenderMode

  /**
   * The initial sequence number to play. This value is updated each frame and also represends the current lane number.
   */
  lane?: number
  /**
   * Initial frame number. This value is updated each frame and also represends the current frame number.
   */
  frame?: number
  /**
   * Time in ms between updates. e.g. 40 is exactly 25 FPS
   */
  frameTime?: number
  /**
   * If true, starts the animation automatically on load
   */
  animate?: boolean
  /**
   * If true, animation playback is reversed
   */
  reverse?: boolean
  /**
   * If true, continues to play the animation in a loop without stopping.
   */
  loop?: boolean
  /**
   * Stops the animation on that frame if `loop` is false.
   */
  stopFrame?: number

  /**
   * If true, allows the user to drag the animation beyond the last frame and wrap over to the beginning.
   */
  wrap?: boolean
  /**
   * If true, allows the user to drag the animation beyond the last sequence and wrap over to the beginning.
   */
  wrapLane?: boolean
  /**
   * Sensitivity factor for user interaction
   */
  sense?: number
  /**
   * Sensitivity factor for user interaction
   */
  senseLane?: number
  /**
   * Preferred axis for user interaction
   */
  orientation?: Orientation | number
  /**
   * If true, tries to detect whether the images are downsampled by the browser.
   */
  detectSubsampling?: boolean
  /**
   * Number of pixels the user must drag within a frame to enable page scroll (for touch devices)
   */
  scrollThreshold?: number
  /**
   * Number of images to preload. If nothing is set, all images are preloaded.
   */
  preloadCount?: number

  /**
   * If true, display width can be controlled by CSS. width and height must still both be set and are used to calculate the aspect ratio.
   */
  responsive?: boolean

  /**
   * Array of plugins to load
   */
  plugins?: any[]
}

export interface Data extends Options {
  /**
   * The unique spritespin instance identifier
   */
  id: string

  /**
   * Array of all image urls
   */
  source: string[]

  /**
   * Array of all image elements
   */
  images: HTMLImageElement[]

  /**
   * The current preload progress state
   */
  progress: null | PreloadProgress

  /**
   * Array with measurement information for each image
   */
  metrics: SheetSpec[]

  /**
   * The detected width of a single frame
   */
  frameWidth: number

  /**
   * The detected height of a single frame
   */
  frameHeight: number

  /**
   * Opaque state object. Plugins may store their information here.
   */
  state: any

  /**
   * Is true during the preload phase
   */
  loading: boolean

  /**
   * The target element
   */
  target: JQuery

  /**
   * The inner stage element
   */
  stage: JQuery

  /**
   * The inner canvas element
   */
  canvas: JQuery<HTMLCanvasElement>

  /**
   * The 2D context of the canvas element
   */
  context: CanvasRenderingContext2D

  /**
   * The pixel ratio of the canvas element
   */
  canvasRatio: number
}
