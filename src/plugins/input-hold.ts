import * as SpriteSpin from '../core'

(() => {

const NAME = 'hold'

interface HoldState {
  frameTime: number
  animate: boolean
  reverse: boolean
}

function getState(data: SpriteSpin.Data) {
  return SpriteSpin.getPluginState(data, NAME) as HoldState
}

function rememberOptions(data: SpriteSpin.Data) {
  const state = getState(data)
  state.frameTime = data.frameTime
  state.animate = data.animate
  state.reverse = data.reverse
}

function restoreOptions(data: SpriteSpin.Data) {
  const state = getState(data)
  data.frameTime = state.frameTime
  data.animate = state.animate
  data.reverse = state.reverse
}

function start(e, data: SpriteSpin.Data) {
  if (SpriteSpin.is(data, 'loading') || SpriteSpin.is(data, 'dragging') || !data.stage.is(':visible')) {
    return
  }
  rememberOptions(data)
  SpriteSpin.updateInput(e, data)
  SpriteSpin.flag(data, 'dragging', true)
  data.animate = true
  SpriteSpin.applyAnimation(data)
}

function stop(e, data: SpriteSpin.Data) {
  SpriteSpin.flag(data, 'dragging', false)
  SpriteSpin.resetInput(data)
  SpriteSpin.stopAnimation(data)
  restoreOptions(data)
  SpriteSpin.applyAnimation(data)
}

function update(e, data: SpriteSpin.Data) {
  if (!SpriteSpin.is(data, 'dragging')) {
    return
  }
  SpriteSpin.updateInput(e, data)
  const input = SpriteSpin.getInputState(data)

  let half, delta
  const target = data.target, offset = target.offset()
  if (data.orientation === 'horizontal') {
    half = target.innerWidth() / 2
    delta = (input.currentX - offset.left - half) / half
  } else {
    half = (data.height / 2)
    delta = (input.currentY - offset.top - half) / half
  }
  data.reverse = delta < 0
  delta = delta < 0 ? -delta : delta
  data.frameTime = 80 * (1 - delta) + 20

  if (((data.orientation === 'horizontal') && (input.dX < input.dY)) ||
    ((data.orientation === 'vertical') && (input.dX < input.dY))) {
    e.preventDefault()
  }
}

function onFrame(e, data: SpriteSpin.Data) {
  data.animate = true
  SpriteSpin.applyAnimation(data)
}

SpriteSpin.registerPlugin(NAME, {
  name: NAME,

  mousedown: start,
  mousemove: update,
  mouseup: stop,
  mouseleave: stop,

  touchstart: start,
  touchmove: update,
  touchend: stop,
  touchcancel: stop,

  onFrame: onFrame
})

})()
