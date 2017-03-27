((SpriteSpin) => {

  const NAME = 'gallery'

  interface GalleryState {
    images: any[]
    offsets: any[]
    speed: number
    opacity: number
    frame: number
    stage: any
    dX: number
    ddX: number
  }

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME) as GalleryState
  }

  function getOption(data, name, fallback) {
    return data[name] || fallback
  }

  function load(e, data: SpriteSpin.Instance) {
    const state = getState(data)

    state.images = []
    state.offsets = []
    state.frame = data.frame
    state.speed = getOption(data, 'gallerySpeed', 500)
    state.opacity = getOption(data, 'galleryOpacity', 0.25)
    state.stage = getOption(data, 'galleryStage', SpriteSpin.$('<div></div>'))

    state.stage.empty().addClass('gallery-stage').prependTo(data.stage)

    let size = 0
    for (const image of data.images){
      const naturalSize = SpriteSpin.Utils.naturalSize(image)
      const scale = data.height / naturalSize.height

      const img = $(image)
      state.stage.append(img)
      state.images.push(img)
      state.offsets.push(-size + (data.width - image.width * scale) / 2)
      size += data.width
      img.css({
        'max-width' : 'initial',
        opacity : state.opacity,
        width: data.width,
        height: data.height
      })
    }
    const innerSize = SpriteSpin.Utils.getInnerSize(data)
    const outerSize = data.responsive ? SpriteSpin.Utils.getComputedSize(data) : SpriteSpin.Utils.getOuterSize(data)
    const layout = SpriteSpin.Utils.getInnerLayout(data.sizeMode, innerSize, outerSize)
    state.stage.css(layout).css({ width: size, left: state.offsets[state.frame] })
    state.images[state.frame].animate({ opacity : 1 }, state.speed)
  }

  function draw(e, data: SpriteSpin.Instance) {
    const state = getState(data)
    const input = SpriteSpin.getInputState(data)
    const isDragging = SpriteSpin.is(data, 'dragging')
    if (state.frame !== data.frame && !isDragging) {
      state.stage.stop(true, false).animate({ left : state.offsets[data.frame] }, state.speed)

      state.images[state.frame].animate({ opacity : state.opacity }, state.speed)
      state.frame = data.frame
      state.images[state.frame].animate({ opacity : 1 }, state.speed)
      state.stage.animate({ left : state.offsets[state.frame] })
    } else if (isDragging || state.dX !== input.dX) {
      state.dX = input.dX
      state.ddX = input.ddX
      state.stage.stop(true, true).animate({ left : state.offsets[state.frame] + state.dX })
    }
  }

  SpriteSpin.registerPlugin(NAME, {
    name: NAME,
    onLoad: load,
    onDraw: draw
  })
})(SpriteSpin)
