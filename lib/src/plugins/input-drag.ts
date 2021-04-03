import {
  InstanceState,
  getPluginState,
  updateInput,
  resetInput,
  startAnimation,
  getInputState,
  updateFrame,
  stopAnimation,
  registerPlugin,
} from '../core'
import {
  Destructor,
  destructor
} from '../utils'

const NAME = 'drag'

interface DragState {
  startAt?: number
  endAt?: number
  frame?: number
  lane?: number
  wasPlaying?: boolean
  destructor: Destructor
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
  data.destructor = destructor()
}

function dragStart(e: MouseEvent, state: InstanceState) {
  if (state.isLoading || state.isDragging || state.isHalted) {
    return
  }

  const data = getState(state)
  data.destructor.addEventListener(document, 'mousemove', (e: MouseEvent) => drag(e, state))
  data.destructor.addEventListener(document, 'mouseup', (e: MouseEvent) => dragEnd(e, state))

  data.startAt = new Date().getTime()
  data.wasPlaying = !!state.animate

  data.frame = state.frame || 0
  data.lane = state.lane || 0
  state.isDragging = true
  updateInput(e, state)
}

function dragEnd(e: MouseEvent, state: InstanceState) {
  const data = getState(state)
  data.destructor()
  if (!state.isDragging) {
    return
  }
  data.endAt = new Date().getTime()
  state.isDragging = false
  resetInput(state)
  if (state.retainAnimate && data.wasPlaying) {
    startAnimation(state)
  }
}

function drag(e: MouseEvent, state: InstanceState) {
  if (!state.isDragging) { return }
  const data = getState(state)
  const input = getInputState(state)
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
