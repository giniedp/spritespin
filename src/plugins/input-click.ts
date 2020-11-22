import { updateInput, Utils, Data, getInputState, updateFrame, registerPlugin } from 'spritespin'

const NAME = 'click'
function click(e: MouseEvent, data: Data) {
  if (data.loading || !Utils.isVisible(data.stage)) {
    return
  }
  updateInput(e, data)
  const input = getInputState(data)

  let half: number, pos: number
  const target = data.target, off = Utils.offset(target)
  if (data.orientation === 'horizontal') {
    half = Utils.innerWidth(target) / 2
    pos = input.currentX - off.left
  } else {
    half = target.clientHeight / 2
    pos = input.currentY - off.top
  }
  updateFrame(data, data.frame + (pos > half ? 1 : -1))
}

registerPlugin(NAME, {
  name: NAME,
  mouseup: click,
  touchend: click
})
