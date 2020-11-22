import { getCursorPosition, innerHeight, innerWidth } from './utils'
import { Data } from './models'
import { getState } from './state'

/**
 * Describes a SpriteSpin input state
 *
 * @public
 */
export interface InputState {
  oldX: number
  oldY: number
  currentX: number
  currentY: number
  startX: number
  startY: number
  clickframe: number
  clicklane: number
  dX: number
  dY: number
  ddX: number
  ddY: number
  ndX: number
  ndY: number
  nddX: number
  nddY: number
}

/**
 * Gets the current input state
 *
 * @public
 * @param data - The SpriteSpin instance data
 */
export function getInputState(data: Data): InputState {
  return getState(data, 'input')
}

/**
 * Updates the input state using a mouse or touch event.
 *
 * @public
 * @param e - The input event
 * @param data - The SpriteSpin instance data
 */
export function updateInput(e: { clientX: number, clientY: number }, data: Data) {
  const cursor = getCursorPosition(e)
  const state = getInputState(data)

  // cache positions from previous frame
  state.oldX = state.currentX
  state.oldY = state.currentY

  state.currentX = cursor.x
  state.currentY = cursor.y

  // Fix old position.
  if (state.oldX === undefined || state.oldY === undefined) {
    state.oldX = state.currentX
    state.oldY = state.currentY
  }

  // Cache the initial click/touch position and store the frame number at which the click happened.
  // Useful for different behavior implementations. This must be restored when the click/touch is released.
  if (state.startX === undefined || state.startY === undefined) {
    state.startX = state.currentX
    state.startY = state.currentY
    state.clickframe = data.frame
    state.clicklane = data.lane
  }

  // Calculate the vector from start position to current pointer position.
  state.dX = state.currentX - state.startX
  state.dY = state.currentY - state.startY

  // Calculate the vector from last frame position to current pointer position.
  state.ddX = state.currentX - state.oldX
  state.ddY = state.currentY - state.oldY

  // Normalize vectors to range [-1:+1]
  state.ndX = state.dX / innerWidth(data.target)
  state.ndY = state.dY / innerHeight(data.target)

  state.nddX = state.ddX / innerWidth(data.target)
  state.nddY = state.ddY / innerHeight(data.target)
}

/**
 * Resets the input state.
 *
 * @public
 */
export function resetInput(data: Data) {
  const input = getInputState(data)
  input.startX = input.startY = undefined
  input.currentX = input.currentY = undefined
  input.oldX = input.oldY = undefined
  input.dX = input.dY = 0
  input.ddX = input.ddY = 0
  input.ndX = input.ndY = 0
  input.nddX = input.nddY = 0
}
