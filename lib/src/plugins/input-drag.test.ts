import * as SpriteSpin from 'spritespin'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#input-drag', () => {

  let FRAME_WIDHT: number
  let FRAME_HEIGHT: number
  let data: SpriteSpin.InstanceState

  beforeEach((done) => {
    data = SpriteSpin.spritespin(t.getEl(), {
      source: t.WHITE50x50,
      frames: 25,
      onLoad: done,
      animate: false,
      plugins: ['drag', '360']
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
    it ('contains drag plugin', () => {
      expect(data.activePlugins[0].name).toBe('drag')
    })
  })

  describe('mouse interaction', () => {
    describe('without click', () => {
      it ('ignores events', () => {
        expect(data.frame).toBe(0)
        t.mouseMove(t.getEl(), 0, 0)
        expect(data.frame).toBe(0)
        t.mouseMove(t.getEl(), FRAME_WIDHT / 2, 0)
        expect(data.frame).toBe(0)
      })
    })

    describe('with click', () => {

      it ('sets "dragging" flag on mousedown', () => {
        expect(data.isDragging).toBeFalsy()
        t.mouseDown(t.getEl(), 0, 0)
        expect(data.isDragging).toBe(true)
      })

      it ('removes "dragging" flag on mouseup', () => {
        data.isDragging = true
        expect(data.isDragging).toBe(true)
        t.mouseUp(t.getEl(), 0, 0)
        expect(data.isDragging).toBe(false)
      })

      it ('updates frame on horizontal movement', () => {
        expect(data.frame).toBe(0, 'initial frame')
        t.mouseDown(t.getEl(), 0, 0)
        expect(data.frame).toBe(0, 'after click')
        t.mouseMove(t.getEl(), FRAME_WIDHT / 2, 0)
        expect(data.frame).toBe(12, 'on move right')
        t.mouseMove(t.getEl(), 0, 0)
        expect(data.frame).toBe(0, 'on move left')
        t.mouseMove(t.getEl(), 0, FRAME_HEIGHT / 2)
        expect(data.frame).toBe(0, 'on move down')
        t.mouseMove(t.getEl(), 0, 0)
        expect(data.frame).toBe(0, 'on move up')
      })

      it ('updates frame on vertical movement', () => {
        data.orientation = 'vertical'
        expect(data.frame).toBe(0, 'initial frame')
        t.mouseDown(t.getEl(), 0, 0)
        expect(data.frame).toBe(0, 'after click')
        t.mouseMove(t.getEl(), FRAME_WIDHT / 2, 0)
        expect(data.frame).toBe(0, 'on move right')
        t.mouseMove(t.getEl(), 0, 0)
        expect(data.frame).toBe(0, 'on move left')
        t.mouseMove(t.getEl(), 0, FRAME_HEIGHT / 2)
        expect(data.frame).toBe(12, 'on move vertical')
        t.mouseMove(t.getEl(), 0, 0)
        expect(data.frame).toBe(0, 'on move vertical')
      })

      it ('updates frame on angle axis movement', () => {
        data.orientation = 45
        expect(data.frame).toBe(0, 'initial frame')
        t.mouseDown(t.getEl(), FRAME_WIDHT / 2, FRAME_HEIGHT / 2)
        expect(data.frame).toBe(0, 'after click')
        t.mouseMove(t.getEl(), FRAME_WIDHT, FRAME_HEIGHT)
        expect(data.frame).toBe(0, 'on move to lower right')
        t.mouseMove(t.getEl(), FRAME_WIDHT / 2, FRAME_HEIGHT / 2)
        expect(data.frame).toBe(0, 'on move to center')
        t.mouseMove(t.getEl(), 0, FRAME_HEIGHT / 2)
        expect(data.frame).toBe(16, 'on move to lower left')
        t.mouseMove(t.getEl(), FRAME_WIDHT / 2, FRAME_HEIGHT / 2)
        expect(data.frame).toBe(0, 'on move to center')
      })

      it ('updates the frame', () => {
        expect(data.frame).toBe(0, 'initial frame')
        t.mouseDown(t.getEl(), 0, 0)
        expect(data.frame).toBe(0, 'after click')
        t.mouseMove(t.getEl(), FRAME_WIDHT / 2, 0)
        expect(data.frame).toBe(12, 'on move right')
        t.mouseMove(t.getEl(), 0, 0)
        expect(data.frame).toBe(0, 'on move left')
      })
    })
  })
})
