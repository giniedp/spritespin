import { extend, Instance, InstanceExtension, getPlaybackState, stopAnimation, applyAnimation, updateFrame } from '../core'

export type CommonApi = Instance & CommonApiFunctions

export interface CommonApiFunctions extends InstanceExtension {
  /**
   * Gets a value indicating whether the animation is currently running.
   */
  isPlaying: () => boolean
  /**
   * Gets a value indicating whether the animation looping is enabled.
   */
  isLooping: () => boolean
  /**
   * Starts/Stops the animation playback
   */
  toggleAnimation: () => void
  /**
   * Stops animation playback
   */
  stopAnimation: () => void
  /**
   * Starts animation playback
   */
  startAnimation: () => void
  /**
   * Sets a value indicating whether the animation should be looped or not.
   * This might start the animation (if the 'animate' data attribute is set to true)
   */
  loop: (value: boolean) => void
  /**
   * Gets the current frame number
   */
  currentFrame: () => number
  /**
   * Updates SpriteSpin to the specified frame.
   */
  updateFrame: (frame: number, lane?: number) => void
  /**
   * Skips the given number of frames
   */
  skipFrames: (step: number) => void
  /**
   * Updates SpriteSpin so that the next frame is shown
   */
  nextFrame: () => void
  /**
   * Updates SpriteSpin so that the previous frame is shown
   */
  prevFrame: () => void
  /**
   * Starts the animations that will play until the given frame number is reached
   * options:
   *   force [boolean] starts the animation, even if current frame is the target frame
   *   nearest [boolean] animates to the direction with minimum distance to the target frame
   */
  playTo: (frame: number, options?: { force?: boolean; nearest?: boolean }) => void
}

extend<CommonApiFunctions>({
  isPlaying: function (this: CommonApi) {
    return getPlaybackState(this.state).handler != null
  },
  isLooping: function (this: CommonApi) {
    return this.state.loop
  },
  toggleAnimation: function (this: CommonApi) {
    if (this.isPlaying()) {
      this.stopAnimation()
    } else {
      this.startAnimation()
    }
  },
  stopAnimation: function (this: CommonApi) {
    this.state.animate = false
    stopAnimation(this.state)
  },
  startAnimation: function (this: CommonApi) {
    this.state.animate = true
    applyAnimation(this.state)
  },
  loop: function (this: CommonApi, value: boolean) {
    this.state.loop = value
    applyAnimation(this.state)
    return this
  },
  currentFrame: function (this: CommonApi) {
    return this.state.frame
  },
  updateFrame: function (this: CommonApi, frame: number, lane?: number) {
    updateFrame(this.state, frame, lane)
    return this
  },
  skipFrames: function (this: CommonApi, step: number) {
    const data = this.state
    updateFrame(data, data.frame + (data.reverse ? -step : +step))
    return this
  },
  nextFrame: function (this: CommonApi) {
    return this.skipFrames(1)
  },
  prevFrame: function (this: CommonApi) {
    return this.skipFrames(-1)
  },
  playTo: function (this: CommonApi, frame: number, options) {
    const data = this.state
    options = options || {}
    if (!options.force && data.frame === frame) {
      return
    }
    if (options.nearest) {
      // distance to the target frame
      const a = frame - data.frame
      // distance to last frame and the to target frame
      const b = frame > data.frame ? a - data.frames : a + data.frames
      // minimum distance
      const c = Math.abs(a) < Math.abs(b) ? a : b
      data.reverse = c < 0
    }
    data.animate = true
    data.loop = false
    data.stopFrame = frame
    applyAnimation(data)
    return this
  },
})
