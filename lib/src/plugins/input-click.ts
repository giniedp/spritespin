import { updateInput, Utils, InstanceState, getInputState, updateFrame, registerPlugin } from '../core'

const NAME = 'click'

registerPlugin(NAME, (state: InstanceState) => {
  const onclick = (e: MouseEvent) => {
    if (state.isLoading) {
      return
    }
    updateInput(e, state)
    const input = getInputState(state)

    let half: number, pos: number
    const target = state.target, off = Utils.offset(target)
    if (state.orientation === 'horizontal') {
      half = Utils.innerWidth(target) / 2
      pos = input.currentX - off.left
    } else {
      half = target.clientHeight / 2
      pos = input.currentY - off.top
    }
    updateFrame(state, state.frame + (pos > half ? 1 : -1))
  }
  return {
    name: NAME,
    mouseup: onclick,
    touchend: onclick
  }
})
