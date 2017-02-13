((SpriteSpin) => {

  const NAME = 'drag'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function dragStart(e, data) {
    const drag = getState(data)
    if (drag.active || data.loading || !data.stage.is(':visible')) {
      return
    }

    drag.frame = data.frame || 0
    drag.lane = data.lane || 0
    drag.active = true
    SpriteSpin.updateInput(e, data)
  }

  function dragEnd(e, data: SpriteSpin.Instance) {
    const drag = getState(data)
    if (drag.active) {
      drag.active = false
      SpriteSpin.resetInput(data)
    }
  }

  function drag(e, data: SpriteSpin.Instance) {
    const drag = getState(data)
    const input = SpriteSpin.getInputState(data)
    if (!drag.active) {
      return
    }
    SpriteSpin.updateInput(e, data)

    // dont do anything if the drag distance exceeds the scroll threshold.
    // this allows to use touch scroll on mobile devices.
    if ((Math.abs(input.ddX) + Math.abs(input.ddY)) > data.scrollThreshold) {
      drag.active = false
      SpriteSpin.resetInput(data)
      return
    }

    // disable touch scroll
    e.preventDefault()

    let angle = 0
    if (typeof data.orientation === 'number') {
      angle = (Number(data.orientation) || 0) * Math.PI / 180
    } else if (data.orientation === 'horizontal') {
      angle = 0
    } else {
      angle = Math.PI / 2
    }
    const sn = Math.sin(angle)
    const cs = Math.cos(angle)
    const x = ((input.nddX * cs - input.nddY * sn) * data.sense) || 0
    const y = ((input.nddX * sn + input.nddY * cs) * (data.senseLane || data.sense)) || 0

    // accumulate
    drag.frame += data.frames * x
    drag.lane += data.lanes * y

    const frame = Math.floor(drag.frame)
    const lane = Math.floor(drag.lane)
    SpriteSpin.updateFrame(data, frame, lane)
    SpriteSpin.stopAnimation(data)
  }

  function mousemove(e, data) {
    dragStart(e, data)
    drag(e, data)
  }

  SpriteSpin.registerPlugin('drag', {
    mousedown: dragStart,
    mousemove: drag,
    mouseup: dragEnd,

    documentmousemove: drag,
    documentmouseup: dragEnd,

    touchstart: dragStart,
    touchmove: drag,
    touchend: dragEnd,
    touchcancel: dragEnd
  })

  SpriteSpin.registerPlugin('move', {
    mousemove: mousemove,
    mouseleave: dragEnd,

    touchstart: dragStart,
    touchmove: drag,
    touchend: dragEnd,
    touchcancel: dragEnd
  })
})(SpriteSpin)
