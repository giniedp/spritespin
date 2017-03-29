/// <reference path="../../tools/spritespin-jasmine.test.ts" />
/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#render-ease', () => {


  let data: SpriteSpin.Instance
  beforeEach((done) => {
    $el.spritespin({
      source: [RED40x30, GREEN40x30, BLUE40x30],
      width: 40,
      height: 30,

      animate: false,
      onComplete: done,
      plugins: ['drag', 'ease']
    })
    data = $el.data(SpriteSpin.namespace)
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
      mouseDown(el, 0, 0)
      setTimeout(() => {
        mouseMove(el, 5, 5)
        setTimeout(() => {
          mouseMove(el, 10, 5)
          mouseUp(el, 10, 5)
          done()
        }, 16)
      }, 16)
    })
  })

})
