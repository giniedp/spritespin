import { Api, ApiExtension, extendApi, getPlaybackState, stopAnimation, applyAnimation, updateFrame } from 'spritespin'

export type CommonApi = Api & CommonApiFunctions

export interface CommonApiFunctions extends ApiExtension {
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
  playTo: (frame: number, options?: { force?: boolean, nearest?: boolean}) => void
}

extendApi<CommonApiFunctions>({
  isPlaying: function(this: CommonApi) {
    return getPlaybackState(this.data).handler != null
  },
  isLooping: function(this: CommonApi) {
    return this.data.loop
  },
  toggleAnimation: function(this: CommonApi) {
    if (this.isPlaying()) {
      this.stopAnimation()
    } else {
      this.startAnimation()
    }
  },
  stopAnimation: function(this: CommonApi) {
      this.data.animate = false
      stopAnimation(this.data)
  },
  startAnimation: function(this: CommonApi) {
    this.data.animate = true
    applyAnimation(this.data)
  },
  loop: function(this: CommonApi, value: boolean) {
    this.data.loop = value
    applyAnimation(this.data)
    return this
  },
  currentFrame: function(this: CommonApi) {
    return this.data.frame
  },
  updateFrame: function(this: CommonApi, frame: number, lane?: number) {
    updateFrame(this.data, frame, lane)
    return this
  },
  skipFrames: function(this: CommonApi, step: number) {
    const data = this.data
    updateFrame(data, data.frame + (data.reverse ? - step : + step))
    return this
  },
  nextFrame: function(this: CommonApi) {
    return this.skipFrames(1)
  },
  prevFrame: function(this: CommonApi) {
    return this.skipFrames(-1)
  },
  playTo: function(this: CommonApi, frame, options) {
    const data = this.data
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
  }
})
