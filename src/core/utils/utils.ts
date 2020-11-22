import { loop } from './requestAnimationFrame'

export function noop() {
  // noop
}

// tslint:disable-next-line: no-console
export const log: (message?: any, ...optionalParams: any[]) => void = console && console.log || noop
// tslint:disable-next-line: no-console
export const warn: (message?: any, ...optionalParams: any[]) => void = console && console.warn || noop
// tslint:disable-next-line: no-console
export const error: (message?: any, ...optionalParams: any[]) => void = console && console.error || noop

export function getOption<T, K extends keyof T>(data: T, name: K, fallback: T[K]) {
  return name in data ? data[name] : fallback
}

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : value != null ? [value] : []
}

/**
 * clamps the given value by the given min and max values
 */
export function clamp(value: number, min: number, max: number) {
  return (value > max ? max : (value < min ? min : value))
}

/**
 *
 */
export function wrap(value: number, min: number, max: number, size: number) {
  while (value > max) { value -= size }
  while (value < min) { value += size }
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
    legacy.backingStorePixelRatio || 1
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
    return Math.max (
      el.body.scrollWidth,
      (el as any).scrollWidth,
      el.body.offsetWidth,
      (el as any).offsetWidth,
      (el as any).clientWidth
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
    return Math.max (
      el.body.scrollHeight,
      (el as any).scrollHeight,
      el.body.offsetHeight,
      (el as any).offsetHeight,
      (el as any).clientHeight
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

export function fadeTo(el: HTMLElement, opacity: number, options?: { duration: number }) {
  const startValue = Number(el.style.opacity || '1')
  const endValue = clamp(opacity, 1, 0)
  const duration = getOption(options, 'duration', 400)
  loop(function (this, t) {
    const value = clamp((t / duration), 1, 0) * (endValue - startValue) + startValue
    el.style.opacity = String(value)
    if (startValue <= endValue && value >= endValue || startValue >= endValue && value <= endValue) {
      this.kill()
    }
  })
}

export function fadeOut(el: HTMLElement, options?: { duration: number }) {
  fadeTo(el, 0, options)
}

export function fadeIn(el: HTMLElement, options?: { duration: number }) {
  fadeTo(el, 1, options)
}

export function offset(el: HTMLElement) {
  const result = {
    top: 0,
    left: 0
  }
  if (el) {
    const rect = el.getBoundingClientRect()
    result.top = rect.top + window.pageYOffset
    result.left = rect.left + window.pageXOffset
  }
  return result
}
