((SpriteSpin) => {

  const NAME = 'gallery'

  function getState(data) {
    return SpriteSpin.getPluginState(data, NAME)
  }

  function load(e, data) {
    data.galleryImages = []
    data.galleryOffsets = []
    data.gallerySpeed = 500
    data.galleryOpacity = 0.25
    data.galleryFrame = 0
    data.galleryStage = data.galleryStage || SpriteSpin.$('<div/>')
    data.stage.prepend(data.galleryStage)
    data.galleryStage.empty()

    let size = 0
    for (const source of data.source){
      const img = SpriteSpin.$("<img src='" + source + "'/>")
      data.galleryStage.append(img)
      data.galleryImages.push(img)
      const scale = data.height / img[0].height
      data.galleryOffsets.push(-size + (data.width - img[0].width * scale) / 2)
      size += data.width
      img.css({
        'max-width' : 'initial',
        opacity : data.galleryOpacity,
        width: data.width,
        height: data.height
      })
    }

    const layout = SpriteSpin.Utils.getInnerLayout(data)
    data.galleryStage.css(layout).css({
      width: size
    })
    data.galleryImages[data.galleryFrame].animate({
      opacity : 1
    }, data.gallerySpeed)
  }

  function draw(e, data) {
    if (data.galleryFrame !== data.frame && !data.dragging) {
      data.galleryStage.stop(true, false)
      data.galleryStage.animate({
        left : data.galleryOffsets[data.frame]
      }, data.gallerySpeed)

      data.galleryImages[data.galleryFrame].animate({ opacity : data.galleryOpacity }, data.gallerySpeed)
      data.galleryFrame = data.frame
      data.galleryImages[data.galleryFrame].animate({ opacity : 1 }, data.gallerySpeed)
    } else if (data.dragging || data.dX !== data.gallerydX) {
      data.galleryDX = data.DX
      data.galleryDDX = data.DDX
      data.galleryStage.stop(true, true).animate({
        left : data.galleryOffsets[data.frame] + data.dX
      })
    }
  }

  SpriteSpin.registerPlugin(NAME, {
    name: NAME,
    onLoad: load,
    onDraw: draw
  })
})(SpriteSpin)
