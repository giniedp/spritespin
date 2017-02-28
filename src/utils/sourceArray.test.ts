/// <reference path="./sourceArray.ts" />

describe('SpriteSpin.Utils', () => {
  const Utils = SpriteSpin.Utils

  describe('sourceArray', () => {
    it ('generates array of urls', () => {
      const output = Utils.sourceArray('http://example.com/image_{frame}.jpg', { frame: [1, 3], digits: 2 })
      expect(output[0]).toBe('http://example.com/image_01.jpg')
      expect(output[1]).toBe('http://example.com/image_02.jpg')
      expect(output[2]).toBe('http://example.com/image_03.jpg')
    })
  })
})
