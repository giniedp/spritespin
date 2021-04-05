import { InstanceState, registerPlugin } from '../core'
import { css, innerHeight, innerWidth } from '../utils'

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

    let scale = 1
    if (state.orientation === 'horizontal') {
      scale = innerHeight(state.target) / sprite.sampledHeight
    } else {
      scale = innerWidth(state.target) / sprite.sampledWidth
    }
    const width = Math.floor(sprite.sampledWidth) * scale
    const height = Math.floor(sprite.sampledHeight) * scale
    css(state.stage, {
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
    css(state.stage, { 'background-position' : `${left}px ${top}px` })
  }

  return {
    name: NAME,
    onLoad: onLoad,
    onDraw: onDraw
  }
})
