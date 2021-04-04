import * as SpriteSpin from '../core'
import * as t from '../lib.test'
import * as Utils from '../utils'

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

  describe('#naturalSize', () => {
    it ('resolves to naturalWidth and naturalHeight', () => {
      const result = Utils.naturalSize({ naturalWidth: WIDTH, naturalHeight: HEIGHT } as any)
      expect(result.width).toBe(WIDTH)
      expect(result.height).toBe(HEIGHT)
    })

    it ('resolves to width and height from preloaded src', () => {
      const result = Utils.naturalSize({ src: t.WHITE50x50 } as any)
      expect(result.width).toBe(WIDTH)
      expect(result.height).toBe(HEIGHT)
    })
  })
})
