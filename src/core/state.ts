import { Data } from './models'

/**
 * Gets a state object by name.
 * @internal
 * @param data - The SpriteSpin instance data
 * @param name - The name of the state object
 */
export function getState<T = any>(data: Data, name: string): T {
  data.state = data.state || {}
  data.state[name] = data.state[name] || {}
  return data.state[name]
}

/**
 * Gets a plugin state object by name.
 *
 * @remarks
 * Plugins should use this method to get or create a state object where they can
 * store any instance variables.
 *
 * @public
 * @param data - The SpriteSpin instance data
 * @param name - The name of the plugin
 */
export function getPluginState<T = any>(data: Data, name: string): T {
  const state = getState<T>(data, 'plugin')
  state[name] = state[name] || {}
  return state[name]
}

/**
 * Checks whether a flag is set. See {@link flag}.
 *
 * @public
 * @param data - The SpriteSpin instance data
 * @param key - The name of the flag
 */
export function is(data: Data, key: string): boolean {
  return !!getState(data, 'flags')[key]
}

/**
 * Sets a flag value. See {@link is}.
 *
 * @public
 * @param data - The SpriteSpin instance data
 * @param key - The name of the flag
 * @param value - The value to set
 */
export function flag(data: Data, key: string, value: boolean) {
  getState(data, 'flags')[key] = !!value
}
