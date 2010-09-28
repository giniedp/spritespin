/* Copyright (c) 2010 Alexander Gräfenstein
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Requires jQuery 1.4.x or higher
 * Optional jQuery-ui 1.8.x or higher if you want to use a slider
 */

(function($, undefined) {

  var methods = {
    init : function(options){
      // Default settings
      var settings = {
        width   : 640,                    // width of a single frame
        height  : 480,                    // height of a single frame
        frames  : 36,                     // number of frames
        frame   : 0,                      // initial frame number
        animate : false,                  // run animation when after initialize
        loop    : false,                  // repeat animation in a loop
        speed   : 36,                     // time between updates
        reverse : false,                  // if true animation is played backward
        image   : "images/spritespin.jpg",// stiched source image
        onFrameChanged : undefined,       // called when frame has changed
        slider  : undefined,              // jquery-ui slider instance
        interactive : true                // enables mouse interaction
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
        } else {
          $.extend(data.settings, options);
        }
        
        // style the wrapper container
        x = -data.settings.frame * data.settings.width;
        $this.css({
          width      : data.settings.width + "px",
          height     : data.settings.height + "px",
          "background-image"    : "url('" + data.settings.image + "')",
          "background-repeat"   : "no-repeat",
          "background-position" : x + "px 0px"
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
        
        // start animation if required
        if (data.settings.animate){
          methods.animate.apply($this, 
            [data.settings.animate, data.settings.loop]);
        }
        
        // unbind all events
        $this.unbind('.spritespin');
            
        // rebind interaction events
        if (settings.interactive){
          $this.bind('mousemove.spritespin',  events.onMouseMove);
          $this.bind('mousedown.spritespin',  events.onMouseDown);
          $this.bind('mouseup.spritespin',    events.onMouseUp);
          $this.bind('mouseleave.spritespin', events.onMouseLeave);
        }
        
        // rebind touchable device events
        if (data.touchable && settings.interactive){
          $this.bind('touchstart.spritespin',    events.onTouchStart);
          $this.bind('touchend.spritespin',      events.onTouchEnd);
          $this.bind('touchcancel.spritespin',   events.onTouchEnd);
          $this.bind('touchmove.spritespin',     events.onTouchMove);
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
    // Updates a single frame to the specified value. If no value is given this
    // will increment the current frame counter. Wraps the framecounter if it 
    // has exceeded the total number of frames. Positions the background image 
    // respecting the new frame value. Stops a running animation when necessary.
    update : function(frame){
      return this.each(function(){        
        var $this = $(this);
        data = $this.data('spritespin');
        settings = data.settings;
        
        oldFrame = data.settings.frame;
         
        // update and wrap the counter
        if (typeof(frame) == 'undefined'){
          step = settings.reverse ? -1 : 1
          settings.frame = (settings.frame + step) % settings.frames;
        } else {
          settings.frame = frame % settings.frames;
        }
        while(settings.frame < 0){
          settings.frame += settings.frames;
        }
        
        if (oldFrame != settings.frame){
          // update background position
          x = -settings.frame * settings.width;
          $this.css({
            "background-position" : x + "px 0px"
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
    // Starts or stops the animation depend on the animate paramter
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
              function(){ methods.update.apply($this, []); }, settings.speed);
          } else if (!animate && data.animation != null) {
            // stop animation
            clearInterval(data.animation);
            data.animation = null;
          }  
        });
      }
    },
    frame : function(frame){
      if (frame == undefined){
        return $(this).data('spritespin').settings.frame;
      } else {
        return this.each(function(){
          methods.update.apply($(this), [frame]);
        });        
      }
    },
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
    onMouseDown : function(){
      var $this = $(this);
      data = $this.data('spritespin');
      data.dragging = true;
    },
    onMouseUp : function(e){
      var $this = $(this);
      data = $this.data('spritespin');
      data.dragging = false;
    },
    onMouseLeave : function(e){
      var $this = $(this);
      data = $this.data('spritespin');
      data.dragging = false;
    },
    onMouseMove : function(e){
      var $this = $(this);
      data = $this.data('spritespin');
      
      if (data.dragging && typeof(data.oldMouseX) != "undefined"){
        d = data.oldMouseX - e.pageX;
        if (d > 0) {
          methods.update.apply($this, [data.settings.frame + 1]);
        } else if (d < 0) {
          methods.update.apply($this, [data.settings.frame - 1]);
        }
        methods.animate.apply($(this), [false]); // stop animation
      }
      data.oldMouseX = e.pageX;
      data.oldMouseY = e.pageY;
    },
    onTouchStart : function(e){
      var $this = $(this);
      data = $this.data('spritespin');
      methods.animate.apply($(this), [false]);
      data.dragging = true;
    },
    onTouchMove : function(e){
      var $this = $(this);
      data = $this.data('spritespin');
      
      if (data.dragging && typeof(data.oldMouseX) != "undefined"){
        d = data.oldMouseX - e.pageX;
        if (d > 0) {
          methods.update.apply($this, [data.settings.frame + 1]);
        } else if (d < 0) {
          methods.update.apply($this, [data.settings.frame - 1]);
        }
      }
      data.oldMouseX = e.touches[0].clientX;
      data.oldMouseY = e.touches[0].clientY;
    },
    onTouchEnd : function(e){
      var $this = $(this);
      data = $this.data('spritespin');
      data.dragging = false;
    },
  };
  
  $.fn.spritespin = function(method) {
    if ( methods[method] ) {
      return methods[method].apply(
        this, Array.prototype.slice.call(arguments, 1)
      );
    } else if (typeof(method) === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.spritespin' );
    }
  };
})(jQuery);
