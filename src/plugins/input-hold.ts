((SpriteSpin) => {

  const NAME = 'hold'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function start(e, data) {
    if (data.loading || data.dragging || !data.stage.is(':visible')) {
      return
    }
    SpriteSpin.updateInput(e, data)
    data.dragging = true
    data.animate = true
    SpriteSpin.applyAnimation(data)
  }

  function stop(e, data) {
    data.dragging = false
    SpriteSpin.resetInput(data)
    SpriteSpin.stopAnimation(data)
  }

  function update(e, data) {
    if (!data.dragging) {
      return
    }
    SpriteSpin.updateInput(e, data)

    let half, delta
    const target = data.target, offset = target.offset()
    if (data.orientation === 'horizontal') {
      half = target.innerWidth() / 2
      delta = (data.currentX - offset().left - half) / half
    } else {
      half = (data.height / 2)
      delta = (data.currentY - offset().top - half) / half
    }
    data.reverse = delta < 0
    delta = delta < 0 ? -delta : delta
    data.frameTime = 80 * (1 - delta) + 20

    if (((data.orientation === 'horizontal') && (data.dX < data.dY)) ||
      ((data.orientation === 'vertical') && (data.dX < data.dY))) {
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
