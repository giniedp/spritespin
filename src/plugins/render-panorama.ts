((SpriteSpin) => {

  const floor = Math.floor

  const NAME = 'panorama'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function onLoad(e, data) {
    data.stage.empty().show()
    data.frames = data.sourceWidth
    if (data.orientation === 'horizontal') {
      data.scale = data.height / data.sourceHeight
      data.frames = data.sourceWidth
    } else {
      data.scale = data.width / data.sourceWidth
      data.frames = data.sourceHeight
    }
    const w = floor(data.sourceWidth * data.scale)
    const h = floor(data.sourceHeight * data.scale)
    const background = `${w}px ${h}px`
    data.stage.css({
      'max-width'               : 'initial',
      'background-image'        : ["url('", data.source[0], "')"].join(''),
      'background-repeat'       : 'repeat-both',
      // set custom background size to enable responsive rendering
      '-webkit-background-size' : background, /* Safari 3-4 Chrome 1-3 */
      '-moz-background-size'    : background, /* Firefox 3.6 */
      '-o-background-size'      : background, /* Opera 9.5 */
      'background-size'         : background  /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
    })
  }

  function onDraw(e, data) {
    let x = 0, y = 0
    if (data.orientation === 'horizontal') {
      x = -floor((data.frame % data.frames) * data.scale)
    } else {
      y = -floor((data.frame % data.frames) * data.scale)
    }
    data.stage.css({
      'background-position' : `${x}px ${y}px`
    })
  }

  SpriteSpin.registerPlugin(NAME, {
    name: NAME,
    onLoad: onLoad,
    onDraw: onDraw
  })

})(SpriteSpin)
