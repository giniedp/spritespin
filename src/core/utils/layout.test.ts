import * as SpriteSpin from '..'
import * as t from '../../lib.test'
import * as Utils from '../utils'

describe('SpriteSpin.Utils', () => {

  describe('#getOuterSize', () => {

    it ('returns width, height and aspect', () => {
      const result = Utils.getOuterSize({ width: 100, height: 200 } as any)
      expect(result.width).toBe(100)
      expect(result.height).toBe(200)
      expect(result.aspect).toBe(0.5)
    })
  })

  describe('#getInnerSize', () => {
    it ('returns frameWidth, frameHeight and aspect', () => {
      const result = Utils.getInnerSize({ frameWidth: 100, frameHeight: 200 } as any)
      expect(result.width).toBe(100)
      expect(result.height).toBe(200)
      expect(result.aspect).toBe(0.5)
    })
  })

  describe('#getInnerLayout', () => {
    const data: Utils.Layoutable = {
      target: null,
      width: 100, height: 200,
      frameWidth: 100, frameHeight: 200,
      sizeMode: 'original'
    }
    let inner: Utils.SizeWithAspect
    let outer: Utils.SizeWithAspect
    const modes: SpriteSpin.SizeMode[] = ['original', 'fit', 'fill', 'stretch']

    describe('with equal outer and inner size', () => {
      beforeEach(() => {
        data.frameWidth = data.width = 100
        data.frameHeight = data.height = 200
      })

      modes.forEach((mode) => {
        describe(`with '${mode}' mode`, () => {
          let result: Utils.Layout

          beforeEach(() => {
            data.sizeMode = mode
            inner = Utils.getInnerSize(data)
            outer = Utils.getOuterSize(data)
            result = Utils.getInnerLayout(data.sizeMode, inner, outer)
          })

          it('returns matching layout', () => {
            expect(result.top).toBe(0, 'top')
            expect(result.right).toBe(0, 'right')
            expect(result.bottom).toBe(0, 'bottom')
            expect(result.left).toBe(0, 'left')
            expect(result.position).toBe('absolute')
          })
        })
      })
    })

    describe('with different outer and inner size', () => {
      beforeEach(() => {
        data.width = 100
        data.height = 200

        data.frameWidth = 300
        data.frameHeight = 400
      })

      describe(`with 'original' mode`, () => {
        let result: Utils.Layout

        beforeEach(() => {
          data.sizeMode = 'original'
          inner = Utils.getInnerSize(data)
          outer = Utils.getOuterSize(data)
          result = Utils.getInnerLayout(data.sizeMode, inner, outer)
        })

        it('returns matching layout', () => {
          expect(result.position).toBe('absolute', 'position')
          expect(result.width).toBe(data.frameWidth, 'frameWidth')
          expect(result.height).toBe(data.frameHeight, 'frameHeight')
          expect(result.top).toBe(-100, 'top')
          expect(result.bottom).toBe(-100, 'bottom')
          expect(result.right).toBe(-100, 'right')
          expect(result.left).toBe(-100, 'left')
        })
      })

      describe(`with 'fit' mode`, () => {
        let result: Utils.Layout

        beforeEach(() => {
          data.sizeMode = 'fit'
          inner = Utils.getInnerSize(data)
          outer = Utils.getOuterSize(data)
          result = Utils.getInnerLayout(data.sizeMode, inner, outer)
        })

        it('returns matching layout', () => {
          expect(result.position).toBe('absolute', 'position')
          expect(result.width).toBe(100, 'frameWidth')
          expect(result.height).toBe(133, 'frameHeight')
          expect(result.top).toBe(33, 'top')
          expect(result.bottom).toBe(33, 'bottom')
          expect(result.right).toBe(0, 'right')
          expect(result.left).toBe(0, 'left')
        })
      })

      describe(`with 'fill' mode`, () => {
        let result: Utils.Layout

        beforeEach(() => {
          data.sizeMode = 'fill'
          inner = Utils.getInnerSize(data)
          outer = Utils.getOuterSize(data)
          result = Utils.getInnerLayout(data.sizeMode, inner, outer)
        })

        it('returns matching layout', () => {
          expect(result.position).toBe('absolute', 'position')
          expect(result.width).toBe(150, 'frameWidth')
          expect(result.height).toBe(200, 'frameHeight')
          expect(result.top).toBe(0, 'top')
          expect(result.bottom).toBe(0, 'bottom')
          expect(result.right).toBe(-25, 'right')
          expect(result.left).toBe(-25, 'left')
        })
      })
    })
  })
})
