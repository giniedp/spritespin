/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#input-drag', () => {

  function event(name: string, clientX: number, clientY: number) {
    const e = document.createEvent('MouseEvent') as MouseEvent
    e.initMouseEvent(name, true, true, window, 0, 0, 0, clientX, clientY, false, false, false, false, 0, el)
    return e
  }

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
        el.dispatchEvent(event('mousemove', 0, 0))
        expect(data.frame).toBe(0)
        el.dispatchEvent(event('mousemove', FRAME_WIDHT / 2, 0))
        expect(data.frame).toBe(0)
      })
    })

    describe('with click', () => {

      it ('sets "dragging" flag on mousedown', () => {
        expect(SpriteSpin.is(data, 'dragging')).toBe(false)
        el.dispatchEvent(event('mousedown', 0, 0))
        expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      })

      it ('removes "dragging" flag on mouseup', () => {
        SpriteSpin.flag(data, 'dragging', true)
        expect(SpriteSpin.is(data, 'dragging')).toBe(true)
        el.dispatchEvent(event('mouseup', 0, 0))
        expect(SpriteSpin.is(data, 'dragging')).toBe(false)
      })

      it ('updates frame on horizontal movement', () => {
        expect(data.frame).toBe(0, 'initial frame')
        el.dispatchEvent(event('mousedown', 0, 0))
        expect(data.frame).toBe(0, 'after click')
        el.dispatchEvent(event('mousemove', FRAME_WIDHT / 2, 0))
        expect(data.frame).toBe(12, 'on move right')
        el.dispatchEvent(event('mousemove', 0, 0))
        expect(data.frame).toBe(0, 'on move left')
        el.dispatchEvent(event('mousemove', 0, FRAME_WIDHT / 2))
        expect(data.frame).toBe(0, 'on move down')
        el.dispatchEvent(event('mousemove', 0, 0))
        expect(data.frame).toBe(0, 'on move up')
      })

      it ('updates frame on vertical movement', () => {
        data.orientation = 'vertical'
        expect(data.frame).toBe(0, 'initial frame')
        el.dispatchEvent(event('mousedown', 0, 0))
        expect(data.frame).toBe(0, 'after click')
        el.dispatchEvent(event('mousemove', FRAME_WIDHT / 2, 0))
        expect(data.frame).toBe(0, 'on move right')
        el.dispatchEvent(event('mousemove', 0, 0))
        expect(data.frame).toBe(0, 'on move left')
        el.dispatchEvent(event('mousemove', 0, FRAME_WIDHT / 2))
        expect(data.frame).toBe(12, 'on move vertical')
        el.dispatchEvent(event('mousemove', 0, 0))
        expect(data.frame).toBe(0, 'on move vertical')
      })

      it ('updates frame on angle axis movement', () => {
        data.orientation = 45
        expect(data.frame).toBe(0, 'initial frame')
        el.dispatchEvent(event('mousedown', FRAME_WIDHT / 2, FRAME_WIDHT / 2))
        expect(data.frame).toBe(0, 'after click')
        el.dispatchEvent(event('mousemove', FRAME_WIDHT, FRAME_WIDHT))
        expect(data.frame).toBe(0, 'on move to lower right')
        el.dispatchEvent(event('mousemove', FRAME_WIDHT / 2, FRAME_WIDHT / 2))
        expect(data.frame).toBe(0, 'on move to center')
        el.dispatchEvent(event('mousemove', 0, FRAME_WIDHT / 2))
        expect(data.frame).toBe(16, 'on move to lower left')
        el.dispatchEvent(event('mousemove', FRAME_WIDHT / 2, FRAME_WIDHT / 2))
        expect(data.frame).toBe(0, 'on move to center')
      })

      it ('updates the frame', () => {
        expect(data.frame).toBe(0, 'initial frame')
        el.dispatchEvent(event('mousedown', 0, 0))
        expect(data.frame).toBe(0, 'after click')
        el.dispatchEvent(event('mousemove', FRAME_WIDHT / 2, 0))
        expect(data.frame).toBe(12, 'on move right')
        el.dispatchEvent(event('mousemove', 0, 0))
        expect(data.frame).toBe(0, 'on move left')
      })
    })
  })
})

