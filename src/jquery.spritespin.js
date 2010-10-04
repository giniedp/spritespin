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
        animate           : true,                   // Run animation when after initialize
        loop              : false,                  // Repeat animation in a loop
        loopFrame         : 0,                      // Indicates the loop start frame
        frameTime         : 36,                     // Time between updates
        reverse           : false,                  // If true animation is played backward
        sense             : 1,                      // Interaction sensitivity used by behavior implementations
        
        // interaction
        slider            : undefined,              // jQuery-ui slider instance
        behavior          : "drag",                 // Enables mouse interaction
        
        // appearance               
        image             : "images/spritespin.jpg",// Stiched source image
        preloadText       : "Loading",              // Text to appear when images are preloaded
        preloadBackground : undefined,              // Background image to display on load
        
        // events
        onFrame           : undefined,              // Occurs whe frame has been updated
        onLoad            : undefined               // Occurs when images are loaded
      }
      
      //extending options
      options = (options || {});
      $.extend(settings, options);
      
      return this.each(function(){
        var $this = $(this);
        var data  = $this.data('spritespin');
        
        if (!data){
          // disable selection
          $this.attr("unselectable", "on");
          
          // Initialize the plugin if it hasn't been initialized yet
          $this.data('spritespin', {
            target    : $this,
            settings  : settings,
            animation : null,
            frameTime : settings.frameTime,
          });

          // run configuration
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
    // Updates a single frame to the specified frame number. If no value is 
    // given this will increment the current frame counter.
    // Triggers the onFrame event
    update : function(frame, reverse){
      return this.each(function(){
        var $this = $(this);
        data = $this.data('spritespin');
        settings = data.settings;
        
        if (reverse != undefined){
          settings.reverse = reverse;
        }
        
        // update frame counter
        if (frame == undefined){
          settings.frame = (settings.frame + (settings.reverse ? -1 : 1));
        } else {
          settings.frame = frame;
        }
        settings.frame = helper.wrapValue(settings.frame, 0, settings.frames);
        data.target.trigger("onFrame", data);
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
                  methods.update.apply($this, []); 
                } catch(err){
                  // The try catch block is a hack for Opera Browser
                }
              }, data.frameTime);
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
          methods.update.apply($(this), [frame]);
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
    updateBackground : function(instance){
      var data = instance.data("spritespin");
      var image = data.settings.image;
      var x = data.settings.offsetX;
      var y = -data.settings.offsetY;
      
      if (typeof(data.settings.image) == "string"){ 
        if (data.settings.frameStep != undefined){
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

      // rebind interaction events
      if (data.touchable){
        instance.bind('touchstart.spritespin',  behavior[data.settings.behavior].mousedown);
        instance.bind('touchmove.spritespin',   behavior[data.settings.behavior].mousemove);
        instance.bind('touchend.spritespin',    behavior[data.settings.behavior].mouseup); 
        instance.bind('touchcancel.spritespin', behavior[data.settings.behavior].mouseleave);
        instance.bind('click.spritespin',         behavior.prevent); 
        instance.bind('gesturestart.spritespin',  behavior.prevent); 
        instance.bind('gesturechange.spritespin', behavior.prevent); 
        instance.bind('gestureend.spritespin',    behavior.prevent); 
      }
      instance.bind('mousedown.spritespin',  behavior[data.settings.behavior].mousedown);
      instance.bind('mousemove.spritespin',  behavior[data.settings.behavior].mousemove);
      instance.bind('mouseup.spritespin',    behavior[data.settings.behavior].mouseup);
      instance.bind('mouseenter.spritespin', behavior[data.settings.behavior].mouseenter);
      instance.bind('mouseover.spritespin',  behavior[data.settings.behavior].mouseover);
      instance.bind('mouseleave.spritespin', behavior[data.settings.behavior].mouseleave);
      instance.bind('dblclick.spritespin',   behavior[data.settings.behavior].dblclick);
      instance.bind('onFrame.spritespin',    behavior[data.settings.behavior].onFrame);
        
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
      
      for(i = 0; i < total; i++){
        if (i == (total - 1)){
          imageObj.onload = function(){
            instance.find(".preload").detach();
            callback.apply([instance, data]);
          }
        }
        imageObj.src=images[i];
      }
    },
  };
  
  
  var behavior = {
    prevent : function(e){
      e.cancelable && e.preventDefault();
      return false;
    },
    
    helper : {
      storePoints : function(e, data){
        data.oldX = data.currentX;
        data.oldY = data.currentY;
        
        if (e.touches != undefined && e.touches.length > 0){
          data.currentX = e.touches[0].clientX;
          data.currentY = e.touches[0].clientY;
        } else {
          data.currentX = e.clientX;
          data.currentY = e.clientY;
        }
        
        if (data.startX == undefined || data.startY == undefined){
          data.startX = data.currentX;
          data.startY = data.currentY;
          data.clickframe = data.settings.frame;
        }
        
        if (data.oldX == undefined || data.oldY == undefined){
          data.oldX = data.currentX;
          data.oldY = data.currentY;
        }
        
        data.dX = data.currentX - data.startX;
        data.dY = data.currentY - data.startY;
        
        data.ddX = data.currentX - data.oldX;
        data.ddY = data.currentY - data.oldY;
        return false;
      },
      resetPoints : function(e, data){
        data.startX = undefined;
        data.startY = undefined;
        data.currentX = undefined;
        data.currentY = undefined;
        data.oldX = undefined;
        data.oldY = undefined;
        data.dX = 0;
        data.dY = 0;
        data.ddX = 0;
        data.ddY = 0;
      },
      clamp : function(value, min, max){ 
        return (value > max ? max : (value < min ? min : value));
      }
    },
    
    none : {
      mousedown  : function(e){ return false; },
      mousemove  : function(e){ return false; },
      mouseup    : function(e){ return false; },
      
      mouseenter : function(e){ return false; },
      mouseover  : function(e){ return false; },
      mouseleave : function(e){ return false; },
      dblclick   : function(e){ return false; },
      
      onFrame : function(e, frame){ return false; }
    },
    spin : {
      mousedown  : function(e){
        var $this = $(this), data = $this.data('spritespin');
        behavior.helper.storePoints(e, data);
        data.onDrag = true;
        return false; 
      },
      mousemove  : function(e){ 
        var $this = $(this), data = $this.data('spritespin');
        if (data.onDrag){
          // perform default drag behavior
          behavior.helper.storePoints(e, data);
          d = data.dX / data.settings.width;
          dFrame = d * data.settings.frames * data.settings.sense;
          frame = Math.round(data.clickframe + dFrame);
          
          methods.update.apply($this, [frame]);     // update to frame
          methods.animate.apply($this, [false]);    // stop animation
          
          // calculate framtetime for spinwheel
          if (data.ddX != 0){
            d = data.ddX / data.settings.width;
            dFrame = d * data.settings.frames * data.settings.sense;
            data.frameTime = (data.settings.frameTime / dFrame);
            data.settings.reverse = (data.ddX < 0);
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
        if (data.ddX != 0){
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
    },
    drag : {
      mousedown  : function(e){ 
        var $this = $(this), data = $this.data('spritespin');
        behavior.helper.storePoints(e, data);
        data.onDrag = true;
        data.cachedAnimate = $this.spritespin("animate");
        return false; 
      },
      mousemove  : function(e){ 
        var $this = $(this), data = $this.data('spritespin');
        if (data.onDrag){
          behavior.helper.storePoints(e, data);
          d = data.dX / data.settings.width;
          dFrame = d * data.settings.frames * data.settings.sense;
          frame = Math.round(data.clickframe + dFrame);
          
          methods.update.apply($this, [frame]);     // update to frame
          methods.animate.apply($(this), [false]);  // stop animation
        }
        return false; 
      },
      mouseup    : function(e){ 
        var $this = $(this), data = $this.data('spritespin');
        behavior.helper.resetPoints(e, data);
        data.onDrag = false;
        methods.animate.apply($(this), [data.cachedAnimate]);
        return false; 
      },
      
      mouseenter : function(e){ return false; },
      mouseover  : function(e){ return false; },
      mouseleave : function(e){ 
        var $this = $(this), data = $this.data('spritespin');
        behavior.helper.resetPoints(e, data);
        data.onDrag = false;
        methods.animate.apply($(this), [data.cachedAnimate]);
        return false; 
      },
      dblclick   : function(e){ 
        var $this = $(this), data = $this.data('spritespin');
        $this.spritespin("animate", "toggle");
        data.cachedAnimate = $this.spritespin("animate");
        return false; 
      },
      onFrame : function(e, frame){ return false; }
    },
  };
})(jQuery);
