import * as SpriteSpin from '..'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#input-hold', () => {

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
      plugins: ['hold', '360']
    })
    data = t.get$El().data(SpriteSpin.namespace)
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
      t.mouseDown(t.getEl(), 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
    })

    it ('starts animation mousedown', () => {
      expect(data.animate).toBe(false)
      t.mouseDown(t.getEl(), 0, 0)
      expect(data.animate).toBe(true)
    })

    it ('removes "dragging" flag on mouseup', () => {
      SpriteSpin.flag(data, 'dragging', true)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      t.mouseUp(t.getEl(), 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    xit ('removes "dragging" flag on mouseleave', () => {
      SpriteSpin.flag(data, 'dragging', true)
      expect(SpriteSpin.is(data, 'dragging')).toBe(true)
      t.mouseLeave(t.getEl(), 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    it ('ignores move event if not dragging', () => {
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
      t.mouseMove(t.getEl(), 0, 0)
      expect(SpriteSpin.is(data, 'dragging')).toBe(false)
    })

    it ('update frameTime on horizontal move', () => {
      const time = data.frameTime
      t.mouseDown(t.getEl(), 0, 0)
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frameTime).toBe(20)
      t.mouseMove(t.getEl(), FRAME_WIDHT / 2, 0)
      expect(data.frameTime).toBe(100)
      t.mouseMove(t.getEl(), FRAME_WIDHT, 0)
      expect(data.frameTime).toBe(20)
    })

    it ('update frameTime on vertical move', () => {
      const time = data.frameTime
      data.orientation = 'vertical'
      t.mouseDown(t.getEl(), 0, 0)
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frameTime).toBe(20)
      t.mouseMove(t.getEl(), 0, FRAME_HEIGHT / 2)
      expect(data.frameTime).toBe(100)
      t.mouseMove(t.getEl(), 0, FRAME_HEIGHT)
      expect(data.frameTime).toBe(20)
    })
  })
})
