import {
  extend,
  InstanceState,
  getPluginState,
  updateFrame,
  registerPlugin,
  getPluginOptions,
} from '../core'
import {
  css,
  hide,
  getOption,
  getCursorPosition,
  clamp,
  findSpecs,
  fadeOut,
  fadeIn,
  innerWidth,
  innerHeight,
  Destructor,
  destructor
} from '../utils'

const NAME = 'zoom'
interface ZoomOptions {
  source: string[]
  wheel: boolean | number
  click: boolean
  clickTime: number
  pinFrame: boolean
}

interface ZoomState {
  active: boolean
  source: string[]
  stage: HTMLElement

  oldX: number
  oldY: number
  currentX: number
  currentY: number

  clickTime: number
  doubleClickTime: number
  useWheel: boolean | number
  useClick: boolean
  pinFrame: boolean
  destructor: Destructor
}

function getState(data: InstanceState) {
  return getPluginState(data, NAME) as ZoomState
}

function onInit(e: Event, data: InstanceState) {
  const state = getState(data)
  const options = (getPluginOptions(data, NAME) || {}) as ZoomOptions
  state.source = getOption(options, 'source', data.source)
  state.useWheel = getOption(options, 'wheel', false)
  state.useClick = getOption(options, 'click', true)
  state.pinFrame = getOption(options, 'pinFrame', true)
  state.doubleClickTime = getOption(options, 'clickTime', 500)
  state.stage = state.stage || document.createElement('div')
  state.stage.classList.add('zoom-stage')
  state.destructor = state.destructor || destructor()
  css(state.stage, {
    width    : '100%',
    height   : '100%',
    top      : 0,
    left     : 0,
    bottom   : 0,
    right    : 0,
    position : 'absolute'
  })
  data.target.appendChild(state.stage)
  if (!state.active) {
    hide(state.stage)
  }
}

function onDestroy(e: Event, state: InstanceState) {
  const zoom = getState(state)
  if (zoom.active) {
    hideZoom(state)
  }
  if (zoom.stage) {
    zoom.stage.remove()
    delete zoom.stage
  }
}

function updateInput(e: MouseEvent, data: InstanceState) {
  const zoom = getState(data)
  if (!zoom.active) {
    return
  }

  const w = innerWidth(zoom.stage)
  const h = innerHeight(zoom.stage)
  if (!w || !h) {
    return
  }

  e.preventDefault()

  // grab touch/cursor position
  const cursor = getCursorPosition(e)
  // normalize cursor position into [0:1] range
  const x = cursor.x / w
  const y = cursor.y / h

  if (zoom.oldX == null) {
    zoom.oldX = x
    zoom.oldY = y
  }
  if (zoom.currentX == null) {
    zoom.currentX = x
    zoom.currentY = y
  }

  // calculate move delta since last frame and remember current position
  let dx = x - zoom.oldX
  let dy = y - zoom.oldY
  zoom.oldX = x
  zoom.oldY = y

  // invert drag direction for touch events to enable 'natural' scrolling
  if (e.type.match(/touch/)) {
    dx = -dx
    dy = -dy
  }

  // accumulate display coordinates
  zoom.currentX = clamp(zoom.currentX + dx, 0, 1)
  zoom.currentY = clamp(zoom.currentY + dy, 0, 1)

  updateFrame(data, data.frame, data.lane)
}

function onClick(e: MouseEvent, data: InstanceState) {
  const zoom = getState(data)
  if (!zoom.useClick) {
    return
  }

  e.preventDefault()
  // simulate double click

  const clickTime = new Date().getTime()
  if (!zoom.clickTime) {
    // on first click
    zoom.clickTime = clickTime
    return
  }

  // on second click
  const timeDelta = clickTime - zoom.clickTime
  if (timeDelta > zoom.doubleClickTime) {
    // took too long, back to first click
    zoom.clickTime = clickTime
    return
  }

  // on valid double click
  zoom.clickTime = undefined
  if (toggleZoom(data)) {
    updateInput(e, data)
  }
}

