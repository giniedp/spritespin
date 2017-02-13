((SpriteSpin) => {

  const max = Math.max
  const min = Math.min

  const NAME = 'ease'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function init(e, data) {
    data.easeAbortAfterMs = max(data.easeAbortAfterMs || 250, 0)
    data.easeDamping = max(min(data.easeDamping || 0.9, 0.999), 0)
    data.easeSamples = max(data.easeSamples || 5, 1)
    data.easeUpdateTime = max(data.easeUpdateTime || data.frameTime, 16)
    data.easeScope = { samples: [], steps: [] }
  }

  function update(e, data) {
    if (data.dragging) {
      killLoop(data, data.easeScope)
      sampleInput(data, data.easeScope)
    }
  }

  function end(e, data) {
    const ease = data.easeScope
    const samples = ease.samples

    let last
    let lanes = 0
    let frames = 0
    let time = 0
    for (const sample of samples) {
      if (!last) {
        last = sample
        continue
      }

      const dt = sample.time - last.time
      if (dt > data.easeAbortAfterMs) {
        lanes = frames = time = 0
        return killLoop(data, ease)
      }

      frames += sample.frame - last.frame
      lanes += sample.lane - last.lane
      time += dt
      last = sample
    }
    samples.length = 0
    if (!time) {
      return
    }

    ease.ms = data.easeUpdateTime

    ease.lane = data.lane
    ease.lanes = 0
    ease.laneStep = lanes / time * ease.ms

    ease.frame = data.frame
    ease.frames = 0
    ease.frameStep = frames / time * ease.ms

    loop(data, ease)
  }

  function sampleInput(data, ease) {
    // add a new sample
    ease.samples.push({
      time: new Date().getTime(),
      frame: data.dragFrame,
      lane: data.dragLane
    })
    // drop old samples
    while (ease.samples.length > data.easeSamples) {
      ease.samples.shift()
    }
  }

  function killLoop(data, ease) {
    if (ease.timeout != null) {
      window.clearTimeout(ease.timeout)
      ease.timeout = null
    }
  }

  function loop(data, ease) {
    ease.timeout = window.setTimeout(() => {
      tick(data, ease)
    }, ease.ms)
  }

  function tick(data, ease) {
    ease.lanes += ease.laneStep
    ease.frames += ease.frameStep
    ease.laneStep *= data.easeDamping
    ease.frameStep *= data.easeDamping
    const frame = Math.floor(ease.frame + ease.frames)
    const lane = Math.floor(ease.lane + ease.lanes)

    SpriteSpin.updateFrame(data, frame, lane)
    if (data.dragging) {
      killLoop(data, ease)
    } else if (Math.abs(ease.frameStep) > 0.005 || Math.abs(ease.laneStep) > 0.005) {
      loop(data, ease)
    } else {
      killLoop(data, ease)
    }
  }

  SpriteSpin.registerPlugin(NAME, {
    name: NAME,

    onLoad: init,

    mousemove: update,
    mouseup: end,
    mouseleave: end,

    touchmove: update,
    touchend: end,
    touchcancel: end
  })

})(SpriteSpin)
