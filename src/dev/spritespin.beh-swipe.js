(function($, window, Spin){
  Spin.behaviors.swipe = {
    name : "swipe",
    mousedown  : function(e){ return false; },
    mousemove  : function(e){ return false; },
    mouseup    : function(e){ return false; },
    
    mouseenter : function(e){ return false; },
    mouseover  : function(e){ return false; },
    mouseleave : function(e){ return false; },
    dblclick   : function(e){ return false; },
    
    onFrame : function(e, frame){ return false; }
  };  
})(jQuery, window, window.SpriteSpin);
