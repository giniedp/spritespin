/// <reference path="./sourceArray.ts" />

describe('SpriteSpin.Utils', () => {
  const Utils = SpriteSpin.Utils

  describe('#sourceArray', () => {
    it ('generates array of urls', () => {
      const output = Utils.sourceArray('http://example.com/image_{frame}.jpg', { frame: [1, 3] })
      expect(output[0]).toBe('http://example.com/image_01.jpg')
      expect(output[1]).toBe('http://example.com/image_02.jpg')
      expect(output[2]).toBe('http://example.com/image_03.jpg')
    })

    it ('accepts "digits" option', () => {
      const output = Utils.sourceArray('http://example.com/image_{frame}.jpg', { frame: [1, 3], digits: 3 })
      expect(output[0]).toBe('http://example.com/image_001.jpg')
      expect(output[1]).toBe('http://example.com/image_002.jpg')
      expect(output[2]).toBe('http://example.com/image_003.jpg')
    })

    it ('accepts "lane" option', () => {
      const output = Utils.sourceArray('http://example.com/image_{lane}x{frame}.jpg', { frame: [1, 2], lane: [1, 2] })
      expect(output[0]).toBe('http://example.com/image_01x01.jpg')
      expect(output[1]).toBe('http://example.com/image_01x02.jpg')
      expect(output[2]).toBe('http://example.com/image_02x01.jpg')
      expect(output[3]).toBe('http://example.com/image_02x02.jpg')
    })
  })
})
