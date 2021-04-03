import { InstanceState, extend, getPluginState, Options } from '../core'

interface FullscreenApiState {
  onChange?: EventListener
  onOrientationChane?: EventListener
}

function getState(instance: InstanceState) {
  return getPluginState<FullscreenApiState>(instance, 'fullscreen-api')
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

function unbindChangeEvent(instance: InstanceState) {
  const state = getState(instance)
  if (state.onChange) {
    document.removeEventListener(browser.fullscreenchange, state.onChange)
    state.onChange = null
  }
}

function bindChangeEvent(instance: InstanceState, callback: EventListener) {
  unbindChangeEvent(instance)
  const state = getState(instance)
  state.onChange = callback
  document.addEventListener(browser.fullscreenchange, state.onChange)
}

function unbindOrientationEvent(instance: InstanceState) {
  const state = getState(instance)
  if (state.onOrientationChane) {
    window.removeEventListener('orientationchange', state.onOrientationChane)
    state.onOrientationChane = null
  }
}
function bindOrientationEvent(instance: InstanceState, callback: EventListener) {
  unbindOrientationEvent(instance)
  const state = getState(instance)
  state.onOrientationChane = callback
  window.addEventListener('orientationchange', state.onOrientationChane)
}

function requestFullscreenNative(e: Element) {
  const el: any = e || document.documentElement
  el[browser.requestFullscreen]()
}

function exitFullscreen() {
  return (document as any)[browser.exitFullscreen]()
}

function fullscreenEnabled() {
  return (document as any)[browser.fullscreenEnabled]
}

function fullscreenElement() {
  return (document as any)[browser.fullscreenElement]
}

function isFullscreen() {
  return !!fullscreenElement()
}

export function toggleFullscreen(state: InstanceState, opts: Pick<Partial<Options>, 'width' | 'height' | 'fillMode' | 'source'>) {
  if (isFullscreen()) {
    requestFullscreen(state, opts)
  } else {
    exitFullscreen()
  }
}

export function requestFullscreen(state: InstanceState, opts: Pick<Partial<Options>, 'width' | 'height' | 'fillMode' | 'source'>) {
  opts = opts || {}
  const instance = state.instance
  const original = {
    width: state.width,
    height: state.height,
    source: state.source,
    fillMode: state.fillMode,
  }
  const enter = () => instance.update(opts)
  const exit = () => instance.update(original)
  bindChangeEvent(state, () => {
    if (isFullscreen()) {
      enter()
      bindOrientationEvent(state, enter)
    } else {
      unbindChangeEvent(state)
      unbindOrientationEvent(state)
      exit()
    }
  })
  requestFullscreenNative(state.target)
}

extend({
  fullscreenEnabled,
  fullscreenElement,
  exitFullscreen,
  toggleFullscreen: function(opts: Options) {
    toggleFullscreen(this.state, opts)
  },
  requestFullscreen: function(opts: Options) {
    requestFullscreen(this.state, opts)
  }
})
