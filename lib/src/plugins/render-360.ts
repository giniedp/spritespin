import { InstanceState, registerPlugin } from '../core'
import { css, hide, show, findSpecs, innerWidth, innerHeight } from '../utils'

const NAME = '360'

registerPlugin(NAME, (state: InstanceState) => {

  function onLoad() {
    state.stage.querySelectorAll('.spritespin-frames').forEach((it) => it.remove())
    if (state.renderMode === 'image' && Array.isArray(state.images)) {
      for (const image of state.images) {
        image.classList.add('spritespin-frames')
        state.stage.appendChild(image)
      }
    }
  }

  function onDraw() {
    const specs = findSpecs(state.metrics, state.frames, state.frame, state.lane)
    const sheet = specs.sheet
    const sprite = specs.sprite

    if (!sheet || !sprite) { return }
    const src = state.source[sheet.id]
    const image = state.images[sheet.id]

    if (state.renderMode === 'canvas') {
      show(state.canvas)
      const w = state.canvas.width / state.canvasRatio
      const h = state.canvas.height / state.canvasRatio
      state.canvasContext.clearRect(0, 0, w, h)
      state.canvasContext.drawImage(image, sprite.sampledX, sprite.sampledY, sprite.sampledWidth, sprite.sampledHeight, 0, 0, w, h)
      return
    }
    if (state.canvas) {
      hide(state.canvas)
    }

    const scaleX = innerWidth(state.stage) / sprite.sampledWidth
    const scaleY = innerHeight(state.stage) / sprite.sampledHeight
    const top = Math.floor(-sprite.sampledY * scaleY)
    const left = Math.floor(-sprite.sampledX * scaleX)
    const width = Math.floor(sheet.sampledWidth * scaleX)
    const height = Math.floor(sheet.sampledHeight * scaleY)
    if (state.renderMode === 'background') {
      css(state.stage, {
        'background-image'    : `url('${src}')`,
        'background-position' : `${left}px ${top}px`,
        'background-repeat'   : 'no-repeat',
        '-webkit-background-size' : `${width}px ${height}px`,
        '-moz-background-size'    : `${width}px ${height}px`,
        '-o-background-size'      : `${width}px ${height}px`,
        'background-size'         : `${width}px ${height}px`
      })
      return
    }

    for (const img of state.images) {
      hide(img)
    }
    show(image)
    css(image, {
      position: 'absolute',
      top: top,
      left: left,
      'max-width' : 'initial',
      width: width,
      height: height
    })
  }

  return {
    name: NAME,
    onLoad,
    onDraw
  }
})
