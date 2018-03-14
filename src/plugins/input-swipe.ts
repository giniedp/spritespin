import * as SpriteSpin from '../core'

(() => {

const NAME = 'swipe'

interface SwipeState {
  fling: number
  snap: number
}

function getState(data) {
  return SpriteSpin.getPluginState(data, NAME) as SwipeState
}
function getOption(data, name, fallback) {
  return data[name] || fallback
}

function init(e, data) {
  const state = getState(data)
  state.fling = getOption(data, 'swipeFling', 10)
  state.snap = getOption(data, 'swipeSnap', 0.50)
}

function start(e, data: SpriteSpin.Data) {
  if (!data.loading && !SpriteSpin.is(data, 'dragging')) {
    SpriteSpin.updateInput(e, data)
    SpriteSpin.flag(data, 'dragging', true)
  }
}

function update(e, data: SpriteSpin.Data) {
  if (!SpriteSpin.is(data, 'dragging')) {
    return
  }
  SpriteSpin.updateInput(e, data)
  const frame = data.frame
  const lane = data.lane
  SpriteSpin.updateFrame(data, frame, lane)
}

function end(e, data: SpriteSpin.Data) {
  if (!SpriteSpin.is(data, 'dragging')) {
    return
  }
  SpriteSpin.flag(data, 'dragging', false)

  const state = getState(data)
  const input = SpriteSpin.getInputState(data)

  let frame = data.frame
  const lane = data.lane
  const snap = state.snap
  const fling = state.fling
  let dS, dF
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

  SpriteSpin.resetInput(data)
  SpriteSpin.updateFrame(data, frame, lane)
  SpriteSpin.stopAnimation(data)
}

SpriteSpin.registerPlugin(NAME, {
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

})()
