(function($, window, Spin){
  Spin.behaviors.click = {
    name : "click",
    mouseup    : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.updateInput(e, data);
      $this.spritespin("animate", false); // stop animation

      var h, p, o = data.target.offset();
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
    }
  };
}(jQuery, window, window.SpriteSpin));