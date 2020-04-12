import { Data } from './models'

let counter = 0

const instances: {[key: string]: Data} = {}

export function pushInstance(data: Data) {
  counter += 1
  data.id = String(counter)
  instances[data.id] = data
}

export function popInstance(data: Data) {
  delete instances[data.id]
}

export function eachInstance(cb: (data: Data) => unknown) {
  for (const id in instances) {
    if (instances.hasOwnProperty(id)) {
      cb(instances[id])
    }
  }
}

export function findInstance(el: HTMLElement): Data {
  for (const key in instances) {
    if (instances[key].target === el) {
      return instances[key]
    }
  }
}
