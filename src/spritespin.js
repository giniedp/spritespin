(function () {
  var Loader = this.SpriteLoader = function(images, callback){
    if (typeof (images) === "string") { 
      images = [images]; 
    }
    
    this.callback = callback;
    this.numLoaded = 0;
    this.numErrors = 0;
    this.numAborts = 0;
    this.numProcessed = 0;
    this.numImages = images.length;
    this.images = [];
    var i = 0;
    for (i = 0; i < images.length; i += 1 ) {
      this.load(images[i]); 
    }
  };
  Loader.prototype.load = function(imageSource){
    var image = new Image();
    this.images.push(image);
    image.loader = this;
    image.onload = function(){
      this.loader.numLoaded += 1;
      this.loader.numProcessed += 1;
      if (this.loader.numProcessed === this.loader.numImages) { 
        this.loader.callback(this.loader); 
      }
    }; 
    
    image.onerror = function(){
      this.loader.numErrors += 1;
      this.loader.numProcessed += 1;
      if (this.loader.numProcessed === this.loader.numImages) { 
        this.loader.callback(this.loader); 
      }
    };
    
    image.onabort = function(){
      this.loader.numAborts += 1;
      this.loader.numProcessed += 1;
      if (this.loader.numProcessed === this.loader.numImages) { 
        this.loader.callback(this.loader); 
      }
    };
    image.src = imageSource;
  };
}());

