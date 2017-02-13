((SpriteSpin) => {

  const NAME = 'zoom'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function onCreate(e, data) {
    const zoom = getState(data)
    if (zoom.stage) {
      return
    }
    zoom.stage = SpriteSpin
      .$("<div class='spritezoom-stage'></div>")
      .css({
        width    : '100%',
        height   : '100%',
        top      : 0,
        left     : 0,
        bottom   : 0,
        right    : 0,
        position : 'absolute'
      })
      .appendTo(data.target)
      .hide()
  }

  function onDestroy(e, data) {
    const zoom = getState(data)
    if (zoom.stage) {
      zoom.stage.remove()
      delete zoom.stage
    }
  }

  function updateInput(e, data) {
    e.preventDefault()

    // hack into drag/move module and disable dragging
    // prevents frame change during zoom mode
    data.dragging = false

    // access touch points from original event
    if (!e.touches && e.originalEvent) {
      e.touches = e.originalEvent.touches
    }

    // grab touch/cursor position
    let x, y, dx, dy
    if (e.touches && e.touches.length) {
      x = e.touches[0].clientX || 0
      y = e.touches[0].clientY || 0
    } else {
      x = e.clientX || 0
      y = e.clientY || 0
    }

    // normalize cursor position into [0:1] range
    x /= data.width
    y /= data.height

    const zoom = getState(data)
    if (zoom.xOld == null) {
      zoom.xOld = x
      zoom.yOld = y
    }
    if (zoom.x == null) {
      zoom.x = x
      zoom.y = y
    }

    // calculate move delta since last frame and remember current position
    dx = x - zoom.xOld
    dy = y - zoom.yOld
    zoom.xOld = x
    zoom.yOld = y

    // invert drag direction for touch events to enable 'natural' scrolling
    if (e.type.match(/touch/)) {
      dx = -dx
      dy = -dy
    }

    // accumulate display coordinates
    zoom.x = SpriteSpin.Utils.clamp(zoom.x + dx, 0, 1)
    zoom.y = SpriteSpin.Utils.clamp(zoom.y + dy, 0, 1)

    SpriteSpin.updateFrame(data)
  }

  function onDraw(e, data) {
    // calculate the frame index
    const index = data.lane * data.frames + data.frame

    // get the zoom image. Use original frames as fallback. This won't work for spritesheets
    const source = (data.zoomSource || data.source)[index]
    if (!source) {
      SpriteSpin.$.error("'zoomSource' option is missing or it contains unsufficient number of frames.")
      return
    }

    // get display position
    const zoom = getState(data)
    let x = zoom.x
    let y = zoom.y
    // fallback to centered position
    if (x == null || y == null) {
      x = zoom.x = 0.5
      y = zoom.y = 0.5
    }
    // scale up from [0:1] to [0:100] range
    x = Math.floor(x * 100)
    y = Math.floor(y * 100)
    // update background image and position
    zoom.stage.css({
      'background-repeat'   : 'no-repeat',
      'background-image'    : ["url('", source, "')"].join(''),
      'background-position' : [x, '% ', y, '%'].join('')
    })
  }

  function onClick(e, data) {
    e.preventDefault()
    const zoom = getState(data)
    // simulate double click

    const clickTime = new Date().getTime()
    if (!zoom.clickTime) {
      zoom.clickTime = clickTime
      return
    }

    const timeDelta = clickTime - zoom.clickTime
    const doubleClickTime = data.zoomDoubleClickTime || 500
    if (timeDelta > doubleClickTime) {
      zoom.clickTime = clickTime
      return
    }

    zoom.clickTime = 0
    if (SpriteSpin.$(this).spritespin('api').toggleZoom()) {
      updateInput(e, data)
    }
  }

  function onMove(e, data) {
    const zoom = getState(data)
    if (!zoom.stage.is(':visible')) {
      return
    }
    updateInput(e, data)
  }

  function toggleZoom() {
    const data = this.data
    const zoom = getState(data)
    if (!zoom.stage) {
      SpriteSpin.$.error('zoom module is not initialized or is not available.')
      return false
    }
    if (zoom.stage.is(':visible')) {
      zoom.stage.fadeOut()
      data.stage.fadeIn()
    } else {
      zoom.stage.fadeIn()
      data.stage.fadeOut()
      return true
    }
    return false
  }

  SpriteSpin.registerPlugin(NAME, {
    name: NAME,

    mousedown: onClick,
    touchstart: onClick,
    mousemove: onMove,
    touchmove: onMove,

    onInit: onCreate,
    onDestroy: onDestroy,
    onDraw: onDraw
  })

  SpriteSpin.registerApi({
    toggleZoom: toggleZoom
  })

})(SpriteSpin)
