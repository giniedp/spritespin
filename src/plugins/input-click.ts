((SpriteSpin) => {

  const NAME = 'click'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function click(e, data) {
    if (data.loading || !data.stage.is(':visible')) {
      return
    }
    SpriteSpin.updateInput(e, data)
    const input = SpriteSpin.getInputState(data)

    let half, pos
    const target = data.target, offset = target.offset()
    if (data.orientation === 'horizontal') {
      half = target.innerWidth() / 2
      pos = input.currentX - offset.left
    } else {
      half = target.innerHeight() / 2
      pos = input.currentY - offset.top
    }
    SpriteSpin.updateFrame(data, data.frame + (pos > half ? 1 : -1))
  }

  SpriteSpin.registerPlugin(NAME, {
    name: NAME,
    mouseup: click,
    touchend: click
  })

})(SpriteSpin)