(function($, window) {

  var Spin = window.SpriteSpin = {};
  
  Spin.modules = {};
  Spin.behaviors = {};
  var api = Spin.api = {};
	  
  Spin.updateInput = function(e, data){
    if (e.touches === undefined && e.originalEvent !== undefined){
      // jQuery Event normalization does not preserve the 'event.touches'
      // try to grab touches from the original event
      e.touches = e.originalEvent.touches;
    }
    
    data.oldX = data.currentX;
    data.oldY = data.currentY;
    
    if (e.touches !== undefined && e.touches.length > 0){
      data.currentX = e.touches[0].clientX;
      data.currentY = e.touches[0].clientY;
    } else {
      data.currentX = e.clientX;
      data.currentY = e.clientY;
    }
    
    if (data.startX === undefined || data.startY === undefined){
      data.startX = data.currentX;
      data.startY = data.currentY;
      data.clickframe = data.frame;
    }
    
    if (data.oldX === undefined || data.oldY === undefined){
      data.oldX = data.currentX;
      data.oldY = data.currentY;
    }
    
    // total drag distance
    data.dX = data.currentX - data.startX;
    data.dY = data.currentY - data.startY;
    data.dW = data.dX * data.dragDirX + data.dY * data.dragDirY;
    
    // frame drag distance
    data.ddX = data.currentX - data.oldX;
    data.ddY = data.currentY - data.oldY;
    data.ddW = data.ddX * data.dragDirX + data.ddY * data.dragDirY;
    
    return false;
  };
  
  Spin.resetInput = function(data){
    // initial touch or click position
    data.startX = undefined;
    data.startY = undefined;
    // touch or click position in current frame
    data.currentX = undefined;
    data.currentY = undefined;
    // touch or click position in last frame
    data.oldX = undefined;
    data.oldY = undefined;
    // total drag distance, respecting the start position
    data.dX = 0;
    data.dY = 0;
    data.dW = 0;
    // total drag distance, respecting the last frame position
    data.ddX = 0;
    data.ddY = 0;
    data.ddW = 0;
    
    if (typeof(data.module.resetInput) === "function"){
      data.module.resetInput(data);
    }
  };
  
  Spin.clamp = function(value, min, max){ 
    return (value > max ? max : (value < min ? min : value));
  };
  
  Spin.wrap = function(value, min, max){
    while (value > max){ value -= max; } 
    while (value < min){ value += max; }
    return value;
  };
  
  Spin.reload = function(data, andInit){
    if (andInit){
      data.module.initialize(data);
    }
    
    Spin.prepareBackground(data);
    Spin.preloadImages(data, function(){
      Spin.rebindEvents(data);
      data.module.reload(data);
      data.target.trigger("onLoad", data);
    });
  };
  
  Spin.preloadImages = function(data, callback) {
    data.preload.fadeIn(250, function(){
      new SpriteLoader(data.image, function(){
        data.preload.fadeOut(250);
        data.stage.show();
        callback.apply(data.target, [data]);
      });
    });
  };
  
  Spin.prepareBackground = function(data){
    var w = [data.width, "px"].join("");
    var h = [data.height, "px"].join("");
    
    data.target.css({ 
      width    : w, 
      height   : h,
      position : "relative"
    });
    
    var css = {
      width    : w, 
      height   : h,
      top      : "0px", 
      left     : "0px",
      position : "absolute"  
    };
    $.extend(css, data.preloadCSS || {});
    data.preload.hide().css(css).html(data.preloadHtml || "");
    
    data.stage.hide().css({
      width    : w, 
      height   : h,
      top      : "0px", 
      left     : "0px",
      position : "absolute"
    });
  };
  
  Spin.draw = function(data){
    data.module.draw(data);
  };
  
  Spin.rebindEvents = function(data){
    var target = data.target;
    // unbind all events
    target.unbind('.spritespin');
  
    // use custom or build in behavior
    var currentBehavior = data.behavior;
    if (typeof(data.behavior) === "string"){
      currentBehavior = Spin.behaviors[data.behavior];
    }
    
    var prevent = function(e){
      if (e.cancelable){
        e.preventDefault();
      }
      return false;
    };
    
    // rebind interaction events
    target.bind('mousedown.spritespin',  currentBehavior.mousedown);
    target.bind('mousemove.spritespin',  currentBehavior.mousemove);
    target.bind('mouseup.spritespin',    currentBehavior.mouseup);
    target.bind('mouseenter.spritespin', currentBehavior.mouseenter);
    target.bind('mouseover.spritespin',  currentBehavior.mouseover);
    target.bind('mouseleave.spritespin', currentBehavior.mouseleave);
    target.bind('dblclick.spritespin',   currentBehavior.dblclick);
    target.bind('onFrame.spritespin',    currentBehavior.onFrame);
  
    if (data.touchable){
      target.bind('touchstart.spritespin',  currentBehavior.mousedown);
      target.bind('touchmove.spritespin',   currentBehavior.mousemove);
      target.bind('touchend.spritespin',    currentBehavior.mouseup); 
      target.bind('touchcancel.spritespin', currentBehavior.mouseleave);
      target.bind('click.spritespin',         prevent); 
      target.bind('gesturestart.spritespin',  prevent); 
      target.bind('gesturechange.spritespin', prevent); 
      target.bind('gestureend.spritespin',    prevent); 
    }
            
    // disable selection
	  target.bind("mousedown.spritespin selectstart.spritespin", prevent);
	  
	  target.bind("onFrame.spritespin", function(event, data){
	    Spin.draw(data);
	  });
	  
	  // bind custom events
	  if (typeof(data.onFrame) === "function"){
	    target.bind("onFrame.spritespin", data.onFrame);
	  }
	  if (typeof(data.onLoad) === "function"){
	    target.bind("onLoad.spritespin", data.onLoad);
	  }
  };
	
  $.fn.spritespin = function(method) {
    if ( api[method] ) {
      return api[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    }
    if (typeof(method) === 'object' || !method) {
      return api.init.apply(this, arguments);
    }
    $.error( 'Method ' +  method + ' does not exist on jQuery.spritespin' );
  };


	api.init = function(options){
    // Default settings
    var settings = {
      // dimensions
      width             : undefined,              // Window width (or frame width)
      height            : undefined,              // Window height (or frame height)
      //offsetX           : 0,                      // Offset in X direction from the left image border to the first frames left border
      //offsetY           : 0,                      // Offset in Y direction from the top image border to the first frames top border
      //frameStepX        : undefined,              // Distance in X direction to the next frame if it differs from window width 
      //frameStepY        : undefined,              // Distance in Y direction to the next frame if it differs from window height
      //frameStep         : undefined,              // Width of a single frame or step to the next frame
      //framesX           : undefined,              // Number of frames in a single row
      frames            : 36,                     // Total number of frames
      frame             : 0,                      // Initial frame number
      //resolutionX       : undefined,              // The spritesheet resolution in X direction
      //resolutionY       : undefined,              // The spritesheet resolution in Y direction
      
      // animation & update
      animate           : true,                   // Run animation when after initialize
      loop              : false,                  // Repeat animation in a loop
      loopFrame         : 0,                      // Indicates the loop start frame
      frameTime         : 36,                     // Time between updates
      reverse           : false,                  // If true animation is played backward
      sense             : 1,                      // Interaction sensitivity used by behavior implementations
      orientation       : "horizontal",
      
      // interaction
      //behavior          : "drag",                 // Enables mouse interaction
      
      // appearance               
      image             : undefined,              // Stiched source image
      preloadHtml       : " ",                    // Html to appear when images are preloaded
      preloadBackground : undefined,              // Background image to display on load
      preloadCSS        : undefined,
			fadeFrames        : 0,                      // Enables and disables smooth transitions between frames
			fadeInTime        : 0,                      // 
			fadeOutTime       : 120,                    // 
      
      // events
      onFrame           : undefined,              // Occurs whe frame has been updated
      onLoad            : undefined,              // Occurs when images are loaded
      touchable         : undefined              // Tells spritespin that it is running on a touchable device
    };
    
    // extending options
    options = (options || {});
    $.extend(settings, options);
    
    return this.each(function(){
      var $this = $(this);
      var data  = $this.data('spritespin');
      
      if (!data){
        // spritespin is not initialized
        
        var images = $this.find("img");
        var i = 0;
        if (images.length > 0){
          settings.image = [];
          for(i = 0; i < images.length; i += 1){
            settings.image.push($(images[i]).attr("src"));
          }
        }
        
        // disable selection & hide overflow
        $this.attr("unselectable", "on").css({ 
          overflow : "hidden", 
          position : "relative"
        }).html("");
        
        // build inner html
        $this.html("");
        $this.append($("<div class='spritespin-stage'/>"));
        $this.append($("<div class='spritespin-preload'/>"));
                
        // resolve module
        if (typeof(settings.module) === "string"){
          settings.module = SpriteSpin.modules[settings.module];
        }
        if (!settings.module){
          settings.module = SpriteSpin360;
        }
        
        // build data
        settings.target = $this;
        settings.stage = $this.find(".spritespin-stage");
        settings.preload = $this.find(".spritespin-preload");
        settings.animation = null;
        settings.touchable =(settings.touchable || (/iphone|ipod|ipad|android/i).test(window.navigator.userAgent));
        
        $this.data('spritespin', settings);
        SpriteSpin.reload(settings, true);
      } else {
        // spritespin is initialized.
        $.extend(data, options);

        if (options.image){
          // when images are passed, need to reload the plugin
          SpriteSpin.reload(data);
        } else {
          // otherwise just reanimate spritespin
          $this.spritespin("animate", data.animate, data.loop);
        }
      }
    });
  };
  
	api.destroy = function(){
    return this.each(function(){
      var $this = $(this);
      $this.unbind('.spritespin');
      $this.removeData('spritespin');
    });
  };

  // Updates a single frame to the specified frame number. If no value is 
  // given this will increment the current frame counter.
  // Triggers the onFrame event
  api.update = function(frame, reverse){
    return this.each(function(){
      var $this = $(this);
      var data = $this.data('spritespin');
      
      if (typeof(reverse) === "boolean"){
        data.reverse = reverse;
      }
      
      // update frame counter
      if (frame === undefined){
        data.frame = (data.frame + (data.reverse ? -1 : 1));
      } else {
        data.frame = frame;
      }
      
      // wrap value to fit in range [0, data.frames]
      if (data.loop || (data.animation !== null)){
        data.frame = Spin.wrap(data.frame, 0, data.frames - 1);
      } else {
        data.frame = Spin.clamp(data.frame, 0, data.frames - 1);
      }

      // stop animation if the loopFrame is reached
      if (!data.loop && (data.animation !== null) && (data.frame === data.loopFrame)){
        api.animate.apply(data.target, [false]);
      }
      
      data.target.trigger("onFrame", data);
    });
  };

  // Starts or stops the animation depend on the animate paramter.
  // In case when animation is already running pass "false" to stop.
  // In case when animation is not running pass "true" to start.
  // To keep animation running forever pass "true" for the loop parameter.
  // To detect whether the animation is running or not, do not pass any
  // parameters.
  api.animate = function(animate, loop){
    if (animate === undefined){
      return $(this).data('spritespin').animation !== null;
    } 
    return this.each(function(){
      var $this = $(this);
      var data = $this.data('spritespin');
      
      // check the loop variable and update settings
      if (typeof(loop) === "boolean"){
        data.loop = loop;
      }
      // toggle and update animation settings
      if (animate === "toggle"){
        data.animate = !data.animate;
      }
      //
      if (typeof(animate) === "boolean"){
        data.animate = animate;
      }
      // stop the running animation
      if (data.animation !== null){
        window.clearInterval(data.animation);
        data.animation = null;
      }
      // start animation
      if (data.animate){
        data.animation = window.setInterval(function(){ 
          try { 
            $this.spritespin("update"); 
          } catch(err){
            // The try catch block is a hack for Opera Browser
          }
        }, data.frameTime);
      }  
    });
  };

  // Gets the current framenumber when no parameter is passed or
  // updates the spinner to the sepcified frame.
  api.frame = function(frame){
    if (frame === undefined){
      return $(this).data('spritespin').frame;
    }
    return this.each(function(){
      $(this).spritespin("update", frame);
    });        
  };

  // Gets or sets a value indicating whether the animation is looped or not.
  // Starts the animation when settings.animate is set to true passed value
  // is defined
  api.loop = function(value){
    if (value === undefined){
      return $(this).data('spritespin').loop;
    }
    return this.each(function(){
      var $this = $(this);
      $this.spritespin("animate", $this.data('spritespin').animate, value);
    }); 
  };

  api.next = function(){
    return this.each(function(){
      var $this = $(this);
      var data = $this.data('spritespin');
      $this.spritespin("frame", data.frame + (data.reverse ? -1 : 1));
    }); 
  };
  
  api.prev = function(){
    return this.each(function(){
      var $this = $(this);
      var data = $this.data('spritespin');
      $this.spritespin("frame", data.frame - (data.reverse ? -1 : 1));
    });
  };
  
  Spin.behaviors.none = {
    name : "none",
    mousedown  : function(e){ return false; },
    mousemove  : function(e){ return false; },
    mouseup    : function(e){ return false; },
    
    mouseenter : function(e){ return false; },
    mouseover  : function(e){ return false; },
    mouseleave : function(e){ return false; },
    dblclick   : function(e){ return false; },
    
    onFrame : function(e, frame){ return false; }
  };
  
}(jQuery, window));

(function () {
  var Loader = this.SpriteLoader = function(images, callback){
    if (typeof (images) === "string") { 
      images = [images]; 
    }
    
    this.callback = callback;
    this.numLoaded = 0;
    this.numErrors = 0;
    this.numAborts = 0;
    this.numProcessed = 0;
    this.numImages = images.length;
    this.images = [];
    var i = 0;
    for (i = 0; i < images.length; i += 1 ) {
      this.load(images[i]); 
    }
  };
  Loader.prototype.load = function(imageSource){
    var image = new Image();
    this.images.push(image);
    image.loader = this;
    image.onload = function(){
      this.loader.numLoaded += 1;
      this.loader.numProcessed += 1;
      if (this.loader.numProcessed === this.loader.numImages) { 
        this.loader.callback(this.loader); 
      }
    }; 
    
    image.onerror = function(){
      this.loader.numErrors += 1;
      this.loader.numProcessed += 1;
      if (this.loader.numProcessed === this.loader.numImages) { 
        this.loader.callback(this.loader); 
      }
    };
    
    image.onabort = function(){
      this.loader.numAborts += 1;
      this.loader.numProcessed += 1;
      if (this.loader.numProcessed === this.loader.numImages) { 
        this.loader.callback(this.loader); 
      }
    };
    image.src = imageSource;
  };
}());

(function($, window, Spin){
  Spin.behaviors.click = {
    name : "click",
    mousedown  : function(e){ return false; },
    mousemove  : function(e){ return false; },
    mouseup    : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.updateInput(e, data);
      if (data.currentX > data.width / 2){
        $this.spritespin("frame", data.frame + 1);
      } else {
        $this.spritespin("frame", data.frame - 1);
      }
    },
    
    mouseenter : function(e){ return false; },
    mouseover  : function(e){ return false; },
    mouseleave : function(e){ return false; },
    dblclick   : function(e){ return false; },
    
    onFrame : function(e, frame){ return false; }
  };
})(jQuery, window, window.SpriteSpin);

