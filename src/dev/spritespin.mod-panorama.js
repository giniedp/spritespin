(function($, window) {  
  var Module = window.SpriteSpin.modules.panorama = {};

  Module.reload = function(data){
    data.stage.empty();             // clear the stage
    var opts = data.modopts = {};   // precalculate and cache options for this module
    opts.resX = (data.resolutionX || data.images[0].width);
    opts.resY = (data.resolutionY || data.images[0].height);
    if (data.orientation == "horizontal"){
      opts.frames = (data.frames || opts.resX);
    } else {
      opts.frames = (data.frames || opts.resY);
    }
    
    Module.drawFirst(data);
  };
  
  // The function was stripped to do only necessary CSS updates
  Module.draw = function(data){      
    var opts = data.modopts;
    var x, y;
       
    if (data.orientation == "horizontal"){
      x = (data.frame % opts.frames);
      y = 0;      
    } else {
      x = 0;
      y = (data.frame % opts.frames);
    }
    data.stage.css({
      "background-position"     : [-x, "px ", -y, "px"].join("")
    });
  };
  
   // Renamed original draw function which is called only once at Load/Reload
  Module.drawFirst = function(data){      
    var opts = data.modopts;
    var x, y;

    if (data.orientation == "horizontal"){
      x = (data.frame % opts.frames);
      y = 0;      
    } else {
      x = 0;
      y = (data.frame % opts.frames);
    }
    data.stage.css({
      width      : [data.width, "px"].join(""),
      height     : [data.height, "px"].join(""),
      "background-image"        : ["url('", data.source[0], "')"].join(""),
      "background-repeat"       : "repeat-both",
      "background-position"     : [-x, "px ", -y, "px"].join(""),
      "-webkit-background-size" : [opts.resX, "px ", opts.resY, "px"].join("")
    });
  };
  
}(window.jQuery, window));