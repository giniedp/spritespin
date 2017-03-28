const WHITE50x50 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAALUlEQVR42u3NMQEAAAgDINc/9Mzg4QcFSDvvIpFIJBKJRCKRSCQSiUQikUhuFtAOY89wCn1dAAAAAElFTkSuQmCC'

let $el
let el: HTMLElement

beforeAll(() => {
  $(document.body).css({ margin: 0, padding: 0 })
})

beforeEach(() => {
  $(document.body).append('<div class="spritespin"></div>')
  $el = $('.spritespin')
  el = $el[0] as HTMLElement
})
afterEach(() => {
  el.remove()
})
