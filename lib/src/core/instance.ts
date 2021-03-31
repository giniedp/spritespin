import { __assign } from 'tslib'
import { Constants } from './constants'
import { Events } from './events'
import { findInstance, popInstance, pushInstance } from './instances'
import { applyLayout } from './layout'
import { InstanceExtension, InstanceState, Options, PluginInstance, PluginLifecycle, PluginMethod } from './models'
import { stopAnimation } from './playback'
import { applyPlugins } from './plugins'
import { applyStage } from './stage'
import { applyResize } from './resize'
import { findSpecs, measure, preload, toArray, warn } from './utils'

/**
 * Adds methods to the SpriteSpin prototype
 *
 * @public
 */
export function extend<T extends InstanceExtension>(extension: T) {
  const prototype: any = Instance.prototype
  for (const key of Object.keys(extension)) {
    if (key in prototype) {
      throw new Error('Instance method is already defined: ' + key)
    } else {
      prototype[key] = extension[key]
    }
  }
}

/**
 * Creates a new SpriteSpin instance, or updates an existing one
 *
 * @public
 */
export function createOrUpdate(options: Options): Instance {
  const instance = findInstance(getElement(options.target))
  if (instance) {
    instance.update(options)
    return instance
  }
  return new Instance(options).load()
}

/**
 * Creates a new SpriteSpin instance
 *
 * @public
 */
export function create(options: Options): Instance {
  const instance = findInstance(getElement(options.target))
  if (instance) {
    throw new Error('Instance on element already exists')
  }
  return new Instance(options).load()
}

/**
 * Updates an existing instance with given options
 *
 * @public
 * @param options
 * @returns
 */
export function update(options: Options): Instance {
  const instance = findInstance(getElement(options.target))
  if (!instance) {
    throw new Error('Instance not found')
  }
  instance.update(options)
  return instance
}

/**
 * Destroys the SpriteSpin instance
 *
 * @remarks
 * - stops running animation
 * - unbinds all events
 * - resets element state
 *
 * @public
 */
export function destroy(target: HTMLElement | string | Pick<Options, 'target'> ) {
  if (typeof target !== 'string' && !(target instanceof Element)) {
    target = target.target
  }
  const el = getElement(target)
  const instance = findInstance(el)
  if (instance) {
    instance.destroy()
  }
}

export class Instance {
  /**
   * The element this instance is bound to
   */
  public readonly target: HTMLElement

  /**
   * The current state of the spritespin instance
   */
  public readonly state: InstanceState

  private events = new Events(this)

  /**
   * Constructs a new spritespin instance and runs
   *
   * @param options - the configuration options
   */
  public constructor(options: Options) {
    this.target = getElement(options.target)
    if (!this.target) {
      throw new Error('Element not given or not found')
    }
    this.state = {
      ...JSON.parse(JSON.stringify(Constants.defaults)),
      ...options,
      source: toArray(options.source),
      target: this.target,
      instance: this
    }
  }

  /**
   * Updates the configuration and reboots the instance
   *
   * @param options - the new instance options
   */
  public update(options: Partial<Options>): this {
    __assign(this.state, {
      ...(options || {}),
      activePlugins: this.state.activePlugins,
      source: toArray(options.source || this.state.source),
      target: this.target,
      stage: this.state.stage,
      images: this.state.images,
      instance: this as Instance
    } as InstanceState)
    this.load()
    return this
  }

  /**
   * Dispatches the `onInit` lifecycle event
   */
  public init(): this {
    onInit(this)
    this.dispatch('onInit')
    return this
  }

  /**
   * Dispatches the `onFrame` and `onDraw` lifecycle events
   */
  public tick(): this {
    this.dispatch('onFrame')
    this.dispatch('onDraw')
    return this
  }

  /**
   * Dispatches the `onDestroy` lifecycle event
   */
  public destroy(): this {
    this.dispatch('onDestroy')
    onDestroy(this)
    return this
  }

