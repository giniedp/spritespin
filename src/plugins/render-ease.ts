import * as SpriteSpin from '../core'
import * as Utils from '../utils'

(() => {

const max = Math.max
const min = Math.min

const NAME = 'ease'

interface EaseSample {
  time: number
  frame: number
  lane: number
}

interface EaseState {
  damping: number
  maxSamples: number
  updateTime: number
  abortTime: number
  samples: EaseSample[]
  steps: number[]
  handler: number

  lane: number
  lanes: number
  laneStep: number

  frame: number
  frames: number
  frameStep: number
}

function getState(data) {
  return SpriteSpin.getPluginState(data, NAME) as EaseState
}

function getOption(data, name, fallback) {
  return data[name] || fallback
}

function init(e, data: SpriteSpin.Data) {
  const state = getState(data)
  state.maxSamples = max(getOption(data, 'easeMaxSamples', 5), 0)
  state.damping = max(min(getOption(data, 'easeDamping', 0.9), 0.999), 0)
  state.abortTime = max(getOption(data, 'easeAbortTime', 250), 16)
  state.updateTime = max(getOption(data, 'easeUpdateTime', data.frameTime), 16)
  state.samples = []
  state.steps = []
}

function update(e, data: SpriteSpin.Data) {
  if (SpriteSpin.is(data, 'dragging')) {
    killLoop(data)
    sampleInput(data)
  }
}

function end(e, data: SpriteSpin.Data) {
  const state = getState(data)
  const samples = state.samples

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
    if (dt > state.abortTime) {
      lanes = frames = time = 0
      return killLoop(data)
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

  state.lane = data.lane
  state.lanes = 0
  state.laneStep = lanes / time * state.updateTime

  state.frame = data.frame
  state.frames = 0
  state.frameStep = frames / time * state.updateTime

  loop(data)
}

function sampleInput(data: SpriteSpin.Data) {
  const state = getState(data)
  // add a new sample
  state.samples.push({
    time: new Date().getTime(),
    frame: data.frame,
    lane: data.lane
  })
  // drop old samples
  while (state.samples.length > state.maxSamples) {
    state.samples.shift()
  }
}

function killLoop(data: SpriteSpin.Data) {
  const state = getState(data)
  if (state.handler != null) {
    window.clearTimeout(state.handler)
    state.handler = null
  }
}

function loop(data: SpriteSpin.Data) {
  const state = getState(data)
  state.handler = window.setTimeout(() => { tick(data) }, state.updateTime)
}

function tick(data: SpriteSpin.Data) {
  const state = getState(data)
  state.lanes += state.laneStep
  state.frames += state.frameStep
  state.laneStep *= state.damping
  state.frameStep *= state.damping
  const frame = Math.floor(state.frame + state.frames)
  const lane = Math.floor(state.lane + state.lanes)

  SpriteSpin.updateFrame(data, frame, lane)

  if (SpriteSpin.is(data, 'dragging')) {
    killLoop(data)
  } else if (Math.abs(state.frameStep) > 0.005 || Math.abs(state.laneStep) > 0.005) {
    loop(data)
  } else {
    killLoop(data)
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

})()
