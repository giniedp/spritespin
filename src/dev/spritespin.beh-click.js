(function($, window, Spin){
  Spin.behaviors.click = {
    name : "click",
    mousedown  : $.noop,
    mousemove  : $.noop,
    mouseup    : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.updateInput(e, data);
      $this.spritespin("animate", false); // stop animation

      var o = data.target.offset();
      var h, p;

      if (data.orientation == "horizontal"){
        h = data.width / 2;
        p = data.currentX - o.left;
      } else {
        h = data.height / 2;
        p = data.currentY - o.top;        
      }
      
      if (p > h){
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