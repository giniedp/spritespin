import type { InstanceState } from './models'

/**
 * Gets an opaque state object by key
 *
 * @internal
 * @param state - The SpriteSpin instance or instance state object
 * @param key - The name of the state object
 */
export function getState<T = Record<string, unknown>>(state: InstanceState, key: string): T | null {
  state.opaque = state.opaque || {}
  state.opaque[key] = state.opaque[key] || {}
  return state.opaque[key] as T
}
