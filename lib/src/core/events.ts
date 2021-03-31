function triggerEvents(events: RegisteredEventHandler[], args: any[]) {
  for (let i = 0; i < events.length; i++) {
    events[i].handler.apply(events[i].context, args)
  }
}

function removeEvent(events: RegisteredEventHandler[], handler: Callback) {
  for (let i = 0; i < events.length; i++) {
    if (events[i].handler === handler) {
      events.splice(i, 1)
      return true
    }
  }
}

interface RegisteredEventHandler {
  handler: Callback
  context: any
}

/**
 * @public
 */
export type Callback = (...args: any[]) => void

/**
 * Basic event system
 *
 * @public
 */
export class Events<T> {

  private events: Record<string, RegisteredEventHandler[]> = {}

  public constructor(private owner: T) {

  }

  /**
   * Bind an event to a `callback` function.
   *
   * @remarks
   * @param name - The name of the event
   * @param callback - The function to call when the even fires
   */
  public on(name: string, callback: Callback) {
    const events = this.events[name] = this.events[name] || []
    events.push({
      handler: callback,
      context: this.owner || this,
    })
    return () => this.off(callback)
  }

  /**
   * Bind an event to only be triggered a single time.
   *
   * @param name - The name of the event
   * @param callback - The function to call when the even fires
   */
  public once(name: string, callback: Callback) {
    const once: any = function (this: T) {
      if (once.called) { return }
      once.called = true
      once.parent.off(name, once)
      callback.apply(this, arguments)
    }
    once.parent = this
    return this.on(name, once)
  }

  /**
   * Remove one callback
   *
   * @param callback - The function to unbind
   */
  public off(callback?: Callback): void {
    const events = this.events
    for (const key in events) {
      if (events.hasOwnProperty(key) && removeEvent(events[key], callback)) {
        return
      }
    }
  }

  /**
   * Trigger one or many events, firing all bound callbacks.
   *
   * @remarks
   * Callbacks are passed the same arguments as `trigger` is, apart from the event name
   * (unless you're listening on `"all"`, which will cause your callback to
   * receive the true name of the event as the first argument).
   *
   * @param name - The name of the event to trigger
   */
  public trigger(name: string, ...args: any[]): void {
    if (this.events[name]) {
      triggerEvents(this.events[name], args)
    }
  }
}
