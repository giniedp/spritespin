import * as SpriteSpin from '../core'
import { isVisible } from '../utils'

(() => {

const NAME = 'wheel'
function wheel(e: WheelEvent, data: SpriteSpin.Data) {
  if (!data.loading && isVisible(data.stage)) {
    e.preventDefault()

    const signX = e.deltaX === 0 ? 0 : e.deltaX > 0 ? 1 : -1
    const signY = e.deltaY === 0 ? 0 : e.deltaY > 0 ? 1 : -1

    SpriteSpin.updateFrame(data, data.frame + signY, data.lane + signX)
  }
}

SpriteSpin.registerPlugin(NAME, {
  name: NAME,
  wheel: wheel
})

})()
