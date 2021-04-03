import { InstanceState } from './models'
import { getState } from './state'
import { addEventListener, Destructor, destructor, DestructorFn } from '../utils'

type ResizeState = {
  destructor: Destructor
}

function getResizeState(instance: InstanceState) {
  return getState<ResizeState>(instance, 'resize')
}

function onResize(state: InstanceState, fn: () => void): DestructorFn {
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

export function useResize(state: InstanceState) {
  const data = getResizeState(state)
  data.destructor = data.destructor || destructor([
    state.instance.addListener('onDestroy', () => {
      data.destructor()
      data.destructor = null
    }),
    onResize(state, () => {
      state.instance.init()
      state.instance.tick()
    })
  ])
}
