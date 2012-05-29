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