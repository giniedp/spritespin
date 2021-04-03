import * as SpriteSpin from 'spritespin'
import * as t from '../lib.test'
import { CommonApi } from './common'

describe('SpriteSpin.Api#common', () => {

  let data: SpriteSpin.InstanceState
  let api: CommonApi
  beforeEach((done) => {
    const source = [t.RED40x30, t.GREEN40x30, t.BLUE40x30, t.RED40x30, t.GREEN40x30, t.BLUE40x30]
    api = SpriteSpin.spritespin(t.getEl(), {
      source: source,
      frames: source.length,
      width: 40,
      height: 30,
      frameTime: 16,

      animate: false,
      onComplete: done
    }) as any
    data = api.state
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('#isPlaying', () => {
    it ('detects if animation is running', () => {
      expect(api.isPlaying()).toBe(false)
      data.animate = true
      SpriteSpin.usePlayback(data)
      expect(api.isPlaying()).toBe(true)
      SpriteSpin.stopAnimation(data)
      expect(api.isPlaying()).toBe(false)
    })
  })

  describe('#isLooping', () => {
    it ('returns data.loop property', () => {
      data.loop = false
      expect(api.isLooping()).toBe(false)
      data.loop = true
      expect(api.isLooping()).toBe(true)
    })
  })

  describe('#toggleAnimation', () => {
    it ('starts/stops the animation', () => {
      api.toggleAnimation()
      expect(api.isPlaying()).toBe(true, 'started')

      api.toggleAnimation()
      expect(api.isPlaying()).toBe(false, 'stopped')
    })
  })

  describe('#loop', () => {
    it ('sets the loop property', () => {
      api.loop(false)
      expect(api.isLooping()).toBe(false)
      api.loop(true)
      expect(api.isLooping()).toBe(true)
    })

    it ('starts the animation if animate=true', () => {
      expect(api.isPlaying()).toBe(false)
      data.animate = true
      api.loop(false)
      expect(api.isPlaying()).toBe(true)
    })
  })

  describe('#currentFrame', () => {
    it ('gets the current frame number', () => {
      data.frame = 1337
      expect(api.currentFrame()).toBe(1337)
      data.frame = 42
      expect(api.currentFrame()).toBe(42)
    })
  })

  describe('#updateFrame', () => {
    it ('updates the frame number', () => {
      // spyOn(SpriteSpin, 'updateFrame').and.callThrough()
      api.updateFrame(2)
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(1)
      expect(data.frame).toBe(2)
    })
  })

  describe('#skipFrames', () => {
    it ('skips number of frames', () => {
      expect(data.frame).toBe(0)
      expect(data.frames).toBe(6)
      // spyOn(SpriteSpin, 'updateFrame').and.callThrough()

      api.skipFrames(2)
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(1)
      expect(data.frame).toBe(2)

      api.skipFrames(2)
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(2)
      expect(data.frame).toBe(4)

      api.skipFrames(2)
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(3)
      expect(data.frame).toBe(0)
    })

    it ('steps backwards if reverse is true', () => {
      data.reverse = true
      expect(data.frame).toBe(0)
      expect(data.frames).toBe(6)
      // spyOn(SpriteSpin, 'updateFrame').and.callThrough()

      api.skipFrames(2)
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(1)
      expect(data.frame).toBe(4)

      api.skipFrames(2)
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(2)
      expect(data.frame).toBe(2)

      api.skipFrames(2)
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(3)
      expect(data.frame).toBe(0)
    })
  })

  describe('#nextFrame', () => {
    it ('increments frame', () => {
      expect(data.frame).toBe(0)
      expect(data.frames).toBe(6)
      // spyOn(SpriteSpin, 'updateFrame').and.callThrough()

      api.nextFrame()
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(1)
      expect(data.frame).toBe(1)

      api.nextFrame()
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(2)
      expect(data.frame).toBe(2)

      api.nextFrame()
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(3)
      expect(data.frame).toBe(3)
    })
  })

  describe('#prevFrame', () => {
    it ('decrements frame', () => {
      expect(data.frame).toBe(0)
      expect(data.frames).toBe(6)
      // spyOn(SpriteSpin, 'updateFrame').and.callThrough()

      api.prevFrame()
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(1)
      expect(data.frame).toBe(5)

      api.prevFrame()
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(2)
      expect(data.frame).toBe(4)

      api.prevFrame()
      // expect(SpriteSpin.updateFrame).toHaveBeenCalledTimes(3)
      expect(data.frame).toBe(3)
    })
  })

  describe('#playTo', () => {
    it ('skips animation if already on frame', () => {
      expect(api.isPlaying()).toBe(false)
      api.playTo(0)
      expect(api.isPlaying()).toBe(false)
    })

    it ('starts animation', () => {
      api.playTo(5)
      expect(api.isPlaying()).toBe(true)
    })

    it ('stops animation on given frame', (done) => {
      api.playTo(3)
      setTimeout(() => {
        expect(api.currentFrame()).toBe(3)
        expect(api.isPlaying()).toBe(false)
        done()
      }, 100)
    })

    describe('with nearest option', () => {
      it ('plays forward, if needed', () => {
        expect(data.reverse).toBe(false)
        api.playTo(2, { nearest: true })
        expect(data.reverse).toBe(false)
      })

      it ('plays backward, if needed', () => {
        expect(data.reverse).toBe(false)
        api.playTo(3, { nearest: true })
        expect(data.reverse).toBe(true)
      })
    })
  })
})
