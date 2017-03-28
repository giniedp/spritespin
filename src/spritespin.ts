
namespace SpriteSpin {

  //
  // - INSTANCE REGISTRY
  //

  let instanceCounter = 0
  export const instances: {[key: string]: Instance} = {}

  function pushInstance(data: Instance) {
    instanceCounter += 1
    data.id = String(instanceCounter)
    instances[data.id] = data
  }

  function popInstance(data: Instance) {
    delete instances[data.id]
  }

  let lazyinit = () => {
    // replace function with a noop
    // this logic must run only once
    lazyinit = () => { /* noop */ }

    function eachInstance(cb) {
      for (const id in instances) {
        if (instances.hasOwnProperty(id)) {
          cb(instances[id])
        }
      }
    }

    function onEvent(eventName, e) {
      eachInstance((data: Instance) => {
        for (const module of data.plugins) {
          if (typeof module[eventName] === 'function') {
            module[eventName].apply(data.target, [e, data])
          }
        }
      })
    }

    function onResize() {
      eachInstance((data: Instance) => {
        if (data.responsive) {
          boot(data)
        }
      })
    }

    for (const eventName of eventNames) {
      $(window.document).bind(eventName + '.' + namespace, (e) => {
        onEvent('document' + eventName, e)
      })
    }

    let resizeTimeout = null
    $(window).on('resize', () => {
      window.clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(onResize, 100)
    })
  }

  //
  // - PLUGIN REGISTRY
  //

  /**
   * Collection of registered modules that can be used to extend the functionality of SpriteSpin.
   */
  const plugins = {}
  /**
   * Registers a module implementation as an available extension to SpriteSpin.
   * Use this to add custom Rendering or Updating modules that can be addressed with the 'module' option.
   */
  export function registerPlugin(name, plugin) {
    if (plugins[name]) {
      Utils.error(`Plugin name "${name}" is already taken`)
      return
    }
    plugin = plugin || {}
    plugins[name] = plugin
    return plugin
  }
  export function registerModule(name, plugin) {
    Utils.warn('"registerModule" is deprecated, use "registerPlugin" instead')
    registerPlugin(name, plugin)
  }

  //
  // - API REGISTRY
  //

  /**
   *
   */
  export class Api {
    constructor(public data: Instance) { }
  }

  /**
   * Helper method that allows to extend the api with more methods.
   * Receives an object with named functions that are extensions to the API.
   */
  export function registerApi(methods: { [key: string]: any }) {
    const api = Api.prototype
    for (const key in methods) {
      if (methods.hasOwnProperty(key)) {
        if (api[key]) {
          $.error('API method is already defined: ' + key)
        } else {
          api[key] = methods[key]
        }
      }
    }
    return api
  }
  export function extendApi(methods) {
    Utils.warn('"extendApi" is deprecated, use "registerApi" instead')
    registerApi(methods)
  }

  //
  // - STATE REGISTRY
  //

  function getState(data: Instance, name: string): any {
    data.state = data.state || {}
    data.state[name] = data.state[name] || {}
    return data.state[name]
  }

  export function getInputState(data: Instance): InputState {
    return getState(data, 'input')
  }

  export function getAnimationState(data: Instance): AnimationState {
    return getState(data, 'animation')
  }

  export function getPluginState(data: Instance, name: string) {
    const state = getState(data, 'plugin')
    state[name] = state[name] || {}
    return state[name]
  }

  export function is(data: Instance, flag: string): boolean {
    return !!getState(data, 'flags')[flag]
  }

  export function flag(data: Instance, flag: string, value: boolean) {
    getState(data, 'flags')[flag] = !!value
  }

  //
  // - INPUT HANDLING
  //

  export interface InputState {
    oldX: number
    oldY: number
    currentX: number
    currentY: number
    startX: number
    startY: number
    clickframe: number
    clicklane: number
    dX: number
    dY: number
    ddX: number
    ddY: number
    ndX: number
    ndY: number
    nddX: number
    nddY: number
  }

  function inputFromEvent(e) {
    let touches = e.touches
    let source = e

    // jQuery Event normalization does not preserve the 'event.touches'
    // try to grab touches from the original event
    if (e.touches === undefined && e.originalEvent !== undefined) {
      touches = e.originalEvent.touches
    }
    // get current touch or mouse position
    if (touches !== undefined && touches.length > 0) {
      source = e.touches[0]
    }
    return {
      clientX: source.clientX || 0,
      clientY: source.clientY || 0
    }
  }

