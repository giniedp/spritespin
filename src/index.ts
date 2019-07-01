export * from './core'
export { sourceArray } from './utils'

import {
  $,
  bind,
  clamp,
  detectSubsampling,
  error,
  findSpecs,
  getComputedSize,
  getCursorPosition,
  getInnerLayout,
  getInnerSize,
  getOuterSize,
  isFunction,
  Layout,
  Layoutable,
  log,
  measure,
  MeasureSheetOptions,
  naturalSize,
  noop,
  pixelRatio,
  preload,
  PreloadOptions,
  PreloadProgress,
  prevent,
  SheetSpec,
  SizeWithAspect,
  sourceArray,
  SourceArrayOptions,
  SpriteSpec,
  toArray,
  unbind,
  warn,
  wrap
} from './utils'

export const Utils = {
  $,
  bind,
  clamp,
  detectSubsampling,
  error,
  findSpecs,
  getComputedSize,
  getCursorPosition,
  getInnerLayout,
  getInnerSize,
  getOuterSize,
  isFunction,
  log,
  measure,
  naturalSize,
  noop,
  pixelRatio,
  preload,
  prevent,
  sourceArray,
  toArray,
  unbind,
  warn,
  wrap
}

export {
  Layout,
  Layoutable,
  MeasureSheetOptions,
  PreloadOptions,
  PreloadProgress,
  SheetSpec,
  SizeWithAspect,
  SourceArrayOptions,
  SpriteSpec
}

import './api'
import './plugins'
