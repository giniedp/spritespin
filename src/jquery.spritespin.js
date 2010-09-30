(function($, undefined) {

  $.fn.spritespin = function(method) {
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if (typeof(method) === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.spritespin' );
    }
  };

  var methods = {
    init : function(options){
      // Default settings
      var settings = {
        // dimensions
        offsetX           : 0,                      // X offset where the frame image starts
        offsetY           : 0,                      // Y offset where the frame image starts
        width             : undefined,              // Window width (or frame width)
        height            : undefined,              // Window height (or frame height)
        frameStep         : undefined,              // Width of a single frame or step to the next frame
        frames            : 36,                     // Number of frames
        frame             : 0,                      // Initial frame number
        
        // animation & update
        animate           : false,                  // Run animation when after initialize
        loop              : false,                  // Repeat animation in a loop
        loopFrame         : 0,
        speed             : 36,                     // Time between updates
        reverse           : false,                  // If true animation is played backward

        // interaction
        slider            : undefined,              // jQuery-ui slider instance
        behavior          : "interactive",          // Enables mouse interaction
        
        // appearance               
        image             : "images/spritespin.jpg",// Stiched source image
        preloadText       : "Loading",              // Text to appear when images are preloaded
        preloadBackground : undefined,
        
        // events
        onFrameChange     : undefined,
        onLoad            : undefined
      }
      
      //extending options
      options = (options || {});
      $.extend(settings, options);
      
      return this.each(function(){
        var $this = $(this);
        var data  = $this.data('spritespin');
        
        if (!data){
          // Initialize the plugin if it hasn't been initialized yet
          //$this.disableSelection();
          $this.attr("unselectable", "on");
          $this.data('spritespin', {
            target    : $this,
            settings  : settings,
            animation : null,
            touchable : (/iphone|ipod|ipad|android/i).test(navigator.userAgent)
          });
          data = $this.data('spritespin');
          helper.reconfiger($this, data);
        } else {
          // reconfiger the plugin if it is already initialized
          $.extend(data.settings, options);
          helper.reconfiger($this, data);
        }
      });
    },
    destroy : function(){
      return this.each(function(){
        var $this = $(this);
        data = $this.data('spritespin');
        $this.unbind('.spritespin');
        $this.removeData('spritespin');
      });
    },
    // Starts or stops the animation depend on the animate paramter.
    // In case when animation is already running pass "false" to stop.
    // In case when animation is not running pass "true" to start.
    // To keep animation running forever pass "true" for the loop parameter.
    // To detect whether the animation is running or not, do not pass any
    // parameters.
    animate : function(animate, loop){
      if (animate == undefined){
        return $(this).data('spritespin').animation != null;
      } else {
        return this.each(function(){
          var $this = $(this);
          data = $this.data('spritespin');
          settings = data.settings;
          
          // check the loop variable and update settings
          if (typeof(loop) == "boolean"){
            settings.loop = loop;
          }
          
          // toggle and update animation settings
          if (animate == "toggle"){
            animate = !settings.animate
            settings.animate = animate;
          } else {
            settings.animate = animate;
          }
          
          if (animate && data.animation == null){
            // start animation
            data.animation = setInterval(
              function(){ 
                try {
                  helper.update(data); 
                } catch(err){
                  // The try catch block is a hack for Opera Browser
                }
              }, settings.speed);
          } else if (!animate && data.animation != null) {
            // stop animation
            clearInterval(data.animation);
            data.animation = null;
          }  
        });
      }
    },
    // Gets the current framenumber when no parameters are passed or
    // updates the player to the sepcified framenumber.
    frame : function(frame){
      if (frame == undefined){
        return $(this).data('spritespin').settings.frame;
      } else {
        return this.each(function(){
          helper.update($(this).data('spritespin'), frame);
        });        
      }
    },
    // Gets a value indication whether the animation is looped or not when
    // no parameters are passed. Otherwise sets the loop setting and starts
    // the animation when settings.animate is set to true
    loop : function(value){
      if (value == undefined){
        return $(this).data('spritespin').settings.loop;
      } else {
        return this.each(function(){
          var $this = $(this);
          data = $this.data('spritespin');
          methods.animate.apply($(this), [data.settings.animate, value]);
        }); 
      }
    },
  };
  
  var behavior = {
    none : {
      onStartDrag : function(e){
        return false;
      },
      onStopDrag : function(e){
        return false;
      },
      onDrag : function(e){
        return false;
      }
    },
    interactive : {
      onStartDrag : function(e){
        var $this = $(this), data = $this.data('spritespin');
        data.dragging = true;
        return false;
      },
      onStopDrag : function(e){
        var $this = $(this), data = $this.data('spritespin');
        data.oldMouseX = undefined;
        data.dragging = false;
        return false;
      },
      onDrag : function(e){
        var $this = $(this), data = $this.data('spritespin');
        
        if (data.dragging && data.oldMouseX != undefined){
          d = data.oldMouseX - e.pageX;
          frame = data.settings.frame + (d > 0 ? 1 : (d < 0 ? -1 : 0));
          if (d != 0) {
            helper.update(data, frame);
          }
          methods.animate.apply($(this), [false]); // stop animation
        }
        if (data.touchable){
          data.oldMouseX = e.touches[0].clientX;
          data.oldMouseY = e.touches[0].clientY;        
        } else {
          data.oldMouseX = e.pageX;
          data.oldMouseY = e.pageY;        
        }
      
        return false;
      }
    }
  };
  
  var helper = {
    reconfiger : function(instance, data){
      helper.blankBackground(instance, data);
      helper.preloadImages(instance, data, function(){
        helper.updateBackground(instance, data);
        helper.hookSlider(instance, data);
        helper.rebindEvents(instance, data);
        if (data.settings.animate){
          methods.animate.apply(instance, [data.settings.animate, data.settings.loop]);
        }
        instance.trigger("onLoad", data);
      });
    },
    wrapValue : function(value, min, max){
      while (value >= max){ 
        value -= max; 
      } 
      while (value < min){ 
        value += max; 
      }
      return value;
    },
    blankBackground : function(instance, data){
      image = "none";
      if (data.settings.preloadBackground != undefined){
        image = ["url('", data.settings.preloadBackground, "')"].join("");
      }
      instance.css({
        width      : [data.settings.width, "px"].join(""),
        height     : [data.settings.height, "px"].join(""),
        "background-image"    : image,
        "background-repeat"   : "repeat-x",
        "background-position" : "0px 0px"
      });
    },
    updateBackground : function(instance, data){
      var image = data.settings.image;
      var x = data.settings.offsetX;
      var y = -data.settings.offsetY;
      
      if (typeof(data.settings.image) == "string"){ 
        if (data.settings.frameWidth != undefined){
          x -= (data.settings.frame * data.settings.frameStep);
        } else {
          x -= (data.settings.frame * data.settings.width);
        }
      } else {
        image = data.settings.image[data.settings.frame];
      }

      instance.css({
        width      : [data.settings.width, "px"].join(""),
        height     : [data.settings.height, "px"].join(""),
        "background-image"    : ["url('", image, "')"].join(""),
        "background-repeat"   : "repeat-x",
        "background-position" : [x, "px ", y, "px"].join("")
      });
    },
    hookSlider : function(instance, data){
      if (data.settings.slider != undefined){
        data.settings.slider.slider({
          value   : data.settings.frame,
          min     : 0,
          max     : (data.settings.frames) - 1,
          step    : 1,
          slide   : function(event, ui) {
            methods.animate.apply(instance, [false]);    // stop animation
            methods.frame.apply(instance, [ui.value]);  // update to frame
          },
        }); 
      }
    },
    rebindEvents : function(instance, data){
      // unbind all events
      instance.unbind('.spritespin');
      
      if (data.touchable){
        // rebind touchable device events
        instance.bind('touchstart.spritespin',    behavior[data.settings.behavior].onStartDrag);
        instance.bind('touchend.spritespin',      behavior[data.settings.behavior].onStopDrag);
        instance.bind('touchcancel.spritespin',   behavior[data.settings.behavior].onStopDrag);
        instance.bind('touchmove.spritespin',     behavior[data.settings.behavior].onDrag);
      } else {
        // rebind mouse events
        instance.bind('mousedown.spritespin',  behavior[data.settings.behavior].onStartDrag);
        instance.bind('mouseup.spritespin',    behavior[data.settings.behavior].onStopDrag);
        instance.bind('mouseleave.spritespin', behavior[data.settings.behavior].onStopDrag);
        instance.bind('mousemove.spritespin',  behavior[data.settings.behavior].onDrag);
      }
      // disable selection
	    instance.bind("mousedown.spritespin selectstart.spritespin",
	    		function( event ) { event.preventDefault(); }
	    );
	    
	    instance.bind("onFrame.spritespin", function(event, data){
	      helper.updateBackground(data.target, data);
        
        // stop animation if we are back at frame 0
        if (data.settings.frame == data.settings.loopFrame && !data.settings.loop){
          methods.animate.apply(data.target, [false]);
        }
        
        // update the jquery-ui slider
        if (data.settings.slider != undefined){
          data.settings.slider.slider("value", data.settings.frame);
        }
	    });
	    
	    // bind custom events
	    if (data.settings.onFrame != undefined){
	      instance.bind("onFrame.spritespin", data.settings.onFrame);
	    }
	    
	    if (data.settings.onLoad != undefined){
	      instance.bind("onLoad.spritespin", data.settings.onLoad);
	    }
    },
    preloadImages : function(instance, data, callback) {
      var preload = $('<div class="preload"/>');
      if (instance.find(".preload").length == 0){
        instance.append(preload);
      }
      preload.html("Loading");
      
      var i = 0;
      var total = 1;
      var images = [data.settings.image];
      
      if (typeof(data.settings.image) == "object"){
        total = data.settings.image.length;
        images = data.settings.image;
      }
      
      imageObj = new Image();
      imageObj.onload = function(){
        instance.find(".preload").detach();
        callback.apply([instance, data]);
      }
      
      for(i = 0; i < total; i++){
        imageObj.src=images[i];
      }
    },
    // Updates a single frame to the specified frame number. If no value is 
    // given this will increment the current frame counter.
    // Triggers the onFrame event
    update : function(data, frame, reverse){
      settings = data.settings;
      settings.reverse = ((reverse != undefined) && reverse);
      
      // update frame counter
      if (frame == undefined){
        settings.frame = (settings.frame + (settings.reverse ? -1 : 1));
      } else {
        settings.frame = frame;
      }
      settings.frame = helper.wrapValue(settings.frame, 0, settings.frames);
      data.target.trigger("onFrame", data);
    },
  };
})(jQuery);
