import * as SpriteSpin from 'spritespin'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#render-zoom', () => {

  function doubleTap(x: number, y: number, cb: () => void) {
    t.getEl().dispatchEvent(t.mouseEvent('mousedown', x, y))
    setTimeout(() => {
      t.getEl().dispatchEvent(t.mouseEvent('mousedown', x, y))
      setTimeout(cb, 16)
    }, 16)
  }

  let data: SpriteSpin.Data
  beforeEach((done) => {
    data = SpriteSpin.spritespin(t.getEl(), {
      source: [t.RED40x30, t.GREEN40x30, t.BLUE40x30],
      frames: 3,
      width: 40,
      height: 30,

      gallerySpeed: 1,
      galleryOpacity: 0.25,

      animate: false,
      onComplete: done,
      plugins: ['zoom']
    } as any)
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('basics', () => {
    it ('has has zoom plugin', () => {
      expect(data.plugins[0].name).toBe('zoom')
    })

    it ('adds a zoom-stage element', () => {
      expect(data.target.querySelectorAll('.zoom-stage').length).toBe(1)
    })

    it ('hides zoom-stage initially', () => {
      expect(SpriteSpin.Utils.isVisible(data.target.querySelector('.zoom-stage'))).toBe(false)
    })
  })

  describe('double tap', () => {
    it ('toggles zoom-stage', (done) => {
      expect(SpriteSpin.Utils.isVisible(data.target.querySelector('.zoom-stage'))).toBe(false)
      doubleTap(0, 0, () => {
        expect(SpriteSpin.Utils.isVisible(data.target.querySelector('.zoom-stage'))).toBe(true)
        doubleTap(0, 0, () => {
          expect(SpriteSpin.Utils.isVisible(data.target.querySelector('.zoom-stage'))).toBe(false)
          done()
        })
      })
    })
  })
})
