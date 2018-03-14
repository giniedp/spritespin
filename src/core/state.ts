import { Data } from './models'

export function getState(data: Data, name: string): any {
  data.state = data.state || {}
  data.state[name] = data.state[name] || {}
  return data.state[name]
}

export function getPluginState(data: Data, name: string) {
  const state = getState(data, 'plugin')
  state[name] = state[name] || {}
  return state[name]
}

export function is(data: Data, key: string): boolean {
  return !!getState(data, 'flags')[key]
}

export function flag(data: Data, key: string, value: boolean) {
  getState(data, 'flags')[key] = !!value
}
