((SpriteSpin) => {

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
    canvas: any
    context: CanvasRenderingContext2D
    steps: BlurStep[]
    fadeTime: number
    frameTime: number
    trackTime: number
    cssBlur: boolean

    timeout: number
  }

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME) as BlurState
  }
  function getOption(data, name, fallback) {
    return data[name] || fallback
  }

  function init(e, data: SpriteSpin.Instance) {
    const state = getState(data)

    state.canvas = state.canvas || SpriteSpin.$("<canvas class='blur-layer'></canvas>")
    state.context = state.context || state.canvas[0].getContext('2d')
    state.steps = state.steps || []
    state.fadeTime = Math.max(getOption(data, 'blurFadeTime', 200), 1)
    state.frameTime = Math.max(getOption(data, 'blurFrameTime', data.frameTime), 16)
    state.trackTime = null
    state.cssBlur = !!getOption(data, 'blurCss', data.frameTime)

    const inner = SpriteSpin.Utils.getInnerSize(data)
    const outer = data.responsive ? SpriteSpin.Utils.getComputedSize(data) : SpriteSpin.Utils.getOuterSize(data)
    const css = SpriteSpin.Utils.getInnerLayout(data.sizeMode, inner, outer)

    state.canvas[0].width = data.width * data.canvasRatio
    state.canvas[0].height = data.height * data.canvasRatio
    state.canvas.css(css).show()
    state.context.scale(data.canvasRatio, data.canvasRatio)
    data.target.append(state.canvas)
  }

  function onFrame(e, data) {
    const state = getState(data)
    trackFrame(data)
    if (state.timeout == null) {
      loop(data)
    }
  }

  function trackFrame(data: SpriteSpin.Instance) {
    const state = getState(data)
    const ani = SpriteSpin.getAnimationState(data)

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

  const toRemove = []
  function removeOldFrames(frames) {
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

  function loop(data: SpriteSpin.Instance) {
    const state = getState(data)
    state.timeout = window.setTimeout(() => { tick(data) }, state.frameTime)
  }

  function killLoop(data: SpriteSpin.Instance) {
    const state = getState(data)
    window.clearTimeout(state.timeout)
    state.timeout = null
  }

  function applyCssBlur(canvas, d) {
    const amount = Math.min(Math.max((d / 2) - 4, 0), 1.5)
    const blur = `blur(${amount}px)`
    canvas.css({
      '-webkit-filter': blur,
      filter: blur
    })
  }

  function drawFrame(data: SpriteSpin.Instance, state: BlurState, step: BlurStep) {
    if (step.alpha <= 0) { return }

    const specs = SpriteSpin.Utils.findSpecs(data.metrics, data.frames, data.frame, data.lane)
    const sheet = specs.sheet
    const sprite = specs.sprite
    if (!sheet || !sprite) { return }

    const src = data.source[sheet.id]
    const image = data.images[sheet.id]
    if (image.complete === false) { return }

    state.canvas.show()
    const w = state.canvas[0].width / data.canvasRatio
    const h = state.canvas[0].height / data.canvasRatio
    state.context.clearRect(0, 0, w, h)
    state.context.drawImage(image, sprite.sampledX, sprite.sampledY, sprite.sampledWidth, sprite.sampledHeight, 0, 0, w, h)
  }

  function tick(data: SpriteSpin.Instance) {
    const state = getState(data)
    killLoop(data)
    if (!state.context) {
      return
    }

    let d = 0
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

})(SpriteSpin)
