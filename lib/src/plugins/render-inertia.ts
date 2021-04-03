import { InstanceState, updateFrame, registerPlugin, getPluginOptions } from '../core'
import { getOption } from '../utils'

const max = Math.max
const min = Math.min

const NAME = 'inertia'

interface InertiaOptions {
  samples: number
  damping: number
  abortTime: number
  updateTime: number
}

interface InertiaSample {
  time: number
  frame: number
  lane: number
}

interface InertiaState {
  damping: number
  maxSamples: number
  updateTime: number
  abortTime: number
  samples: InertiaSample[]
  steps: number[]
  handler: number

  lane: number
  lanes: number
  laneStep: number

  frame: number
  frames: number
  frameStep: number
}

registerPlugin(NAME, (data: InstanceState) => {
  const state: InertiaState = {
    maxSamples: 5,
    damping: 0.9,
    abortTime: 250,
    updateTime: data.frameTime,
  } as InertiaState

  function init() {
    const options = getPluginOptions(data, NAME) as InertiaOptions
    if (options) {
      state.maxSamples = max(getOption(options, 'samples', 5), 0)
      state.damping = max(min(getOption(options, 'damping', 0.9), 0.999), 0)
      state.abortTime = max(getOption(options, 'abortTime', 250), 16)
      state.updateTime = max(getOption(options, 'updateTime', data.frameTime), 16)
    }
    state.samples = []
    state.steps = []
  }

  function clear() {
    state.samples.length = 0
    killLoop()
  }

  function update() {
    if (data.isDragging) {
      sampleInput()
    }
  }

  function end() {
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
        return killLoop()
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

    loop()
  }

  function sampleInput() {
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

  function killLoop() {
    if (state.handler != null) {
      window.clearTimeout(state.handler)
      state.handler = null
    }
  }

  function loop() {
    state.handler = window.setTimeout(() => { tick() }, state.updateTime)
  }

  function tick() {
    state.lanes += state.laneStep
    state.frames += state.frameStep
    state.laneStep *= state.damping
    state.frameStep *= state.damping
    const frame = Math.floor(state.frame + state.frames)
    const lane = Math.floor(state.lane + state.lanes)

    updateFrame(data, frame, lane)

    if (data.isDragging) {
      killLoop()
    } else if (Math.abs(state.frameStep) > 0.005 || Math.abs(state.laneStep) > 0.005) {
      loop()
    } else {
      killLoop()
    }
  }

  return {
    name: NAME,

    onLoad: init,

    mousedown: clear,
    mousemove: update,
    mouseup: end,
    mouseleave: end,

    touchstart: clear,
    touchmove: update,
    touchend: end,
    touchcancel: end
  }
})
