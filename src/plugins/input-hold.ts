((SpriteSpin) => {

  const NAME = 'hold'

  function getState(data: SpriteSpin.Instance) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function start(e, data: SpriteSpin.Instance) {
    if (SpriteSpin.is(data, 'loading') || SpriteSpin.is(data, 'dragging') || !data.stage.is(':visible')) {
      return
    }
    SpriteSpin.updateInput(e, data)
    SpriteSpin.flag(data, 'dragging', true)
    data.animate = true
    SpriteSpin.applyAnimation(data)
  }

  function stop(e, data: SpriteSpin.Instance) {
    SpriteSpin.flag(data, 'dragging', false)
    SpriteSpin.resetInput(data)
    SpriteSpin.stopAnimation(data)
  }

  function update(e, data: SpriteSpin.Instance) {
    if (!SpriteSpin.is(data, 'dragging')) {
      return
    }
    SpriteSpin.updateInput(e, data)
    const input = SpriteSpin.getInputState(data)

    let half, delta
    const target = data.target, offset = target.offset()
    if (data.orientation === 'horizontal') {
      half = target.innerWidth() / 2
      delta = (input.currentX - offset.left - half) / half
    } else {
      half = (data.height / 2)
      delta = (input.currentY - offset.top - half) / half
    }
    data.reverse = delta < 0
    delta = delta < 0 ? -delta : delta
    data.frameTime = 80 * (1 - delta) + 20

    if (((data.orientation === 'horizontal') && (input.dX < input.dY)) ||
      ((data.orientation === 'vertical') && (input.dX < input.dY))) {
      e.preventDefault()
    }
  }

  function onFrame() {
    SpriteSpin.$(this).spritespin('api').startAnimation()
  }

  SpriteSpin.registerPlugin(NAME, {
    namw: NAME,

    mousedown: start,
    mousemove: update,
    mouseup: stop,
    mouseleave: stop,

    touchstart: start,
    touchmove: update,
    touchend: stop,
    touchcancel: stop,

    onFrame: onFrame
  })

})(SpriteSpin)
