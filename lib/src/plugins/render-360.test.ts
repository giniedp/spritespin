import * as SpriteSpin from 'spritespin'
import * as t from '../lib.test'
const { isVisible } = SpriteSpin.Utils

describe('SpriteSpin.Plugins#render-360', () => {

  const WIDTH = 50
  const HEIGHT = 50
  let data: SpriteSpin.InstanceState
  beforeEach((done) => {
    data = SpriteSpin.spritespin(t.getEl(), {
      source: t.WHITE50x50,
      frames: 25,
      onComplete: done,
      renderMode: 'canvas',
      plugins: ['360']
    }).state
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('renderer = canvas', () => {

    beforeEach((done) => {
      SpriteSpin.spritespin(data.target, {
        onComplete: done,
        renderMode: 'canvas'
      })
    })

    // it ('has empty stage', () => {
    //   expect(data.stage.querySelectorAll('*').length).toBe(0)
    // })

    it ('shows the stage element', () => {
      expect(isVisible(data.stage)).toBe(true)
    })

    it ('shows the canvas element', () => {
      expect(isVisible(data.canvas)).toBe(true)
    })
  })

  describe('renderer = background', () => {
    beforeEach((done) => {
      SpriteSpin.spritespin(data.target, {
        onComplete: done,
        renderMode: 'background'
      })
    })

    // it ('has empty stage', () => {
    //   expect(data.stage.querySelectorAll('*').length).toBe(0)
    // })

    it ('shows the stage element', () => {
      expect(isVisible(data.stage)).toBe(true)
    })

    it ('hides the canvas element', () => {
      expect(isVisible(data.canvas)).toBe(false)
    })

    it ('shows background on stage', () => {
      expect(data.stage.style.backgroundImage).toContain(t.WHITE50x50)
    })
  })

  describe('renderer = image', () => {

    beforeEach((done) => {
      SpriteSpin.spritespin(data.target, {
        onComplete: done,
        renderMode: 'image'
      })
    })

    it ('has images inside stage', () => {
      expect(data.stage.querySelectorAll('img').length).toBe(1)
    })

    it ('shows the stage element', () => {
      expect(isVisible(data.stage)).toBe(true)
    })

    it ('hides the canvas element', () => {
      expect(isVisible(data.canvas)).toBe(false)
    })

    it ('shows the image element', () => {
      expect(isVisible(data.images[0])).toBe(true)
    })
  })
})
