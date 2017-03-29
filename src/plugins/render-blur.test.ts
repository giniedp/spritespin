/// <reference path="../../tools/spritespin-jasmine.test.ts" />
/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#render-blur', () => {

  let data: SpriteSpin.Instance
  beforeEach((done) => {
    $el.spritespin({
      source: [RED40x30, GREEN40x30, BLUE40x30],
      width: 40,
      height: 30,

      animate: false,
      onComplete: done,
      plugins: ['blur']
    })
    data = $el.data(SpriteSpin.namespace)
  })

  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('basics', () => {
    it ('has has ease plugin', () => {
      expect(data.plugins[0].name).toBe('blur')
    })

    it ('doesnt break', () => {
      // can not test blur programmatically
      // thus just call updateFrame several times to step through frames
      SpriteSpin.updateFrame(data, 0)
      SpriteSpin.updateFrame(data, 1)
      SpriteSpin.updateFrame(data, 2)
    })
  })
})
