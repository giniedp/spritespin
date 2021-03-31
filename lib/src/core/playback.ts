import { clamp, wrap } from './utils'
import { InstanceState } from './models'
import { getState } from './state'

/**
 * Gets the playback state
 *
 * @public
 * @param instance - The SpriteSpin instance state
 */
export function getPlaybackState(instance: InstanceState): PlaybackState {
  return getState(instance, `playback`)
}

/**
 * The playback state
 *
 * @public
 */
export interface PlaybackState {
  frameTime: number
  lastFrame: number
  lastLane: number
  handler: number
}

function updateLane(instance: InstanceState, lane: number) {
  instance.lane = instance.wrapLane
    ? wrap(lane, 0, instance.lanes - 1, instance.lanes)
    : clamp(lane, 0, instance.lanes - 1)
}

function updateAnimationFrame(data: InstanceState) {
  data.frame += (data.reverse ? -1 : 1)
  // wrap the frame value to fit in range [0, data.frames)
  data.frame = wrap(data.frame, 0, data.frames - 1, data.frames)
  // stop animation if loop is disabled and the stopFrame is reached
  if (!data.loop && (data.frame === data.stopFrame)) {
    stopAnimation(data)
  }
}

function updateInputFrame(data: InstanceState, frame: number) {
  data.frame = Number(frame)
  data.frame = data.wrap
    ? wrap(data.frame, 0, data.frames - 1, data.frames)
    : clamp(data.frame, 0, data.frames - 1)
}

function updateAnimation(data: InstanceState) {
  const state = getPlaybackState(data)
  if (!state.handler) {
    return
  }
  aroundFrame(data, () => {
    updateAnimationFrame(data)
  })
}

function aroundFrame(data: InstanceState, fn: Function) {
  const state = getPlaybackState(data)
  state.lastFrame = data.frame
  state.lastLane = data.lane
  fn()
  const instance = data.instance
  if (state.lastFrame !== data.frame || state.lastLane !== data.lane) {
    instance.dispatch('onFrameChanged')
  }
  instance.tick()
}

/**
 * Updates the frame or lane number of the SpriteSpin data.
 *
 * @public
 * @param data - The SpriteSpin instance state
 * @param frame - The frame number to set
 * @param lane - The lane number to set
 */
export function updateFrame(data: InstanceState, frame?: number, lane?: number) {
  aroundFrame(data, () => {
    if (frame != null) {
      updateInputFrame(data, frame)
    }
    if (lane != null) {
      updateLane(data, lane)
    }
  })
}

/**
 * Stops the running animation.
 *
 * @public
 * @param data - The SpriteSpin instance state
 */
export function stopAnimation(data: InstanceState) {
  data.animate = false
  const state = getPlaybackState(data)
  if (state.handler != null) {
    window.clearInterval(state.handler)
    state.handler = null
  }
}

/**
 * Starts animation playback if needed.
 *
 * @remarks
 * Starts animation playback if `animate` property is `true` and the animation is not yet running.
 *
 * @public
 * @param data - The SpriteSpin instance state
 */
export function applyAnimation(data: InstanceState) {
  const state = getPlaybackState(data)
  if (state.handler && (!data.animate || state.frameTime !== data.frameTime)) {
    stopAnimation(data)
  }
  if (data.animate && !state.handler) {
    state.frameTime = data.frameTime
    state.handler = window.setInterval(() => updateAnimation(data), state.frameTime)
  }
}

/**
 * Starts the animation playback
 *
 * @remarks
 * Starts the animation playback and also sets the `animate` property to `true`
 *
 * @public
 * @param state - The SpriteSpin instance state
 */
export function startAnimation(state: InstanceState) {
  state.animate = true
  applyAnimation(state)
}
