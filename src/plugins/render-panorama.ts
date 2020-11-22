import { Data, getPluginState, registerPlugin, Utils } from 'spritespin'

const { innerHeight, innerWidth, css } = Utils

const NAME = 'panorama'

interface PanoramaState {
  scale: number
}

function getState(data: Data) {
  return getPluginState<PanoramaState>(data, NAME)
}

function onLoad(e: Event, data: Data) {
  const state = getState(data)
  const sprite = data.metrics[0]
  if (!sprite) {
    return
  }

  if (data.orientation === 'horizontal') {
    state.scale = innerHeight(data.target) / sprite.sampledHeight
    data.frames = sprite.sampledWidth
  } else {
    state.scale = innerWidth(data.target) / sprite.sampledWidth
    data.frames = sprite.sampledHeight
  }
  const width = Math.floor(sprite.sampledWidth * state.scale)
  const height = Math.floor(sprite.sampledHeight * state.scale)
  css(data.stage, {
    'background-image'        : `url(${data.source[sprite.id]})`,
    'background-repeat'       : 'repeat-both',
    // set custom background size to enable responsive rendering
    '-webkit-background-size' : `${width}px ${height}px`, /* Safari 3-4 Chrome 1-3 */
    '-moz-background-size'    : `${width}px ${height}px`, /* Firefox 3.6 */
    '-o-background-size'      : `${width}px ${height}px`, /* Opera 9.5 */
    'background-size'         : `${width}px ${height}px`  /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
  })
}

function onDraw(e: Event, data: Data) {
  const state = getState(data)
  const px = data.orientation === 'horizontal' ? 1 : 0
  const py = px ? 0 : 1

  const offset = data.frame % data.frames
  const left = Math.round(px * offset * state.scale)
  const top = Math.round(py * offset * state.scale)
  css(data.stage, { 'background-position' : `${left}px ${top}px` })
}

registerPlugin(NAME, {
  name: NAME,
  onLoad: onLoad,
  onDraw: onDraw
})
