import type { PluginClass, PluginFactory, InstanceState, PluginType, PluginInstance } from './models'
import { getState } from './state'
import { error, findIndex } from '../utils'

const registry: Record<string, PluginType> = {}

/**
 * Registers a plugin to the spritespin plugin pool
 *
 * @public
 * @param name - The name of the plugin
 * @param plugin - The plugin implementation
 */
export function registerPlugin(name: string, plugin: PluginType) {
  if (!plugin) {
    error(new Error(`No plugin provided to register ("${name}")`))
    return
  }
  if (!name) {
    error(new Error(`No plugin name provided to register`))
    return
  }
  if (registry[name]) {
    error(new Error(`Plugin name "${name}" is already taken`))
    return
  }
  registry[name] = plugin
}

function getPluginType(name: string): PluginType | null {
  return registry[name]
}

function createPlugin(state: InstanceState, pluginOrType: PluginType): PluginInstance {
  if (typeof pluginOrType === 'function') {
    if ('prototype' in pluginOrType) {
      return new (pluginOrType as PluginClass)(state)
    }
    return (pluginOrType as PluginFactory)(state)
  }
  return pluginOrType
}

function createState<T>(): T {
  return {} as T
}

/**
 * Gets a plugin state object by name.
 *
 * @remarks
 * Plugins should use this method to get or create a state object where they can
 * store any instance variables.
 *
 * @public
 * @param state - The SpriteSpin instance state
 * @param pluginName - The name of the plugin
 */
export function getPluginState<T extends object = any>(state: InstanceState, pluginName: string, orCreate: () => T = createState): T {
  const data = getState<{ [key: string]: T}>(state, 'plugins')
  if (!data[pluginName]) {
    data[pluginName] = orCreate()
  }
  return data[pluginName]
}

/**
 * Gets the user options given for the plugin
 *
 * @public
 * @param state - The SpriteSpin instance state
 * @param name - The plugin name
 * @returns
 */
export function getPluginOptions(state: InstanceState, name: string) {
  for (const plugin of state.plugins) {
    if (typeof plugin !== 'string' && plugin.name === name) {
      return plugin.options
    }
  }
}

/**
 * Gets an instance of an active plugin by name
 *
 * @param state - The SpriteSpin instance state
 * @param name - The plugin name
 * @returns
 */
export function getPluginInstance(state: InstanceState, name: string): PluginInstance | null {
  for (let i = 0; i < state.activePlugins.length; i++) {
    if (state.activePlugins[i].name === name)  {
      return state.activePlugins[i]
    }
  }
}
/**
 * Replaces module names on given SpriteSpin data and replaces them with actual implementations.
 * @public
 */
export function usePlugins(
  state: InstanceState,
  actions: {
    onCreated: (p: PluginInstance) => void
    onRemoved: (p: PluginInstance) => void
  },
) {
  const plugins: PluginInstance[] = []
  const createdPlugins: PluginInstance[] = []
  const existingPlugins: PluginInstance[] = [...(state.activePlugins || [])]
  const names = state.plugins.map((it) => typeof it === 'string' ? it : it.name)
  for (const id of names) {
    const index = findIndex(existingPlugins, (p) => p.name === id)
    if (index >= 0) {
      plugins.push(existingPlugins[index])
      existingPlugins.splice(index, 1)
      continue
    }
    const type = getPluginType(id)
    if (type) {
      const plugin = createPlugin(state, type)
      createdPlugins.push(plugin)
      plugins.push(plugin)
    } else {
      error(new Error(`No plugin found with name ${name}`))
    }
  }
  state.activePlugins = plugins
  for (const plugin of existingPlugins) {
    actions.onRemoved(plugin)
  }
  for (const plugin of createdPlugins) {
    actions.onCreated(plugin)
  }
}
