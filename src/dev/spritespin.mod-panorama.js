(function($, window) {
  
  var Module = window.SpriteSpinPanorama = {};
  window.SpriteSpin.modules["panorama"] = Module;
  
  Module.defaults = {};

  Module.reload = function(data){
    data.stage.empty();             // clear the stage
    var opts = data.modopts = {};   // precalculate and cache options for this module
    opts.resX = (data.resolutionX || data.images[0].width);
    opts.resY = (data.resolutionY || data.images[0].height);
    opts.frames = (data.frames || opts.resX);
    Module.draw(data);
  };
  
  Module.draw = function(data){      
    var opts = data.modopts;
    var x = (data.frame % opts.frames);
    var y = 0;
    data.stage.css({
      width      : [data.width, "px"].join(""),
      height     : [data.height, "px"].join(""),
      "background-image"        : ["url('", data.source[0], "')"].join(""),
      "background-repeat"       : "repeat-x",
      "background-position"     : [-x, "px ", -y, "px"].join(""),
      "-webkit-background-size" : [opts.resX, "px ", opts.resY, "px"].join("")
    });
  };
  
}(window.jQuery, window));