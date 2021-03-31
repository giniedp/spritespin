import type { Instance } from './instance'

const instances: Array<Instance> = []

/**
 * @internal
 */
export function pushInstance(instance: Instance) {
  if (instances.indexOf(instance) < 0) {
    instances.push(instance)
  }
}

/**
 * @internal
 */
export function popInstance(instance: Instance) {
  const index = instances.indexOf(instance)
  if (index >= 0) {
    instances.splice(index, 1)
  }
}

/**
 * @internal
 */
export function eachInstance(cb: (instance: Instance) => unknown) {
  instances.forEach(cb)
}

/**
 * @internal
 */
export function findInstance(el: HTMLElement): Instance | null {
  for (const instance of instances) {
    if (instance.target === el) {
      return instance
    }
  }
  return null
}
