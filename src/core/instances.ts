import { Data } from './models'

let counter = 0

const instances: {[key: string]: Data} = {}

/**
 * @internal
 */
export function pushInstance(data: Data) {
  counter += 1
  data.id = String(counter)
  instances[data.id] = data
}

/**
 * @internal
 */
export function popInstance(data: Data) {
  delete instances[data.id]
}

/**
 * @internal
 */
export function eachInstance(cb: (data: Data) => unknown) {
  for (const id in instances) {
    if (instances.hasOwnProperty(id)) {
      cb(instances[id])
    }
  }
}

/**
 * @internal
 */
export function findInstance(el: HTMLElement): Data {
  for (const key in instances) {
    if (instances[key].target === el) {
      return instances[key]
    }
  }
}
