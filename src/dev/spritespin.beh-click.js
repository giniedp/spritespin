(function($, window, Spin){
  Spin.behaviors.click = {
    name : "click",
    mousedown  : $.noop,
    mousemove  : $.noop,
    mouseup    : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.updateInput(e, data);
      $this.spritespin("animate", false); // stop animation
      if (data.currentX > data.width / 2){
        $this.spritespin("frame", data.frame + 1);
        data.reverse = false;
      } else {
        $this.spritespin("frame", data.frame - 1);
        data.reverse = true;
      }
    },
    
    mouseenter : $.noop,
    mouseover  : $.noop,
    mouseleave : $.noop,
    dblclick   : $.noop,
    
    onFrame : $.noop
  };
})(jQuery, window, window.SpriteSpin);