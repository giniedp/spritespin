import * as SpriteSpin from '../core'
import { css, getOption, naturalSize, getInnerSize, getComputedSize, getOuterSize, getInnerLayout, fadeTo } from '../utils'

const NAME = 'gallery'

interface GalleryState {
  images: HTMLImageElement[]
  offsets: number[]
  speed: number
  opacity: number
  frame: number
  stage: HTMLElement
  dX: number
  ddX: number
}

function getState(data: SpriteSpin.Data) {
  return SpriteSpin.getPluginState(data, NAME) as GalleryState
}

function load(e: Event, data: SpriteSpin.Data) {
  const state = getState(data)

  state.images = []
  state.offsets = []
  state.frame = data.frame
  state.speed = getOption(data as any, 'gallerySpeed', 500)
  state.opacity = getOption(data as any, 'galleryOpacity', 0.25)
  state.stage = getOption(data as any, 'galleryStage', document.createElement('div'))

  state.stage.innerHTML = ''
  state.stage.classList.add('gallery-stage')
  data.stage.prepend(state.stage)

  let size = 0
  for (const image of data.images) {
    const scale = data.height / naturalSize(image).height

    state.stage.append(image)
    state.images.push(image)
    state.offsets.push(-size + (data.width - image.width * scale) / 2)
    size += data.width
    css(image, {
      'max-width' : 'initial',
      opacity : `${state.opacity}`,
      width: `${data.width}px`,
      height: `${data.height}px`
    })
  }
  const innerSize = getInnerSize(data)
  const outerSize = data.responsive ? getComputedSize(data) : getOuterSize(data)
  const layout = getInnerLayout(data.sizeMode, innerSize, outerSize)
  css(state.stage, layout)
  css(state.stage, { width: size, left: state.offsets[state.frame] })
  fadeTo(state.images[state.frame], 1, { duration: state.speed })
}

function draw(e: Event, data: SpriteSpin.Data) {
  const state = getState(data)
  const input = SpriteSpin.getInputState(data)
  const isDragging = SpriteSpin.is(data, 'dragging')
  if (state.frame !== data.frame && !isDragging) {
    css(state.stage, { left : state.offsets[data.frame] })

    css(state.images[state.frame], { opacity: String(state.opacity) })
    state.frame = data.frame
    css(state.images[state.frame], { opacity: String(1) })
    css(state.stage, { left: state.offsets[state.frame] })
  } else if (isDragging || state.dX !== input.dX) {
    state.dX = input.dX
    state.ddX = input.ddX
    css(state.stage, { left : state.offsets[state.frame] + state.dX })
  }
}

SpriteSpin.registerPlugin(NAME, {
  name: NAME,
  onLoad: load,
  onDraw: draw
})
