import * as SpriteSpin from '../core'

(() => {

const NAME = 'drag'

interface DragState {
  startAt?: number
  endAt?: number
  frame?: number
  lane?: number
  wasPlaying?: boolean
  minTime: number
  maxTime: number
}

function getState(data: SpriteSpin.Data) {
  return SpriteSpin.getPluginState(data, NAME) as DragState
}

function getAxis(data: SpriteSpin.Data) {
  if (typeof data.orientation === 'number') {
    return data.orientation * Math.PI / 180
  }
  if (data.orientation === 'horizontal') {
    return 0
  }
  return Math.PI / 2
}

function onInit(e, data: SpriteSpin.Data) {
  const state = getState(data)
  const d = [200, 1500]
  const t = data.touchScrollTimer || d
  state.minTime = t[0] || d[0]
  state.maxTime = t[1] || d[1]
}

function dragStart(e, data: SpriteSpin.Data) {
  const state = getState(data)
  if (data.loading || SpriteSpin.is(data, 'dragging') || data['zoomPinFrame'] && !data.stage.is(':visible')) {
    return
  }

  // Touch scroll can only be disabled by cancelling the 'touchstart' event.
  // If we would try to cancel the 'touchmove' event during a scroll
  // chrome browser raises an error
  //
  // When a user interacts with sprite spin, we dont know whether the intention
  // is to scroll the page or to roll the spin.
  //
  // On first interaction with SpriteSpin the scroll is not disabled
  // On double tap within 200ms the scroll is not disabled
  // Scroll is only disabled if there was an interaction with SpriteSpin in the past 1500ms

  const now = new Date().getTime()
  if (state.endAt && (now - state.endAt > state.maxTime)) {
    // reset timer if the user has no interaction with spritespin within 1500ms
    state.startAt = null
    state.endAt = null
  }
  if (state.startAt && (now - state.startAt > state.minTime)) {
    // disable scroll only if there was already an interaction with spritespin
    // however, allow scrolling on double tab within 200ms
    e.preventDefault()
  }

  state.startAt = now
  state.wasPlaying = !!SpriteSpin.getPlaybackState(data).handler

  state.frame = data.frame || 0
  state.lane = data.lane || 0
  SpriteSpin.flag(data, 'dragging', true)
  SpriteSpin.updateInput(e, data)
}

function dragEnd(e, data: SpriteSpin.Data) {
  if (SpriteSpin.is(data, 'dragging')) {
    getState(data).endAt = new Date().getTime()
    SpriteSpin.flag(data, 'dragging', false)
    SpriteSpin.resetInput(data)
    if (data.retainAnimate && getState(data).wasPlaying) {
      SpriteSpin.startAnimation(data)
    }
  }
}

function drag(e, data: SpriteSpin.Data) {
  const state = getState(data)
  const input = SpriteSpin.getInputState(data)
  if (!SpriteSpin.is(data, 'dragging')) { return }
  SpriteSpin.updateInput(e, data)

  const rad = getAxis(data)
  const sn = Math.sin(rad)
  const cs = Math.cos(rad)
  const x = ((input.nddX * cs - input.nddY * sn) * data.sense) || 0
  const y = ((input.nddX * sn + input.nddY * cs) * (data.senseLane || data.sense)) || 0

  // accumulate
  state.frame += data.frames * x
  state.lane += data.lanes * y

  // update spritespin
  const oldFrame = data.frame
  const oldLane = data.lane
  SpriteSpin.updateFrame(data, Math.floor(state.frame), Math.floor(state.lane))
  SpriteSpin.stopAnimation(data)
}

function mousemove(e, data) {
  dragStart(e, data)
  drag(e, data)
}

SpriteSpin.registerPlugin('drag', {
  name: 'drag',
  onInit: onInit,

  mousedown: dragStart,
  mousemove: drag,
  mouseup: dragEnd,

  documentmousemove: drag,
  documentmouseup: dragEnd,

  touchstart: dragStart,
  touchmove: drag,
  touchend: dragEnd,
  touchcancel: dragEnd
})

SpriteSpin.registerPlugin('move', {
  name: 'move',
  onInit: onInit,

  mousemove: mousemove,
  mouseleave: dragEnd,

  touchstart: dragStart,
  touchmove: drag,
  touchend: dragEnd,
  touchcancel: dragEnd
})

})()