  /**
   * Updates the input state of the SpriteSpin data using the given mouse or touch event.
   */
  export function updateInput(e, data: Instance) {
    const input = inputFromEvent(e)
    const state = getInputState(data)

    // cache positions from previous frame
    state.oldX = state.currentX
    state.oldY = state.currentY

    state.currentX = input.clientX
    state.currentY = input.clientY

    // Fix old position.
    if (state.oldX === undefined || state.oldY === undefined) {
      state.oldX = state.currentX
      state.oldY = state.currentY
    }

    // Cache the initial click/touch position and store the frame number at which the click happened.
    // Useful for different behavior implementations. This must be restored when the click/touch is released.
    if (state.startX === undefined || state.startY === undefined) {
      state.startX = state.currentX
      state.startY = state.currentY
      state.clickframe = data.frame
      state.clicklane = data.lane
    }

    // Calculate the vector from start position to current pointer position.
    state.dX = state.currentX - state.startX
    state.dY = state.currentY - state.startY

    // Calculate the vector from last frame position to current pointer position.
    state.ddX = state.currentX - state.oldX
    state.ddY = state.currentY - state.oldY

    // Normalize vectors to range [-1:+1]
    state.ndX = state.dX / data.width
    state.ndY = state.dY / data.height

    state.nddX = state.ddX / data.width
    state.nddY = state.ddY / data.height
  }

  /**
   * Resets the input state of the SpriteSpin data.
   */
  export function resetInput(data: Instance) {
    const input = getInputState(data)
    input.startX = input.startY = undefined
    input.currentX = input.currentY = undefined
    input.oldX = input.oldY = undefined
    input.dX = input.dY = 0
    input.ddX = input.ddY = 0
    input.ndX = input.ndY = 0
    input.nddX = input.nddY = 0
  }

  //
  // - ANIMATION HANDLING
  //

  export interface AnimationState {
    lastFrame: number
    lastLane: number
    handler: number
  }

  function updateLane(data: Instance, lane: number) {
    data.lane = lane
    if (data.wrapLane) {
      data.lane = Utils.wrap(data.lane, 0, data.lanes - 1, data.lanes)
    } else {
      data.lane = Utils.clamp(data.lane, 0, data.lanes - 1)
    }
  }

  function updateAnimationFrame(data: Instance) {
    data.frame += (data.reverse ? -1 : 1)
    // wrap the frame value to fit in range [0, data.frames)
    data.frame = Utils.wrap(data.frame, 0, data.frames - 1, data.frames)
    // stop animation if loop is disabled and the stopFrame is reached
    if (!data.loop && (data.frame === data.stopFrame)) {
      stopAnimation(data)
    }
  }

  function updateInputFrame(data: Instance, frame: number) {
    data.frame = Number(frame)
    if (data.wrap) {
      // wrap/clamp the frame value to fit in range [0, data.frames)
      data.frame = Utils.wrap(data.frame, 0, data.frames - 1, data.frames)
    } else {
      data.frame = Utils.clamp(data.frame, 0, data.frames - 1)
    }
  }

  function updateAnimation(data: Instance) {
    const state = getAnimationState(data)
    if (state.handler) {
      updateBefore(data)
      updateAnimationFrame(data)
      updateAfter(data)
    }
  }

  function updateBefore(data: Instance) {
    const state = getAnimationState(data)
    state.lastFrame = data.frame
    state.lastLane = data.lane
  }

  function updateAfter(data: Instance) {
    const state = getAnimationState(data)
    if (state.lastFrame !== data.frame || state.lastLane !== data.lane) {
      data.target.trigger('onFrameChanged', data)
    }
    data.target.trigger('onFrame', data)
    data.target.trigger('onDraw', data)
  }

  /**
   * Updates the frame number of the SpriteSpin data. Performs an auto increment if no frame number is given.
   */
  export function updateFrame(data: Instance, frame: number, lane?: number) {
    updateBefore(data)
    if (frame !== undefined) {
      updateInputFrame(data, frame)
    }
    if (lane !== undefined) {
      updateLane(data, lane)
    }
    updateAfter(data)
  }

