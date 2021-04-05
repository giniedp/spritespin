import * as SpriteSpin from 'spritespin'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#input-hold', () => {

  let FRAME_WIDHT: number
  let FRAME_HEIGHT: number

  let data: SpriteSpin.InstanceState
  beforeEach((done) => {
    data = SpriteSpin.spritespin(t.getEl(), {
      source: t.WHITE50x50,
      frames: 25,
      onLoad: done,
      animate: false,
      plugins: ['hold', '360']
    }).state
  })
  beforeEach(() => {
    FRAME_WIDHT = data.target.offsetWidth
    FRAME_HEIGHT = data.target.offsetHeight
  })
  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('setup', () => {
    it ('contains hold plugin', () => {
      expect(data.activePlugins[0].name).toBe('hold')
    })
  })

  describe('mouse interaction', () => {

    it ('sets "dragging" flag on mousedown', () => {
      expect(data.isDragging).toBeFalsy()
      t.mouseDown(t.getEl(), 0, 0)
      expect(data.isDragging).toBe(true)
    })

    it ('starts animation mousedown', () => {
      expect(data.animate).toBe(false)
      t.mouseDown(t.getEl(), 0, 0)
      expect(data.animate).toBe(true)
    })

    it ('removes "dragging" flag on mouseup', () => {
      data.isDragging = true
      expect(data.isDragging).toBe(true)
      t.mouseUp(t.getEl(), 0, 0)
      expect(data.isDragging).toBe(false)
    })

    it ('removes "dragging" flag on mouseleave', () => {
      data.isDragging = true
      expect(data.isDragging).toBe(true)
      t.mouseLeave(t.getEl(), 0, 0)
      expect(data.isDragging).toBe(false)
    })

    it ('ignores move event if not dragging', () => {
      expect(data.isDragging).toBeFalsy()
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.isDragging).toBeFalsy()
    })

    it ('update frameTime on horizontal move', () => {
      const time = data.frameTime
      t.mouseDown(t.getEl(), 0, 0)
      t.mouseMove(t.getEl(), 0, 0)
      expect(data.frameTime).toBe(20)
      t.mouseMove(t.getEl(), FRAME_WIDHT / 2, 0)
      expect(Math.round(data.frameTime)).toBe(100)
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