  /**
   * Preloads images and runs the initial lifecycle. Creates plugins, loads images, dispatches events.
   *
   * @public
   */
  public load(): this {
    const state = this.state
    this.init()
    state.isLoading = true
    preload({
      source: state.source,
      crossOrigin: state.crossOrigin,
      preloadCount: state.preloadCount,
      progress: (progress) => {
        state.progress = progress
        this.dispatch('onProgress')
      },
      complete: (images) => {
        state.images = images
        state.isLoading = false
        onLoad(this)
        this.dispatch('onLoad')
        this.tick()
        this.dispatch('onComplete')
      },
    })
    return this
  }

  /**
   * Adds a lifecycle event listener
   *
   * @param event - the lifecycle event name
   * @param cb - the handler method
   * @returns a function to remove the added event listener
   */
  public addListener(event: keyof PluginLifecycle, cb: PluginMethod): () => void {
    return this.events.on(event, cb)
  }

  /**
   * Removes a previously added event listener
   *
   * @param cb
   * @returns
   */
  public removeListener(cb: PluginMethod): this {
    this.events.off(cb)
    return this
  }

  /**
   * Dispatches a lifecycle event
   *
   * @param event - the lifecycle method name
   */
  public dispatch(event: keyof PluginLifecycle) {
    let e: Event
    try {
      e = document.createEvent('Event')
      e.initEvent(`${event}.${Constants.namespace}`, true, true)
    } catch(e) {
      warn(e)
    }
    this.events.trigger(event, e, this.state)
    if (e) {
      this.target.dispatchEvent(e)
    }
  }
}

function onInit(instance: Instance) {
  pushInstance(instance)
  instance.target.classList.add('spritespin-instance')
  const state = instance.state

  state.target.classList.add('loading')
  state.source = toArray(state.source)
  applyResize(state)
  applyStage(state)
  applyLayout(state)
  applyPlugins(state, {
    onCreated: (plugin) => onPluginCreated(instance, plugin),
    onRemoved: (plugin) => onPluginRemoved(instance, plugin)
  })
}

function onLoad(instance: Instance) {
  const state = instance.state
  state.frames = state.frames || state.images.length
  state.target.classList.remove('loading')
  applyMetrics(state)
  applyLayout(state)
}

function onDestroy(instance: Instance) {
  stopAnimation(instance.state)
  instance.target.innerHTML = ''
  instance.target.setAttribute('style', null)
  instance.target.setAttribute('unselectable', null)
  instance.target.classList.remove('spritespin-instance')
  popInstance(instance)
}

function onPluginCreated(instance: Instance, plugin: PluginInstance) {
  const unlisten: Function[] = []
  const onDestroy = plugin.onDestroy
  plugin.onDestroy = (e, instance) => {
    for (const fn of unlisten) {
      fn()
    }
    onDestroy?.call(plugin, e, instance)
  }
  Constants.lifecycleNames.forEach((key) => {
    if (!plugin[key]) { return }
    unlisten.push(instance.addListener(key, (e, state) => {
      plugin[key].call(plugin, e, state)
    }))
  })
  Constants.eventNames.forEach((key) => {
    if (!plugin[key]) { return }
    const target = instance.target
    const listener = (e: any) => plugin[key].call(plugin, e, instance.state)
    target.addEventListener(key, listener, { passive: false })
    unlisten.push(() => target.removeEventListener(key, listener))
  })
}

function onPluginRemoved(instance: Instance, plugin: PluginInstance) {
  plugin.onDestroy?.(null, instance.state)
}

function getElement(target: HTMLElement | string): HTMLElement {
  if (target instanceof Element) {
    return target
  }
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target)
  }
  return null
}

function applyMetrics(state: InstanceState) {
  state.metrics = measure(state.images, {
    frames: state.frames,
    framesX: state.framesX,
    framesY: state.framesY,
    detectSubsampling: state.detectSubsampling,
  })
  const spec = findSpecs(state.metrics, state.frames, 0, 0)
  if (spec.sprite) {
    state.frameWidth = spec.sprite.width
    state.frameHeight = spec.sprite.height
  }
}
