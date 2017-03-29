/// <reference path="../../tools/spritespin-jasmine.test.ts" />
/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#input-drag', () => {

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
      plugins: ['drag', '360']
    })
    data = $el.data(SpriteSpin.namespace)
  })
  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('setup', () => {
    it ('contains drag plugin', () => {
      expect(data.plugins[0].name).toBe('drag')
    })
  })

  describe('mouse interaction', () => {
    describe('without click', () => {
      it ('ignores events', () => {
        expect(data.frame).toBe(0)
        mouseMove(el, 0, 0)
        expect(data.frame).toBe(0)
        mouseMove(el, FRAME_WIDHT / 2, 0)
        expect(data.frame).toBe(0)
      })
    })

    describe('with click', () => {

      it ('sets "dragging" flag on mousedown', () => {
        expect(SpriteSpin.is(data, 'dragging')).toBe(false)
        mouseDown(el, 0, 0)
        expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      })

      it ('removes "dragging" flag on mouseup', () => {
        SpriteSpin.flag(data, 'dragging', true)
        expect(SpriteSpin.is(data, 'dragging')).toBe(true)
        mouseUp(el, 0, 0)
        expect(SpriteSpin.is(data, 'dragging')).toBe(false)
      })

      it ('updates frame on horizontal movement', () => {
        expect(data.frame).toBe(0, 'initial frame')
        mouseDown(el, 0, 0)
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
        mouseDown(el, 0, 0)
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
        mouseDown(el, FRAME_WIDHT / 2, FRAME_WIDHT / 2)
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
        mouseDown(el, 0, 0)
        expect(data.frame).toBe(0, 'after click')
        mouseMove(el, FRAME_WIDHT / 2, 0)
        expect(data.frame).toBe(12, 'on move right')
        mouseMove(el, 0, 0)
        expect(data.frame).toBe(0, 'on move left')
      })
    })
  })
})

