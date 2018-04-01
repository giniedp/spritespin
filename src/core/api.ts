// tslint:disable ban-types
import { Data } from './models'

/**
 * @internal
 */
export class Api {
  constructor(public data: Data) { }
}

/**
 * Adds methods to the SpriteSpin api
 *
 * @public
 */
export function extendApi(methods: { [key: string]: Function }) {
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
