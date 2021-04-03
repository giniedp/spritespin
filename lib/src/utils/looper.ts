
const getTime: () => number = (() => {
  if (window.performance && typeof window.performance.now === 'function') {
    return () => window.performance.now()
  }
  return () => Date.now()
})()

function withWindowBinding(...names: string[]) {
  for (const name of names) {
    if (name in window) {
      const fn = window[name as any] as any
      if (typeof fn === 'function') {
        return fn.bind(window)
      }
    }
  }
  return null
}

const requestAnimationFrame: (cb: FrameRequestCallback) => number =
  withWindowBinding(
    'requestAnimationFrame',                     // prefer without wendor prefix
    'mozRequestAnimationFrame',                  // fallback to vendor prefix
    'webkitRequestAnimationFrame',
    'msRequestAnimationFrame'
  ) || ((cb) => setTimeout(() => cb(getTime()))) // no RAF support => usage with setTimeout

const cancelAnimationFrame: (requestId: number) => number = withWindowBinding(
  'cancelAnimationFrame',       // prefer without wendor prefix
  'mozCancelAnimationFrame',    // fallback to vendor prefix
  'webkitCancelAnimationFrame',
  'msCancelAnimationFrame',
  'clearTimeout'                // no RAF support => usage with setTimeout
)

/**
 * A loop function that can be started and killed
 *
 * @public
 */
export interface Loop {
  /**
   * Indicates whether the looper is currently active
   */
  isRunning: boolean
  /**
   * Kills the loop
   */
  kill(): void
  /**
   * Starts the loop
   */
  (): void
}

/**
 * Spins the given `update` function in a loop by utilizing `requestAnimationFrame`
 *
 * @public
 * @remarks
 * A primitive loop scheduler with no fixed time support or any optimizations.
 * Simply schedules the given `update` function with `requestAnimationFrame`.
 */
export function loop(update: (this: Loop, timestamp?: number, dt?: number) => any): Loop {
  let requestId: number = null
  let startTime = 0
  let totalTime = 0

  function tick() {
    const dt = getTime() - (startTime + totalTime)
    totalTime += dt
    update.call(looper, totalTime, dt)
    if (requestId != null) {
      requestId = requestAnimationFrame(tick)
    }
  }
  const looper = () => {
    if (requestId == null) {
      startTime = getTime()
      requestId = requestAnimationFrame(tick)
      looper.isRunning = true
    }
  }
  looper.kill = () => {
    if (requestId != null) {
      cancelAnimationFrame(requestId)
      requestId = null
      looper.isRunning = false
    }
  }
  looper.isRunning = false
  looper()

  return looper
}
