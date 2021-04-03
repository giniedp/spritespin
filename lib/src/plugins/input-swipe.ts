import { InstanceState, updateInput, updateFrame, getInputState, resetInput, stopAnimation, registerPlugin, getPluginOptions } from '../core'
import { getOption } from '../utils'

const NAME = 'swipe'

interface SwipeState {
  fling: number
  snap: number
}

registerPlugin(NAME, (data: InstanceState) => {

  const state: SwipeState = {
    fling: 10,
    snap: 0.5
  }

  function init() {
    const options = getPluginOptions(data, NAME)
    if (options) {
      state.fling = getOption(data as any, 'swipeFling', state.fling)
      state.snap = getOption(data as any, 'swipeSnap', state.snap)
    }
  }

  function start(e: MouseEvent) {
    if (!data.isLoading && !data.isDragging) {
      updateInput(e, data)
      data.isDragging = true
    }
  }

  function update(e: MouseEvent) {
    if (!data.isDragging) {
      return
    }
    updateInput(e, data)
    const frame = data.frame
    const lane = data.lane
    updateFrame(data, frame, lane)
  }

  function end() {
    if (!data.isDragging) {
      return
    }
    data.isDragging = false

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

  return {
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
  }
})
