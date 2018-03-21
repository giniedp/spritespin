import * as SpriteSpin from '../core'
import * as Utils from '../utils'

(() => {

const NAME = 'zoom'

interface ZoomState {
  source: string[]
  stage: any

  oldX: number
  oldY: number
  currentX: number
  currentY: number

  clickTime: number
  doubleClickTime: number
}

function getState(data) {
  return SpriteSpin.getPluginState(data, NAME) as ZoomState
}
function getOption(data, name, fallback) {
  return data[name] || fallback
}

function onInit(e, data: SpriteSpin.Data) {
  const state = getState(data)
  state.source = getOption(data, 'zoomSource', data.source)
  state.doubleClickTime = getOption(data, 'zoomDoubleClickTime', 500)
  state.stage = state.stage || Utils.$("<div class='zoom-stage'></div>")
  state.stage.css({
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

function onDestroy(e, data: SpriteSpin.Data) {
  const state = getState(data)
  if (state.stage) {
    state.stage.remove()
    delete state.stage
  }
}

function updateInput(e, data: SpriteSpin.Data) {
  const state = getState(data)
  if (!state.stage.is(':visible')) {
    return
  }

  e.preventDefault()

  // hack into drag/move module and disable dragging
  // prevents frame change during zoom mode
  SpriteSpin.flag(data, 'dragging', false)

  // grab touch/cursor position
  const cursor = Utils.getCursorPosition(e)
  // normalize cursor position into [0:1] range
  const x = cursor.x / data.width
  const y = cursor.y / data.height

  if (state.oldX == null) {
    state.oldX = x
    state.oldY = y
  }
  if (state.currentX == null) {
    state.currentX = x
    state.currentY = y
  }

  // calculate move delta since last frame and remember current position
  let dx = x - state.oldX
  let dy = y - state.oldY
  state.oldX = x
  state.oldY = y

  // invert drag direction for touch events to enable 'natural' scrolling
  if (e.type.match(/touch/)) {
    dx = -dx
    dy = -dy
  }

  // accumulate display coordinates
  state.currentX = Utils.clamp(state.currentX + dx, 0, 1)
  state.currentY = Utils.clamp(state.currentY + dy, 0, 1)

  SpriteSpin.updateFrame(data, data.frame, data.lane)
}

function onClick(e, data: SpriteSpin.Data) {
  e.preventDefault()
  const state = getState(data)
  // simulate double click

  const clickTime = new Date().getTime()
  if (!state.clickTime) {
    // on first click
    state.clickTime = clickTime
    return
  }

  // on second click
  const timeDelta = clickTime - state.clickTime
  if (timeDelta > state.doubleClickTime) {
    // took too long, back to first click
    state.clickTime = clickTime
    return
  }

  // on valid double click
  state.clickTime = undefined
  if (toggleZoom(data)) {
    updateInput(e, data)
  }
}

function onMove(e, data: SpriteSpin.Data) {
  const state = getState(data)
  if (state.stage.is(':visible')) {
    updateInput(e, data)
  }
}

function onDraw(e, data: SpriteSpin.Data) {
  const state = getState(data)

  // calculate the frame index
  const index = data.lane * data.frames + data.frame
  // get the zoom image. Use original frames as fallback. This won't work for spritesheets
  const source = state.source[index]
  const spec = Utils.findSpecs(data.metrics, data.frames, data.frame, data.lane)

  // get display position
  let x = state.currentX
  let y = state.currentY
  // fallback to centered position
  if (x == null) {
    x = state.currentX = 0.5
    y = state.currentY = 0.5
  }

  if (source) {
    // scale up from [0:1] to [0:100] range
    x = Math.floor(x * 100)
    y = Math.floor(y * 100)

    // update background image and position
    state.stage.css({
      'background-repeat'   : 'no-repeat',
      'background-image'    : `url('${source}')`,
      'background-position' : `${x}% ${y}%`
    })
  } else if (spec.sheet && spec.sprite) {
    const sprite = spec.sprite
    const sheet = spec.sheet
    const src = data.source[sheet.id]
    const left = -Math.floor(sprite.sampledX + x * (sprite.sampledWidth - data.width))
    const top = -Math.floor(sprite.sampledY + y * (sprite.sampledHeight - data.height))
    const width = sheet.sampledWidth
    const height = sheet.sampledHeight
    state.stage.css({
      'background-image'    : `url('${src}')`,
      'background-position' : `${left}px ${top}px`,
      'background-repeat'   : 'no-repeat',
      // set custom background size to enable responsive rendering
      '-webkit-background-size' : `${width}px ${height}px`, /* Safari 3-4 Chrome 1-3 */
      '-moz-background-size'    : `${width}px ${height}px`, /* Firefox 3.6 */
      '-o-background-size'      : `${width}px ${height}px`, /* Opera 9.5 */
      'background-size'         : `${width}px ${height}px`  /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
    })
  }
}

function toggleZoom(data) {
  const state = getState(data)
  if (!state.stage) {
    throw new Error('zoom module is not initialized or is not available.')
  }
  if (state.stage.is(':visible')) {
    state.stage.fadeOut()
    data.stage.fadeIn()
  } else {
    state.stage.fadeIn()
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

  onInit: onInit,
  onDestroy: onDestroy,
  onDraw: onDraw
})

SpriteSpin.extendApi({
  toggleZoom: function() { toggleZoom(this.data) } // tslint:disable-line
})

})()
