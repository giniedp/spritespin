import * as SpriteSpin from '../core'
import { show, css, getOption, getInnerSize, getComputedSize, getOuterSize, getInnerLayout, findSpecs } from '../utils'

const NAME = 'blur'

interface BlurStep {
  frame: number
  lane: number
  live: number
  step: number
  d: number
  alpha: number
}
interface BlurState {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  steps: BlurStep[]
  fadeTime: number
  frameTime: number
  trackTime: number
  cssBlur: boolean

  timeout: number
}

function getState(data: SpriteSpin.Data) {
  return SpriteSpin.getPluginState(data, NAME) as BlurState
}

function init(e: Event, data: SpriteSpin.Data) {
  const state = getState(data)

  state.canvas = state.canvas || document.createElement('canvas')
  state.canvas.classList.add('blur-layer')
  state.context = state.context || state.canvas.getContext('2d')
  state.steps = state.steps || []
  state.fadeTime = Math.max(getOption(data as any, 'blurFadeTime', 200), 1)
  state.frameTime = Math.max(getOption(data as any, 'blurFrameTime', data.frameTime), 16)
  state.trackTime = null
  state.cssBlur = !!getOption(data as any, 'blurCss', false)

  const inner = getInnerSize(data)
  const outer = data.responsive ? getComputedSize(data) : getOuterSize(data)
  const layout = getInnerLayout(data.sizeMode, inner, outer)

  state.canvas.width = data.width * data.canvasRatio
  state.canvas.height = data.height * data.canvasRatio
  css(state.canvas, layout)
  show(state.canvas)
  state.context.scale(data.canvasRatio, data.canvasRatio)
  data.target.appendChild(state.canvas)
}

function onFrame(e: Event, data: SpriteSpin.Data) {
  const state = getState(data)
  trackFrame(data)
  if (state.timeout == null) {
    loop(data)
  }
}

function trackFrame(data: SpriteSpin.Data) {
  const state = getState(data)
  const ani = SpriteSpin.getPlaybackState(data)

  // distance between frames
  let d = Math.abs(data.frame - ani.lastFrame)
  // shortest distance
  d = d >= data.frames / 2 ? data.frames - d : d

  state.steps.unshift({
    frame: data.frame,
    lane: data.lane,
    live: 1,
    step: state.frameTime / state.fadeTime,
    d: d,
    alpha: 0
  })
}

const toRemove: number[] = []
function removeOldFrames(frames: BlurStep[]) {
  toRemove.length = 0
  for (let i = 0; i < frames.length; i += 1) {
    if (frames[i].alpha <= 0) {
      toRemove.push(i)
    }
  }
  for (const item of toRemove) {
    frames.splice(item, 1)
  }
}

function loop(data: SpriteSpin.Data) {
  const state = getState(data)
  state.timeout = window.setTimeout(() => { tick(data) }, state.frameTime)
}

function killLoop(data: SpriteSpin.Data) {
  const state = getState(data)
  window.clearTimeout(state.timeout)
  state.timeout = null
}

function applyCssBlur(canvas: HTMLElement, d: number) {
  const amount = Math.min(Math.max((d / 2) - 4, 0), 2.5)
  const blur = `blur(${amount}px)`
  css(canvas, {
    '-webkit-filter': blur,
    filter: blur
  })
}

function clearFrame(data: SpriteSpin.Data, state: BlurState) {
  show(state.canvas)
  const w = state.canvas.width / data.canvasRatio
  const h = state.canvas.height / data.canvasRatio
  // state.context.clearRect(0, 0, w, h)
}

function drawFrame(data: SpriteSpin.Data, state: BlurState, step: BlurStep) {
  if (step.alpha <= 0) { return }

  const specs = findSpecs(data.metrics, data.frames, step.frame, step.lane)
  const sheet = specs.sheet
  const sprite = specs.sprite
  if (!sheet || !sprite) { return }

  const src = data.source[sheet.id]
  const image = data.images[sheet.id]
  if (image.complete === false) { return }

  show(state.canvas)
  const w = state.canvas.width / data.canvasRatio
  const h = state.canvas.height / data.canvasRatio
  state.context.globalAlpha = step.alpha
  state.context.drawImage(image, sprite.sampledX, sprite.sampledY, sprite.sampledWidth, sprite.sampledHeight, 0, 0, w, h)
}

function tick(data: SpriteSpin.Data) {
  const state = getState(data)
  killLoop(data)
  if (!state.context) {
    return
  }

  let d = 0
  clearFrame(data, state)
  state.context.clearRect(0, 0, data.width, data.height)
  for (const step of state.steps) {
    step.live = Math.max(step.live - step.step, 0)
    step.alpha = Math.max(step.live - 0.25, 0)
    drawFrame(data, state, step)
    d += step.alpha + step.d
  }
  if (state.cssBlur) {
    applyCssBlur(state.canvas, d)
  }
  removeOldFrames(state.steps)
  if (state.steps.length) {
    loop(data)
  }
}

SpriteSpin.registerPlugin(NAME, {
  name: NAME,

  onLoad: init,
  onFrameChanged: onFrame
})
