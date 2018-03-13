import * as t from '../lib.test'
import * as Utils from './index'

describe('SpriteSpin.Utils', () => {

  const WIDTH = 50
  const HEIGHT = 50

  let image: HTMLImageElement

  beforeEach((done) => {
    Utils.preload({
      source: [t.WHITE50x50],
      complete: (result) => {
        image = result[0]
        done()
      }
    })
  })

  describe('#detectSubsampling', () => {
    describe('with small image', () => {
      it ('resolves to false', () => {
        const result = Utils.detectSubsampling(image, WIDTH, HEIGHT)
        expect(result).toBe(false)
      })
    })

    describe('with (fake) subsampled image', () => {
      it ('resolves to true', () => {
        const result = Utils.detectSubsampling(image, 1025, 1025)
        expect(result).toBe(true)
      })
    })

  })
})
