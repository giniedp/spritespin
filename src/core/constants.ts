import { Options } from './models'

/**
 * The namespace that is used to bind functions to DOM events and store the data object
 */
export const namespace = 'spritespin'

/**
 * Event names that are recognized by SpriteSpin. A module can implement any of these and they will be bound
 * to the target element on which the plugin is called.
 */
export const eventNames = [
  'mousedown',
  'mousemove',
  'mouseup',
  'mouseenter',
  'mouseover',
  'mouseleave',
  'dblclick',
  'mousewheel',
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
  'selectstart',
  'gesturestart',
  'gesturechange',
  'gestureend'
]

/**
 *
 */
export const callbackNames = [
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
 * Names of events for that the default behavior should be prevented.
 */
export const eventsToPrevent = [
  'dragstart'
]

/**
 * Default set of SpriteSpin options. This also represents the majority of data attributes that are used during the
 * lifetime of a SpriteSpin instance. The data is stored inside the target DOM element on which the plugin is called.
 */
export const defaults: Options = {
  source            : undefined,    // Stitched source image or array of files
  width             : undefined,    // actual display width
  height            : undefined,    // actual display height
  frames            : undefined,    // Total number of frames
  framesX           : undefined,    // Number of frames in one row of sprite sheet (if source is a spritesheet)
  lanes             : 1,            // Number of 360 sequences. Used for 3D like effect.
  sizeMode          : undefined,    //

  renderer          : 'canvas',     // The rendering mode to use

  lane              : 0,            // The initial sequence number to play
  frame             : 0,            // Initial (and current) frame number
  frameTime         : 40,           // Time in ms between updates. 40 is exactly 25 FPS
  animate           : true,         // If true starts the animation on load
  reverse           : false,        // If true animation is played backward
  loop              : true,         // If true loops the animation
  stopFrame         : 0,            // Stops the animation at this frame if loop is disabled

  wrap              : true,         // If true wraps around the frame index on user interaction
  wrapLane          : false,        // If true wraps around the lane index on user interaction
  sense             : 1,            // Interaction sensitivity used by behavior implementations
  senseLane         : undefined,    // Interaction sensitivity used by behavior implementations
  orientation       : 'horizontal', // Preferred axis for user interaction
  detectSubsampling : true,         // Tries to detect whether the images are downsampled by the browser.
  preloadCount      : undefined,    // Number of frames to preload. If nothing is set, all frames are preloaded.

  responsive        : undefined,
  plugins           : [
    '360',
    'drag'
  ]
}
