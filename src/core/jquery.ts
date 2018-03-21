import { $ } from '../utils'
import { Api } from './api'
import { createOrUpdate, destroy } from './boot'
import { namespace } from './constants'

function extension(obj, value) {
  if (obj === 'data') {
    return this.data(namespace)
  }
  if (obj === 'api') {
    const data = this.data(namespace)
    data.api = data.api || new Api(data)
    return data.api
  }
  if (obj === 'destroy') {
    return $(this).each(() => {
      destroy($(this).data(namespace))
    })
  }
  if (arguments.length === 2 && typeof obj === 'string') {
    const tmp = {}
    tmp[obj] = value
    obj = tmp
  }
  if (typeof obj === 'object') {
    obj.target = obj.target || $(this)
    createOrUpdate(obj)
    return obj.target
  }

  throw new Error('Invalid call to spritespin')
}

$.fn[namespace] = extension
