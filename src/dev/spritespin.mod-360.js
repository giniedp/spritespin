(function($, window) {
  
  var Module = window.SpriteSpin.modules["360"] = {};
  
  Module.reload = function(data){
    // clear the stage
    data.stage.empty();
    // precalculate and cache options for this module
    data.modopts = {
      gridsheet : (data.images.length == 1),
      resX      : (data.resolutionX || data.images[0].width),
      resY      : (data.resolutionY || data.images[0].height),
      offX      : (data.offsetX || 0),
      offY      : (data.offsetY || 0),
      stepX     : (data.stepX || data.width),
      stepY     : (data.stepY || data.height),
      numFramesX: (data.framesX || data.frames),
      oldFrame  : data.frame
    };

    Module.draw(data);
  };
  
  Module.draw = function(data){      
    var opts = data.modopts;
    if (!opts.gridsheet){
      if (data.canvas){
        data.context.drawImage(data.images[data.frame], 0, 0);
      } else {
        data.stage.css({
          width      : [data.width, "px"].join(""),
          height     : [data.height, "px"].join(""),
          "background-image"    : ["url('", data.source[data.frame], "')"].join(""),
          "background-repeat"   : "no-repeat",
          "-webkit-background-size" : [opts.resX, "px ", opts.resY, "px"].join("")
        });
      }
    } else {
      var image = data.source[0];
      var frameX = (data.frame % opts.numFramesX);
      var frameY = (data.frame / opts.numFramesX)|0;
      var x = opts.offX + frameX * opts.stepX;
      var y = opts.offY + frameY * opts.stepY;

      if (data.canvas){
        data.context.drawImage(data.images[0], x, y, data.width, data.height, 0, 0, data.width, data.height);
      } else {
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
      }
    }
  };
  
}(window.jQuery, window));