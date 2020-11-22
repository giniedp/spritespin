import { PreloadProgress, SheetSpec } from './utils'

/**
 * A callback function
 *
 * @public
 */
export type SpriteSpinCallback = (this: HTMLElement, e: Event, data: Data) => void

/**
 * Additional callback options for SpriteSpin
 *
 * @public
 */
export interface LifeCycleOptions {
  /**
   * Occurs when the plugin has been initialized, but before loading the source files.
   */
  onInit?: SpriteSpinCallback
  /**
   * Occurs when any source file has been loaded and the progress has changed.
   */
  onProgress?: SpriteSpinCallback
  /**
   * Occurs when all source files have been loaded and spritespin is ready to update and draw.
   */
  onLoad?: SpriteSpinCallback
  /**
   * Occurs when the frame number has been updated (e.g. during animation)
   */
  onFrame?: SpriteSpinCallback
  /**
   * Occurs when the frame number has changed.
   */
  onFrameChanged?: SpriteSpinCallback
  /**
   * Occurs when all update is complete and frame can be drawn
   */
  onDraw?: SpriteSpinCallback
  /**
   * Occurs when spritespin has been loaded and the first draw operation is complete
   */
  onComplete?: SpriteSpinCallback
}

/**
 * @public
 */
export type SizeMode = 'original' | 'fit' | 'fill' | 'stretch'

/**
 * @public
 */
export type RenderMode = 'canvas' | 'image' | 'background'

/**
 * @public
 */
export type Orientation = 'horizontal' | 'vertical'

/**
 * Options for SpriteSpin
 *
 * @public
 */
export interface Options extends LifeCycleOptions {
  /**
   * The target element which should hold the spritespin instance. This is usually already specified by the jQuery selector but can be overridden here.
   */
  target?: HTMLElement,

  /**
   * Image URL or array of urls to be used.
   */
  source: string | string[]

  /**
   * The display width in pixels.
   *
   * @remarks
   * Width and height should match the aspect ratio of the frames.
   */
  width?: number

  /**
   * The display height in pixels.
   *
   * @remarks
   * Width and height should match the aspect ratio of the frames.
   */
  height?: number

  /**
   * Number of frames for a full 360 rotation.
   *
   * @remarks
   * If multiple lanes are used, each lane must have this amount of frames.
   */
  frames: number

  /**
   * Number of frames in one row of a single sprite sheet.
   */
  framesX?: number

  /**
   * Number of frames in one column of a single sprite sheet.
   */
  framesY?: number

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
   * The initial sequence number to play.
   *
   * @remarks
   * This value is updated each frame and also represents the current lane number.
   */
  lane?: number
  /**
   * Initial frame number.
   *
   * @remarks
   * This value is updated each frame and also represents the current frame number.
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
   * If true, retains the animation after user user interaction
   */
  retainAnimate?: boolean
  /**
   * If true, animation playback is reversed
   */
  reverse?: boolean
  /**
   * If true, continues playback in a loop.
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
   * If true, tries to detect whether the images are down sampled by the browser.
   */
  detectSubsampling?: boolean
  /**
   * Number of images to preload. If nothing is set, all images are preloaded.
   */
  preloadCount?: number

  /**
   * If true, display width can be controlled by CSS.
   *
   * @remarks
   * Width and height must still both be set and are used to calculate the aspect ratio.
   */
  responsive?: boolean

  /**
   * Time range in ms when touch scroll will be disabled during interaction with SpriteSpin
   */
  touchScrollTimer?: [number, number]

  /**
   * Array of plugins to load
   */
  plugins?: any[]

  /**
   * Allows to download images from foreign origins
   *
   * @remarks
   * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
   */
  crossOrigin?: string
}

/**
 * The instance data of SpriteSpin
 *
 * @public
 */
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
  target: HTMLElement

  /**
   * The inner stage element
   */
  stage: HTMLElement

  /**
   * The inner canvas element
   */
  canvas: HTMLCanvasElement

  /**
   * The 2D context of the canvas element
   */
  context: CanvasRenderingContext2D

  /**
   * The pixel ratio of the canvas element
   */
  canvasRatio: number

  /**
   *
   */
  api: Api
}

/**
 * A spritespin api function
 *
 * @public
 */
export type ApiFunction<T extends Api = Api> = (this: T, ...args: any[]) => any

/**
 * The spritespin api instance
 *
 * @public
 */
export class Api {
  constructor(public data: Data) { }
}

/**
 * An object with extension methods for spritespin api
 *
 * @public
 */
export interface ApiExtension {
  [key: string]: ApiFunction
}
