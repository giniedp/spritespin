import { clamp, loop, Loop, wrap } from '../utils'
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
  /**
   * The time between frames
   */
  frameTime: number
  /**
   * The time when the last update occured
   */
  lastTime: number
  /**
   * The frame number at last frame
   */
  lastFrame: number
  /**
   * The lane number at last frame
   */
  lastLane: number
  /**
   * The animation looper
   */
  looper: Loop
}

function setLane(instance: InstanceState, lane: number) {
  instance.lane = instance.wrapLane
    ? wrap(lane, 0, instance.lanes - 1, instance.lanes)
    : clamp(lane, 0, instance.lanes - 1)
}

function setFrame(data: InstanceState, frame: number) {
  data.frame = Number(frame)
  data.frame = data.wrap
    ? wrap(data.frame, 0, data.frames - 1, data.frames)
    : clamp(data.frame, 0, data.frames - 1)
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

function updateAnimation(data: InstanceState, time: number) {
  const state = getPlaybackState(data)
  state.lastTime = state.lastTime || 0
  if ((time - state.lastTime) < state.frameTime) {
    return
  }
  state.lastTime = time
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
      setFrame(data, frame)
    }
    if (lane != null) {
      setLane(data, lane)
    }
  })
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
export function usePlayback(data: InstanceState) {
  const state = getPlaybackState(data)
  state.frameTime = data.frameTime
  if (!data.animate) {
    state.looper?.kill()
    state.lastTime = null
  } else if (state.looper) {
    state.looper()
  } else {
    state.looper = loop((time) => {
      updateAnimation(data, time)
    })
  }
}

/**
 * Stops the running animation.
 *
 * @public
 * @param data - The SpriteSpin instance state
 */
 export function stopAnimation(data: InstanceState) {
  data.animate = false
  usePlayback(data)
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
  usePlayback(state)
}
