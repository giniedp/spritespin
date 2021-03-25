import {
  Data,
  getPluginState,
  flag,
  updateFrame,
  registerPlugin,
  extendApi,
  Api,
  Utils
} from '../core'

const {
  css,
  hide,
  getOption,
  isVisible,
  getCursorPosition,
  clamp,
  findSpecs,
  fadeOut,
  fadeIn
} = Utils

const NAME = 'zoom'

interface ZoomState {
  source: string[]
  stage: HTMLElement

  oldX: number
  oldY: number
  currentX: number
  currentY: number

  clickTime: number
  doubleClickTime: number
  useWheel: boolean | number
  useClick: number
  pinFrame: boolean
}

function getState(data: Data) {
  return getPluginState(data, NAME) as ZoomState
}

function onInit(e: Event, data: Data) {
  const state = getState(data)
  state.source = getOption(data as any, 'zoomSource', data.source)
  state.useWheel = getOption(data as any, 'zoomUseWheel', false)
  state.useClick = getOption(data as any, 'zoomUseClick', true)
  state.pinFrame = getOption(data as any, 'zoomPinFrame', true)
  state.doubleClickTime = getOption(data as any, 'zoomDoubleClickTime', 500)
  state.stage = state.stage || document.createElement('div')
  state.stage.classList.add('zoom-stage')
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
  hide(state.stage)
}

function onDestroy(e: Event, data: Data) {
  const state = getState(data)
  if (state.stage) {
    state.stage.remove()
    delete state.stage
  }
}

function updateInput(e: MouseEvent, data: Data) {
  const state = getState(data)
  if (!isVisible(state.stage)) {
    return
  }

  e.preventDefault()

  if (state.pinFrame) {
    // hack into drag/move module and disable dragging
    // prevents frame change during zoom mode
    flag(data, 'dragging', false)
  }

  // grab touch/cursor position
  const cursor = getCursorPosition(e)
  // normalize cursor position into [0:1] range
  const x = cursor.x / data.width
  const y = cursor.y / data.height

  if (state.oldX == null) {
    state.oldX = x
    state.oldY = y
  }
  if (state.currentX == null) {
    state.currentX = x
    state.currentY = y
  }

  // calculate move delta since last frame and remember current position
  let dx = x - state.oldX
  let dy = y - state.oldY
  state.oldX = x
  state.oldY = y

  // invert drag direction for touch events to enable 'natural' scrolling
  if (e.type.match(/touch/)) {
    dx = -dx
    dy = -dy
  }

  // accumulate display coordinates
  state.currentX = clamp(state.currentX + dx, 0, 1)
  state.currentY = clamp(state.currentY + dy, 0, 1)

  updateFrame(data, data.frame, data.lane)
}

function onClick(e: MouseEvent, data: Data) {
  const state = getState(data)
  if (!state.useClick) {
    return
  }

  e.preventDefault()
  // simulate double click

  const clickTime = new Date().getTime()
  if (!state.clickTime) {
    // on first click
    state.clickTime = clickTime
    return
  }

  // on second click
  const timeDelta = clickTime - state.clickTime
  if (timeDelta > state.doubleClickTime) {
    // took too long, back to first click
    state.clickTime = clickTime
    return
  }

  // on valid double click
  state.clickTime = undefined
  if (toggleZoom(data)) {
    updateInput(e, data)
  }
}

function onMove(e: MouseEvent, data: Data) {
  const state = getState(data)
  if (isVisible(state.stage)) {
    updateInput(e, data)
  }
}

function onDraw(e: Event, data: Data) {
  const state = getState(data)

  // calculate the frame index
  const index = data.lane * data.frames + data.frame
  // get the zoom image. Use original frames as fallback. This won't work for sprite sheets
  const source = state.source[index]
  const spec = findSpecs(data.metrics, data.frames, data.frame, data.lane)

  // get display position
  let x = state.currentX
  let y = state.currentY
  // fallback to centered position
  if (x == null) {
    x = state.currentX = 0.5
    y = state.currentY = 0.5
  }

  if (source) {
    // scale up from [0:1] to [0:100] range
    x = Math.floor(x * 100)
    y = Math.floor(y * 100)

    // update background image and position
    css(state.stage, {
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
    css(state.stage, {
      'background-image'    : `url('${src}')`,
      'background-position' : `${left}px ${top}px`,
      'background-repeat'   : 'no-repeat',
      // set custom background size to enable responsive rendering
      '-webkit-background-size' : `${width}px ${height}px`, /* Safari 3-4 Chrome 1-3 */
      '-moz-background-size'    : `${width}px ${height}px`, /* Firefox 3.6 */
      '-o-background-size'      : `${width}px ${height}px`, /* Opera 9.5 */
      'background-size'         : `${width}px ${height}px`  /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
    })
  }
}

function toggleZoom(data: Data) {
  console.log('toggle zoom')
  const state = getState(data)
  if (!state.stage) {
    throw new Error('zoom module is not initialized or is not available.')
  }
  if (isVisible(state.stage)) {
    showZoom(data)
  } else {
    hideZoom(data)
    return true
  }
  return false
}

function showZoom(data: Data) {
  console.log('showZoom')
  const state = getState(data)
  fadeOut(state.stage)
  fadeIn(data.stage)
}

function hideZoom(data: Data) {
  console.log('hideZoom')
  const state = getState(data)
  fadeIn(state.stage)
  fadeOut(data.stage)
}

function wheel(e: WheelEvent, data: Data) {
  const state = getState(data)
  if (!data.loading && state.useWheel) {

    let signY = e.deltaY === 0 ? 0 : e.deltaY > 0 ? 1 : -1
    if (typeof state.useWheel === 'number') {
      signY *= state.useWheel
    }

    if (isVisible(state.stage) && signY > 0) {
      e.preventDefault()
      showZoom(data)
    }
    if (!isVisible(state.stage) && signY < 0) {
      e.preventDefault()
      hideZoom(data)
    }
  }
}

registerPlugin(NAME, {
  name: NAME,

  mousedown: onClick,
  touchstart: onClick,
  mousemove: onMove,
  touchmove: onMove,
  wheel: wheel,

  onInit: onInit,
  onDestroy: onDestroy,
  onDraw: onDraw
})

extendApi({
  toggleZoom: function(this: Api) { toggleZoom(this.data) }
})
