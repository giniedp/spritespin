import * as SpriteSpin from 'spritespin'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#input-swipe', () => {

  const FRAME_WIDHT = 10
  const FRAME_HEIGHT = 10

  let data: SpriteSpin.InstanceState
  beforeEach((done) => {
    data = SpriteSpin.spritespin(t.getEl(), {
      source: t.WHITE50x50,
      width: FRAME_WIDHT,
      height: FRAME_HEIGHT,
      frames: 25,
      onLoad: done,
      animate: false,
      plugins: ['swipe', '360']
    }).state
  })
  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('setup', () => {
    it ('contains swipe plugin', () => {
      expect(data.activePlugins[0].name).toBe('swipe')
    })
  })

  describe('swipe horizontal', () => {
    it ('updates frame if swipe distance is 50%', () => {
      expect(data.frame).toBe(0, 'initial frame')
      t.dragMouse(t.getEl(), 10, 0, 5, 0)
      expect(data.frame).toBe(1, 'after swipe')
      t.dragMouse(t.getEl(), 0, 0, 5, 0)
      expect(data.frame).toBe(0, 'after swipe')
    })
  })

  describe('swipe vertical', () => {
    it ('updates frame if swipe distance is 50%', () => {
      data.orientation = 'vertical'
      expect(data.frame).toBe(0, 'initial frame')
      t.dragMouse(t.getEl(), 0, 10, 0, 5)
      expect(data.frame).toBe(1, 'after swipe')
      t.dragMouse(t.getEl(), 0, 0, 0, 5)
      expect(data.frame).toBe(0, 'after swipe')
    })
  })
})
