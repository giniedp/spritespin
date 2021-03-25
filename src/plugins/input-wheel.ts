import { Utils, Data, updateFrame, registerPlugin } from '../core'

const { isVisible } = Utils

const NAME = 'wheel'
function wheel(e: WheelEvent, data: Data) {
  if (!data.loading && isVisible(data.stage)) {
    e.preventDefault()

    const signX = e.deltaX === 0 ? 0 : e.deltaX > 0 ? 1 : -1
    const signY = e.deltaY === 0 ? 0 : e.deltaY > 0 ? 1 : -1

    updateFrame(data, data.frame + signY, data.lane + signX)
  }
}

registerPlugin(NAME, {
  name: NAME,
  wheel: wheel
})
