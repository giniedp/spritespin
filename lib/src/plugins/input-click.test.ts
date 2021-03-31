import * as SpriteSpin from 'spritespin'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#input-click', () => {

  let instance: SpriteSpin.InstanceState

  beforeEach((done) => {
    instance = SpriteSpin.create({
      target: t.getEl(),
      source: t.WHITE50x50,
      width: 10,
      height: 10,
      frames: 25,
      onLoad: done,
      plugins: ['click', '360']
    }).state
  })
  afterEach(() => {
    SpriteSpin.destroy(instance.target)
  })

  describe('interaction', () => {
    describe('in loading state', () => {
      it ('is idle', () => {
        instance.isLoading = true
        expect(instance.frame).toBe(0, 'initial')
        t.mouseUp(t.getEl(), 0, 0)
        expect(instance.frame).toBe(0)
        t.mouseUp(t.getEl(), 10, 0)
        expect(instance.frame).toBe(0)
        t.mouseUp(t.getEl(), 0, 10)
        expect(instance.frame).toBe(0)
        t.mouseUp(t.getEl(), 10, 10)
        expect(instance.frame).toBe(0)
      })
    })

    describe('in horizontal mode', () => {
      beforeEach(() => {
        instance.orientation = 'horizontal'
      })
      it ('decrements frame on left click', () => {
        expect(instance.frame).toBe(0, 'initial')
        t.mouseUp(t.getEl(), 0, 5)
        expect(instance.frame).toBe(instance.frames - 1)
        t.mouseUp(t.getEl(), 5, 5)
        expect(instance.frame).toBe(instance.frames - 2)
      })

      it ('increments frame on right click', () => {
        expect(instance.frame).toBe(0, 'initial')
        t.mouseUp(t.getEl(), 6, 5)
        expect(instance.frame).toBe(1)
        t.mouseUp(t.getEl(), 10, 5)
        expect(instance.frame).toBe(2)
      })
    })

    describe('in vertical mode', () => {
      beforeEach(() => {
        instance.orientation = 'vertical'
      })

      it ('decrements frame on upper click', () => {
        expect(instance.frame).toBe(0, 'initial')
        t.mouseUp(t.getEl(), 5, 0)
        expect(instance.frame).toBe(instance.frames - 1)
        t.mouseUp(t.getEl(), 5, 5)
        expect(instance.frame).toBe(instance.frames - 2)
      })

      it ('increments frame on lower click', () => {
        expect(instance.frame).toBe(0, 'initial')
        t.mouseUp(t.getEl(), 5, 6)
        expect(instance.frame).toBe(1)
        t.mouseUp(t.getEl(), 5, 10)
        expect(instance.frame).toBe(2)
      })
    })
  })
})
