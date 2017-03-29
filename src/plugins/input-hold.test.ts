/// <reference path="../../tools/spritespin-jasmine.test.ts" />
/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#input-hold', () => {

  const FRAME_WIDHT = 10
  const FRAME_HEIGHT = 10

  let data: SpriteSpin.Instance
  beforeEach((done) => {
    $el.spritespin({
      source: WHITE50x50,
      width: FRAME_WIDHT,
      height: FRAME_HEIGHT,
      frames: 25,
      onLoad: done,
      animate: false,
      plugins: ['hold', '360']
    })
    data = $el.data(SpriteSpin.namespace)
  })
  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('setup', () => {
    it ('contains hold plugin', () => {
      expect(data.plugins[0].name).toBe('hold')
    })
  })

  describe('mouse interaction', () => {

    it ('sets "dragging" flag on mousedown', () => {
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
      mouseDown(el, 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
    })

    it ('starts animation mousedown', () => {
      expect(data.animate).toBe(false)
      mouseDown(el, 0, 0)
      expect(data.animate).toBe(true)
    })

    it ('removes "dragging" flag on mouseup', () => {
      SpriteSpin.flag(data, 'dragging', true)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      mouseUp(el, 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    xit ('removes "dragging" flag on mouseleave', () => {
      SpriteSpin.flag(data, 'dragging', true)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      mouseLeave(el, 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    it ('ignores move event if not dragging', () => {
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
      mouseMove(el, 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    it ('update frameTime on horizontal move', () => {
      const time = data.frameTime
      mouseDown(el, 0, 0)
      mouseMove(el, 0, 0)
      expect(data.frameTime).toBe(20)
      mouseMove(el, FRAME_WIDHT / 2, 0)
      expect(data.frameTime).toBe(100)
      mouseMove(el, FRAME_WIDHT, 0)
      expect(data.frameTime).toBe(20)
    })

    it ('update frameTime on vertical move', () => {
      const time = data.frameTime
      data.orientation = 'vertical'
      mouseDown(el, 0, 0)
      mouseMove(el, 0, 0)
      expect(data.frameTime).toBe(20)
      mouseMove(el, 0, FRAME_HEIGHT / 2)
      expect(data.frameTime).toBe(100)
      mouseMove(el, 0, FRAME_HEIGHT)
      expect(data.frameTime).toBe(20)
    })
  })
})
