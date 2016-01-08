(function ($, SpriteSpin) {
  "use strict";

  function load(e, data){
    data.galleryImages = [];
    data.galleryOffsets = [];
    data.gallerySpeed = 500;
    data.galleryOpacity = 0.25;
    data.galleryFrame = 0;
    data.galleryStage = data.galleryStage || $('<div/>');
    data.stage.prepend(data.galleryStage);
    data.galleryStage.empty();

    var size = 0, i;
    for(i = 0; i < data.source.length; i+= 1){
      var img = $("<img src='" + data.source[i] + "'/>");
      data.galleryStage.append(img);
      data.galleryImages.push(img);
      var scale = data.height / img[0].height;
      data.galleryOffsets.push(-size + (data.width - img[0].width * scale) / 2);
      size += data.width;
      img.css({
        "max-width" : 'initial',
        opacity : data.galleryOpacity,
        width: data.width,
        height: data.height
      });
    }
    var css = SpriteSpin.calculateInnerLayout(data);
    data.galleryStage.css(css).css({
      width: size
    });
    data.galleryImages[data.galleryFrame].animate({
      opacity : 1
    }, data.gallerySpeed);
  }

  function draw(e, data){
    if (data.galleryFrame !== data.frame && !data.dragging){
      data.galleryStage.stop(true, false);
      data.galleryStage.animate({
        "left" : data.galleryOffsets[data.frame]
      }, data.gallerySpeed);

      data.galleryImages[data.galleryFrame].animate({ opacity : data.galleryOpacity }, data.gallerySpeed);
      data.galleryFrame = data.frame;
      data.galleryImages[data.galleryFrame].animate({ opacity : 1 }, data.gallerySpeed);
    } else if (data.dragging || data.dX != data.gallerydX) {
      data.galleryDX = data.DX;
      data.galleryDDX = data.DDX;
      data.galleryStage.stop(true, true).animate({
        "left" : data.galleryOffsets[data.frame] + data.dX
      });
    }
  }

  SpriteSpin.registerModule('gallery', {
    onLoad: load,
    onDraw: draw
  });
}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));