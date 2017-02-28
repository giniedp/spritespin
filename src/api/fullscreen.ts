// tslint:disable:only-arrow-functions
namespace SpriteSpin.Fullscreen {

  export interface Options {
    source?: string|string[],
    sizeMode?: SpriteSpin.SizeMode
  }

  function pick(target, names: string[]): string {
    for (const name of names) {
      if (target[name]) {
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
      'fullscreenchange',
      'webkitfullscreenchange',
         'mozfullscreenchange',
          'MSFullscreenChange']),
    fullscreenerror: pick(document, [
      'fullscreenerror',
      'webkitfullscreenerror',
         'mozfullscreenerror',
          'MSFullscreenError'])
  }

  const changeEvent = browser.fullscreenchange + '.' + SpriteSpin.namespace + '-fullscreen'
  function unbindChangeEvent() {
    SpriteSpin.$(document).unbind(changeEvent)
  }

  function bindChangeEvent(callback) {
    unbindChangeEvent()
    SpriteSpin.$(document).bind(changeEvent, callback)
  }

  const orientationEvent = 'orientationchange.' + SpriteSpin.namespace + '-fullscreen'
  function unbindOrientationEvent() {
    SpriteSpin.$(window).unbind(orientationEvent)
  }
  function bindOrientationEvent(callback) {
    unbindOrientationEvent()
    SpriteSpin.$(window).bind(orientationEvent, callback)
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

  export function toggleFullscreen(data: SpriteSpin.Instance, opts: Options) {
    if (isFullscreen()) {
      this.apiRequestFullscreen(opts)
    } else {
      this.exitFullscreen()
    }
  }

  export function requestFullscreen(data: SpriteSpin.Instance, opts: Options) {
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
      SpriteSpin.boot(data)
    }
    const exit = () => {
      data.width = oWidth
      data.height = oHeight
      data.source = oSource
      data.sizeMode = oSize
      data.responsive = oResponsive
      SpriteSpin.boot(data)
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

  SpriteSpin.registerApi({
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
}
