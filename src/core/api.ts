import { ApiExtension, Api } from './models'

/**
 * Adds methods to the SpriteSpin api
 *
 * @public
 */
export function extendApi<T extends ApiExtension>(extension: T) {
  const api: any = Api.prototype
  for (const key in extension) {
    if (extension.hasOwnProperty(key)) {
      if (api[key]) {
        throw new Error('API method is already defined: ' + key)
      } else {
        api[key] = extension[key]
      }
    }
  }
}
