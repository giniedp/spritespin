import { Data } from './models'
import { css, hide, getComputedSize, getOuterSize, getInnerLayout, getInnerSize, pixelRatio } from '../utils'

/**
 * Applies css attributes to layout the SpriteSpin containers.
 *
 * @internal
 */
export function applyLayout(data: Data) {
  data.target.setAttribute('unselectable', 'on')
  css(data.target, {
    width: '',
    height: '',
    '-ms-user-select': 'none',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    'user-select': 'none'
  })

  const size = data.responsive ? getComputedSize(data) : getOuterSize(data)
  const layout = getInnerLayout(data.sizeMode, getInnerSize(data), size)

  // apply layout on target
  css(data.target, {
    width    : size.width,
    height   : size.height,
    position : 'relative',
    overflow : 'hidden'
  })

  // apply layout on stage
  css(data.stage, layout)
  hide(data.stage)

  if (!data.canvas) { return }
  css(data.canvas, layout)
  hide(data.canvas)
  // apply pixel ratio on canvas
  data.canvasRatio = data.canvasRatio || pixelRatio(data.context)
  if (typeof layout.width === 'number' && typeof layout.height === 'number') {
    data.canvas.width = ((layout.width as number) * data.canvasRatio) || size.width
    data.canvas.height = ((layout.height as number) * data.canvasRatio) || size.height
  } else {
    data.canvas.width = (size.width * data.canvasRatio)
    data.canvas.height = (size.height * data.canvasRatio)
  }
  // width and height must be set before calling scale
  data.context.scale(data.canvasRatio, data.canvasRatio)
}
