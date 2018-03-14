import * as SpriteSpin from '..'
import * as t from '../lib.test'

describe('SpriteSpin.Plugins#render-ease', () => {

  let data: SpriteSpin.Data
  beforeEach((done) => {
    t.get$El().spritespin({
      source: [t.RED40x30, t.GREEN40x30, t.BLUE40x30],
      width: 40,
      height: 30,

      animate: false,
      onComplete: done,
      plugins: ['drag', 'ease']
    })
    data = t.get$El().data(SpriteSpin.namespace)
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('basics', () => {
    it ('has has ease plugin', () => {
      expect(data.plugins[1].name).toBe('ease')
    })
    it ('doesnt break', (done) => {
      // can not test ease programmatically
      // thus just emulate mouse drag
      t.mouseDown(t.getEl(), 0, 0)
      setTimeout(() => {
        t.mouseMove(t.getEl(), 5, 5)
        setTimeout(() => {
          t.mouseMove(t.getEl(), 10, 5)
          t.mouseUp(t.getEl(), 10, 5)
          done()
        }, 16)
      }, 16)
    })
  })

})
