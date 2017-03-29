/// <reference path="../../tools/spritespin-jasmine.test.ts" />
/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#render-gallery', () => {

  let data: SpriteSpin.Instance
  beforeEach((done) => {
    $el.spritespin({
      source: [RED40x30, GREEN40x30, BLUE40x30],
      width: 40,
      height: 30,

      gallerySpeed: 1,
      galleryOpacity: 0.25,

      animate: false,
      onComplete: done,
      plugins: ['gallery']
    })
    data = $el.data(SpriteSpin.namespace)
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('basics', () => {

    it ('has has gallery plugin', () => {
      expect(data.plugins[0].name).toBe('gallery')
    })

    it ('adds a gallery-stage element', () => {
      expect(data.target.find('.gallery-stage').length).toBe(1)
    })

    it ('adds images to gallery-stage', () => {
      expect(data.target.find('.gallery-stage img').length).toBe(3)
    })

    it ('highlights current frame image, dims other', (done) => {
      SpriteSpin.updateFrame(data, 1)
      setTimeout(() => {
        expect(data.target.find('.gallery-stage img:nth-child(1)').css('opacity')).toBe('0.25', 'frame 0')
        expect(data.target.find('.gallery-stage img:nth-child(2)').css('opacity')).toBe('1', 'frame 1')
        expect(data.target.find('.gallery-stage img:nth-child(3)').css('opacity')).toBe('0.25', 'frame 2')

        SpriteSpin.updateFrame(data, 2)
        setTimeout(() => {
          expect(data.target.find('.gallery-stage img:nth-child(1)').css('opacity')).toBe('0.25', 'frame 0')
          expect(data.target.find('.gallery-stage img:nth-child(2)').css('opacity')).toBe('0.25', 'frame 1')
          expect(data.target.find('.gallery-stage img:nth-child(3)').css('opacity')).toBe('1', 'frame 2')
          done()
        }, 16)
      }, 16)
    })
  })
})
