(function($, window, Spin){
  Spin.behaviors.swipe = {
    name : "swipe",
    mousedown  : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.updateInput(e, data);
      data.onDrag = true;
    },
    mousemove  : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      if (data.onDrag){
        Spin.updateInput(e, data);
        
        var frame = data.frame;
        var snap = data.snap || 0.25;
        var d, s;
        
        if (data.orientation == "horizontal"){
          d = data.dX; 
          s = data.width * snap;
        } else {
          d = data.dY; 
          s = data.height * snap;
        }
        
        if (d > s){
          frame = data.frame - 1;       
          data.onDrag = false;
        } else if (d < -s){
          frame = data.frame + 1;
          data.onDrag = false;
        }
        
        $this.spritespin("update", frame);  // update to frame
        $this.spritespin("animate", false); // stop animation
      }
    },
    mouseup    : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      data.onDrag = false;
      Spin.resetInput(data);
    },
    mouseleave : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      data.onDrag = false;
      Spin.resetInput(data);
    }
  };  
}(jQuery, window, window.SpriteSpin));
