export const WHITE40x30 = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAQAAAD01JRWAAAAJElEQVR42u3MMQEAAAgDINc/9Ezg5wkBSDuvIhQKhUKhUCi8LW/iO+NtzNg6AAAAAElFTkSuQmCC'
export const WHITE50x50 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAALUlEQVR42u3NMQEAAAgDINc/9Mzg4QcFSDvvIpFIJBKJRCKRSCQSiUQikUhuFtAOY89wCn1dAAAAAElFTkSuQmCC'
export const RED40x30 = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAYAAABe3VzdAAAAMUlEQVR42u3OMREAAAjEMN6/aMAAO0N6FZB01f63AAICAgICAgICAgICAgICAgICXg1dLDvjAn5XTwAAAABJRU5ErkJggg=='
export const GREEN40x30 = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAYAAABe3VzdAAAAMElEQVR42u3OMQEAAAjDMOZfNGCAnyOtgaR6f1wAAQEBAQEBAQEBAQEBAQEBAQGvBj9KO+MrG0hPAAAAAElFTkSuQmCC'
export const BLUE40x30 = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAYAAABe3VzdAAAAL0lEQVR42u3OMQEAAAgDoK1/aE3g7wEJaDKTxyooKCgoKCgoKCgoKCgoKCgoKHhZIWg740ZlTUgAAAAASUVORK5CYII='

export function mouseEvent(name: string, clientX: number, clientY: number) {
  const e = document.createEvent('MouseEvent') as MouseEvent
  e.initMouseEvent(name, true, true, window, 0, 0, 0, clientX, clientY, false, false, false, false, 0, element)
  return e
}

export function mouseDown(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(mouseEvent('mousedown', x, y))
}
export function mouseUp(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(mouseEvent('mouseup', x, y))
}
export function mouseLeave(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(mouseEvent('mouseleave', x, y))
}
export function mouseMove(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(mouseEvent('mousemove', x, y))
}
export function touchStart(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(mouseEvent('touchstart', x, y))
}
export function touchMove(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(mouseEvent('touchmove', x, y))
}
export function touchEnd(el: HTMLElement, x: number, y: number) {
  el.dispatchEvent(mouseEvent('touchend', x, y))
}

export function moveMouse(el: HTMLElement, startX: number, startY: number, endX: number, endY: number) {
  mouseMove(el, startX, startY)
  mouseMove(el, endX, endY)
}
export function moveTouch(el: HTMLElement, startX: number, startY: number, endX: number, endY: number) {
  touchMove(el, startX, startY)
  touchMove(el, endX, endY)
}
export function dragMouse(el: HTMLElement, startX: number, startY: number, endX: number, endY: number) {
  mouseDown(el, startX, startY)
  mouseMove(el, endX, endY)
  mouseUp(el, endX, endY)
}
export function dragTouch(el: HTMLElement, startX: number, startY: number, endX: number, endY: number) {
  touchStart(el, startX, startY)
  touchMove(el, endX, endY)
  touchEnd(el, endX, endY)
}

export function getEl(): HTMLElement {
  return element
}

let element: HTMLElement

beforeAll(() => {
  document.body.style.margin = '0'
  document.body.style.padding = '0'
})

beforeEach(() => {
  element = document.createElement('div')
  element.classList.add('spritespin')
  document.body.append(element)
})
afterEach(() => {
  element.remove()
})
