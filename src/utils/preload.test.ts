import * as SpriteSpin from '..'
import * as t from '../lib.test'
import * as Utils from '../utils'

describe('SpriteSpin.Utils', () => {

  describe('#preload', () => {

    const source = [t.RED40x30, t.GREEN40x30, t.BLUE40x30]

    function expectArrayOfImages(input, output) {
      expect(Array.isArray(output)).toBe(true)
      expect(output.length).toBe(input.length)
      expect(output.every((it) => it instanceof Image)).toBe(true)
    }

    it ('accepts string input', (done) => {
      Utils.preload({
        source: t.RED40x30,
        initiated: (result) => {
          expectArrayOfImages([t.RED40x30], result)
          done()
        }
      })
    })

    it ('reports array of Image elements when initiated', (done) => {
      Utils.preload({
        source: source,
        initiated: (result) => {
          expectArrayOfImages(source, result)
          done()
        }
      })
    })

    it ('reports array of Image elements on complete', (done) => {
      Utils.preload({
        source: source,
        complete: (result) => {
          expectArrayOfImages(source, result)
          done()
        }
      })
    })

    it ('reports progress for each image', (done) => {
      let count = 0
      Utils.preload({
        source: source,
        progress: () => { count++ },
        complete:  () => {
          expect(count).toBe(source.length)
          done()
        }
      })
    })

    it ('completes if preload count is reached', (done) => {
      let count = 0
      const preloadCount = 2
      Utils.preload({
        source: source,
        preloadCount: preloadCount,
        progress: () => { count++ },
        complete: (result) => {
          expect(count).toBe(preloadCount)
          done()
        }
      })
    })
  })
})
