import { InstanceState } from './models'
import { getState } from './state'
import { addEventListener } from './utils'

type ResizeState = {
  dispose: Array<Function>
}

function getResizeState(instance: InstanceState) {
  return getState<ResizeState>(instance, 'resize')
}

function onResize(state: InstanceState, fn: () => void): Function {
  let timeout: any
  const resize = () => {
    clearTimeout(timeout)
    timeout = setTimeout(fn, 0)
  }
  if (typeof ResizeObserver !== 'undefined') {
    let didStart = false
    const observer = new ResizeObserver(() => {
      if (!didStart) {
        didStart = true // skip initial
      } else {
        resize()
      }
    })
    observer.observe(state.target)
    return () => observer.disconnect()
  }
  return addEventListener(window, 'resize', resize)
}

export function applyResize(state: InstanceState) {
  const data = getResizeState(state)
  data.dispose = data.dispose || [
    state.instance.addListener('onDestroy', () => {
      data.dispose.forEach((fn) => fn())
    }),
    onResize(state, () => {
      console.log('resize')
      state.instance.init()
      state.instance.tick()
    }),
  ]
}
