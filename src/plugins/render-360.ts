import { Utils, Data, registerPlugin } from 'spritespin'
const { css, hide, innerHeight, innerWidth, show, findSpecs } = Utils

const NAME = '360'

function onLoad(e: Event, data: Data) {
  data.stage.querySelectorAll('.spritespin-frames').forEach((it) => it.remove())
  if (data.renderer === 'image' && Array.isArray(data.images)) {
    for (const image of data.images) {
      image.classList.add('spritespin-frames')
      data.stage.appendChild(image)
    }
  }
}

function onDraw(e: Event, data: Data) {
  const specs = findSpecs(data.metrics, data.frames, data.frame, data.lane)
  const sheet = specs.sheet
  const sprite = specs.sprite

  if (!sheet || !sprite) { return }
  const src = data.source[sheet.id]
  const image = data.images[sheet.id]

  if (data.renderer === 'canvas') {
    show(data.canvas)
    const w = data.canvas.width / data.canvasRatio
    const h = data.canvas.height / data.canvasRatio
    data.context.clearRect(0, 0, w, h)
    data.context.drawImage(image, sprite.sampledX, sprite.sampledY, sprite.sampledWidth, sprite.sampledHeight, 0, 0, w, h)
    return
  }

  const scaleX = innerWidth(data.stage) / sprite.sampledWidth
  const scaleY = innerHeight(data.stage) / sprite.sampledHeight
  const top = Math.floor(-sprite.sampledY * scaleY)
  const left = Math.floor(-sprite.sampledX * scaleX)
  const width = Math.floor(sheet.sampledWidth * scaleX)
  const height = Math.floor(sheet.sampledHeight * scaleY)
  if (data.renderer === 'background') {
    css(data.stage, {
      'background-image'    : `url('${src}')`,
      'background-position' : `${left}px ${top}px`,
      'background-repeat'   : 'no-repeat',
      // set custom background size to enable responsive rendering
      '-webkit-background-size' : `${width}px ${height}px`, /* Safari 3-4 Chrome 1-3 */
      '-moz-background-size'    : `${width}px ${height}px`, /* Firefox 3.6 */
      '-o-background-size'      : `${width}px ${height}px`, /* Opera 9.5 */
      'background-size'         : `${width}px ${height}px`  /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
    })
    return
  }

  for (const img of data.images) {
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

registerPlugin(NAME, {
  name: NAME,
  onLoad,
  onDraw
})
