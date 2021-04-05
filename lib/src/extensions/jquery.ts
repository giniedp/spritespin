import { spritespin } from '../core'

if (typeof window !== 'undefined' && 'jQuery' in window) {
  const jq: any = (window as any).jQuery
  jq.fn.spritespin = function(this: any, ...args: any[]) {
    this.each(function(this: any) {
      spritespin.call(this, this, ...args)
    })
  }
}