(function($, window, Spin){
  Spin.behaviors.drag = {
    name : "drag",
    mousedown  : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.updateInput(e, data);
      data.onDrag = true;
      return false; 
    },
    mousemove  : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      if (data.onDrag){
        Spin.updateInput(e, data);
        var d = data.dX / data.width;
        var dFrame = d * data.frames * data.sense;
        var frame = Math.round(data.clickframe + dFrame);
        
        api.update.apply($this, [frame]);   // update to frame
        api.animate.apply($this, [false]);  // stop animation
      }
      return false; 
    },
    mouseup    : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.resetInput(data);
      data.onDrag = false;
      return false; 
    },
    
    mouseenter : function(e){ return false; },
    mouseover  : function(e){ return false; },
    mouseleave : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.resetInput(data);
      data.onDrag = false;
      return false; 
    },
    dblclick   : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      $this.spritespin("animate", "toggle");
      return false; 
    },
    onFrame : function(e, frame){ 
      return false; 
    }
  };  
})(jQuery, window, window.SpriteSpin);

(function($, window, Spin){
  Spin.behaviors.spin = {
    name : "spin",
    mousedown  : function(e){
      var $this = $(this), data = $this.data('spritespin');
      Spin.updateInput(e, data);
      data.onDrag = true;
      return false; 
    },
    mousemove  : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      if (data.onDrag){
        // perform default drag behavior
        Spin.updateInput(e, data);
        var d = data.dX / data.width;
        var dFrame = d * data.frames * data.sense;
        var frame = Math.round(data.clickframe + dFrame);
        
        api.update.apply($this, [frame]);     // update to frame
        api.animate.apply($this, [false]);    // stop animation
        
        // calculate framtetime for spinwheel
        if (data.ddX !== 0){
          d = data.ddX / data.width;
          dFrame = d * data.frames * data.sense;
          data.frameTime = (data.frameTime / dFrame);
          data.reverse = (data.ddX < 0);
        }
      }
      return false;  
    },
    mouseup    : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      if (data.onDrag){
        data.onDrag = false;
        $this.spritespin("animate", true);
      }
      return false; 
    },
  
    mouseenter : function(e){ return false; },
    mouseover  : function(e){ return false; },
    mouseleave : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      if (data.onDrag){
        data.onDrag = false;
        $this.spritespin("animate", $this.spritespin("animate"));
      }
      return false; 
    },
    dblclick   : function(e){ 
      $(this).spritespin("animate", "toggle");
      return false; 
    },
    onFrame : function(e, data){
      if (data.ddX !== 0){
        data.frameTime = data.frameTime + 1;
      
        $(this).spritespin("animate", false);
        if (data.frameTime < 62){
          $(this).spritespin("animate", true);
        }  
      } else {
        $(this).spritespin("animate", false);
      }
      return false; 
    }
  };
})(jQuery, window, window.SpriteSpin);

