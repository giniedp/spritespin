import { defaults, eventNames, eventsToPrevent, namespace } from './constants'
import { handleEvent, unbindEvents, bindEvent } from './events'
import { findInstance, popInstance, pushInstance } from './instances'
import { applyLayout } from './layout'
import { Data, Options, Api } from './models'
import { applyAnimation, stopAnimation } from './playback'
import { applyPlugins } from './plugins'
import { show, measure, findSpecs, toArray, preload } from '../utils'

function bindEvents(data: Data, target: EventTarget) {
  for (const  eventName of eventNames) {
    const internalName = target === document ? 'document' +  eventName : eventName
    bindEvent(data, target, eventName, (e: Event) => {
      handleEvent(data, internalName, e)
    })
  }
}

function bindPreventEvents(data: Data) {
  for (const eName of eventsToPrevent) {
    bindEvent(data, data.target, eName, (e: Event) => e.preventDefault())
  }
}

function bindResizeEvents(data: Data) {
  let resizeTimeout: number = null
  bindEvent(data, window, 'resize', (e: Event) => {
    window.clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(() => {
      if (data.responsive) {
        boot(data)
      }
    }, 100)
  })
}

/**
 * (re)binds all spritespin events on the target element
 *
 * @internal
 */
export function applyEvents(data: Data) {
  // Clear all SpriteSpin events on the target element
  unbindEvents(data)

  bindResizeEvents(data)
  bindPreventEvents(data)
  bindEvents(data, document)
  bindEvents(data, data.target)
  bindEvent(data, data.target, `onLoad.${namespace}`, (e: Event, d: Data) => applyAnimation(d))
}

function applyMetrics(data: Data) {
  if (!data.images) {
    data.metrics = []
  }
  data.metrics = measure(data.images, data)
  const spec = findSpecs(data.metrics, data.frames, 0, 0)
  if (spec.sprite) {
    // TODO: try to remove frameWidth/frameHeight
    data.frameWidth = spec.sprite.width
    data.frameHeight = spec.sprite.height
  }
}

/**
 * Runs the boot process.
 *
 * @remarks
 * (re)initializes plugins, (re)initializes the layout, (re)binds events and loads source images.
 *
 * @internal
 */
export function boot(data: Data) {
  applyPlugins(data)
  applyEvents(data)
  applyLayout(data)

  data.source = toArray(data.source)
  data.loading = true
  data.target.classList.add('loading')
  handleEvent(data, 'onInit')
  preload({
    source: data.source,
    crossOrigin: data.crossOrigin,
    preloadCount: data.preloadCount,
    progress: (progress) => {
      data.progress = progress
      handleEvent(data, 'onProgress')
    },
    complete: (images) => {
      data.images = images
      data.loading = false
      data.frames = data.frames || images.length

      applyMetrics(data)
      applyLayout(data)
      show(data.stage)
      data.target.classList.remove('loading')
      handleEvent(data, 'onLoad')
      handleEvent(data, 'onFrame')
      handleEvent(data, 'onDraw')
      handleEvent(data, 'onComplete')
    }
  })
}

/**
 * Creates a new SpriteSpin instance
 *
 * @public
 */
export function create(options: Options & { target: HTMLElement | string }): Data {
  const target = getElement(options.target)
  const data: Data = {
    ...JSON.parse(JSON.stringify(defaults)),
    ...options,
    target
  } as any

  // ensure source is set
  data.source = data.source || []
  // ensure plugins are set
  data.plugins = data.plugins || [
    '360',
    'drag'
  ]

  // if image tags are contained inside this DOM element
  // use these images as the source files
  target.querySelectorAll('img').forEach((item) => {
    if (!Array.isArray(data.source)) {
      data.source = []
    }
    data.source.push(item.getAttribute('src'))
  })

  // build inner html
  // <div>
  //   <div class='spritespin-stage'></div>
  //   <canvas class='spritespin-canvas'></canvas>
  // </div>
  target.classList.add('spritespin-instance')
  target.innerHTML = "<div class='spritespin-stage'></div>"

  // add the canvas element if canvas rendering is enabled and supported
  if (data.renderer === 'canvas') {
    const canvas = document.createElement('canvas')
    if (!!(canvas.getContext && canvas.getContext('2d'))) {
      data.canvas = canvas
      data.canvas.classList.add('spritespin-canvas')
      data.context = canvas.getContext('2d')
      target.appendChild(data.canvas)
      target.classList.add('with-canvas')
    } else {
      // fallback to image rendering mode
      data.renderer = 'image'
    }
  }

  // setup references to DOM elements
  data.target = target
  data.stage = target.querySelector('.spritespin-stage')
  data.api = new Api(data)
  // store the data
  pushInstance(data)

  return data
}

/**
 * Creates a new SpriteSpin instance, or updates an existing one
 *
 * @public
 */
export function createOrUpdate(options: Options & { target: HTMLElement | string }): Data {
  options.target = getElement(options.target)
  let data = findInstance(options.target)
  if (!data) {
    data = create(options)
  } else {
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        (data as any)[key] = (options as any)[key]
      }
    }
  }
  boot(data)
  return data
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
export function destroy(data: Data) {
  popInstance(data)
  stopAnimation(data)
  handleEvent(data, 'onDestroy')
  unbindEvents(data)
  data.target.innerHTML = ''
  data.target.setAttribute('style', null)
  data.target.setAttribute('unselectable', null)
  data.target.classList.remove('spritespin-instance', 'with-canvas')
}

export function spritespin(options: Options & { target: string | HTMLElement}): Data
export function spritespin(target: HTMLElement | string, option: 'destroy'): void
export function spritespin(target: HTMLElement | string, option: 'data'): Data
export function spritespin(target: HTMLElement | string, option?: Partial<Options>): Data
export function spritespin<K extends keyof Data>(target: HTMLElement, key: K): Data[K]
export function spritespin<K extends keyof Data>(target: HTMLElement, key: K, value: Data[K]): Data
export function spritespin() {
  if (arguments.length === 0) {
    throw new Error('Invalid arguments')
  }
  if (arguments.length === 1) {
    return createOrUpdate(arguments[0])
  }

  const target: HTMLElement = getElement(arguments[0])
  if (!target) {
    throw new Error('Invalid arguments')
  }

  const option = arguments[1]
  if (typeof option !== 'string') {
    return createOrUpdate({
      ...option,
      target
    })
  }

  const data = findInstance(target)
  switch (option) {
    case 'data':
    case undefined:
    case null: {
      return data
    }
    case 'destroy': {
      data.api = data.api || new Api(data)
      return data
    }
  }

  if (arguments.length === 3) {
    (data as any)[option] = arguments[2]
    return createOrUpdate(data)
  } else {
    return (data as any)[option]
  }
}

function getElement(target: HTMLElement | string): HTMLElement {
  return typeof target === 'string' ? document.querySelector(target) : target
}
