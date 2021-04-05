import type { PluginEvents, Options, PluginLifecycle } from './models'

declare const VERSION_STRING: string

/**
 * The version string
 *
 * @public
 */
export const VERSION = typeof VERSION_STRING === 'string' ? VERSION_STRING : null

/**
 * The namespace that is used to bind functions to DOM events and store the data object
 *
 * @public
 */
export const namespace = 'spritespin'

/**
 * Event names that are recognized by SpriteSpin. A module can implement any of these and they will be bound
 * to the target element on which the plugin is called.
 *
 * @public
 */
export const eventNames: Array<keyof PluginEvents> = [
  'resize',
  'blur',
  'focus',
  'click',
  'dblclick',
  'keydown',
  'keypress',
  'keyup',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'wheel',
  'mousewheel',
]

/**
 *
 * @public
 */
export const lifecycleNames: Array<keyof PluginLifecycle> = [
  'onInit',
  'onProgress',
  'onLoad',
  'onFrameChanged',
  'onFrame',
  'onDraw',
  'onComplete',
  'onDestroy',
]

/**
 * Default set of SpriteSpin options. This also represents the majority of data attributes that are used during the
 * lifetime of a SpriteSpin instance. The data is stored inside the target DOM element on which the plugin is called.
 *
 * @public
 */
export const defaults: Options = {
  source: undefined,
  width: undefined,
  height: undefined,
  frames: undefined,
  framesX: undefined,
  lanes: 1,
  fillMode: 'contain',
  renderMode: 'canvas',

  lane: 0,
  frame: 0,
  frameTime: 40,
  animate: true,
  retainAnimate: false,
  reverse: false,
  loop: true,
  stopFrame: 0,

  wrap: true,
  wrapLane: false,
  sense: 1,
  senseLane: undefined,
  orientation: 'horizontal',
  detectSubsampling: true,
  preloadCount: undefined,

  plugins: ['360', 'drag'],
}
