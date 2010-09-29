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
        width          : 640,                    // Width of a single frame
        height         : 480,                    // Height of a single frame
        offsetX        : 0,                      // Position offset in x direction
        offsetY        : 0,                      // Position offset in y direction
        frames         : 36,                     // Number of frames
        frame          : 0,                      // Initial frame number
        animate        : false,                  // Run animation when after initialize
        loop           : false,                  // Repeat animation in a loop
        speed          : 36,                     // Time between updates
        reverse        : false,                  // If true animation is played backward
        image          : "images/spritespin.jpg",// Stiched source image
        onFrameChanged : undefined,              // Called when frame has changed
        onInitialized  : undefined,              // Called when plugin has been initialized
        slider         : undefined,              // jQuery-ui slider instance
        behavior       : "interactive",          // Enables mouse interaction
        preloadText    : "Loading",               // Text to appear when images are preloaded
        preloadBackground : "none"
      }
      
      //extending options
      options = (options || {});
      $.extend(settings, options);
      
      return this.each(function(){
        var $this = $(this);
        var data  = $this.data('spritespin');
        
        if (!data){
          // Initialize the plugin if it hasn't been initialized yet
          $(this).disableSelection();
          $(this).data('spritespin', {
            target    : $this,
            settings  : settings,
            animation : null,
            touchable : (/iphone|ipod|ipad|android/i).test(navigator.userAgent)
          });
          data = $this.data('spritespin');
          
          helper.reconfiger($this, data);
          
          if (data.settings.onInitialized != undefined){
            data.settings.onInitialized();
          }
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
    // Wraps the framecounter if it has exceeded the total number of frames. 
    // Positions the background image respecting the new frame value. 
    // Stops a running animation when necessary.
    update : function(frame, reverse){
      return this.each(function(){        
        var $this = $(this), 
        data = $this.data('spritespin'), 
        settings = data.settings;
        settings.reverse = ((reverse != undefined) && reverse);

        oldFrame = data.settings.frame;
        
        // update frame counter
        if (frame == undefined){
          settings.frame = (settings.frame + (settings.reverse ? -1 : 1));
        } else {
          settings.frame = frame;
        }
        
        if (oldFrame != settings.frame){
          settings.frame = helper.wrapValue(settings.frame, 0, settings.frames);
          helper.updateBackground($this, data);
          
          // stop animation if we are back at frame 0
          if (settings.frame == 0 && !settings.loop){
            methods.animate.apply($this, [false]);
          }
          
          // update the jquery-ui slider
          if (settings.slider != undefined){
            settings.slider.slider("value", settings.frame);
          }
          
          // callback to custom function
          if (settings.onFrameChanged != undefined){
            settings.onFrameChanged.apply($this, [settings.frame]);
          }
        }
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
              }, settings.speed);
          } else if (!animate && data.animation != null) {
            // stop animation
            clearInterval(data.animation);
            data.animation = null;
          }  
        });
      }
    },
    // Gets and sets the current frame number
    frame : function(frame){
      if (frame == undefined){
        return $(this).data('spritespin').settings.frame;
      } else {
        return this.each(function(){
          methods.update.apply($(this), [frame]);
        });        
      }
    },
    // Gets and sets the loop indicator
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
            methods.update.apply($this, [frame]);
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
        if (data.settings.animate){
          helper.updateBackground(instance, data);
          helper.hookSlider(instance, data);
          helper.rebindEvents(instance, data);
          methods.animate.apply(instance, [data.settings.animate, data.settings.loop]);
        }
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
      instance.css({
        width      : [data.settings.width, "px"].join(""),
        height     : [data.settings.height, "px"].join(""),
        "background-image"    : "none",
        "background-repeat"   : "no-repeat",
        "background-position" : "0px 0px"
      });
    },
    updateBackground : function(instance, data){
      var image = data.settings.image;
      var x = data.settings.offsetX;
      var y = -data.settings.offsetY;
      
      if (typeof(data.settings.image) == "string"){ 
        x -= (data.settings.frame * data.settings.width);
      } else {
        image = data.settings.image[data.settings.frame];
      }

      instance.css({
        width      : [data.settings.width, "px"].join(""),
        height     : [data.settings.height, "px"].join(""),
        "background-image"    : ["url('", image, "')"].join(""),
        "background-repeat"   : "no-repeat",
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
            methods.update.apply(instance, [ui.value]);  // update to frame
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
    }
  };
})(jQuery);
