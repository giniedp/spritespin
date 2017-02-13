// tslint:disable:object-literal-shorthand
// tslint:disable:only-arrow-functions

module SpriteSpin {

  const $ = (window['jQuery'] || window['Zepto'] || window['$']) // tslint:disable-line

  function pick(names: string[]): string {
    for (const name of names) {
      if (document[name]) {
        return name
      }
    }
    return names[0]
  }

  const browser = {
    requestFullscreen: pick([
      'requestFullscreen',
      'webkitRequestFullscreen',
      'webkitRequestFullScreen',
         'mozRequestFullScreen',
          'msRequestFullscreen']),
    exitFullscreen: pick([
      'exitFullscreen',
      'webkitExitFullscreen',
      'webkitCancelFullScreen',
         'mozCancelFullScreen',
          'msExitFullscreen']),
    fullscreenElement: pick([
      'fullscreenElement',
      'webkitFullscreenElement',
      'webkitCurrentFullScreenElement',
         'mozFullScreenElement',
          'msFullscreenElement']),
    fullscreenEnabled: pick([
      'fullscreenEnabled',
      'webkitFullscreenEnabled',
         'mozFullScreenEnabled',
          'msFullscreenEnabled']),
    fullscreenchange: pick([
      'fullscreenchange',
      'webkitfullscreenchange',
         'mozfullscreenchange',
          'MSFullscreenChange']),
    fullscreenerror: pick([
      'fullscreenerror',
      'webkitfullscreenerror',
         'mozfullscreenerror',
          'MSFullscreenError'])
  }

  function requestFullscreen(e) {
    e = e || document.documentElement
    e[browser.requestFullscreen]()
  }

  function exitFullscreen() {
    return document[browser.exitFullscreen]()
  }

  function fullscreenEnabled() {
    return document[browser.fullscreenEnabled]
  }

  function fullscreenElement() {
    return document[browser.fullscreenElement]
  }

  function isFullscreen() {
    return !!fullscreenElement()
  }

  const changeEvent = browser.fullscreenchange + '.' + SpriteSpin.namespace + '-fullscreen'
  function unbindChangeEvent() {
    $(document).unbind(changeEvent)
  }

  function bindChangeEvent(callback) {
    unbindChangeEvent()
    $(document).bind(changeEvent, callback)
  }

  const orientationEvent = 'orientationchange.' + SpriteSpin.namespace + '-fullscreen'
  function unbindOrientationEvent() {
    $(window).unbind(orientationEvent)
  }
  function bindOrientationEvent(callback) {
    unbindOrientationEvent()
    $(window).bind(orientationEvent, callback)
  }

  SpriteSpin.registerApi({
    fullscreenEnabled,
    fullscreenElement,
    exitFullscreen,
    toggleFullscreen: function(opts) {
      if (isFullscreen()) {
        this.requestFullscreen(opts)
      } else {
        this.exitFullscreen()
      }
    },
    requestFullscreen: function(opts){
      opts = opts || {}
      const api = this
      const data = api.data
      const oWidth = data.width
      const oHeight = data.height
      const oSource = data.source
      const oSize = data.sizeMode
      const enter = function() {
        data.width = window.screen.width
        data.height = window.screen.height
        data.source = opts.source || oSource
        data.sizeMode = opts.sizeMode || 'fit'
        SpriteSpin.boot(data)
      }
      const exit = function() {
        data.width = oWidth
        data.height = oHeight
        data.source = oSource
        data.sizeMode = oSize
        SpriteSpin.boot(data)
      }

      bindChangeEvent(function(){
        if (isFullscreen()) {
          enter()
          bindOrientationEvent(enter)
        } else {
          unbindChangeEvent()
          unbindOrientationEvent()
          exit()
        }
      })
      requestFullscreen(data.target[0])
    }
  })
}
