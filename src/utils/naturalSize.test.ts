/// <reference path="./preload.ts" />
/// <reference path="./naturalSize.ts" />

describe('SpriteSpin.Utils', () => {

  const Utils = SpriteSpin.Utils
  const WHITE50x50 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAALUlEQVR42u3NMQEAAAgDINc/9Mzg4QcFSDvvIpFIJBKJRCKRSCQSiUQikUhuFtAOY89wCn1dAAAAAElFTkSuQmCC'
  const WIDTH = 50
  const HEIGHT = 50

  let image: HTMLImageElement

  beforeEach((done) => {
    Utils.preload({
      source: [WHITE50x50],
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
      const result = Utils.naturalSize({ src: WHITE50x50 } as any)
      expect(result.width).toBe(WIDTH)
      expect(result.height).toBe(HEIGHT)
    })
  })
})
