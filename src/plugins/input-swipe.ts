((SpriteSpin) => {

  const NAME = 'swipe'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function init(e, data) {
    data.swipeFling = data.swipeFling || 10
    data.swipeSnap = data.swipeSnap || 0.50
  }

  function start(e, data) {
    if (!data.loading && !data.dragging) {
      SpriteSpin.updateInput(e, data)
      data.dragging = true
    }
  }

  function update(e, data) {
    if (!data.dragging) {
      return
    }
    SpriteSpin.updateInput(e, data)
    const frame = data.frame
    const lane = data.lane
    SpriteSpin.updateFrame(data, frame, lane)
  }

  function end(e, data) {
    if (!data.dragging) {
      return
    }
    data.dragging = false

    let frame = data.frame
    const lane = data.lane
    const snap = data.swipeSnap
    const fling = data.swipeFling
    let dS, dF
    if (data.orientation === 'horizontal') {
      dS = data.ndX
      dF = data.ddX
    } else {
      dS = data.ndY
      dF = data.ddY
    }

    if (dS > snap || dF > fling) {
      frame = data.frame - 1
    } else if (dS < -snap || dF < -fling) {
      frame = data.frame + 1
    }

    SpriteSpin.resetInput(data)
    SpriteSpin.updateFrame(data, frame, lane)
    SpriteSpin.stopAnimation(data)
  }

  SpriteSpin.registerPlugin(NAME, {
    name: NAME,
    onLoad: init,
    mousedown: start,
    mousemove: update,
    mouseup: end,
    mouseleave: end,

    touchstart: start,
    touchmove: update,
    touchend: end,
    touchcancel: end
  })

})(SpriteSpin)
