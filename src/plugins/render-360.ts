((SpriteSpin) => {

  const $ = SpriteSpin.$

  const floor = Math.floor

  const NAME = '360'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function drawSprite(data) {
    const index = data.lane * data.frames + data.frame

    let x = data.frameWidth * (index % data.framesX)
    let y = data.frameHeight * floor(index / data.framesX)

    if (data.renderer === 'canvas') {
      const w = data.canvas[0].width / data.canvasRatio
      const h = data.canvas[0].height / data.canvasRatio
      data.context.clearRect(0, 0, w, h)
      data.context.drawImage(data.images[0], x, y, data.frameWidth, data.frameHeight, 0, 0, w, h)
      return
    }

    x = -floor(x * data.scaleWidth)
    y = -floor(y * data.scaleHeight)

    if (data.renderer === 'background') {
      data.stage.css({
        'background-image'    : ["url('", data.source[0], "')"].join(''),
        'background-position' : [x, 'px', y, 'px'].join('')
      })
    } else {
      $(data.images).css({
        top: y,
        left: x,
        'max-width' : 'initial'
      })
    }
  }

  function drawFrames(data) {
    const index = data.lane * data.frames + data.frame

    const img = data.images[index]
    if (data.renderer === 'canvas') {
      if (img && img.complete !== false) {
        const w = data.canvas[0].width / data.canvasRatio
        const h = data.canvas[0].height / data.canvasRatio
        data.context.clearRect(0, 0, w, h)
        data.context.drawImage(img, 0, 0, w, h)
      }
    } else if (data.renderer === 'background') {
      data.stage.css({
        'background-image' : ["url('", data.source[index], "')"].join(''),
        'background-position' : [0, 'px ', 0, 'px'].join('')
      })
    } else {
      $(data.images).hide()
      $(data.images[index]).show()
    }
  }

  function onLoad(e, data) {

      // calculate scaling if we are in responsive mode
      if (data.width && data.frameWidth) {
        data.scaleWidth = data.width / data.frameWidth
      } else {
        data.scaleWidth = 1
      }
      if (data.height && data.frameHeight) {
        data.scaleHeight = data.height / data.frameHeight
      } else {
        data.scaleHeight = 1
      }

      // assume that the source is a spritesheet, when there is only one image given
      data.sourceIsSprite = data.images.length === 1

      // clear and enable the stage container
      data.stage.empty().css({ 'background-image' : 'none' }).show()

      if (data.renderer === 'canvas') {
        const w = data.canvas[0].width / data.canvasRatio
        const h = data.canvas[0].height / data.canvasRatio
        data.context.clearRect(0, 0, w, h)
        data.canvas.show()
      } else if (data.renderer === 'background') {
        // prepare rendering frames as background images

        let w, h
        if (data.sourceIsSprite) {
          w = floor(data.sourceWidth * data.scaleWidth)
          h = floor(data.sourceHeight * data.scaleHeight)
        } else {
          w = floor(data.frameWidth * data.scaleWidth)
          h = floor(data.frameHeight * data.scaleHeight)
        }
        const background = [w, 'px ', h, 'px'].join('')

        data.stage.css({
          'background-repeat'   : 'no-repeat',
          // set custom background size to enable responsive rendering
          '-webkit-background-size' : background, /* Safari 3-4 Chrome 1-3 */
          '-moz-background-size'    : background, /* Firefox 3.6 */
          '-o-background-size'      : background, /* Opera 9.5 */
          'background-size'         : background  /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
        })
      } else if (data.renderer === 'image') {
        let w, h
        // prepare rendering frames as image elements
        if (data.sourceIsSprite) {
          w = floor(data.sourceWidth * data.scaleWidth)
          h = floor(data.sourceHeight * data.scaleHeight)
        } else {
          w = h = '100%'
        }
        $(data.images).appendTo(data.stage).css({
          width: w,
          height: h,
          position: 'absolute'
        })
      }
  }

  function onDraw(e, data) {
    if (data.sourceIsSprite) {
      drawSprite(data)
    } else {
      drawFrames(data)
    }
  }

  SpriteSpin.registerPlugin(NAME, {
    name: NAME,
    onLoad,
    onDraw
  })

})(SpriteSpin)