(function($, window, Spin){
  Spin.behaviors.swipe = {
    name : "swipe",
    mousedown  : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.updateInput(e, data);
      data.onDrag = true;
      return false; 
    },
    mousemove  : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      if (data.onDrag){
        Spin.updateInput(e, data);
        
        var frame = data.frame;
        
        if (data.dX > data.width * 0.25){
          frame = data.frame - 1;       
          data.onDrag = false;
        }
        if (data.dX < -data.width * 0.25){
          frame = data.frame + 1;
          data.onDrag = false;
        }
        
        $this.spritespin("update", frame);  // update to frame
        $this.spritespin("animate", false); // stop animation
      }
      return false; 
    },
    mouseup    : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      data.onDrag = false;
      Spin.resetInput(data);
      return false; 
    },
    
    mouseenter : function(e){ return false; },
    mouseover  : function(e){ return false; },
    mouseleave : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      data.onDrag = false;
      Spin.resetInput(data);
      return false; 
    },
    dblclick   : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      $this.spritespin("animate", "toggle");
      return false; 
    },
    onFrame : function(e, frame){ 
      return false; 
    }
  };  
})(jQuery, window, window.SpriteSpin);

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
    } else {
      //console.log(data.dX);
      data.stage.css({
        "left" : data.offsets[data.frame] + data.dX
      });
    }
  };
  
  Module.resetInput = function(data){
    if (!data.onDrag){
      data.stage.animate({
        "left" : data.offsets[data.frame]
      });
    }
  };
}(jQuery, window));

(function($, window) {
  
  var Module = window.SpriteSpin360 = {};

  Module.defaults = {};
    
  Module.initialize = function(){
    
  };
  
  Module.reconfiger = function(){
    
  };
  
}(jQuery, window));

