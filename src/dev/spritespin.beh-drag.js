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
