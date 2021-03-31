import { pixelRatio } from 'core/utils'
import { Utils, InstanceState, getPluginState, getPlaybackState, registerPlugin } from '../core'
const { show, css, getOption, findSpecs } = Utils

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

function getState(data: InstanceState) {
  return getPluginState<BlurState>(data, NAME)
}

function init(e: Event, data: InstanceState) {
  const state = getState(data)

  state.steps = state.steps || []
  state.fadeTime = Math.max(getOption(data as any, 'blurFadeTime', 200), 1)
  state.frameTime = Math.max(getOption(data as any, 'blurFrameTime', data.frameTime), 16)
  state.trackTime = null
  state.cssBlur = !!getOption(data as any, 'blurCss', false)

  if (!state.canvas || !state.canvas.parentElement) {
    state.canvas = state.canvas || document.createElement('canvas')
    state.canvas.classList.add('blur-layer')
    state.context = state.context || state.canvas.getContext('2d')
    css(state.canvas, {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    })
    data.stage.appendChild(state.canvas)
  }

  const canvasRatio = pixelRatio(state.context)
  state.canvas.width = data.width * canvasRatio
  state.canvas.height = data.height * canvasRatio
  show(state.canvas)
  state.context.scale(canvasRatio, canvasRatio)

}

function onFrame(e: Event, data: InstanceState) {
  const state = getState(data)
  trackFrame(data)
  if (state.timeout == null) {
    loop(data)
  }
}

function trackFrame(data: InstanceState) {
  const state = getState(data)
  const ani = getPlaybackState(data)

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

function loop(data: InstanceState) {
  const state = getState(data)
  state.timeout = window.setTimeout(() => { tick(data) }, state.frameTime)
}

function killLoop(data: InstanceState) {
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

function clearFrame(data: InstanceState, state: BlurState) {
  show(state.canvas)
  const w = state.canvas.width / data.canvasRatio
  const h = state.canvas.height / data.canvasRatio
  // state.context.clearRect(0, 0, w, h)
}

function drawFrame(data: InstanceState, state: BlurState, step: BlurStep) {
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

function tick(data: InstanceState) {
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

registerPlugin(NAME, {
  name: NAME,

  onLoad: init,
  onFrameChanged: onFrame
})
