import { boot, Data, extendApi, getPluginState, SizeMode } from 'spritespin'

export interface Options {
  source?: string | string[],
  sizeMode?: SizeMode
}

interface FullscreenApiState {
  onChange?: EventListener
  onOrientationChane?: EventListener
}

function getState(data: Data) {
  return getPluginState<FullscreenApiState>(data, 'fullscreen-api')
}

function pick(target: any, names: string[]): string {
  for (const name of names) {
    if (name in target) {
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

function unbindChangeEvent(data: Data) {
  const state = getState(data)
  if (state.onChange) {
    document.removeEventListener(browser.fullscreenchange, state.onChange)
    state.onChange = null
  }
}

function bindChangeEvent(data: Data, callback: EventListener) {
  unbindChangeEvent(data)
  const state = getState(data)
  state.onChange = callback
  document.addEventListener(browser.fullscreenchange, state.onChange)
}

function unbindOrientationEvent(data: Data) {
  const state = getState(data)
  if (state.onOrientationChane) {
    window.removeEventListener('orientationchange', state.onOrientationChane)
    state.onOrientationChane = null
  }
}
function bindOrientationEvent(data: Data, callback: EventListener) {
  unbindOrientationEvent(data)
  const state = getState(data)
  state.onOrientationChane = callback
  window.addEventListener('orientationchange', state.onOrientationChane)
}

function requestFullscreenNative(e: Element) {
  const el: any = e || document.documentElement
  el[browser.requestFullscreen]()
}

export function exitFullscreen() {
  return (document as any)[browser.exitFullscreen]()
}

export function fullscreenEnabled() {
  return (document as any)[browser.fullscreenEnabled]
}

export function fullscreenElement() {
  return (document as any)[browser.fullscreenElement]
}

export function isFullscreen() {
  return !!fullscreenElement()
}

export function toggleFullscreen(data: Data, opts: Options) {
  if (isFullscreen()) {
    requestFullscreen(data, opts)
  } else {
    exitFullscreen()
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

  bindChangeEvent(data, () => {
    if (isFullscreen()) {
      enter()
      bindOrientationEvent(data, enter)
    } else {
      unbindChangeEvent(data)
      unbindOrientationEvent(data)
      exit()
    }
  })
  requestFullscreenNative(data.target)
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
