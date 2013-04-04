(function($, window) {
  
  var Module = window.SpriteSpin.modules["360"] = {};
  
  Module.reload = function(data){
    var images = $(data.images);

    // clear the stage and refill with images
    data.stage.empty()

    // precalculate and cache options for this module
    data.modopts = {
      is_sprite : (data.images.length == 1),
      resX      : (data.resolutionX || data.images[0].width),
      resY      : (data.resolutionY || data.images[0].height),
      offX      : (data.offsetX || 0),
      offY      : (data.offsetY || 0),
      stepX     : (data.stepX || data.width),
      stepY     : (data.stepY || data.height),
      numFramesX: (data.framesX || data.frames),
      oldFrame  : data.frame,
      images    : images
    };

    if (!data.modopts.is_sprite && !data.canvas){
      data.stage.append(images);
    }

    images.css({
      width: data.modopts.resX,
      height: data.modopts.resY
    });

    Module.draw(data);
  };
  
  Module.draw = function(data){    
    if (data.modopts.is_sprite){
      Module.drawSpritesheet(data);
    } else{
      Module.drawImages(data);
    }
  };

  Module.drawSpritesheet = function(data){
    // Assumes all images are batched in a single sprite image

    var opts = data.modopts;
    var image = data.source[0];
    var frameX = (data.frame % opts.numFramesX);
    var frameY = (data.frame / opts.numFramesX)|0;
    var x = opts.offX + frameX * opts.stepX;
    var y = opts.offY + frameY * opts.stepY;

    if (data.canvas){
      data.context.clearRect(0, 0, data.width, data.height);
      data.context.drawImage(data.images[0], x, y, data.width, data.height, 0, 0, data.width, data.height);
      return;
    }

    data.stage.css({
      width      : [data.width, "px"].join(""),
      height     : [data.height, "px"].join(""),
      "background-image"    : ["url('", image, "')"].join(""),
      "background-repeat"   : "no-repeat",
      "background-position" : [-x, "px ", -y, "px"].join(""),
      // Spritesheets may easily exceed the maximum image size for iphones.
      // In this case the browser will scale down the image automaticly and
      // this will break the logic how spritespin works.
      // Here we set the webkit css attribute to display the background in its
      // original dimension even if it has been scaled down.
      "-webkit-background-size" : [opts.resX, "px ", opts.resY, "px"].join("")
    }); 
  };

  Module.drawImages = function(data){
    var img = data.images[data.frame];
    if (data.canvas){
      data.context.clearRect(0, 0, data.width, data.height);
      data.context.drawImage(img, 0, 0);
      return;
    }

    var frame = data.stage.css({
      width      : [data.width, "px"].join(""),
      height     : [data.height, "px"].join("")
    }).children().hide()[data.frame];
    SpriteSpin.disableSelection($(frame)).show();
  };

}(window.jQuery, window));