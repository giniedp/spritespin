const WHITE40x30 = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAQAAAD01JRWAAAAJElEQVR42u3MMQEAAAgDINc/9Ezg5wkBSDuvIhQKhUKhUCi8LW/iO+NtzNg6AAAAAElFTkSuQmCC'
const WHITE50x50 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAALUlEQVR42u3NMQEAAAgDINc/9Mzg4QcFSDvvIpFIJBKJRCKRSCQSiUQikUhuFtAOY89wCn1dAAAAAElFTkSuQmCC'
const RED40x30 = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAYAAABe3VzdAAAAMUlEQVR42u3OMREAAAjEMN6/aMAAO0N6FZB01f63AAICAgICAgICAgICAgICAgICXg1dLDvjAn5XTwAAAABJRU5ErkJggg=='
const GREEN40x30 = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAYAAABe3VzdAAAAMElEQVR42u3OMQEAAAjDMOZfNGCAnyOtgaR6f1wAAQEBAQEBAQEBAQEBAQEBAQGvBj9KO+MrG0hPAAAAAElFTkSuQmCC'
const BLUE40x30 = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAYAAABe3VzdAAAAL0lEQVR42u3OMQEAAAgDoK1/aE3g7wEJaDKTxyooKCgoKCgoKCgoKCgoKCgoKHhZIWg740ZlTUgAAAAASUVORK5CYII='

function mouseEvent(name: string, clientX: number, clientY: number) {
  const e = document.createEvent('MouseEvent') as MouseEvent
  e.initMouseEvent(name, true, true, window, 0, 0, 0, clientX, clientY, false, false, false, false, 0, el)
  return e
}

function mouseDown(el: HTMLElement, x, y) {
  el.dispatchEvent(mouseEvent('mousedown', x, y))
}
function mouseUp(el: HTMLElement, x, y) {
  el.dispatchEvent(mouseEvent('mouseup', x, y))
}
function mouseLeave(el: HTMLElement, x, y) {
  el.dispatchEvent(mouseEvent('mouseleave', x, y))
}
function mouseMove(el: HTMLElement, x, y) {
  el.dispatchEvent(mouseEvent('mousemove', x, y))
}
function touchStart(el: HTMLElement, x, y) {
  el.dispatchEvent(mouseEvent('touchstart', x, y))
}
function touchMove(el: HTMLElement, x, y) {
  el.dispatchEvent(mouseEvent('touchmove', x, y))
}
function touchEnd(el: HTMLElement, x, y) {
  el.dispatchEvent(mouseEvent('touchend', x, y))
}

function moveMouse(el: HTMLElement, startX, startY, endX, endY) {
  mouseMove(el, startX, startY)
  mouseMove(el, endX, endY)
}
function moveTouch(el: HTMLElement, startX, startY, endX, endY) {
  touchMove(el, startX, startY)
  touchMove(el, endX, endY)
}
function dragMouse(el: HTMLElement, startX, startY, endX, endY) {
  mouseDown(el, startX, startY)
  mouseMove(el, endX, endY)
  mouseUp(el, endX, endY)
}
function dragTouch(el: HTMLElement, startX, startY, endX, endY) {
  touchStart(el, startX, startY)
  touchMove(el, endX, endY)
  touchEnd(el, endX, endY)
}

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
