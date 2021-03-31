import {
  InstanceState,
  getPluginState,
  getPlaybackState,
  updateInput,
  resetInput,
  startAnimation,
  getInputState,
  updateFrame,
  stopAnimation,
  registerPlugin,
  Utils
} from '../core'

const { isVisible } = Utils

const NAME = 'drag'

interface DragState {
  startAt?: number
  endAt?: number
  frame?: number
  lane?: number
  wasPlaying?: boolean
  minTime: number
  maxTime: number
  unlink: Function []
}

function getState(state: InstanceState) {
  return getPluginState(state, NAME) as DragState
}

function getAxis(state: InstanceState) {
  if (typeof state.orientation === 'number') {
    return state.orientation * Math.PI / 180
  }
  if (state.orientation === 'horizontal') {
    return 0
  }
  return Math.PI / 2
}

function onInit(e: Event, state: InstanceState) {
  const data = getState(state)
  const d = [200, 1500]
  const t = state.touchScrollTimer || d
  data.minTime = t[0] || d[0]
  data.maxTime = t[1] || d[1]
  data.unlink = []
}

function dragStart(e: MouseEvent, state: InstanceState) {
  const data = getState(state)
  if (state.isLoading || state.isDragging || state.isHalted) {
    return
  }

  data.unlink.push(
    Utils.addEventListener(document, 'mousemove', (e: MouseEvent) => drag(e, state)),
    Utils.addEventListener(document, 'mouseup', (e: MouseEvent) => dragEnd(e, state))
  )

  // Touch scroll can only be disabled by cancelling the 'touchstart' event.
  // If we would try to cancel the 'touchmove' event during a scroll
  // chrome browser raises an error
  //
  // When a user interacts with sprite spin, we don't know whether the intention
  // is to scroll the page or to roll the spin.
  //
  // On first interaction with SpriteSpin the scroll is not disabled
  // On double tap within 200ms the scroll is not disabled
  // Scroll is only disabled if there was an interaction with SpriteSpin in the past 1500ms

  const now = new Date().getTime()
  if (data.endAt && (now - data.endAt > data.maxTime)) {
    // reset timer if the user has no interaction with spritespin within 1500ms
    data.startAt = null
    data.endAt = null
  }
  if (data.startAt && (now - data.startAt > data.minTime)) {
    // disable scroll only if there was already an interaction with spritespin
    // however, allow scrolling on double tab within 200ms
    // e.preventDefault()
  }

  data.startAt = now
  data.wasPlaying = !!getPlaybackState(state).handler

  data.frame = state.frame || 0
  data.lane = state.lane || 0
  state.isDragging = true
  updateInput(e, state)
}

function dragEnd(e: MouseEvent, state: InstanceState) {
  const data = getState(state)
  data.unlink.forEach((it) => it())
  if (state.isDragging) {
    data.endAt = new Date().getTime()
    state.isDragging = false
    resetInput(state)
    if (state.retainAnimate && data.wasPlaying) {
      startAnimation(state)
    }
  }
}

function drag(e: MouseEvent, state: InstanceState) {
  const data = getState(state)
  const input = getInputState(state)
  if (!state.isDragging) { return }
  updateInput(e, state)

  const rad = getAxis(state)
  const sn = Math.sin(rad)
  const cs = Math.cos(rad)
  const x = ((input.nddX * cs - input.nddY * sn) * state.sense) || 0
  const y = ((input.nddX * sn + input.nddY * cs) * (state.senseLane || state.sense)) || 0

  // accumulate
  data.frame += state.frames * x
  data.lane += state.lanes * y

  // update spritespin
  updateFrame(state, Math.floor(data.frame), Math.floor(data.lane))
  stopAnimation(state)
}

function mousemove(e: MouseEvent, instance: InstanceState) {
  dragStart(e, instance)
  drag(e, instance)
}

registerPlugin('drag', {
  name: 'drag',
  onInit: onInit,

  mousedown: dragStart,
  mousemove: drag,
  mouseup: dragEnd,

  touchstart: dragStart,
  touchmove: drag,
  touchend: dragEnd,
  touchcancel: dragEnd
})

registerPlugin('move', {
  name: 'move',
  onInit: onInit,
  mousemove: mousemove,
  mouseleave: dragEnd,

  touchstart: dragStart,
  touchmove: drag,
  touchend: dragEnd,
  touchcancel: dragEnd
})
