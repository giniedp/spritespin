import 'tslib'
export * from './core'
export { sourceArray } from './utils'

import {
  clamp,
  detectSubsampling,
  error,
  findSpecs,
  getComputedSize,
  getCursorPosition,
  getInnerLayout,
  getInnerSize,
  getOuterSize,
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
  SheetSpec,
  SizeWithAspect,
  sourceArray,
  SourceArrayOptions,
  SpriteSpec,
  toArray,
  warn,
  wrap
} from './utils'

export const Utils = {
  clamp,
  detectSubsampling,
  error,
  findSpecs,
  getComputedSize,
  getCursorPosition,
  getInnerLayout,
  getInnerSize,
  getOuterSize,
  log,
  measure,
  naturalSize,
  noop,
  pixelRatio,
  preload,
  sourceArray,
  toArray,
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
