import { loop } from './looper'

export function noop() {
  // noop
}

export function findIndex<T>(arr: T[], fn: (it: T, i: number, arr: T[]) => boolean) {
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) {
      return i
    }
  }
  return -1
}

export function getElement(target: HTMLElement | string): HTMLElement {
  if (target instanceof Element) {
    return target
  }
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target)
  }
  return null
}

// tslint:disable-next-line: no-console
export const log: (message?: any, ...optionalParams: any[]) => void = (console && console.log) || noop
// tslint:disable-next-line: no-console
export const warn: (message?: any, ...optionalParams: any[]) => void = (console && console.warn) || noop
// tslint:disable-next-line: no-console
export const error: (message?: any, ...optionalParams: any[]) => void = (console && console.error) || noop

export function getOption<T, K extends keyof T>(data: T, name: K, fallback: T[K]) {
  return data && name in data ? data[name] : fallback
}

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : value != null ? [value] : []
}

export function addEventListener(target: EventTarget, name: string, handler: EventListener, options?: boolean | AddEventListenerOptions) {
  target.addEventListener(name, handler, options ?? { passive : false })
  return () => {
    target.removeEventListener(name, handler)
  }
}

export type DestructorFn = () => void
export type Destructor = DestructorFn & {
  add: (fn: DestructorFn) => void
  addEventListener: typeof addEventListener
}

export function destructor(list: DestructorFn[] = []): Destructor {
  const instance = () => {
    list.forEach((fn) => fn())
    list.length = 0
  }
  instance.add = (teardown: DestructorFn) => {
    list.push(teardown)
  }
  instance.addEventListener = (target: EventTarget, name: string, handler: EventListener, options?: boolean | AddEventListenerOptions) => {
    const unlisten = addEventListener(target, name, handler, options)
    list.push(unlisten)
    return unlisten
  }
  return instance
}

/**
 * clamps the given value by the given min and max values
 */
export function clamp(value: number, min: number, max: number) {
  return value > max ? max : value < min ? min : value
}

/**
 *
 */
export function wrap(value: number, min: number, max: number, size: number) {
  while (value > max) {
    value -= size
  }
  while (value < min) {
    value += size
  }
  return value
}

export function pixelRatio(context: CanvasRenderingContext2D) {
  const devicePixelRatio = window.devicePixelRatio || 1
  const legacy = context as any
  const backingStoreRatio =
    legacy.webkitBackingStorePixelRatio ||
    legacy.mozBackingStorePixelRatio ||
    legacy.msBackingStorePixelRatio ||
    legacy.oBackingStorePixelRatio ||
    legacy.backingStorePixelRatio ||
    1
  return devicePixelRatio / backingStoreRatio
}

export function innerWidth(el: Window | Document | Element): number {
  if (!el) {
    return 0
  }
  if (el === window || el instanceof Window) {
    return el.innerWidth
  }
  if (el === document || el instanceof Document) {
    return Math.max(
      el.body.scrollWidth,
      (el as any).scrollWidth,
      el.body.offsetWidth,
      (el as any).offsetWidth,
      (el as any).clientWidth,
    )
  }
  return el.clientWidth
}

export function innerHeight(el: Window | Document | Element): number {
  if (!el) {
    return 0
  }
  if (el === window || el instanceof Window) {
    return el.innerHeight
  }
  if (el === document || el instanceof Document) {
    return Math.max(
      el.body.scrollHeight,
      (el as any).scrollHeight,
      el.body.offsetHeight,
      (el as any).offsetHeight,
      (el as any).clientHeight,
    )
  }
  return el.clientHeight
}

/**
 * Sets CSS properties of the given element
 *
 * @remarks
 * numeric values are assumed to be pixel values. Numbers must be passed as strings
 * to avoid the 'px' suffix
 *
 * @param el - The element
 * @param style - The style sheet
 */
export function css(el: HTMLElement, style: { [key: string]: string | number }) {
  if (!el) {
    return
  }
  for (const key in style) {
    if (style.hasOwnProperty(key)) {
      let value = style[key]
      if (typeof value === 'number') {
        value = `${value}px`
      }
      el.style.setProperty(key, String(value))
    }
  }
}

export function createElement(name: string, options: { id?: string; class?: string }) {
  const el = document.createElement(name)
  if (options.id) {
    el.setAttribute('id', options.id)
  }
  if (options.class) {
    el.setAttribute('class', options.class)
  }
  return el
}

export function isVisible(el: HTMLElement) {
  if (!el) {
    return false
  }
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
}

export function hide(el: HTMLElement) {
  if (el) {
    el.style.display = 'none'
  }
}

export function show(el: HTMLElement) {
  if (el) {
    el.style.display = 'block'
  }
}

export function fadeTo(el: HTMLElement, opacity: number, options?: { duration?: number }) {
  const startValue = Number(el.style.display === 'none' ? 0 : el.style.opacity)
  const endValue = clamp(opacity, 1, 0)
  const duration = getOption(options, 'duration', 400)

  const looper = loop(function (this, t) {
    t = clamp(t / duration, 0, 1)
    const value = t * (endValue - startValue) + startValue
    if (value) {
      el.style.display = null
    } else {
      // el.style.display = 'none'
    }
    el.style.opacity = String(value)
    if (t >= 1) {
      looper.kill()
    }
  })
}

export function fadeOut(el: HTMLElement, options?: { duration: number; cb?: Function }) {
  fadeTo(el, 0, options)
}

export function fadeIn(el: HTMLElement, options?: { duration: number; cb?: Function }) {
  fadeTo(el, 1, options)
}

export function offset(el: HTMLElement) {
  const result = {
    top: 0,
    left: 0,
  }
  if (el) {
    const rect = el.getBoundingClientRect()
    result.top = rect.top + window.pageYOffset
    result.left = rect.left + window.pageXOffset
  }
  return result
}
