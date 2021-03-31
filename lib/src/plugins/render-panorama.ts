import { InstanceState, registerPlugin, Utils } from '../core'

const NAME = 'panorama'
registerPlugin(NAME, (state: InstanceState) => {

  function onLoad() {
    const sprite = state.metrics[0]
    if (!sprite) {
      return
    }
    if (state.orientation === 'horizontal') {
      state.frames = sprite.sampledWidth
    } else {
      state.frames = sprite.sampledHeight
    }
    const width = Math.floor(sprite.sampledWidth)
    const height = Math.floor(sprite.sampledHeight)
    Utils.css(state.stage, {
      'background-image'        : `url(${state.source[sprite.id]})`,
      'background-repeat'       : 'repeat-both',
      '-webkit-background-size' : `${width}px ${height}px`,
      '-moz-background-size'    : `${width}px ${height}px`,
      '-o-background-size'      : `${width}px ${height}px`,
      'background-size'         : `${width}px ${height}px`
    })
  }

  function onDraw() {
    const px = state.orientation === 'horizontal' ? 1 : 0
    const py = px ? 0 : 1
    const offset = state.frame % state.frames
    const left = Math.round(px * offset)
    const top = Math.round(py * offset)
    Utils.css(state.stage, { 'background-position' : `${left}px ${top}px` })
  }

  return {
    name: NAME,
    onLoad: onLoad,
    onDraw: onDraw
  }
})
