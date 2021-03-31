import type { PluginEvents, Options, PluginLifecycle } from './models'

/**
 * The namespace that is used to bind functions to DOM events and store the data object
 */
const namespace = 'spritespin'

/**
 * Event names that are recognized by SpriteSpin. A module can implement any of these and they will be bound
 * to the target element on which the plugin is called.
 */
const eventNames: Array<keyof PluginEvents> = [
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
 */
const lifecycleNames: Array<keyof PluginLifecycle> = [
  'onInit',
  'onProgress',
  'onLoad',
  'onFrameChanged',
  'onFrame',
  'onDraw',
  'onComplete',
  'onDestroy'
]

/**
 * Default set of SpriteSpin options. This also represents the majority of data attributes that are used during the
 * lifetime of a SpriteSpin instance. The data is stored inside the target DOM element on which the plugin is called.
 */
const defaults: Options = {
  source            : undefined,    // Stitched source image or array of files
  width             : undefined,    // actual display width
  height            : undefined,    // actual display height
  frames            : undefined,    // Total number of frames
  framesX           : undefined,    // Number of frames in one row of sprite sheet (if source is a sprite sheet)
  lanes             : 1,            // Number of 360 sequences. Used for 3D like effect.
  fillMode          : 'contain',    //
  renderMode        : 'canvas',     // The rendering mode to use

  lane              : 0,            // The initial sequence number to play
  frame             : 0,            // Initial (and current) frame number
  frameTime         : 40,           // Time in ms between updates. 40 is exactly 25 FPS
  animate           : true,         // If true starts the animation on load
  retainAnimate     : false,        // If true, retains the animation after user interaction
  reverse           : false,        // If true animation is played backward
  loop              : true,         // If true loops the animation
  stopFrame         : 0,            // Stops the animation at this frame if loop is disabled

  wrap              : true,         // If true wraps around the frame index on user interaction
  wrapLane          : false,        // If true wraps around the lane index on user interaction
  sense             : 1,            // Interaction sensitivity used by behavior implementations
  senseLane         : undefined,    // Interaction sensitivity used by behavior implementations
  orientation       : 'horizontal', // Preferred axis for user interaction
  detectSubsampling : true,         // Tries to detect whether the images are down sampled by the browser.
  preloadCount      : undefined,    // Number of frames to preload. If nothing is set, all frames are preloaded.

  touchScrollTimer  : [200, 1500],  // Time range in ms when touch scroll will be disabled during interaction with SpriteSpin
  plugins           : ['360', 'drag']
}

export const Constants = {
  namespace,
  eventNames,
  lifecycleNames,
  defaults
}
