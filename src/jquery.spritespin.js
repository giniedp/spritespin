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
        width   : 640,                    // width of a single frame
        height  : 480,                    // height of a single frame
        offsetX : 0,
        offsetY : 0,
        frames  : 36,                     // number of frames
        frame   : 0,                      // initial frame number
        animate : false,                  // run animation when after initialize
        loop    : false,                  // repeat animation in a loop
        speed   : 36,                     // time between updates
        reverse : false,                  // if true animation is played backward
        image   : "images/spritespin.jpg",// stiched source image
        onFrameChanged : undefined,       // called when frame has changed
        onInitialized  : undefined,       // called when plugin has been initialized
        slider  : undefined,              // jquery-ui slider instance
        interactive : true                // enables mouse interaction
      }
      
      //extending options
      options = (options || {});
      $.extend(settings, options);
      
      return this.each(function(){
        var $this = $(this);
        var data  = $this.data('spritespin');
        var initialized = false;
        
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
          initialized = true;
        } else {
          $.extend(data.settings, options);
        }
        
        // style the wrapper container
        x = data.settings.offsetX - data.settings.frame * data.settings.width;
        y = -data.settings.offsetY;
        $this.css({
          width      : data.settings.width + "px",
          height     : data.settings.height + "px",
          "background-image"    : "url('" + data.settings.image + "')",
          "background-repeat"   : "no-repeat",
          "background-position" : [x, "px ", y, "px"].join("")
        });
        
        // hook the jquery-ui slider
        if (data.settings.slider != undefined){
          data.settings.slider.slider({
            value   : data.settings.frame,
            min     : 0,
            max     : (data.settings.frames) - 1,
            step    : 1,
            slide   : function(event, ui) {
              methods.animate.apply($this, [false]);    // stop animation
              methods.update.apply($this, [ui.value]);  // update to frame
            },
          }); 
        }
        
        // unbind all events
        $this.unbind('.spritespin');
            
        if (data.touchable && settings.interactive){
          // rebind touchable device events
          $this.bind('touchstart.spritespin',    events.onStartDrag);
          $this.bind('touchend.spritespin',      events.onStopDrag);
          $this.bind('touchcancel.spritespin',   events.onStopDrag);
          $this.bind('touchmove.spritespin',     events.onDrag);
        } else if (settings.interactive){
          // rebind interaction events
          $this.bind('mousedown.spritespin',  events.onStartDrag);
          $this.bind('mouseup.spritespin',    events.onStopDrag);
          $this.bind('mouseleave.spritespin', events.onStopDrag);
          $this.bind('mousemove.spritespin',  events.onDrag);
        }
        
        // start animation if required
        if (data.settings.animate){
          methods.animate.apply($this, [data.settings.animate, data.settings.loop]);
        }
        
        // call custom events
        if (initialized && data.settings.onInitialized != undefined){
          data.settings.onInitialized();
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
    update : function(frame){
      return this.each(function(){        
        var $this = $(this), 
        data = $this.data('spritespin'), 
        settings = data.settings;
        
        oldFrame = data.settings.frame;
        
        // update frame counter
        if (frame == undefined){
          settings.frame = (settings.frame + (settings.reverse ? -1 : 1));
        } else {
          settings.frame = frame;
        }
      
        if (oldFrame != settings.frame){
          // wrap the frame counter. avoid using % operator for speed
          if (settings.frame >= settings.frames){ 
            settings.frame -= settings.frames; 
          } else if (settings.frame < 0){ 
            settings.frame += settings.frames; 
          }
        
          // update background position
          x = settings.offsetX - settings.frame * settings.width;
          y = -settings.offsetY;
          $this.css({
            "background-position" : [x, "px ", y, "px"].join("")
          });
          
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
  
  var events = {
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
    },
  };
})(jQuery);
