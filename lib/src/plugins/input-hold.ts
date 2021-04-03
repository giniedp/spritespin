import { InstanceState, updateInput, usePlayback, resetInput, stopAnimation, getInputState, registerPlugin } from '../core'
import { innerWidth, offset } from '../utils'

const NAME = 'hold'

interface HoldState {
  frameTime: number
  animate: boolean
  reverse: boolean
}

registerPlugin(NAME, (data: InstanceState) => {
  const state: HoldState = {
    frameTime: null,
    animate: null,
    reverse: null,
  }

  function rememberOptions() {
    state.frameTime = data.frameTime
    state.animate = data.animate
    state.reverse = data.reverse
  }

  function restoreOptions() {
    data.frameTime = state.frameTime
    data.animate = state.animate
    data.reverse = state.reverse
  }

  function start(e: MouseEvent) {
    if (data.isLoading || data.isDragging || data.isHalted) {
      return
    }
    rememberOptions()
    updateInput(e, data)
    data.isDragging = true
    data.animate = true
    usePlayback(data)
  }

  function stop() {
    data.isDragging = false
    resetInput(data)
    stopAnimation(data)
    restoreOptions()
    usePlayback(data)
  }

  function update(e: MouseEvent) {
    if (!data.isDragging || data.isLoading || data.isHalted) {
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

  function onFrame() {
    data.animate = true
    usePlayback(data)
  }

  return {
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
  }
})
