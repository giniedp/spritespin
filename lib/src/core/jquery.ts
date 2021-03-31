import { spritespin } from './legacy'

if ('jQuery' in window) {
  const jq: any = (window as any).jQuery
  jq.fn.spritespin = function(this: any) {
    const args = arguments
    this.each(function(this: any) {
      const params: any[] = []
      for (let i = 0; i < args.length; i++) {
        params[i] = args[i]
      }
      params.unshift(this[0])
      spritespin.apply(this, params)
    })
  }
}
