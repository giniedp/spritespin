import * as SpriteSpin from '../core'
import * as Utils from '../utils'

(() => {

const floor = Math.floor

const NAME = '360'

function onLoad(e, data: SpriteSpin.Data) {
  data.stage.find('.spritespin-frames').detach()
  if (data.renderer === 'image') {
    $(data.images).addClass('spritespin-frames').appendTo(data.stage)
  }
}

function onDraw(e, data: SpriteSpin.Data) {
  const specs = Utils.findSpecs(data.metrics, data.frames, data.frame, data.lane)
  const sheet = specs.sheet
  const sprite = specs.sprite

  if (!sheet || !sprite) { return }
  const src = data.source[sheet.id]
  const image = data.images[sheet.id]

  if (data.renderer === 'canvas') {
    data.canvas.show()
    const w = data.canvas[0].width / data.canvasRatio
    const h = data.canvas[0].height / data.canvasRatio
    data.context.clearRect(0, 0, w, h)
    data.context.drawImage(image, sprite.sampledX, sprite.sampledY, sprite.sampledWidth, sprite.sampledHeight, 0, 0, w, h)
    return
  }

  const scaleX = data.stage.innerWidth() / sprite.sampledWidth
  const scaleY = data.stage.innerHeight() / sprite.sampledHeight
  const top = Math.floor(-sprite.sampledY * scaleY)
  const left = Math.floor(-sprite.sampledX * scaleX)
  const width = Math.floor(sheet.sampledWidth * scaleX)
  const height = Math.floor(sheet.sampledHeight * scaleY)
  if (data.renderer === 'background') {
    data.stage.css({
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

  $(data.images).hide()
  $(image).show().css({
    position: 'absolute',
    top: top,
    left: left,
    'max-width' : 'initial',
    width: width,
    height: height
  })
}

SpriteSpin.registerPlugin(NAME, {
  name: NAME,
  onLoad,
  onDraw
})

})()
