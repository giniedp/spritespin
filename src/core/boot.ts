import * as Utils from '../utils'
import { Api } from './api'
import { callbackNames, defaults, eventNames, eventsToPrevent, namespace } from './constants'
import { applyLayout } from './layout'
import { Data, Options } from './models'
import { applyAnimation, stopAnimation } from './playback'
import { applyPlugins } from './plugins'

const $ = Utils.$

let counter = 0
/**
 * Collection of all SpriteSpin instances
 */
export const instances: {[key: string]: Data} = {}

function pushInstance(data: Data) {
  counter += 1
  data.id = String(counter)
  instances[data.id] = data
}

function popInstance(data: Data) {
  delete instances[data.id]
}

function eachInstance(cb) {
  for (const id in instances) {
    if (instances.hasOwnProperty(id)) {
      cb(instances[id])
    }
  }
}

let lazyinit = () => {
  // replace function with a noop
  // this logic must run only once
  lazyinit = () => { /* noop */ }

  function onEvent(eventName, e) {
    eachInstance((data: Data) => {
      for (const module of data.plugins) {
        if (typeof module[eventName] === 'function') {
          module[eventName].apply(data.target, [e, data])
        }
      }
    })
  }

  function onResize() {
    eachInstance((data: Data) => {
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

/**
 * (re)binds all spritespin events on the target element
 */
export function applyEvents(data: Data) {
  const target = data.target

  // Clear all SpriteSpin events on the target element
  Utils.unbind(target)

  // disable all default browser behavior on the following events
  // mainly prevents image drag operation
  for (const eName of eventsToPrevent) {
    Utils.bind(target, eName, Utils.prevent)
  }

  // Bind module functions to SpriteSpin events
  for (const plugin of data.plugins) {
    for (const eName of eventNames) {
      Utils.bind(target, eName, plugin[eName])
    }
    for (const eName of callbackNames) {
      Utils.bind(target, eName, plugin[eName])
    }
  }

  // bind auto start function to load event.
  Utils.bind(target, 'onLoad', (e, d) => {
    applyAnimation(d)
  })

  // bind all user events that have been passed on initialization
  for (const eName of callbackNames) {
    Utils.bind(target, eName, data[eName])
  }
}

function applyMetrics(data: Data) {
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
export function boot(data: Data) {
  applyPlugins(data)
  applyEvents(data)
  applyLayout(data)

  data.source = Utils.toArray(data.source)
  data.loading = true
  data.target.addClass('loading').trigger('onInit', data)
  Utils.preload({
    source: data.source,
    preloadCount: data.preloadCount,
    progress: (progress) => {
      data.progress = progress
      data.target.trigger('onProgress', data)
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

/**
 * Creates a new SpriteSpin instance
 */
export function create(options: Options): Data {
  const target = options.target

  // SpriteSpin is not initialized
  // Create default settings object and extend with given options
  const data = $.extend({}, defaults, options) as Data

  // ensure source is set
  data.source = data.source || []
  // ensure plugins are set
  data.plugins = data.plugins || []

  // if image tags are contained inside this DOM element
  // use these images as the source files
  target.find('img').each(() => {
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
  target
    .empty()
    .addClass('spritespin-instance')
    .append("<div class='spritespin-stage'></div>")

  // add the canvas element if canvas rendering is enabled and supported
  if (data.renderer === 'canvas') {
    const canvas = document.createElement('canvas')
    if (!!(canvas.getContext && canvas.getContext('2d'))) {
      data.canvas = $(canvas).addClass('spritespin-canvas') as any
      data.context = canvas.getContext('2d')
      target.append(data.canvas)
      target.addClass('with-canvas')
    } else {
      // fallback to image rendering mode
      data.renderer = 'image'
    }
  }

  // setup references to DOM elements
  data.target = target
  data.stage = target.find('.spritespin-stage')

  // store the data
  target.data(namespace, data)
  pushInstance(data)

  return data
}

/**
 * Creates a new SpriteSpin instance, or updates it if it is already present
 */
export function createOrUpdate(options: Options) {
  lazyinit()

  let data  = options.target.data(namespace) as Data
  if (!data) {
    data = create(options)
  } else {
    $.extend(data, options)
  }
  boot(data)
}

/**
 * Stops running animation, unbinds all events and deletes the data on the target element of the given data object.
 */
export function destroy(data: Data) {
  popInstance(data)
  stopAnimation(data)
  data.target.trigger('onDestroy', data)
  Utils.unbind(data.target)
  data.target.removeData(namespace)
}
