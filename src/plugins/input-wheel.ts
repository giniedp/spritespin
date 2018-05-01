import * as SpriteSpin from '../core'

(() => {

const NAME = 'wheel'
function wheel(e: JQueryMouseEventObject, data: SpriteSpin.Data) {
  if (!data.loading && data.stage.is(':visible')) {
    e.preventDefault()

    const we = e.originalEvent as WheelEvent
    const signX = we.deltaX === 0 ? 0 : we.deltaX > 0 ? 1 : -1
    const signY = we.deltaY === 0 ? 0 : we.deltaY > 0 ? 1 : -1

    SpriteSpin.updateFrame(data, data.frame + signY, data.lane + signX)
  }
}

SpriteSpin.registerPlugin(NAME, {
  name: NAME,
  wheel: wheel
})

})()