  /**
   * Stops the running animation on given SpriteSpin data.
   */
  export function stopAnimation(data: Instance) {
    data.animate = false
    const animation = getAnimationState(data)
    if (animation.handler) {
      window.clearInterval(animation.handler)
      animation.handler = null
    }
  }

  /**
   * Starts animation on given SpriteSpin data if animation is enabled.
   */
  export function applyAnimation(data: Instance) {
    if (data.animate) {
      requestAnimation(data)
    } else {
      stopAnimation(data)
    }
  }

  function requestAnimation(data: Instance) {
    const state = getAnimationState(data)
    state.handler = (state.handler || window.setInterval((() => {
      updateAnimation(data)
    }), data.frameTime))
  }

  //
  //
  //

  export type Callback = (e, data: Instance) => void

  export interface CallbackOptions {
    /**
     * Occurs when plugin has been initialized, but before loading the source files
     */
    onInit?: Callback
    /**
     * Occurs when any source file has been loaded
     */
    onProgress?: Callback
    /**
     * Occurs when all source files have been loaded
     */
    onLoad?: Callback
    /**
     * Occurs when the frame number has been updated (e.g. during animation)
     */
    onFrame?: Callback
    /**
     * Occurs when all update is complete and frame can be drawn
     */
    onDraw?: Callback

    onComplete?: Callback
  }

  export type SizeMode = 'original' | 'fit' | 'fill' | 'stretch'
  export type RenderMode = 'canvas' | 'image' | 'background'
  export type Orientation = 'horizontal' | 'vertical'

  export interface Options extends CallbackOptions {
    /**
     * The target element which should hold the spritespin instance.
     */
    target?: any,

    /**
     * Url or array of urls to the image frames
     */
    source: string|string[]

    /**
     * The display width
     */
    width?: number

    /**
     * The display height
     */
    height?: number

    /**
     * Total number of frames
     */
    frames: number

    /**
     * Number of frames in one row of sprite sheet (if source is a spritesheet)
     */
    framesX?: number

    /**
     * Number of 360 sequences. Used for 3D like effect.
     */
    lanes?: number

    /**
     * Determines how the inner container is sized and scaled if it does not match the given
     * width and height dimensions.
     */
    sizeMode?: SizeMode

    /**
     * The presentation module to use
     * @deprecated
     */
    module?: string
    /**
     * The interaction module to use
     * @deprecated
     */
    behavior?: string

    /**
     * The rendering mode to use
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
     * If true starts the animation on load
     */
    animate?: boolean
    /**
     * If true animation is played backward
     */
    reverse?: boolean
    /**
     * If true animation is loopt infinitely
     */
    loop?: boolean
    /**
     * Stops the animation at this frame if loop is disabled
     */
    stopFrame?: number

    /**
     * If true wraps around the frame index on user interaction.
     */
    wrap?: boolean
    /**
     * If true wraps around the lane index on user interaction
     */
    wrapLane?: boolean
    /**
     * Interaction sensitivity used by behavior implementations
     */
    sense?: number
    /**
     * Interaction sensitivity used by behavior implementations
     */
    senseLane?: number
    /**
     * Preferred axis for user interaction
     */
    orientation?: Orientation|number
    /**
     * Tries to detect whether the images are downsampled by the browser.
     */
    detectSubsampling?: boolean
    /**
     * Number of pixels the user must drag within a frame to enable page scroll (for touch devices)
     */
    scrollThreshold?: number
    /**
     * Number of frames to preload. If nothing is set, all frames are preloaded.
     */
    preloadCount?: number

    /**
     *
     */
    responsive: boolean

    plugins: any[]
  }

  export interface Instance extends Options {
    id: string
    source: string[]
    images: HTMLImageElement[]
    target: any
    metrics: Utils.SheetSpec[]
    frameWidth: number
    frameHeight: number

    state: any
    loading: boolean

    stage: any
    canvas: any
    context: CanvasRenderingContext2D
    canvasRatio: number
  }

