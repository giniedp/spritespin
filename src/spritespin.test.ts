import * as SpriteSpin from './core'
import * as t from './lib.test'
import { $ } from './utils'

describe('SpriteSpin', () => {

  const WIDTH = 50
  const HEIGHT = 50

  let data: SpriteSpin.Data
  beforeEach((done) => {
    $.noConflict(true)
    t.get$El().spritespin({
      source: t.WHITE50x50,
      width: 10,
      height: 10,
      frames: 25,
      onLoad: done,
      plugins: ['click', '360']
    })
    data = t.get$El().data(SpriteSpin.namespace)
  })
  afterEach(() => {
    SpriteSpin.destroy(data)
  })

  describe('#getAnimationState', () => {
    it ('returns state.animation', () => {
      const result = SpriteSpin.getPlaybackState(data)
      expect(result).toBeDefined()
      expect(result).toBe(data.state.playback)
    })
  })

  describe('#getInputState', () => {
    it ('returns state.input', () => {
      const result = SpriteSpin.getInputState(data)
      expect(result).toBeDefined()
      expect(result).toBe(data.state.input)
    })
  })

  describe('#getPluginState', () => {
    it ('returns state.plugin.NAME', () => {
      const result = SpriteSpin.getPluginState(data, 'lorem ipsum')
      expect(result).toBeDefined()
      expect(result).toBe(data.state.plugin['lorem ipsum'])
    })
  })

  describe('#is / #flag', () => {
    it ('gets and sets a state flag', () => {
      const result = SpriteSpin.is(data, 'loading')
      expect(result).toBe(false)

      SpriteSpin.flag(data, 'loading', true)
    })
  })

  describe('#extendApi', () => {
    afterEach(() => {
      SpriteSpin.Api.prototype = {} as any
    })
    it ('adds methods to SpriteSpin.Api.prototype', () => {
      function a() { /*noop*/ }
      function b() { /*noop*/ }
      const proto = SpriteSpin.Api.prototype as any

      expect(proto.a).toBeUndefined()
      expect(proto.b).toBeUndefined()

      SpriteSpin.extendApi({ a, b })

      expect(proto.a).toBe(a)
      expect(proto.b).toBe(b)
    })

    it ('throws error on method override', () => {
      function a() { /*noop*/ }
      function b() { /*noop*/ }
      const proto = SpriteSpin.Api.prototype as any

      expect(proto.a).toBeUndefined()

      expect(() => {
        SpriteSpin.extendApi({ a: a })
        SpriteSpin.extendApi({ a: b })
      }).toThrowError()
    })
  })

  describe('#updateInput', () => {
    let input: SpriteSpin.InputState
    beforeEach(() => {
      input = SpriteSpin.getInputState(data)
    })

    it ('sets and keeps startX and startY', () => {
      // initial update sets values
      SpriteSpin.updateInput({ clientX: 5, clientY: 5 }, data)
      expect(input.startX).toBe(5)
      expect(input.startY).toBe(5)

      // successive update keeps values
      SpriteSpin.updateInput({ clientX: 6, clientY: 7 }, data)
      expect(input.startX).toBe(5)
      expect(input.startY).toBe(5)
    })

    it ('tracks currentX and currentY', () => {
      // initial update sets values
      SpriteSpin.updateInput({ clientX: 5, clientY: 5 }, data)
      expect(input.currentX).toBe(5)
      expect(input.currentY).toBe(5)

      // successive update updates values
      SpriteSpin.updateInput({ clientX: 6, clientY: 7 }, data)
      expect(input.currentX).toBe(6)
      expect(input.currentY).toBe(7)
    })

    it ('tracks oldX and oldY', () => {
      // initial update sets values
      SpriteSpin.updateInput({ clientX: 5, clientY: 5 }, data)
      expect(input.oldX).toBe(5)
      expect(input.oldY).toBe(5)

      // successive update sets previous values
      SpriteSpin.updateInput({ clientX: 6, clientY: 7 }, data)
      expect(input.oldX).toBe(5)
      expect(input.oldY).toBe(5)

      // successive update sets previous values
      SpriteSpin.updateInput({ clientX: 8, clientY: 9 }, data)
      expect(input.oldX).toBe(6)
      expect(input.oldY).toBe(7)
    })

    it ('consumes touch events', () => {
      // initial update sets values
      SpriteSpin.updateInput({ touches: [{ clientX: 5, clientY: 5 }]}, data)
      expect(input.oldX).toBe(5)
      expect(input.oldY).toBe(5)
    })
  })

  describe('#updateFrame', () => {
    //
  })

  describe('#resetInput', () => {

    ['current', 'start', 'old'].forEach((name) => {

      it (`resets ${name}X and ${name}Y`, () => {
        let input: SpriteSpin.InputState
        input = SpriteSpin.getInputState(data)
        input[`${name}X`] = 10
        input[`${name}Y`] = 10

        expect(input[`${name}X`]).toBe(10)
        expect(input[`${name}Y`]).toBe(10)
        SpriteSpin.resetInput(data)
        expect(input[`${name}X`]).toBeUndefined()
        expect(input[`${name}Y`]).toBeUndefined()
      })
    });

    ['d', 'dd', 'nd', 'ndd'].forEach((name) => {
      it (`resets ${name}X and ${name}Y`, () => {
        let input: SpriteSpin.InputState
        input = SpriteSpin.getInputState(data)
        input[`${name}X`] = 10
        input[`${name}Y`] = 10

        expect(input[`${name}X`]).toBe(10)
        expect(input[`${name}Y`]).toBe(10)
        SpriteSpin.resetInput(data)
        expect(input[`${name}X`]).toBe(0)
        expect(input[`${name}Y`]).toBe(0)
      })
    })
  })

  describe('$ extension', () => {
    describe('spritespin("data")', () => {
      it ('returns the data object', () => {
        expect(t.get$El().spritespin('data')).toBeDefined()
        expect(t.get$El().spritespin('data')).toBe(data)
      })
    })

    describe('spritespin("api")', () => {
      it ('returns the Api instance', () => {
        const api = t.get$El().spritespin('api')
        expect(api instanceof SpriteSpin.Api).toBe(true)
      })
    })

    describe('spritespin("destroy")', () => {
      it ('destroys the instance', () => {

        t.get$El().spritespin('destroy')
        expect(t.get$El().data('spritespin')).toBeUndefined()
      })
    })

    describe('spritespin("xxx", "yyy")', () => {
      it ('sets property of data object', () => {
        expect(data['xxx']).toBeUndefined() // tslint:disable-line
        t.get$El().spritespin('xxx', 'yyy')
        expect(data['xxx']).toBe('yyy') // tslint:disable-line
      })

      it ('calls SpriteSpin.createOrUpdate', () => {
        expect(data['xxx']).toBeUndefined()
        t.get$El().spritespin('xxx', 'yyy')
        expect(data['xxx']).toBe('yyy')
      })
    })

    describe('spritespin("xxx")', () => {
      it ('throws an error', () => {
        expect(() => {
          t.get$El().spritespin('xxx')
        }).toThrowError()
      })
    })
  })
})
