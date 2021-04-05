import * as SpriteSpin from '../core'
import * as t from '../lib.test'
import * as Utils from '../utils'

describe('SpriteSpin.Utils', () => {

  describe('#toArray', () => {
    it ('wraps string to array', () => {
      const input = 'foo'
      const output = Utils.toArray(input)
      expect(Array.isArray(output)).toBe(true)
      expect(output[0]).toBe(input)
    })

    it ('doesnt transform arrays', () => {
      const input = ['foo']
      const output = Utils.toArray(input)
      expect(output).toBe(input)
    })
  })

  describe('#clamp', () => {
    it ('clamps to lower bound', () => {
      const min = 10
      const max = 20
      const output = Utils.clamp(5, min, max)
      expect(output).toBe(min)
    })
    it ('clamps to upper bound', () => {
      const min = 10
      const max = 20
      const output = Utils.clamp(25, min, max)
      expect(output).toBe(max)
    })
    it ('preserves inside bounds', () => {
      const min = 10
      const max = 20
      expect(Utils.clamp(min, min, max)).toBe(min)
      expect(Utils.clamp(max, min, max)).toBe(max)
      expect(Utils.clamp(15, min, max)).toBe(15)
    })
  })
})