function onMove(e: MouseEvent, data: InstanceState) {
  const zoom = getState(data)
  if (zoom.active) {
    updateInput(e, data)
  }
}

function onDraw(e: Event, data: InstanceState) {
  const zoom = getState(data)

  // calculate the frame index
  const index = data.lane * data.frames + data.frame
  // get the zoom image. Use original frames as fallback. This won't work for sprite sheets
  const source = zoom.source[index]
  const spec = findSpecs(data.metrics, data.frames, data.frame, data.lane)

  // get display position
  let x = zoom.currentX
  let y = zoom.currentY
  // fallback to centered position
  if (x == null) {
    x = zoom.currentX = 0.5
    y = zoom.currentY = 0.5
  }

  if (source) {
    // scale up from [0:1] to [0:100] range
    x = Math.floor(x * 100)
    y = Math.floor(y * 100)

    // update background image and position
    css(zoom.stage, {
      'background-repeat'   : 'no-repeat',
      'background-image'    : `url('${source}')`,
      'background-position' : `${x}% ${y}%`
    })
  } else if (spec.sheet && spec.sprite) {
    const sprite = spec.sprite
    const sheet = spec.sheet
    const src = data.source[sheet.id]
    const left = -Math.floor(sprite.sampledX + x * (sprite.sampledWidth - data.width))
    const top = -Math.floor(sprite.sampledY + y * (sprite.sampledHeight - data.height))
    const width = sheet.sampledWidth
    const height = sheet.sampledHeight
    css(zoom.stage, {
      'background-image'    : `url('${src}')`,
      'background-position' : `${left}px ${top}px`,
      'background-repeat'   : 'no-repeat',
      '-webkit-background-size' : `${width}px ${height}px`,
      '-moz-background-size'    : `${width}px ${height}px`,
      '-o-background-size'      : `${width}px ${height}px`,
      'background-size'         : `${width}px ${height}px`
    })
  }
}

function toggleZoom(data: InstanceState) {
  const zoom = getState(data)
  if (!zoom.stage) {
    throw new Error('zoom module is not initialized or is not available.')
  }
  zoom.active = !zoom.active
  if (zoom.active) {
    showZoom(data)
  } else {
    hideZoom(data)
  }
  return zoom.active
}

function showZoom(state: InstanceState) {
  const zoom = getState(state)
  zoom.active = true
  fadeOut(zoom.stage)
  state.isHalted = !!zoom.pinFrame
  fadeIn(state.stage)
  zoom.destructor.addEventListener(document, 'mousemove', (e: MouseEvent) => onMove(e, state))
}

function hideZoom(state: InstanceState) {
  const zoom = getState(state)
  zoom.active = false
  fadeIn(zoom.stage)
  state.isHalted = false
  fadeOut(state.stage)
  zoom.destructor()
}

function wheel(e: WheelEvent, state: InstanceState) {
  const zoom = getState(state)
  if (state.isLoading || !zoom.useWheel) {
    return
  }
  let signY = e.deltaY === 0 ? 0 : e.deltaY > 0 ? 1 : -1
  if (typeof zoom.useWheel === 'number') {
    signY *= zoom.useWheel
  }

  if (!zoom.active && signY > 0) {
    // e.preventDefault()
    showZoom(state)
  }
  if (zoom.active && signY < 0) {
    // e.preventDefault()
    hideZoom(state)
  }
}

registerPlugin(NAME, () => {
  return {
    name: NAME,
    mousedown: onClick,
    touchstart: onClick,
    mousemove: onMove,
    touchmove: onMove,
    wheel: wheel,

    onInit: onInit,
    onDestroy: onDestroy,
    onDraw: onDraw
  }
})

extend({
  toggleZoom: function(this) { toggleZoom(this.state) }
})
