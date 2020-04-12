import * as SpriteSpin from '..'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#render-gallery', () => {

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
      plugins: ['gallery']
    } as any)
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('basics', () => {

    it ('has has gallery plugin', () => {
      expect(data.plugins[0].name).toBe('gallery')
    })

    it ('adds a gallery-stage element', () => {
      expect(data.target.querySelectorAll('.gallery-stage').length).toBe(1)
    })

    it ('adds images to gallery-stage', () => {
      expect(data.target.querySelectorAll('.gallery-stage img').length).toBe(3)
    })

    it ('highlights current frame image, dims other', (done) => {
      SpriteSpin.updateFrame(data, 1)
      setTimeout(() => {
        expect(data.target.querySelector<HTMLElement>('.gallery-stage img:nth-child(1)').style.opacity).toBe('0.25', 'frame 0')
        expect(data.target.querySelector<HTMLElement>('.gallery-stage img:nth-child(2)').style.opacity).toBe('1', 'frame 1')
        expect(data.target.querySelector<HTMLElement>('.gallery-stage img:nth-child(3)').style.opacity).toBe('0.25', 'frame 2')

        SpriteSpin.updateFrame(data, 2)
        setTimeout(() => {
          expect(data.target.querySelector<HTMLElement>('.gallery-stage img:nth-child(1)').style.opacity).toBe('0.25', 'frame 0')
          expect(data.target.querySelector<HTMLElement>('.gallery-stage img:nth-child(2)').style.opacity).toBe('0.25', 'frame 1')
          expect(data.target.querySelector<HTMLElement>('.gallery-stage img:nth-child(3)').style.opacity).toBe('1', 'frame 2')
          done()
        }, 32)
      }, 32)
    })
  })
})
