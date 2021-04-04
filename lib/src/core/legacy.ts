import { InstanceState, Options } from './models'
import { find, createOrUpdate, Instance } from './instance'
import { getElement } from '../utils/utils'
/**
 * Gets an existing spritespin instance for the given element (or selector)
 *
 * @public
 * @param target - The target element
 */
export function spritespin(target: HTMLElement | string): Instance
/**
 * Creates or updates a spritespin instance
 *
 * @public
 * @param options - The create or update options
 */
export function spritespin(options: Options): Instance
/**
 * Creates or updates a spritespin instance
 *
 * @public
 * @param target - The target element
 * @param options - The create or update options
 */
export function spritespin(target: HTMLElement | string, option: Partial<Options>): Instance
/**
 * Destroys a spritespin instance
 *
 * @public
 * @param target - The target element
 * @param options - The action to execute
 */
export function spritespin(target: HTMLElement | string, option: 'destroy'): void
/**
 * Gets a value of an existing spritespin instance
 *
 * @public
 * @param target - The target element
 * @param key - The option key
 */
export function spritespin<K extends keyof InstanceState>(target: HTMLElement | string, key: K): InstanceState[K]
/**
 * Updates a value on an existing spritespin instance
 *
 * @public
 * @param target - The target element
 * @param key - The option key
 * @param value - The value to set
 */
export function spritespin<K extends keyof InstanceState>(target: HTMLElement | string, key: K, value: InstanceState[K]): Instance
export function spritespin() {
  if (arguments.length === 0) {
    throw new Error('Not enough arguments')
  }

  if (arguments.length === 1) {
    if ((typeof arguments[0] !== 'string') && !(arguments[0] instanceof Element)) {
      return createOrUpdate(arguments[0])
    }
    return find(getElement(arguments[0] as HTMLElement))
  }

  const target: HTMLElement = getElement(arguments[0])
  if (!target) {
    throw new Error('Target element not given or not found')
  }

  const option = arguments[1]
  if (option && typeof option === 'object') {
    return createOrUpdate({
      ...option,
      target
    })
  }
  const instance = find(target)
  if (!instance) {
    throw new Error('Instance not found')
  }
  switch (option) {
    case 'destroy': {
      return instance.destroy()
    }
  }
  if (arguments.length === 3) {
    return instance.update({ [option]: arguments[2] })
  } else {
    return instance.state[option as keyof InstanceState]
  }
}

