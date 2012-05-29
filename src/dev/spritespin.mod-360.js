(function($, window) {
  
  var Module = window.SpriteSpin360 = {};
  window.SpriteSpin.modules["360"] = Module;
  
  Module.defaults = {};

  Module.initialize = function(data){
    imageElement = data.target.find("img");
    if (imageElement.length === 0){
      imageElement = $("<img src=''/>");
      data.target.append(imageElement);
    }
    
    var i;
    for (i = 1; i < data.fadeFrames; i ++){
    	data.target.append("<img src=''/>");
    }
    
    imageElements = data.target.find("img");
    imageElements.hide();    
  };
  
  Module.reload = function(data){
    
  };
  
  Module.draw = function(data){
    var image = data.image;
    var x = data.offsetX;
    var y = -data.offsetY;
    
    if (typeof(data.image) === "string"){ 
      var stepX = (data.frameStepX || data.width);
      var stepY = (data.frameStepY || data.height);
      var numFramesX = (data.framesX || data.frames);
      var frameX = (data.frame % numFramesX);
      var frameY = (data.frame / numFramesX)|0;
      x -= (frameX * stepX);
      y -= (frameY * stepY);
    } else {
      // we expect an array in this case
      image = data.image[data.frame];
    }
  
    var css = {};
    if (data.imageElement){
      css = {
        position   : "absolute",
        top        : "0px",
        left       : "0px"        
      };
      if (data.resolutionX && data.resolutionY){
        css.width = data.resolutionX;
        css.height = data.resolutionY;
      }
      instance.css({
        position   : "relative",
        top        : 0,
        left       : 0,
        width      : data.width,
        height     : data.height
      });

			if (data.imageElements.length === 1){
				data.imageElement.attr("src", image).css(css).show();
			} else {
				var max = data.imageElements.length - 1;
				var index = helper.wrapValue(data.imageIndex, 0, max);
				var prevIndex = helper.wrapValue(data.imageIndex + 1, 0, max);
				data.imageIndex = helper.wrapValue(data.imageIndex - 1, 0, max);
				
				if (data.fadeOutTime > 0){
					$(data.imageElements[prevIndex]).fadeOut(data.fadeOutTime);
				} else {
					$(data.imageElements[prevIndex]).hide();
				}
				
				if (data.fadeInTime > 0){
					$(data.imageElements[index]).attr("src", image).css(css).fadeIn(data.fadeInTime);
				} else {
					$(data.imageElements[index]).attr("src", image).css(css).show();
				}
			}
			
    } else {
      css = {
        width      : [data.width, "px"].join(""),
        height     : [data.height, "px"].join(""),
        "background-image"    : ["url('", image, "')"].join(""),
        "background-repeat"   : "repeat-x",
        "background-position" : [x, "px ", y, "px"].join("")
      };
      // Spritesheets may easily exceed the maximum image size for iphones.
      // In this case the browser will scale down the image automaticly and
      // this will break the logic how spritespin works.
      // Here we set the webkit css attribute to display the background in its
      // original dimension even if it has been scaled down.
      if (data.resolutionX && data.resolutionY) {
        css["-webkit-background-size"] = [data.resolutionX, "px ", data.resolutionY, "px"].join("");
      }
      instance.css(css);
    }
  };
  
}(jQuery, window));