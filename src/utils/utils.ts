import { namespace } from '../core/constants'

export function noop() {
  // noop
}

function wrapConsole(type: string): (message?: any, ...optionalParams: any[]) => void {
  return console && console[type] ? (...args: any[]) => console.log.apply(console, args) : noop
}

export const log = wrapConsole('log')
export const warn = wrapConsole('warn')
export const error = wrapConsole('error')

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
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

/**
 * prevents default action on the given event
 */
export function prevent(e) {
  e.preventDefault()
  return false
}

/**
 * Binds on the given target and event the given function.
 * The SpriteSpin namespace is attached to the event name
 */
export function bind(target: JQuery, event: string, func: (...args: any[]) => any) {
  if (func) {
    target.bind(event + '.' + namespace, (e) => {
      func.apply(target, [e, (target as any).spritespin('data')])
    })
  }
}

/**
 * Unbinds all SpriteSpin events from given target element
 */
export function unbind(target: JQuery): void {
  target.unbind('.' + namespace)
}

/**
 * Checks if given object is a function
 */
export function isFunction(fn: any): boolean {
  return typeof fn === 'function'
}

export function pixelRatio(context) {
  const devicePixelRatio = window.devicePixelRatio || 1
  const backingStoreRatio =
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1
  return devicePixelRatio / backingStoreRatio
}
