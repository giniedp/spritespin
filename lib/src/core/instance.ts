import { __assign } from 'tslib'
import { Events } from './events'
import { useLayout } from './layout'
import { InstanceExtension, InstanceState, Options, PluginInstance, PluginLifecycle, PluginMethod } from './models'
import { usePlayback, stopAnimation } from './playback'
import { getPluginInstance, getPluginState, usePlugins } from './plugins'
import { useStage } from './stage'
import { useResize } from './resize'
import { destructor, findSpecs, measure, preload, toArray, warn } from '../utils'
import { defaults, eventNames, lifecycleNames, namespace } from './constants'

const instances: Array<Instance> = []

function pushInstance(instance: Instance) {
  if (instances.indexOf(instance) < 0) {
    instances.push(instance)
  }
}

function popInstance(instance: Instance) {
  const index = instances.indexOf(instance)
  if (index >= 0) {
    instances.splice(index, 1)
  }
}

/**
 * Gets an instance for the given HTML Element
 *
 * @public
 * @param target - The HTML Element or a selector or an object with target
 */
export function find(target: HTMLElement | string | Pick<Options, 'target'>): Instance | null {
  const el = elementOf(target)
  for (const instance of instances) {
    if (instance.target === el) {
      return instance
    }
  }
  return null
}

/**
 * Creates a new SpriteSpin instance, or updates an existing one
 *
 * @public
 */
export function createOrUpdate(options: Options): Instance {
  let instance = find(options)
  if (!instance) {
    instance = new Instance(options)
    return instance.load()
  }
  return instance.update(options)
}

/**
 * Creates a new SpriteSpin instance
 *
 * @public
 */
export function create(options: Options): Instance {
  const instance = find(options)
  if (instance) {
    throw new Error('Instance on element already exists')
  }
  return new Instance(options).load()
}

/**
 * Updates an existing instance with given options
 *
 * @public
 */
 export function update(options: Options): Instance {
  const instance = find(options)
  if (!instance) {
    throw new Error('Instance not found')
  }
  return instance.update(options)
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
export function destroy(target: HTMLElement | string | Pick<Options, 'target'>) {
  const instance = find(target)
  if (instance) {
    instance.destroy()
  }
}

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
 *
 * @public
 */
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
    this.target = elementOf(options.target)
    if (!this.target) {
      throw new Error('Element not given or not found')
    }
    this.state = {
      ...JSON.parse(JSON.stringify(defaults)),
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
      instance: this as Instance,
      opaque: this.state.opaque
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
   * @param cb - the handler to remove
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
      e.initEvent(`${event}.${namespace}`, true, true)
    } catch(e) {
      warn(e)
    }
    this.events.trigger(event, e, this.state)
    if (e) {
      this.target.dispatchEvent(e)
    }
    if (event in this.state) {
      this.state[event].call(this, e, this.state)
    }
  }

  /**
   * Gets the instance of an active plugin by name
   *
   * @param name - The name of the plugin
   */
  public getPlugin(name: string) {
    return getPluginInstance(this.state, name)
  }
}

function onInit(instance: Instance) {
  pushInstance(instance)
  instance.target.classList.add('spritespin-instance')
  const state = instance.state

  state.target.classList.add('loading')
  state.source = toArray(state.source)
  useResize(state)
  useStage(state)
  useLayout(state)
  usePlugins(state, {
    onCreated: (plugin) => onPluginCreated(instance, plugin),
    onRemoved: (plugin) => onPluginRemoved(instance, plugin)
  })
}

function onLoad(instance: Instance) {
  const state = instance.state
  state.frames = state.frames || state.images.length
  state.target.classList.remove('loading')
  useMetrics(state)
  useLayout(state)
  usePlayback(state)
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
  const destroy = destructor()
  const onDestroy = plugin.onDestroy
  plugin.onDestroy = (e, instance) => {
    destroy()
    onDestroy?.call(plugin, e, instance)
  }
  for (const key of lifecycleNames) {
    if (typeof plugin[key] !== 'function') { continue }
    destroy.add(instance.addListener(key, (e, state) => {
      plugin[key].call(plugin, e, state)
    }))
  }
  for (const key of eventNames) {
    if (typeof plugin[key] !== 'function') { continue }
    const listener = (e: any) => plugin[key].call(plugin, e, instance.state)
    destroy.addEventListener(instance.target, key, listener, { passive: false })
  }
}

function onPluginRemoved(instance: Instance, plugin: PluginInstance) {
  plugin.onDestroy?.(null, instance.state)
}

function elementOf(target: HTMLElement | string | Pick<Options, 'target'>): HTMLElement {
  if (target instanceof Element) {
    return target
  }
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target)
  }
  if (typeof target === 'object') {
    return elementOf(target.target)
  }
  return null
}

function useMetrics(state: InstanceState) {
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
