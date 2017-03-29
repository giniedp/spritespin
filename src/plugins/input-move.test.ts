/// <reference path="../../tools/spritespin-jasmine.test.ts" />
/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#input-move', () => {

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
      plugins: ['move', '360']
    })
    data = $el.data(SpriteSpin.namespace)
  })
  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('setup', () => {
    it ('contains move plugin', () => {
      expect(data.plugins[0].name).toBe('move')
    })
  })

  describe('mouse interaction', () => {

    it ('sets "dragging" flag on mousemove', () => {
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
      mouseMove(el, 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
    })

    xit ('removes "dragging" flag on mouseleave', () => {
      SpriteSpin.flag(data, 'dragging', true)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      mouseLeave(el, 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    it ('updates frame on horizontal movement', () => {
      expect(data.frame).toBe(0, 'initial frame')
      mouseMove(el, 0, 0)
      expect(data.frame).toBe(0, 'after click')
      mouseMove(el, FRAME_WIDHT / 2, 0)
      expect(data.frame).toBe(12, 'on move right')
      mouseMove(el, 0, 0)
      expect(data.frame).toBe(0, 'on move left')
      mouseMove(el, 0, FRAME_WIDHT / 2)
      expect(data.frame).toBe(0, 'on move down')
      mouseMove(el, 0, 0)
      expect(data.frame).toBe(0, 'on move up')
    })

    it ('updates frame on vertical movement', () => {
      data.orientation = 'vertical'
      expect(data.frame).toBe(0, 'initial frame')
      mouseMove(el, 0, 0)
      expect(data.frame).toBe(0, 'after click')
      mouseMove(el, FRAME_WIDHT / 2, 0)
      expect(data.frame).toBe(0, 'on move right')
      mouseMove(el, 0, 0)
      expect(data.frame).toBe(0, 'on move left')
      mouseMove(el, 0, FRAME_WIDHT / 2)
      expect(data.frame).toBe(12, 'on move vertical')
      mouseMove(el, 0, 0)
      expect(data.frame).toBe(0, 'on move vertical')
    })

    it ('updates frame on angle axis movement', () => {
      data.orientation = 45
      expect(data.frame).toBe(0, 'initial frame')
      mouseMove(el, FRAME_WIDHT / 2, FRAME_WIDHT / 2)
      expect(data.frame).toBe(0, 'after click')
      mouseMove(el, FRAME_WIDHT, FRAME_WIDHT)
      expect(data.frame).toBe(0, 'on move to lower right')
      mouseMove(el, FRAME_WIDHT / 2, FRAME_WIDHT / 2)
      expect(data.frame).toBe(0, 'on move to center')
      mouseMove(el, 0, FRAME_WIDHT / 2)
      expect(data.frame).toBe(16, 'on move to lower left')
      mouseMove(el, FRAME_WIDHT / 2, FRAME_WIDHT / 2)
      expect(data.frame).toBe(0, 'on move to center')
    })

    it ('updates the frame', () => {
      expect(data.frame).toBe(0, 'initial frame')
      mouseMove(el, 0, 0)
      expect(data.frame).toBe(0, 'after click')
      mouseMove(el, FRAME_WIDHT / 2, 0)
      expect(data.frame).toBe(12, 'on move right')
      mouseMove(el, 0, 0)
      expect(data.frame).toBe(0, 'on move left')
    })
  })
})
