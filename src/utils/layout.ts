module SpriteSpin.Utils {

  export interface Layout {
    width: string|number
    height: string|number
    top: number
    left: number
    bottom: number
    right: number
    position: 'absolute'
    overflow: 'hidden'
  }

  export interface Size {
    width: number
    height: number
    aspect?: number
  }

  /**
   *
   */
  export function getOuterSize(data): Size {
    const width = Math.floor(data.width || data.frameWidth || data.target.innerWidth())
    const height = Math.floor(data.height || data.frameHeight || data.target.innerHeight())
    return {
      aspect: width / height,
      height,
      width
    }
  }

  export function getComputedSize(data): Size {
    const size = getOuterSize(data)
    if ((typeof window.getComputedStyle === 'function')) {
      const style = window.getComputedStyle(data.target[0])
      if (style.width) {
        size.width = Math.floor(Number(style.width.replace('px', '')))
        size.height = Math.floor(size.width / size.aspect)
      }
    }
    return size
  }

  /**
   *
   */
  export function getInnerSize(data): Size {
    const width = Math.floor(data.frameWidth || data.width || data.target.innerWidth())
    const height = Math.floor(data.frameHeight || data.height || data.target.innerHeight())
    return {
      aspect: width / height,
      height,
      width
    }
  }

  /**
   *
   */
  export function getInnerLayout(data): Layout {

    // the size mode
    const mode = data.sizeMode

    // resulting layout
    const layout: Layout = {
      width    : '100%',
      height   : '100%',
      top      : 0,
      left     : 0,
      bottom   : 0,
      right    : 0,
      position : 'absolute',
      overflow : 'hidden'
    }

    // no calculation here
    if (!mode || mode === 'scale') {
      return layout
    }

    const outer = getOuterSize(data)
    const inner = getInnerSize(data)

    // mode == original
    layout.width = outer.width
    layout.height = outer.height

    // keep aspect ratio but fit into container
    if (mode === 'fit') {
      if (inner.aspect >= outer.aspect) {
        layout.width = outer.width
        layout.height = outer.width / inner.aspect
      } else {
        layout.height = outer.height
        layout.width = outer.height * inner.aspect
      }
    }

    // keep aspect ratio but fill the container
    if (mode === 'fill') {
      if (inner.aspect >= outer.aspect) {
        layout.height = outer.height
        layout.width = outer.height * inner.aspect
      } else {
        layout.width = outer.width
        layout.height = outer.width / inner.aspect
      }
    }

    // floor the numbers
    layout.width = Math.floor(layout.width as number)
    layout.height = Math.floor(layout.height as number)

    // position in center
    layout.top = Math.floor((outer.width - (layout.height as number)) / 2)
    layout.left = Math.floor((outer.height - (layout.width as number)) / 2)
    layout.right = layout.left
    layout.bottom = layout.top

    return layout
  }
}
