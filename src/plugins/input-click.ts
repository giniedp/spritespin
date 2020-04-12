import * as SpriteSpin from '../core'
import { innerWidth, isVisible, offset } from '../utils'

const NAME = 'click'
function click(e: MouseEvent, data: SpriteSpin.Data) {
  if (data.loading || !isVisible(data.stage)) {
    return
  }
  SpriteSpin.updateInput(e, data)
  const input = SpriteSpin.getInputState(data)

  let half: number, pos: number
  const target = data.target, off = offset(target)
  if (data.orientation === 'horizontal') {
    half = innerWidth(target) / 2
    pos = input.currentX - off.left
  } else {
    half = target.clientHeight / 2
    pos = input.currentY - off.top
  }
  SpriteSpin.updateFrame(data, data.frame + (pos > half ? 1 : -1))
}

SpriteSpin.registerPlugin(NAME, {
  name: NAME,
  mouseup: click,
  touchend: click
})
