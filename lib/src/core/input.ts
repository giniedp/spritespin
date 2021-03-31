import { getCursorPosition, innerHeight, innerWidth } from './utils'
import { InstanceState } from './models'
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
 * Gets the current input state which is stored in the given instance state
 *
 * @public
 * @param state - The SpriteSpin instance state
 */
export function getInputState(state: InstanceState): InputState {
  return getState(state, `input`)
}

/**
 * Updates the input state using a mouse or touch event.
 *
 * @public
 * @param e - The input event
 * @param state - The SpriteSpin instance state
 *
 * @remarks
 * Detects current mouse or pointer location and updates the input state. Does not trigger any event.
 */
export function updateInput(e: { clientX: number, clientY: number }, state: InstanceState) {
  const cursor = getCursorPosition(e)
  const input = getInputState(state)

  // cache positions from previous frame
  input.oldX = input.currentX
  input.oldY = input.currentY

  input.currentX = cursor.x
  input.currentY = cursor.y

  // Fix old position.
  if (input.oldX === undefined || input.oldY === undefined) {
    input.oldX = input.currentX
    input.oldY = input.currentY
  }

  // Cache the initial click/touch position and store the frame number at which the click happened.
  // Useful for different behavior implementations. This must be restored when the click/touch is released.
  if (input.startX === undefined || input.startY === undefined) {
    input.startX = input.currentX
    input.startY = input.currentY
    input.clickframe = state.frame
    input.clicklane = state.lane
  }

  // Calculate the vector from start position to current pointer position.
  input.dX = input.currentX - input.startX
  input.dY = input.currentY - input.startY

  // Calculate the vector from last frame position to current pointer position.
  input.ddX = input.currentX - input.oldX
  input.ddY = input.currentY - input.oldY

  // Normalize vectors to range [-1:+1]
  input.ndX = input.dX / innerWidth(state.target)
  input.ndY = input.dY / innerHeight(state.target)

  input.nddX = input.ddX / innerWidth(state.target)
  input.nddY = input.ddY / innerHeight(state.target)
}

/**
 * Resets the input state.
 *
 * @public
 * @param state - The SpriteSpin instance state
 *
 * @remarks
 * Simply clears the input state. Does not trigger any event.
 */
export function resetInput(state: InstanceState) {
  const input = getInputState(state)
  input.startX = input.startY = undefined
  input.currentX = input.currentY = undefined
  input.oldX = input.oldY = undefined
  input.dX = input.dY = 0
  input.ddX = input.ddY = 0
  input.ndX = input.ndY = 0
  input.nddX = input.nddY = 0
}
