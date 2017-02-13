((SpriteSpin) => {

  const NAME = 'blur'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function init(e, data) {
    const scope = scopeFrom(data)
    const css = SpriteSpin.Utils.getInnerLayout(data)
    scope.canvas[0].width = data.width * data.canvasRatio
    scope.canvas[0].height = data.height * data.canvasRatio
    scope.canvas.css(css).show()
    scope.context.scale(data.canvasRatio, data.canvasRatio)
    data.target.append(scope.canvas)
  }

  function destroy(e, data) {
    const scope = scopeFrom(data)
    data.target.remove(data)
    delete data.blurScope
  }

  function onFrame(e, data) {
    const scope = scopeFrom(data)
    trackFrame(data, scope)
    if (scope.timeout == null) {
      loop(data, scope)
    }
  }

  function scopeFrom(data) {
    data.blurScope = data.blurScope || {}
    const scope = data.blurScope
    scope.canvas = scope.canvas || SpriteSpin.$("<canvas class='blur-layer'></canvas>")
    scope.context = scope.context || scope.canvas[0].getContext('2d')
    scope.steps = scope.steps || []
    scope.fadeTime = Math.max(data.blurFadeTime || 200, 1)
    scope.frameTime = Math.max(data.blurFrameTime || data.frameTime, 16)
    scope.trackTime = null
    scope.cssBlur = !!data.blurCss
    return scope
  }

  function trackFrame(data, scope) {
    let d = Math.abs(data.frame - data.lastFrame) // distance between frames
    if (d >= data.frames / 2) {
      // get shortest distance
      d = data.frames - d
    }
    scope.steps.unshift({
      index: data.lane * data.frames + data.frame,
      live: 1,
      step: scope.frameTime / scope.fadeTime,
      d: d
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

  function loop(data, scope) {
    scope.timeout = window.setTimeout(() => {
      tick(data, scope)
    }, scope.frameTime)
  }

  function killLoop(data, scope) {
    window.clearTimeout(scope.timeout)
    scope.timeout = null
  }

  function applyCssBlur(canvas, d) {
    const amount = Math.min(Math.max((d / 2) - 4, 0), 1.5)
    const blur = `blur(${amount}px)`
    canvas.css({
      '-webkit-filter': blur,
      filter: blur
    })
  }

  function drawFrame(data, scope, step) {
    const context = scope.context
    const index = step.index
    const img = (data.sourceIsSprite ? data.images[0] : data.images[index])

    if (step.alpha <= 0) {
      return
    }
    if (!img || img.complete === false) {
      return
    }

    context.globalAlpha = step.alpha
    if (data.sourceIsSprite) {
      const x = data.frameWidth * (index % data.framesX)
      const y = data.frameHeight * Math.floor(index / data.framesX)
      context.drawImage(img, x, y, data.frameWidth, data.frameHeight, 0, 0, data.width, data.height)
    } else {
      context.drawImage(img, 0, 0, data.width, data.height)
    }
  }

  function tick(data, scope) {
    killLoop(data, scope)
    if (!scope.context) {
      return
    }

    let d = 0
    scope.context.clearRect(0, 0, data.width, data.height)
    for (const step of scope.steps) {
      step.live = Math.max(step.live - step.step, 0)
      step.alpha = Math.max(step.live - 0.25, 0)
      drawFrame(data, scope, step)
      d += step.alpha + step.d
    }
    if (scope.cssBlur) {
      applyCssBlur(scope.canvas, d)
    }
    removeOldFrames(scope.steps)
    if (scope.steps.length) {
      loop(data, scope)
    }
  }

  SpriteSpin.registerPlugin(NAME, {
    name: NAME,

    onLoad: init,
    onFrameChanged: onFrame
  })

})(SpriteSpin)
