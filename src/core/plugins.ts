import { error, warn } from '../utils'
import { Data } from './models'

const plugins = {}

/**
 * Registers a module implementation as an available extension to SpriteSpin.
 * Use this to add custom Rendering or Updating modules that can be addressed with the 'module' option.
 */
export function registerPlugin(name, plugin) {
  if (plugins[name]) {
    error(`Plugin name "${name}" is already taken`)
    return
  }
  plugin = plugin || {}
  plugins[name] = plugin
  return plugin
}

export function registerModule(name, plugin) {
  warn('"registerModule" is deprecated, use "registerPlugin" instead')
  registerPlugin(name, plugin)
}

export function getPlugin(name) {
  return plugins[name]
}

/**
 * Replaces module names on given SpriteSpin data and replaces them with actual implementations.
 */
export function applyPlugins(data: Data) {
  fixPlugins(data)
  for (let i = 0; i < data.plugins.length; i += 1) {
    const name = data.plugins[i]
    if (typeof name !== 'string') {
      continue
    }
    const plugin = getPlugin(name)
    if (!plugin) {
      error('No plugin found with name ' + name)
      continue
    }
    data.plugins[i] = plugin
  }
}

function fixPlugins(data: Data) {
  // tslint:disable no-string-literal

  if (data['mods']) {
    warn('"mods" option is deprecated, use "plugins" instead')
    data.plugins = data['mods']
    delete data['mods']
  }

  if (data['behavior']) {
    warn('"behavior" option is deprecated, use "plugins" instead')
    data.plugins.push(data['behavior'])
    delete data['behavior']
  }

  if (data['module']) {
    warn('"module" option is deprecated, use "plugins" instead')
    data.plugins.push(data['module'])
    delete data['module']
  }
}
