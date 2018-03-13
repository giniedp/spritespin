import * as SpriteSpin from '..'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#input-move', () => {

  const FRAME_WIDHT = 10
  const FRAME_HEIGHT = 10

  let data: SpriteSpin.Data
  beforeEach((done) => {
    t.get$El().spritespin({
      source: t.WHITE50x50,
      width: FRAME_WIDHT,
      height: FRAME_HEIGHT,
      frames: 25,
      onLoad: done,
      animate: false,
      plugins: ['move', '360']
    })
    data = t.get$El().data(SpriteSpin.namespace)
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
      t.mouseMove(t.getEl(), 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
    })

    xit ('removes "dragging" flag on mouseleave', () => {
      SpriteSpin.flag(data, 'dragging', true)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      t.mouseLeave(t.getEl(), 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    it ('updates frame on horizontal movement', () => {
      expect(data.frame).toBe(0, 'initial frame')
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frame).toBe(0, 'after click')
      t.mouseMove(t.getEl(), FRAME_WIDHT / 2, 0)
      expect(data.frame).toBe(12, 'on move right')
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frame).toBe(0, 'on move left')
      t.mouseMove(t.getEl(), 0, FRAME_WIDHT / 2)
      expect(data.frame).toBe(0, 'on move down')
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frame).toBe(0, 'on move up')
    })

    it ('updates frame on vertical movement', () => {
      data.orientation = 'vertical'
      expect(data.frame).toBe(0, 'initial frame')
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frame).toBe(0, 'after click')
      t.mouseMove(t.getEl(), FRAME_WIDHT / 2, 0)
      expect(data.frame).toBe(0, 'on move right')
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frame).toBe(0, 'on move left')
      t.mouseMove(t.getEl(), 0, FRAME_WIDHT / 2)
      expect(data.frame).toBe(12, 'on move vertical')
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frame).toBe(0, 'on move vertical')
    })

    it ('updates frame on angle axis movement', () => {
      data.orientation = 45
      expect(data.frame).toBe(0, 'initial frame')
      t.mouseMove(t.getEl(), FRAME_WIDHT / 2, FRAME_WIDHT / 2)
      expect(data.frame).toBe(0, 'after click')
      t.mouseMove(t.getEl(), FRAME_WIDHT, FRAME_WIDHT)
      expect(data.frame).toBe(0, 'on move to lower right')
      t.mouseMove(t.getEl(), FRAME_WIDHT / 2, FRAME_WIDHT / 2)
      expect(data.frame).toBe(0, 'on move to center')
      t.mouseMove(t.getEl(), 0, FRAME_WIDHT / 2)
      expect(data.frame).toBe(16, 'on move to lower left')
      t.mouseMove(t.getEl(), FRAME_WIDHT / 2, FRAME_WIDHT / 2)
      expect(data.frame).toBe(0, 'on move to center')
    })

    it ('updates the frame', () => {
      expect(data.frame).toBe(0, 'initial frame')
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frame).toBe(0, 'after click')
      t.mouseMove(t.getEl(), FRAME_WIDHT / 2, 0)
      expect(data.frame).toBe(12, 'on move right')
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frame).toBe(0, 'on move left')
    })
  })
})
