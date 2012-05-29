(function($, window) {
  
  var Module = window.SpriteSpin.modules["gallery"] = {};
  
  Module.defaults = {};

  Module.initialize = function(data){

  };
  
  Module.reload = function(data){
    data.images = [];
    data.offsets = [];
    data.stage.empty();
    data.speed = 500;
    data.opacity = 0.25;
    data.oldFrame = 0;
    
    var size = 0;
    for(var i = 0; i < data.image.length; i+= 1){
      var img = $("<img src='" + data.image[i] + "'/>");
      data.stage.append(img);
      data.images.push(img);
      data.offsets.push(-size + (data.width - img[0].width) / 2);
      size += img[0].width;
      
      img.css({ opacity : 0.25 });
    }
    data.stage.css({ width : size });
    data.images[data.oldFrame].animate({ opacity : 1 }, data.speed);
  };
  
  Module.draw = function(data){
    if ((data.oldFrame != data.frame) && data.offsets){
      data.stage.stop(true, false);
      data.stage.animate({ 
        "left" : data.offsets[data.frame]
      }, data.speed);
      
      data.images[data.oldFrame].animate({ opacity : data.opacity }, data.speed);
      data.oldFrame = data.frame;
      data.images[data.oldFrame].animate({ opacity : 1 }, data.speed);
    }
  };
  
}(jQuery, window));