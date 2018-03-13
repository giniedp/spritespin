import * as SpriteSpin from '..'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#render-zoom', () => {

  function doubleTap(x, y, cb) {
    t.getEl().dispatchEvent(t.mouseEvent('mousedown', x, y))
    setTimeout(() => {
      t.getEl().dispatchEvent(t.mouseEvent('mousedown', x, y))
      setTimeout(cb, 16)
    }, 16)
  }

  let data: SpriteSpin.Data
  beforeEach((done) => {
    t.get$El().spritespin({
      source: [t.RED40x30, t.GREEN40x30, t.BLUE40x30],
      width: 40,
      height: 30,

      gallerySpeed: 1,
      galleryOpacity: 0.25,

      animate: false,
      onComplete: done,
      plugins: ['zoom']
    })
    data = t.get$El().data(SpriteSpin.namespace)
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('basics', () => {
    it ('has has zoom plugin', () => {
      expect(data.plugins[0].name).toBe('zoom')
    })

    it ('adds a zoom-stage element', () => {
      expect(data.target.find('.zoom-stage').length).toBe(1)
    })

    it ('hides zoom-stage initially', () => {
      expect(data.target.find('.zoom-stage').is(':visible')).toBe(false)
    })
  })

  describe('double tap', () => {
    beforeEach(() => {
      $.fx.off = true
    })
    afterEach(() => {
      $.fx.off = false
    })

    it ('toggles zoom-stage', (done) => {
      expect(data.target.find('.zoom-stage').is(':visible')).toBe(false)
      doubleTap(0, 0, () => {
        expect(data.target.find('.zoom-stage').is(':visible')).toBe(true)
        doubleTap(0, 0, () => {
          expect(data.target.find('.zoom-stage').is(':visible')).toBe(false)
          done()
        })
      })
    })
  })
})
