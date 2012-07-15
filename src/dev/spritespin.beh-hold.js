(function($, window, Spin){
  Spin.behaviors.hold = {
    name : "hold",
    mousedown  : function(e){
      var $this = $(this), data = $this.data('spritespin');
      Spin.updateInput(e, data);
      data.onDrag = true;
      $this.spritespin("animate", true);
    },
    mousemove  : function(e){
      var $this = $(this), data = $this.data('spritespin');
      
      if (data.onDrag){
        Spin.updateInput(e, data);
        
        var h, d, o = data.target.offset();
        if (data.orientation == "horizontal"){
          h = (data.width / 2);
          d = (data.currentX - o.left - h) / h;
        } else {
          h = (data.height / 2);
          d = (data.currentY - o.top - h) / h;
        }
        data.reverse = d < 0;
        d = d < 0 ? -d : d;
        data.frameTime = 80 * (1 - d) + 20;        
      }
    },
    mouseup    : function(e){ 
      var $this = $(this), data = $this.data('spritespin');
      Spin.resetInput(data);
      data.onDrag = false;
      $this.spritespin("animate", false);
    },
    mouseleave : function(e){
      var $this = $(this), data = $this.data('spritespin');
      Spin.resetInput(data);
      data.onDrag = false;
      $this.spritespin("animate", false);
    },
    onFrame : function(e){
      var $this = $(this);
      $this.spritespin("animate", true);
    }
  };
}(jQuery, window, window.SpriteSpin));