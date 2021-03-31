import type { Instance } from './instance'
import { PreloadProgress, SheetSpec } from './utils'

/**
 * A spritespin instance method
 *
 * @public
 */
export type InstanceMethod<T extends Instance = Instance> = (this: T, ...args: any[]) => any

/**
 * An object with extension methods for spritespin instance
 *
 * @public
 */
export type InstanceExtension = Record<string, InstanceMethod>

/**
 * A callback function
 *
 * @public
 */
export type PluginMethod = (e: Event, instance: InstanceState) => void

/**
 * The plugin lifecycle interface
 *
 * @public
 */
export interface PluginLifecycle {
  /**
   * Occurs when the plugin has been initialized, but before loading the source files.
   */
  onInit?: PluginMethod
  /**
   * Occurs during the preload phase when preload progress is changed
   */
  onProgress?: PluginMethod
  /**
   * Occurs when all source files have been loaded and spritespin is ready to update and draw.
   */
  onLoad?: PluginMethod
  /**
   * Occurs when the frame number has changed.
   */
  onFrameChanged?: PluginMethod
  /**
   * Occurs when the frame number has been updated (e.g. during animation)
   */
  onFrame?: PluginMethod
  /**
   * Occurs when all update is complete and frame can be drawn
   */
  onDraw?: PluginMethod
  /**
   * Occurs when spritespin has been loaded and the first draw operation is complete
   */
  onComplete?: PluginMethod
  /**
   * Occurs when plugin should be removed from spritespin
   */
  onDestroy?: PluginMethod
}

/**
 * The plugin DOM events interface
 *
 * @public
 */
 export interface PluginEvents {
  resize?: PluginMethod
  blur?: PluginMethod
  focus?: PluginMethod
  click?: PluginMethod
  dblclick?: PluginMethod
  keydown?: PluginMethod
  keypress?: PluginMethod
  keyup?: PluginMethod
  mousedown?: PluginMethod
  mouseenter?: PluginMethod
  mouseleave?: PluginMethod
  mousemove?: PluginMethod
  mouseout?: PluginMethod
  mouseover?: PluginMethod
  mouseup?: PluginMethod
  touchcancel?: PluginMethod
  touchend?: PluginMethod
  touchmove?: PluginMethod
  touchstart?: PluginMethod
  wheel?: PluginMethod
  mousewheel?: PluginMethod
}

/**
 * Describes a SpriteSpin plugin
 *
 * @public
 */
export interface PluginInstance extends PluginLifecycle, PluginEvents {
  /**
   * The name of the plugin
   */
  name?: string
}

export type PluginType = PluginInstance | PluginClass | PluginFactory

/**
 * A plugin class
 *
 * @public
 */
export type PluginClass = {
  new (instance: InstanceState): PluginInstance
}

/**
 * A plugin factory function
 *
 * @public
 */
export type PluginFactory = (instance: InstanceState) => PluginInstance

/**
 * @public
 */
export type FillMode = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'

/**
 * @public
 */
export type RenderMode = 'canvas' | 'image' | 'background' | null

/**
 * @public
 */
export type Orientation = 'horizontal' | 'vertical'

/**
 * Options for SpriteSpin
 *
 * @public
 */
export interface Options extends PluginLifecycle {
  /**
   * The target element which should hold the spritespin instance. This is usually already specified by the jQuery selector but can be overridden here.
   */
  target?: HTMLElement | string

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
  frames?: number

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
  fillMode?: FillMode

  /**
   * Specifies the rendering mode.
   */
  renderMode?: RenderMode

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
   * Time range in ms when touch scroll will be disabled during interaction with SpriteSpin
   */
  touchScrollTimer?: [number, number]

  /**
   * Array of plugins to load
   */
  plugins?: Array<string | { name: string; options: any }>

  /**
   * Allows to download images from foreign origins
   *
   * @remarks
   * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
   */
  crossOrigin?: string
}

/**
 * The spritespin instance state
 *
 * @public
 */
export interface InstanceState extends Options {
  /**
   * The target element
   */
  target: HTMLElement

  /**
   * The spritespin instance
   */
  instance: Instance

  /**
   * The stage element where rendering happens
   */
  stage: HTMLElement

  /**
   * The canvas element where rendering happens
   */
  canvas: HTMLCanvasElement

  /**
   * The 2d rendering context
   */
  canvasContext: CanvasRenderingContext2D

  /**
   * The canvas pixel ratio
   */
  canvasRatio: number

  /**
   * The current preload progress state
   */
  progress: null | PreloadProgress

  /**
   * Is true during the preload phase
   */
  isLoading: boolean

  /**
   * Is true when touch interaction is active
   */
  isDragging: boolean

  /**
   * Is true when frame upate is temporarily halted
   */
  isHalted: boolean

  /**
   * Array of all image urls
   */
  source: string[]

  /**
   * Array of all source images
   */
  images: HTMLImageElement[]

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
  opaque: Record<string, unknown>

  /**
   * Array of plugins to load
   */
  activePlugins: PluginInstance[]
}
