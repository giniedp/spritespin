/// <reference path="../spritespin.ts" />
/// <reference path="./../../tools/spritespin-jasmine.ts" />

describe('SpriteSpin.Plugins#input-hold', () => {

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
      el.dispatchEvent(event('mousedown', 0, 0))
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
    })

    it ('starts animation mousedown', () => {
      expect(data.animate).toBe(false)
      el.dispatchEvent(event('mousedown', 0, 0))
      expect(data.animate).toBe(true)
    })

    it ('removes "dragging" flag on mouseup', () => {
      SpriteSpin.flag(data, 'dragging', true)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      el.dispatchEvent(event('mouseup', 0, 0))
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    xit ('removes "dragging" flag on mouseleave', () => {
      SpriteSpin.flag(data, 'dragging', true)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      el.dispatchEvent(event('mouseleave', 0, 0))
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    it ('ignores move event if not dragging', () => {
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
      el.dispatchEvent(event('mousemove', 0, 0))
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    it ('update frameTime on horizontal move', () => {
      const time = data.frameTime
      el.dispatchEvent(event('mousedown', 0, 0))
      el.dispatchEvent(event('mousemove', 0, 0))
      expect(data.frameTime).toBe(20)
      el.dispatchEvent(event('mousemove', FRAME_WIDHT / 2, 0))
      expect(data.frameTime).toBe(100)
      el.dispatchEvent(event('mousemove', FRAME_WIDHT, 0))
      expect(data.frameTime).toBe(20)
    })

    it ('update frameTime on vertical move', () => {
      const time = data.frameTime
      data.orientation = 'vertical'
      el.dispatchEvent(event('mousedown', 0, 0))
      el.dispatchEvent(event('mousemove', 0, 0))
      expect(data.frameTime).toBe(20)
      el.dispatchEvent(event('mousemove', 0, FRAME_HEIGHT / 2))
      expect(data.frameTime).toBe(100)
      el.dispatchEvent(event('mousemove', 0, FRAME_HEIGHT))
      expect(data.frameTime).toBe(20)
    })
  })
})
