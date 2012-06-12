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
