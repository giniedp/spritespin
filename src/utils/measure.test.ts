/// <reference path="./measure.ts" />
/// <reference path="./preload.ts" />
/// <reference path="./../spritespin.ts" />

describe('SpriteSpin.Utils', () => {

  const Utils = SpriteSpin.Utils
  const WHITE50x50 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAALUlEQVR42u3NMQEAAAgDINc/9Mzg4QcFSDvvIpFIJBKJRCKRSCQSiUQikUhuFtAOY89wCn1dAAAAAElFTkSuQmCC'
  const WIDTH = 50
  const HEIGHT = 50

  let image

  beforeEach((done) => {
    Utils.preload({
      source: [WHITE50x50],
      complete: (result) => {
        image = result[0]
        done()
      }
    })
  })

  describe('#measure', () => {

    let result: SpriteSpin.Utils.SheetSpec[]

    describe('a sprite sheet', () => {
      const FRAMES = 95
      const FRAMESX = 10

      beforeEach(() => {
        result = Utils.measure([image], { frames: FRAMES, framesX: FRAMESX })
      })

      it('resolves sheet spec', () => {
        expect(result.length).toBe(1)
        result.forEach((sheet, index) => {
          expect(sheet.id).toBe(index)
          expect(sheet.width).toBe(WIDTH)
          expect(sheet.width).toBe(HEIGHT)
          expect(sheet.sampledHeight).toBe(sheet.width)
          expect(sheet.sampledHeight).toBe(sheet.height)
        })
      })

      it('resolves sprite specs', () => {
        expect(result[0].sprites.length).toBe(FRAMES)
        result[0].sprites.forEach((sprite, index) => {
          expect(sprite.id).toBe(index)
          expect(sprite.width).toBe(WIDTH / FRAMESX)
          expect(sprite.height).toBe(HEIGHT / (Math.ceil(FRAMES / FRAMESX)))
        })
      })
    })

    describe('an array of frames', () => {
      let IMAGES = [image, image, image, image]
      let FRAMES = IMAGES.length

      beforeEach(() => {
        IMAGES = [image, image, image, image]
        FRAMES = IMAGES.length
        result = Utils.measure(IMAGES, { frames: FRAMES })
      })

      it('resolves sheet spec', () => {
        expect(result.length).toBe(FRAMES)
        result.forEach((sheet, index) => {
          expect(sheet.id).toBe(index)
          expect(sheet.width).toBe(WIDTH)
          expect(sheet.height).toBe(HEIGHT)
          expect(sheet.sampledHeight).toBe(sheet.width)
          expect(sheet.sampledHeight).toBe(sheet.height)
        })
      })

      it('resolves sprite specs', () => {
        result.forEach((sheet) => {
          expect(sheet.sprites.length).toBe(1)
          sheet.sprites.forEach((sprite, index) => {
            expect(sprite.id).toBe(index)
            expect(sprite.width).toBe(WIDTH)
            expect(sprite.height).toBe(HEIGHT)
            expect(sprite.sampledWidth).toBe(sprite.width)
            expect(sprite.sampledHeight).toBe(sprite.height)
          })
        })
      })
    })
  })

  describe('#findSpec', () => {
    const metrics = [
      { sprites: ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3']},
      { sprites: ['x1', 'x2', 'x3', 'y1', 'y2', 'y3', 'z1', 'z2', 'z3']}
    ]

    it('finds the correct data', () => {
      expect(Utils.findSpecs(metrics as any, 3, 0, 0).sprite).toBe('a1')
      expect(Utils.findSpecs(metrics as any, 3, 0, 1).sprite).toBe('b1')
      expect(Utils.findSpecs(metrics as any, 3, 0, 2).sprite).toBe('c1')
      expect(Utils.findSpecs(metrics as any, 3, 0, 3).sprite).toBe('x1')
      expect(Utils.findSpecs(metrics as any, 3, 0, 4).sprite).toBe('y1')
      expect(Utils.findSpecs(metrics as any, 3, 0, 5).sprite).toBe('z1')

      expect(Utils.findSpecs(metrics as any, 3, 1, 0).sprite).toBe('a2')
      expect(Utils.findSpecs(metrics as any, 3, 1, 1).sprite).toBe('b2')
      expect(Utils.findSpecs(metrics as any, 3, 1, 2).sprite).toBe('c2')
      expect(Utils.findSpecs(metrics as any, 3, 1, 3).sprite).toBe('x2')
      expect(Utils.findSpecs(metrics as any, 3, 1, 4).sprite).toBe('y2')
      expect(Utils.findSpecs(metrics as any, 3, 1, 5).sprite).toBe('z2')

      expect(Utils.findSpecs(metrics as any, 3, 2, 0).sprite).toBe('a3')
      expect(Utils.findSpecs(metrics as any, 3, 2, 1).sprite).toBe('b3')
      expect(Utils.findSpecs(metrics as any, 3, 2, 2).sprite).toBe('c3')
      expect(Utils.findSpecs(metrics as any, 3, 2, 3).sprite).toBe('x3')
      expect(Utils.findSpecs(metrics as any, 3, 2, 4).sprite).toBe('y3')
      expect(Utils.findSpecs(metrics as any, 3, 2, 5).sprite).toBe('z3')
    })
  })
})
