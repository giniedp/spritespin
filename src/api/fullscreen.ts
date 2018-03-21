import { boot, Data, extendApi, namespace, SizeMode } from '../core'
import { $ } from '../utils'

export interface Options {
  source?: string | string[],
  sizeMode?: SizeMode
}

function pick(target, names: string[]): string {
  for (const name of names) {
    if (target[name] || name in target) {
      return name
    }
  }
  return names[0]
}

const browser = {
  requestFullscreen: pick(document.documentElement, [
    'requestFullscreen',
    'webkitRequestFullScreen',
        'mozRequestFullScreen',
        'msRequestFullscreen']),
  exitFullscreen: pick(document, [
    'exitFullscreen',
    'webkitExitFullscreen',
    'webkitCancelFullScreen',
        'mozCancelFullScreen',
        'msExitFullscreen']),
  fullscreenElement: pick(document, [
    'fullscreenElement',
    'webkitFullscreenElement',
    'webkitCurrentFullScreenElement',
        'mozFullScreenElement',
        'msFullscreenElement']),
  fullscreenEnabled: pick(document, [
    'fullscreenEnabled',
    'webkitFullscreenEnabled',
        'mozFullScreenEnabled',
        'msFullscreenEnabled']),
  fullscreenchange: pick(document, [
    'onfullscreenchange',
    'onwebkitfullscreenchange',
        'onmozfullscreenchange',
        'onMSFullscreenChange']).replace(/^on/, ''),
  fullscreenerror: pick(document, [
    'onfullscreenerror',
    'onwebkitfullscreenerror',
        'onmozfullscreenerror',
        'onMSFullscreenError']).replace(/^on/, '')
}

const changeEvent = browser.fullscreenchange + '.' + namespace + '-fullscreen'
function unbindChangeEvent() {
  $(document).unbind(changeEvent)
}

function bindChangeEvent(callback) {
  unbindChangeEvent()
  $(document).bind(changeEvent, callback)
}

const orientationEvent = 'orientationchange.' + namespace + '-fullscreen'
function unbindOrientationEvent() {
  $(window).unbind(orientationEvent)
}
function bindOrientationEvent(callback) {
  unbindOrientationEvent()
  $(window).bind(orientationEvent, callback)
}

function requestFullscreenNative(e) {
  e = e || document.documentElement
  e[browser.requestFullscreen]()
}

export function exitFullscreen() {
  return document[browser.exitFullscreen]()
}

export function fullscreenEnabled() {
  return document[browser.fullscreenEnabled]
}

export function fullscreenElement() {
  return document[browser.fullscreenElement]
}

export function isFullscreen() {
  return !!fullscreenElement()
}

export function toggleFullscreen(data: Data, opts: Options) {
  if (isFullscreen()) {
    this.apiRequestFullscreen(opts)
  } else {
    this.exitFullscreen()
  }
}

export function requestFullscreen(data: Data, opts: Options) {
  opts = opts || {}
  const oWidth = data.width
  const oHeight = data.height
  const oSource = data.source
  const oSize = data.sizeMode
  const oResponsive = data.responsive
  const enter = () => {
    data.width = window.screen.width
    data.height = window.screen.height
    data.source = (opts.source || oSource) as string[]
    data.sizeMode = opts.sizeMode || 'fit'
    data.responsive = false
    boot(data)
  }
  const exit = () => {
    data.width = oWidth
    data.height = oHeight
    data.source = oSource
    data.sizeMode = oSize
    data.responsive = oResponsive
    boot(data)
  }

  bindChangeEvent(() => {
    if (isFullscreen()) {
      enter()
      bindOrientationEvent(enter)
    } else {
      unbindChangeEvent()
      unbindOrientationEvent()
      exit()
    }
  })
  requestFullscreenNative(data.target[0])
}

extendApi({
  fullscreenEnabled,
  fullscreenElement,
  exitFullscreen,
  toggleFullscreen: function(opts: Options) {
    toggleFullscreen(this.data, opts)
  },
  requestFullscreen: function(opts: Options) {
    requestFullscreen(this.data, opts)
  }
})
