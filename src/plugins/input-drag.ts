((SpriteSpin) => {

  const NAME = 'drag'

  interface DragState {
    frame: number
    lane: number
  }

  function getState(data: SpriteSpin.Instance) {
    return SpriteSpin.getPluginState(data, NAME) as DragState
  }

  function getAxis(data: SpriteSpin.Instance) {
    if (typeof data.orientation === 'number') {
      return data.orientation * Math.PI / 180
    }
    if (data.orientation === 'horizontal') {
      return 0
    }
    return Math.PI / 2
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
    const state = getState(data)
    const input = SpriteSpin.getInputState(data)
    if (!SpriteSpin.is(data, 'dragging')) { return }
    SpriteSpin.updateInput(e, data)

    const rad = getAxis(data)
    const sn = Math.sin(rad)
    const cs = Math.cos(rad)
    const x = ((input.nddX * cs - input.nddY * sn) * data.sense) || 0
    const y = ((input.nddX * sn + input.nddY * cs) * (data.senseLane || data.sense)) || 0

    // accumulate
    state.frame += data.frames * x
    state.lane += data.lanes * y

    // update spritespin
    const oldFrame = data.frame
    const oldLane = data.lane
    SpriteSpin.updateFrame(data, Math.floor(state.frame), Math.floor(state.lane))
    SpriteSpin.stopAnimation(data)

    if (/^touch.*/.test(e.name) && (oldFrame !== data.frame || oldLane !== data.lane)) {
      // prevent touch scroll
      e.preventDefault()
      // stop dragging if the drag distance exceeds the scroll threshold.
      if (data.scrollThreshold != null && (Math.abs(input.ddX) + Math.abs(input.ddY)) > data.scrollThreshold) {
        dragEnd(e, data)
      }
    }
  }

  function mousemove(e, data) {
    dragStart(e, data)
    drag(e, data)
  }

  SpriteSpin.registerPlugin('drag', {
    name: 'drag',

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
    name: 'move',

    mousemove: mousemove,
    mouseleave: dragEnd,

    touchstart: dragStart,
    touchmove: drag,
    touchend: dragEnd,
    touchcancel: dragEnd
  })
})(SpriteSpin)