  export const $: any = (window['jQuery'] || window['Zepto'] || window['$']) // tslint:disable-line

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
    'onComplete'
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
    scrollThreshold   : 50,           // Number of pixels the user must drag within a frame to enable page scroll (for touch devices)
    preloadCount      : undefined,    // Number of frames to preload. If nothing is set, all frames are preloaded.

    onInit            : undefined,    // Occurs when plugin has been initialized, but before loading the source files
    onProgress        : undefined,    // Occurs when any source file has been loaded
    onLoad            : undefined,    // Occurs when all source files have been loaded
    onFrame           : undefined,    // Occurs when the frame number has been updated (e.g. during animation)
    onDraw            : undefined,     // Occurs when all update is complete and frame can be drawn

    responsive        : undefined,
    plugins           : [
      '360',
      'drag'
    ]
  }

  /**
   * Replaces module names on given SpriteSpin data and replaces them with actual implementations.
   */
  export function applyPlugins(data: Instance) {
    for (let i = 0; i < data.plugins.length; i += 1) {
      const name = data.plugins[i]
      if (typeof name !== 'string') {
        continue
      }
      const plugin = plugins[name]
      if (!plugin) {
        Utils.error('No plugin found with name ' + name)
        continue
      }
      data.plugins[i] = plugin
    }
  }

  /**
   * Applies css attributes to layout the SpriteSpin containers.
   */
  export function applyLayout(data: Instance) {
    // disable selection
    data.target
      .attr('unselectable', 'on')
      .css({
        width: '',
        height: '',
        '-ms-user-select': 'none',
        '-moz-user-select': 'none',
        '-khtml-user-select': 'none',
        '-webkit-user-select': 'none',
        'user-select': 'none'
      })

    const size = data.responsive ? Utils.getComputedSize(data) : Utils.getOuterSize(data)
    const layout = Utils.getInnerLayout(data.sizeMode, Utils.getInnerSize(data), size)

    // apply layout on target
    data.target.css({
      width    : size.width,
      height   : size.height,
      position : 'relative',
      overflow : 'hidden'
    })

    // apply layout on stage
    data.stage.css(layout).hide()

    if (!data.canvas) { return }
    // apply layout on canvas
    data.canvas.css(layout).hide()
    data.context.scale(data.canvasRatio, data.canvasRatio)

    // apply pixel ratio on canvas
    data.canvasRatio = data.canvasRatio || Utils.pixelRatio(data.context)
    if (typeof layout.width === 'number' && typeof layout.height === 'number') {
      data.canvas[0].width = ((layout.width as number) * data.canvasRatio) || size.width
      data.canvas[0].height = ((layout.height as number) * data.canvasRatio) || size.height
    } else {
      data.canvas[0].width = (size.width * data.canvasRatio)
      data.canvas[0].height = (size.height * data.canvasRatio)
    }
  }

  /**
   * (re)binds all spritespin events on the target element
   */
  export function applyEvents(data: Instance) {
    const target = data.target

    // Clear all SpriteSpin events on the target element
    Utils.unbind(target)

    // disable all default browser behavior on the following events
    // mainly prevents image drag operation
    for (const eName of SpriteSpin.eventsToPrevent) {
      Utils.bind(target, eName, Utils.prevent)
    }

    // Bind module functions to SpriteSpin events
    for (const plugin of data.plugins) {
      for (const eName of SpriteSpin.eventNames) {
        Utils.bind(target, eName, plugin[eName])
      }
      for (const eName of SpriteSpin.callbackNames) {
        Utils.bind(target, eName, plugin[eName])
      }
    }

    // bind auto start function to load event.
    Utils.bind(target, 'onLoad', (e, d) => {
      applyAnimation(d)
    })

    // bind all user events that have been passed on initialization
    for (const eName of SpriteSpin.callbackNames) {
      Utils.bind(target, eName, data[eName])
    }
  }

  function applyMetrics(data: Instance) {
    if (!data.images) {
      data.metrics = []
    }
    data.metrics = Utils.measure(data.images, data)
    const spec = Utils.findSpecs(data.metrics, data.frames, 0, 0)
    if (spec.sprite) {
      // TODO: try to remove frameWidth/frameHeight
      data.frameWidth = spec.sprite.width
      data.frameHeight = spec.sprite.height
    }
  }

  /**
   * Runs the boot process. (re)initializes plugins, (re)initializes the layout, (re)binds events and loads source images.
   */
  export function boot(data: Instance) {
    applyPlugins(data)
    applyLayout(data)
    applyEvents(data)

    data.loading = true
    data.target.addClass('loading').trigger('onInit', data)
    Utils.preload({
      source: data.source,
      preloadCount: data.preloadCount,
      progress: (progress) => {
        data.target.trigger('onProgress', [progress, data])
      },
      complete: (images) => {
        data.images = images
        data.loading = false
        data.frames = data.frames || images.length

        applyMetrics(data)
        applyLayout(data)
        data.stage.show()
        data.target
          .removeClass('loading')
          .trigger('onLoad', data)
          .trigger('onFrame', data)
          .trigger('onDraw', data)
          .trigger('onComplete', data)
      }
    })
  }

  function instantiate(options: Options): Instance {
    const $this = options.target

    // SpriteSpin is not initialized
    // Create default settings object and extend with given options
    const data = $.extend({}, defaults, options) as Instance

    // ensure source is set
    data.source = data.source || []
    // ensure plugins are set
    data.plugins = data.plugins || []

    // if image tags are contained inside this DOM element
    // use these images as the source files
    $this.find('img').each(() => {
      if (!Array.isArray(data.source)) {
        data.source = []
      }
      data.source.push($(this).attr('src'))
    })

    // build inner html
    // <div>
    //   <div class='spritespin-stage'></div>
    //   <canvas class='spritespin-canvas'></canvas>
    // </div>
    $this
      .empty()
      .addClass('spritespin-instance')
      .append("<div class='spritespin-stage'></div>")

    // add the canvas element if canvas rendering is enabled and supported
    if (data.renderer === 'canvas') {
      const canvas = document.createElement('canvas')
      if (!!(canvas.getContext && canvas.getContext('2d'))) {
        data.canvas = $(canvas).addClass('spritespin-canvas')
        data.context = canvas.getContext('2d')
        $this.append(data.canvas)
        $this.addClass('with-canvas')
      } else {
        // fallback to image rendering mode
        data.renderer = 'image'
      }
    }

    // setup references to DOM elements
    data.target = $this
    data.stage = $this.find('.spritespin-stage')

    // store the data
    $this.data(namespace, data)
    pushInstance(data)

    return data
  }

  function fixPlugins(data: Instance) {

    // tslint:disable
    if (data['mods']) {
      Utils.warn('"mods" option is deprecated, use "plugins" instead')
      data.plugins = data['mods']
    }
    // tslint:enable

    if (data.behavior || data.module) {
      Utils.warn('"behavior" and "module" options are deprecated, use "plugins" instead')
      if (data.behavior) {
        data.plugins.push(data.behavior)
      }
      if (data.module) {
        data.plugins.push(data.module)
      }

      delete data.behavior
      delete data.module
    }
  }

  /**
   * Initializes the target element with spritespin data.
   */
  export function createOrUpdate(options: Options) {
    lazyinit()

    const $this = options.target
    let data  = $this.data(namespace) as Instance

    if (!data) {
      data = instantiate(options)
    } else {
      // just update the data object
      $.extend(data, options)
    }

    data.source = Utils.toArray(data.source)

    fixPlugins(data)

    boot(data)
  }

  /**
   * Stops running animation, unbinds all events and deletes the data on the target element of the given data object.
   */
  export function destroy(data: Instance) {
    popInstance(data)
    stopAnimation(data)
    Utils.unbind(data.target)
    data.target.removeData(namespace)
  }

  function extension(obj, value) {
    if (obj === 'data') {
      return this.data(namespace)
    }
    if (obj === 'api') {
      const data = this.data(namespace)
      data.api = data.api || new SpriteSpin.Api(data)
      return data.api
    }
    if (obj === 'destroy') {
      return $(this).each(() => {
        SpriteSpin.destroy($(this).data(namespace))
      })
    }
    if (arguments.length === 2 && typeof obj === 'string') {
      const tmp = {}
      tmp[obj] = value
      obj = tmp
    }
    if (typeof obj === 'object') {
      obj.target = obj.target || $(this)
      SpriteSpin.createOrUpdate(obj)
      return obj.target
    }

    return $.error('Invalid call to spritespin')
  }

  $.fn.spritespin = extension
}
