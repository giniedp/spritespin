((SpriteSpin) => {

  const NAME = 'drag'

  interface DragState {
    frame: number
    lane: number
  }

  function getState(data: SpriteSpin.Instance) {
    return SpriteSpin.getPluginState(data, NAME) as DragState
  }

  function dragStart(e, data: SpriteSpin.Instance) {
    const state = getState(data)
    if (data.loading || SpriteSpin.is(data, 'dragging') || !data.stage.is(':visible')) {
      return
    }

    state.frame = data.frame || 0
    state.lane = data.lane || 0
    SpriteSpin.flag(data, 'dragging', true)
    SpriteSpin.updateInput(e, data)
  }

  function dragEnd(e, data: SpriteSpin.Instance) {
    if (SpriteSpin.is(data, 'dragging')) {
      SpriteSpin.flag(data, 'dragging', false)
      SpriteSpin.resetInput(data)
    }
  }

  function drag(e, data: SpriteSpin.Instance) {
    const drag = getState(data)
    const input = SpriteSpin.getInputState(data)
    if (!SpriteSpin.is(data, 'dragging')) { return }
    SpriteSpin.updateInput(e, data)

    // dont do anything if the drag distance exceeds the scroll threshold.
    // this allows to use touch scroll on mobile devices.
    if ((Math.abs(input.ddX) + Math.abs(input.ddY)) > data.scrollThreshold) {
      SpriteSpin.flag(data, 'dragging', false)
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
