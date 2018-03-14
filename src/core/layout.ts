import * as Utils from '../utils'
import { Data } from './models'

/**
 * Applies css attributes to layout the SpriteSpin containers.
 */
export function applyLayout(data: Data) {
  // disable selection
  data.target
    .attr('unselectable', 'on')
    .css({
      width: '',
      height: '',
      '-ms-user-select': 'none',
      '-moz-user-select': 'none',
      '-khtml-user-select': 'none',
      '-webkit-user-select': 'none',
      'user-select': 'none'
    })

  const size = data.responsive ? Utils.getComputedSize(data) : Utils.getOuterSize(data)
  const layout = Utils.getInnerLayout(data.sizeMode, Utils.getInnerSize(data), size)

  // apply layout on target
  data.target.css({
    width    : size.width,
    height   : size.height,
    position : 'relative',
    overflow : 'hidden'
  })

  // apply layout on stage
  data.stage.css(layout).hide()

  if (!data.canvas) { return }
  // apply layout on canvas
  data.canvas.css(layout).hide()
  // apply pixel ratio on canvas
  data.canvasRatio = data.canvasRatio || Utils.pixelRatio(data.context)
  if (typeof layout.width === 'number' && typeof layout.height === 'number') {
    data.canvas[0].width = ((layout.width as number) * data.canvasRatio) || size.width
    data.canvas[0].height = ((layout.height as number) * data.canvasRatio) || size.height
  } else {
    data.canvas[0].width = (size.width * data.canvasRatio)
    data.canvas[0].height = (size.height * data.canvasRatio)
  }
  // width and height must be set before calling scale
  data.context.scale(data.canvasRatio, data.canvasRatio)
}
