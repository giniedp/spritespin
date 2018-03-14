import * as SpriteSpin from '..'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#render-360', () => {

  const WIDTH = 50
  const HEIGHT = 50
  let data: SpriteSpin.Data

  beforeEach((done) => {
    t.get$El().spritespin({
      source: t.WHITE50x50,
      width: 10,
      height: 10,
      frames: 25,
      onComplete: done,
      renderer: 'canvas',
      plugins: ['360']
    })
    data = t.get$El().data(SpriteSpin.namespace)
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('renderer = canvas', () => {

    beforeEach((done) => {
      t.get$El().spritespin({
        onComplete: done,
        renderer: 'canvas'
      })
    })

    it ('has empty stage', () => {
      expect(data.stage.find('*').length).toBe(0)
    })

    it ('shows the stage element', () => {
      expect(data.stage.is(':visible')).toBe(true)
    })

    it ('shows the canvas element', () => {
      expect(data.canvas.is(':visible')).toBe(true)
    })
  })

  describe('renderer = background', () => {

    beforeEach((done) => {
      t.get$El().spritespin({
        onComplete: done,
        renderer: 'background'
      })
    })

    it ('has empty stage', () => {
      expect(data.stage.find('*').length).toBe(0)
    })

    it ('shows the stage element', () => {
      expect(data.stage.is(':visible')).toBe(true)
    })

    it ('hides the canvas element', () => {
      expect(data.canvas.is(':visible')).toBe(false)
    })

    it ('shows background on stage', () => {
      expect(data.stage.css('background-image')).toContain(t.WHITE50x50)
    })
  })

  describe('renderer = image', () => {

    beforeEach((done) => {
      t.get$El().spritespin({
        onComplete: done,
        renderer: 'image'
      })
    })

    it ('has images inside stage', () => {
      expect(data.stage.find('img').length).toBe(1)
    })

    it ('shows the stage element', () => {
      expect(data.stage.is(':visible')).toBe(true)
    })

    it ('hides the canvas element', () => {
      expect(data.canvas.is(':visible')).toBe(false)
    })

    it ('shows the image element', () => {
      expect($(data.images[0]).is(':visible')).toBe(true)
    })
  })
})
