import { Data, SpriteSpinCallback } from './models'
import { getState } from './state'

export function handleEvent(data: Data, eventName: string, e?: Event) {
  const shouldDispatch = !e
  if (shouldDispatch) {
    e = document.createEvent('Event')
    e.initEvent(`${eventName}.spritespin`, true, true)
  }

  for (const module of data.plugins) {
    const fn: SpriteSpinCallback = module[eventName]
    if (typeof fn === 'function') {
      fn.call(data.target, e, data)
    }
  }

  {
    const fn = (data as any)[eventName as any]
    if (typeof fn === 'function') {
      fn.call(data.target, e, data)
    }
  }

  if (shouldDispatch) {
    data.target.dispatchEvent(e)
  }
}

interface EventsState {
  bindings: EventBinding[]
}

interface EventBinding {
  target: EventTarget,
  name: string,
  handler: any,
  unbind: () => void
}

function getEventsState(data: Data) {
  const state = getState<EventsState>(data, 'spritespin-events')
  state.bindings = state.bindings || []
  return state
}

export function bindEvent(data: Data, target: EventTarget, name: string, fn: SpriteSpinCallback) {
  const handler = (e: Event) => fn.call(target, e, data)
  getEventsState(data).bindings.push({
    handler,
    name,
    target,
    unbind: () => target.removeEventListener(name, handler)
  })
  target.addEventListener(name, handler)
}

export function unbindEvents(data: Data, target?: EventTarget, name?: string) {
  const state = getEventsState(data)
  state.bindings = state.bindings.filter((it) => {
    if ((!target || it.target === target) && (!name || it.name === name)) {
      it.unbind()
      return false
    }
    return true
  })
}
