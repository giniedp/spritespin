import { Data, getPluginState, is, updateInput, flag, updateFrame, getInputState, resetInput, stopAnimation, registerPlugin, Utils } from 'spritespin'
const { getOption } = Utils

const NAME = 'swipe'

interface SwipeState {
  fling: number
  snap: number
}

function getState(data: Data) {
  return getPluginState(data, NAME) as SwipeState
}

function init(e: Event, data: Data) {
  const state = getState(data)
  state.fling = getOption(data as any, 'swipeFling', 10)
  state.snap = getOption(data as any, 'swipeSnap', 0.50)
}

function start(e: MouseEvent, data: Data) {
  if (!data.loading && !is(data, 'dragging')) {
    updateInput(e, data)
    flag(data, 'dragging', true)
  }
}

function update(e: MouseEvent, data: Data) {
  if (!is(data, 'dragging')) {
    return
  }
  updateInput(e, data)
  const frame = data.frame
  const lane = data.lane
  updateFrame(data, frame, lane)
}

function end(e: Event, data: Data) {
  if (!is(data, 'dragging')) {
    return
  }
  flag(data, 'dragging', false)

  const state = getState(data)
  const input = getInputState(data)

  let frame = data.frame
  const lane = data.lane
  const snap = state.snap
  const fling = state.fling
  let dS: number, dF: number
  if (data.orientation === 'horizontal') {
    dS = input.ndX
    dF = input.ddX
  } else {
    dS = input.ndY
    dF = input.ddY
  }

  if (dS >= snap || dF >= fling) {
    frame = data.frame - 1
  } else if (dS <= -snap || dF <= -fling) {
    frame = data.frame + 1
  }

  resetInput(data)
  updateFrame(data, frame, lane)
  stopAnimation(data)
}

registerPlugin(NAME, {
  name: NAME,
  onLoad: init,
  mousedown: start,
  mousemove: update,
  mouseup: end,
  mouseleave: end,

  touchstart: start,
  touchmove: update,
  touchend: end,
  touchcancel: end
})
