import { Data } from './models'

export class Api {
  constructor(public data: Data) { }
}

/**
 * Helper method that allows to extend the api with more methods.
 * Receives an object with named functions that are extensions to the API.
 */
export function extendApi(methods: { [key: string]: any }) {
  const api = Api.prototype
  for (const key in methods) {
    if (methods.hasOwnProperty(key)) {
      if (api[key]) {
        throw new Error('API method is already defined: ' + key)
      } else {
        api[key] = methods[key]
      }
    }
  }
  return api
}
