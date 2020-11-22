import { Data, getPluginState, is, updateInput, flag, applyAnimation, resetInput, stopAnimation, getInputState, registerPlugin, Utils } from 'spritespin'
const { innerWidth, isVisible, offset } = Utils

const NAME = 'hold'

interface HoldState {
  frameTime: number
  animate: boolean
  reverse: boolean
}

function getState(data: Data) {
  return getPluginState(data, NAME) as HoldState
}

function rememberOptions(data: Data) {
  const state = getState(data)
  state.frameTime = data.frameTime
  state.animate = data.animate
  state.reverse = data.reverse
}

function restoreOptions(data: Data) {
  const state = getState(data)
  data.frameTime = state.frameTime
  data.animate = state.animate
  data.reverse = state.reverse
}

function start(e: MouseEvent, data: Data) {
  if (is(data, 'loading') || is(data, 'dragging') || !isVisible(data.stage)) {
    return
  }
  rememberOptions(data)
  updateInput(e, data)
  flag(data, 'dragging', true)
  data.animate = true
  applyAnimation(data)
}

function stop(e: Event, data: Data) {
  flag(data, 'dragging', false)
  resetInput(data)
  stopAnimation(data)
  restoreOptions(data)
  applyAnimation(data)
}

function update(e: MouseEvent, data: Data) {
  if (!is(data, 'dragging')) {
    return
  }
  updateInput(e, data)
  const input = getInputState(data)

  let half, delta
  const target = data.target, off = offset(target)
  if (data.orientation === 'horizontal') {
    half = innerWidth(target) / 2
    delta = (input.currentX - off.left - half) / half
  } else {
    half = (data.height / 2)
    delta = (input.currentY - off.top - half) / half
  }
  data.reverse = delta < 0
  delta = delta < 0 ? -delta : delta
  data.frameTime = 80 * (1 - delta) + 20

  if (((data.orientation === 'horizontal') && (input.dX < input.dY)) ||
    ((data.orientation === 'vertical') && (input.dX < input.dY))) {
    e.preventDefault()
  }
}

function onFrame(e: Event, data: Data) {
  data.animate = true
  applyAnimation(data)
}

registerPlugin(NAME, {
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
