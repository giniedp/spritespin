module SpriteSpin.Utils {

  export function toArray(value: string|string[]) {
    return typeof value === 'string' ? [value] : value
  }

  /**
   * clamps the given value by the given min and max values
   */
  export function clamp(value, min, max) {
    return (value > max ? max : (value < min ? min : value))
  }

  /**
   *
   */
  export function wrap(value, min, max, size) {
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
   *
   */
  export function log(args) {
    if (window.console && window.console.log) {
      window.console.log.apply(window.console, arguments)
    }
  }

  /**
   *
   */
  export function error(args) {
    if (window.console && window.console.error) {
      window.console.error.apply(window.console, arguments)
    }
  }

  /**
   *
   */
  export function warn(args) {
    if (window.console && window.console.warn) {
      window.console.warn.apply(window.console, arguments)
    }
  }

  /**
   * Binds on the given target and event the given function.
   * The SpriteSpin namespace is attached to the event name
   */
  export function bind(target, event, func) {
    if (func) {
      target.bind(event + '.' + SpriteSpin.namespace, (e) => {
        func.apply(target, [e, target.spritespin('data')])
      })
    }
  }

  /**
   * Unbinds all SpriteSpin events from given target element
   */
  export function unbind(target: any): void {
    target.unbind('.' + SpriteSpin.namespace)
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
}
