/// <reference path="../spritespin.ts" />

describe('SpriteSpin.Plugins#input-click', () => {

  const $ = SpriteSpin.$
  const WHITE50x50 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAALUlEQVR42u3NMQEAAAgDINc/9Mzg4QcFSDvvIpFIJBKJRCKRSCQSiUQikUhuFtAOY89wCn1dAAAAAElFTkSuQmCC'
  const WIDTH = 50
  const HEIGHT = 50
  let $el
  let el: HTMLElement
  let data: SpriteSpin.Instance

  function event(clientX: number, clientY: number) {
    const e = document.createEvent('MouseEvent') as MouseEvent
    e.initMouseEvent('mouseup', true, true, window, 0, 0, 0, clientX, clientY, false, false, false, false, 0, el)
    return e
  }

  beforeAll(() => {
    $(document.body).css({ margin: 0, padding: 0 })
  })

  beforeEach(() => {
    $(document.body).append('<div class="test-spin"></div>')
    $el = $('.test-spin')
    el = $el[0] as HTMLElement
  })
  afterEach(() => {
    $el.spritespin('destroy')
    $el.remove()
  })

  beforeEach((done) => {
    $el.spritespin({
      source: WHITE50x50,
      width: 10,
      height: 10,
      frames: 25,
      onLoad: done,
      plugins: ['click', '360']
    })
    data = $el.data(SpriteSpin.namespace)
  })

  describe('interaction', () => {
    describe('in loading state', () => {
      it ('is idle', () => {
        data.loading = true
        expect(data.frame).toBe(0, 'initial')
        el.dispatchEvent(event(0, 0))
        expect(data.frame).toBe(0)
        el.dispatchEvent(event(10, 0))
        expect(data.frame).toBe(0)
        el.dispatchEvent(event(0, 10))
        expect(data.frame).toBe(0)
        el.dispatchEvent(event(10, 10))
        expect(data.frame).toBe(0)
      })
    })

    describe('in horizontal mode', () => {
      beforeEach(() => {
        data.orientation = 'horizontal'
      })
      it ('decrements frame on left click', () => {
        expect(data.frame).toBe(0, 'initial')
        el.dispatchEvent(event(0, 5))
        expect(data.frame).toBe(data.frames - 1)
        el.dispatchEvent(event(5, 5))
        expect(data.frame).toBe(data.frames - 2)
      })

      it ('increments frame on right click', () => {
        expect(data.frame).toBe(0, 'initial')
        el.dispatchEvent(event(6, 5))
        expect(data.frame).toBe(1)
        el.dispatchEvent(event(10, 5))
        expect(data.frame).toBe(2)
      })
    })

    describe('in vertical mode', () => {
      beforeEach(() => {
        data.orientation = 'vertical'
      })

      it ('decrements frame on upper click', () => {
        expect(data.frame).toBe(0, 'initial')
        el.dispatchEvent(event(5, 0))
        expect(data.frame).toBe(data.frames - 1)
        el.dispatchEvent(event(5, 5))
        expect(data.frame).toBe(data.frames - 2)
      })

      it ('increments frame on lower click', () => {
        expect(data.frame).toBe(0, 'initial')
        el.dispatchEvent(event(5, 6))
        expect(data.frame).toBe(1)
        el.dispatchEvent(event(5, 10))
        expect(data.frame).toBe(2)
      })
    })
  })
})
