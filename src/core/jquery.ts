import { spritespin } from './boot'

if ('jQuery' in globalThis) {
  const jq: any = (globalThis as any).jQuery
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
