import { InstanceState, updateFrame, registerPlugin } from '../core'

const NAME = 'wheel'
registerPlugin(NAME, (state: InstanceState) => {
  function wheel(e: WheelEvent) {
    if (!state.isLoading) {
      e.preventDefault()
      const signX = e.deltaX === 0 ? 0 : e.deltaX > 0 ? 1 : -1
      const signY = e.deltaY === 0 ? 0 : e.deltaY > 0 ? 1 : -1
      updateFrame(state, state.frame + signY, state.lane + signX)
    }
  }
  return {
    name: NAME,
    wheel: wheel
  }
})
