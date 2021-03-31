import { InstanceState } from './models'
import { css } from './utils'

function solveContain(width: number, height: number, maxWidth: number, maxHeight: number) {
  const aspect = (width / height) || 1
  const aspect2 = (maxWidth / maxHeight) || 1
  if (aspect > aspect2) {
    width = maxWidth
    height = maxWidth / aspect
  } else {
    height = maxHeight
    width = height * aspect
  }
  return [width, height]
}

function solveCover(width: number, height: number, maxWidth: number, maxHeight: number) {
  const aspect = (width / height) || 1
  const aspect2 = (maxWidth / maxHeight) || 1
  if (aspect < aspect2) {
    width = maxWidth
    height = maxWidth / aspect
  } else {
    height = maxHeight
    width = height * aspect
  }
  return [width, height]
}

function solveFill(width: number, height: number, maxWidth: number, maxHeight: number) {
  return [maxWidth, maxHeight]
}

function solveScaleDown(width: number, height: number, maxWidth: number, maxHeight: number) {
  const [w, h] = solveContain(width, height, maxWidth, maxHeight)
  if (w * h < width * height) {
    return [w, h]
  }
  return [width, height]
}

/**
 * Applies css attributes to layout the SpriteSpin containers.
 *
 * @internal
 */
export function applyLayout(state: InstanceState) {
  state.target.setAttribute('unselectable', 'on')
  css(state.target, {
    '-ms-user-select': 'none',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    'user-select': 'none',
    overflow : 'hidden',
    position: 'relative'
  })

  css(state.stage, {
    width: state.width || state.frameWidth,
    height: state.height || state.frameHeight,
  })

  let width = state.frameWidth || state.width
  let height = state.frameHeight || state.height
  let targetWidth = state.target.offsetWidth || width
  let targetHeight = state.target.offsetHeight || height
  switch (state.fillMode) {
    case 'contain':
      [width, height] = solveContain(width, height, targetWidth, targetHeight)
      break
    case 'cover':
      [width, height] = solveCover(width, height, targetWidth, targetHeight)
      break
    case 'fill':
      [width, height] = solveFill(width, height, targetWidth, targetHeight)
      break
    case 'scale-down':
      [width, height] = solveScaleDown(width, height, targetWidth, targetHeight)
      break
    default:
      // none
      break
  }
  css(state.stage, {
    width: width,
    height: height,
    position: 'relative'
  })
  targetWidth = state.target.offsetWidth || width
  targetHeight = state.target.offsetHeight || height
  css(state.stage, {
    left: (targetWidth - width) / 2,
    top: (targetHeight - height) / 2
  })

  if (!state.canvas || !state.canvasContext) { return }
  css(state.canvas, {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  })
  state.canvas.width = (width * state.canvasRatio)
  state.canvas.height = (height * state.canvasRatio)
  state.canvasContext.scale(state.canvasRatio, state.canvasRatio)
}
