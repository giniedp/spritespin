import type { InstanceState } from "./models"
import { pixelRatio } from "./utils"

/**
 * Prepares the render stage and canvas
 *
 * @public
 * @param state - The SpriteSpin instance state
 */
export function applyStage(state: InstanceState) {
  if (!state.stage) {
    state.stage = grabStage(state.target)
    state.images = grabImages(state.stage)
  }
  if (!state.canvas && state.renderMode === 'canvas') {
    state.canvas = grabCanvas(state.target, state.stage)
    state.canvasContext = grabContext(state.canvas)
    if (!state.canvasContext) {
      state.renderMode = 'image' // fallback to image rendering mode
    } else {
      state.canvasRatio = state.canvasRatio || pixelRatio(state.canvasContext)
    }
  }
}

function grabStage(root: HTMLElement) {
  let stage = root.querySelector<HTMLElement>('.spritespin-stage')
  if (!stage) {
    stage = document.createElement('div')
    root.appendChild(stage)
  }
  stage.classList.add('spritespin-stage')
  return stage
}

function grabCanvas(root: HTMLElement, parent: HTMLElement) {
  let canvas = root.querySelector<HTMLCanvasElement>('canvas.spritespin-stage,canvas')
  if (!canvas) {
    canvas = document.createElement('canvas')
    parent.appendChild(canvas)
  }
  canvas.classList.add('spritespin-canvas')
  return canvas
}

function grabContext(canvas: HTMLCanvasElement) {
  return canvas.getContext?.('2d')
}

function grabImages(parent: HTMLElement) {
  const images: HTMLImageElement[] = []
  const children = parent.children
  for (let i = 0; i < children.length; i++) {
    const child = children.item(i)
    if (child instanceof HTMLImageElement) {
      images.push(child)
      child.remove()
    }
  }
  return images
}
