/// <reference path="../../tools/spritespin-jasmine.test.ts" />
/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#input-click', () => {

  let data: SpriteSpin.Instance

  beforeEach((done) => {
    $el.spritespin({
      source: WHITE50x50,
      width: 10,
      height: 10,
      frames: 25,
      onLoad: done,
      plugins: ['click', '360']
    })
    data = $el.data(SpriteSpin.namespace)
  })
  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('interaction', () => {
    describe('in loading state', () => {
      it ('is idle', () => {
        data.loading = true
        expect(data.frame).toBe(0, 'initial')
        mouseUp(el, 0, 0)
        expect(data.frame).toBe(0)
        mouseUp(el, 10, 0)
        expect(data.frame).toBe(0)
        mouseUp(el, 0, 10)
        expect(data.frame).toBe(0)
        mouseUp(el, 10, 10)
        expect(data.frame).toBe(0)
      })
    })

    describe('in horizontal mode', () => {
      beforeEach(() => {
        data.orientation = 'horizontal'
      })
      it ('decrements frame on left click', () => {
        expect(data.frame).toBe(0, 'initial')
        mouseUp(el, 0, 5)
        expect(data.frame).toBe(data.frames - 1)
        mouseUp(el, 5, 5)
        expect(data.frame).toBe(data.frames - 2)
      })

      it ('increments frame on right click', () => {
        expect(data.frame).toBe(0, 'initial')
        mouseUp(el, 6, 5)
        expect(data.frame).toBe(1)
        mouseUp(el, 10, 5)
        expect(data.frame).toBe(2)
      })
    })

    describe('in vertical mode', () => {
      beforeEach(() => {
        data.orientation = 'vertical'
      })

      it ('decrements frame on upper click', () => {
        expect(data.frame).toBe(0, 'initial')
        mouseUp(el, 5, 0)
        expect(data.frame).toBe(data.frames - 1)
        mouseUp(el, 5, 5)
        expect(data.frame).toBe(data.frames - 2)
      })

      it ('increments frame on lower click', () => {
        expect(data.frame).toBe(0, 'initial')
        mouseUp(el, 5, 6)
        expect(data.frame).toBe(1)
        mouseUp(el, 5, 10)
        expect(data.frame).toBe(2)
      })
    })
  })
})
