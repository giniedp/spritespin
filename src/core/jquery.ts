import { $ } from '../utils'
import { Api } from './api'
import { createOrUpdate, destroy } from './boot'
import { namespace } from './constants'

function extension(option: string | any, value: any) {
  const $target = $(this)
  if (option === 'data') {
    return $target.data(namespace)
  }
  if (option === 'api') {
    const data = $target.data(namespace)
    data.api = data.api || new Api(data)
    return data.api
  }
  if (option === 'destroy') {
    return $target.each(() => {
      const data = $target.data(namespace)
      if (data) {
        destroy(data)
      }
    })
  }
  if (arguments.length === 2 && typeof option === 'string') {
    option = { [option]: value }
  }
  if (typeof option === 'object') {
    return createOrUpdate($.extend(true, { target: $target }, option)).target
  }

  throw new Error('Invalid call to spritespin')
}

$.fn[namespace] = extension
