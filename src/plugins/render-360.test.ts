/// <reference path="../../tools/spritespin-jasmine.test.ts" />
/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#render-360', () => {

  const WIDTH = 50
  const HEIGHT = 50
  let data: SpriteSpin.Instance

  beforeEach((done) => {
    $el.spritespin({
      source: WHITE50x50,
      width: 10,
      height: 10,
      frames: 25,
      onComplete: done,
      renderer: 'canvas',
      plugins: ['360']
    })
    data = $el.data(SpriteSpin.namespace)
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('renderer = canvas', () => {

    beforeEach((done) => {
      $el.spritespin({
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
      $el.spritespin({
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
      const bgr = data.stage.css('background-image')
      expect(bgr).toMatch(WHITE50x50)
    })
  })


  describe('renderer = image', () => {

    beforeEach((done) => {
      $el.spritespin({
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
