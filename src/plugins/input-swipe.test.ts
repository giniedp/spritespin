/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#input-swipe', () => {

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
      plugins: ['swipe', '360']
    })
    data = $el.data(SpriteSpin.namespace)
  })
  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('setup', () => {
    it ('contains swipe plugin', () => {
      expect(data.plugins[0].name).toBe('swipe')
    })
  })

  describe('swipe horizontal', () => {
    it ('updates frame if swipe distance is 50%', () => {
      expect(data.frame).toBe(0, 'initial frame')
      dragMouse(el, 10, 0, 5, 0)
      expect(data.frame).toBe(1, 'after swipe')
      dragMouse(el, 0, 0, 5, 0)
      expect(data.frame).toBe(0, 'after swipe')
    })
  })

  describe('swipe vertical', () => {
    it ('updates frame if swipe distance is 50%', () => {
      data.orientation = 'vertical'
      expect(data.frame).toBe(0, 'initial frame')
      dragMouse(el, 0, 10, 0, 5)
      expect(data.frame).toBe(1, 'after swipe')
      dragMouse(el, 0, 0, 0, 5)
      expect(data.frame).toBe(0, 'after swipe')
    })
  })
})
