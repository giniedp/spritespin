/// <reference path="./measure.ts" />
/// <reference path="./preload.ts" />
/// <reference path="./../spritespin.ts" />

describe('SpriteSpin.Utils', () => {

  const Utils = SpriteSpin.Utils
  const WHITE50x50 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAALUlEQVR42u3NMQEAAAgDINc/9Mzg4QcFSDvvIpFIJBKJRCKRSCQSiUQikUhuFtAOY89wCn1dAAAAAElFTkSuQmCC'
  const WIDTH = 50
  const HEIGHT = 50

  describe('measureSource', () => {

    describe('with sprite sheet', () => {

      let data

      beforeEach((done) => {
        Utils.preload({
          source: [WHITE50x50],
          initiated: (result) => {
            data = {
              images: result,
              frames: 100,
              framesX: 10
            }
            done()
          }
        })
      })

      it ('measures sourceWidth and sourceHeight', () => {
        Utils.measureSource(data)
        expect(data.sourceWidth).toBe(WIDTH)
        expect(data.sourceHeight).toBe(HEIGHT)
        // expect(data.frames).toBe(100)
      })

      it ('measures frameWidth and frameHeight', () => {
        Utils.measureSource(data)
        expect(data.frameWidth).toBe(5)
        expect(data.frameHeight).toBe(5)
        // expect(data.frames).toBe(100)
      })
    })
  })
})
