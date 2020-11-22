import { SizeMode } from '../models'
import { innerHeight, innerWidth } from './utils'

export interface Layoutable {
  width?: number
  height?: number
  frameWidth?: number
  frameHeight?: number
  target: HTMLElement
  sizeMode?: SizeMode
}

export interface Layout {
  [key: string]: any
  width: string | number
  height: string | number
  top: number
  left: number
  bottom: number
  right: number
  position: 'absolute'
  overflow: 'hidden'
}

export interface SizeWithAspect {
  width: number
  height: number
  aspect: number
}

/**
 *
 */
export function getOuterSize(data: Layoutable): SizeWithAspect {
  const width = Math.floor(data.width || data.frameWidth || innerWidth(data.target))
  const height = Math.floor(data.height || data.frameHeight || innerHeight(data.target))
  return {
    aspect: width / height,
    height,
    width
  }
}

export function getComputedSize(data: Layoutable): SizeWithAspect {
  const size = getOuterSize(data)
  if (typeof window.getComputedStyle !== 'function') { return size }

  const style = window.getComputedStyle(data.target)
  if (!style.width) { return size }

  size.width = Math.floor(Number(style.width.replace('px', '')))
  size.height = Math.floor(size.width / size.aspect)
  return size
}

/**
 *
 */
export function getInnerSize(data: Layoutable): SizeWithAspect {
  const width = Math.floor(data.frameWidth || data.width || innerWidth(data.target))
  const height = Math.floor(data.frameHeight || data.height || innerHeight(data.target))
  return {
    aspect: width / height,
    height,
    width
  }
}

/**
 *
 */
export function getInnerLayout(mode: SizeMode, inner: SizeWithAspect, outer: SizeWithAspect): Layout {

  // get mode
  const isFit = mode === 'fit'
  const isFill = mode === 'fill'
  const isMatch = mode === 'stretch'

  // resulting layout
  const layout: Layout = {
    width    : '100%',
    height   : '100%',
    top      : 0,
    left     : 0,
    bottom   : 0,
    right    : 0,
    position : 'absolute',
    overflow : 'hidden'
  }

  // no calculation here
  if (!mode || isMatch) {
    return layout
  }

  // get size and aspect
  const aspectIsGreater = inner.aspect >= outer.aspect

  // mode == original
  let width = inner.width
  let height = inner.height

  // keep aspect ratio but fit/fill into container
  if (isFit && aspectIsGreater || isFill && !aspectIsGreater) {
    width = outer.width
    height = outer.width / inner.aspect
  }
  if (isFill && aspectIsGreater || isFit && !aspectIsGreater) {
    height = outer.height
    width = outer.height * inner.aspect
  }

  // floor the numbers
  width = Math.floor(width)
  height = Math.floor(height)

  // position in center
  layout.width = width
  layout.height = height
  layout.top = Math.floor((outer.height - height) / 2)
  layout.left = Math.floor((outer.width - width) / 2)
  layout.right = layout.left
  layout.bottom = layout.top

  return layout
}
