(function ($, SpriteSpin) {
  "use strict";

  function dragStart(e) {
    var data = $(this).spritespin('data');
    if (data.loading){
      return;
    }
    SpriteSpin.updateInput(e, data);
    data.dragging = true;
  }

  function dragEnd() {
    var data = $(this).spritespin('data');
    data.dragging = false;
    SpriteSpin.resetInput(data);
  }

  function drag(e) {
    var $this = $(this), data = $this.spritespin('data');
    if (data.dragging) {
      SpriteSpin.updateInput(e, data);

      var frame = data.frame;
      var snap = data.snap || 0.25;
      var d, s;

      if (data.orientation === "horizontal") {
        d = data.dX;
        s = data.target.innerWidth() * snap;
      } else {
        d = data.dY;
        s = data.target.innerHeight() * snap;
      }

      if (d > s) {
        frame = data.frame - 1;
        data.dragging = false;
      } else if (d < -s) {
        frame = data.frame + 1;
        data.dragging = false;
      }

      $this.spritespin("update", frame);  // update to frame
      $this.spritespin("animate", false); // stop animation

      if (((data.orientation === 'horizontal') && (data.dX < data.dY)) ||
        ((data.orientation === 'vertical') && (data.dX < data.dY))) {
        e.preventDefault();
      }
    }
  }

  SpriteSpin.registerModule('swipe', {
    mousedown: dragStart,
    mousemove: drag,
    mouseup: dragEnd,
    mouseleave: dragEnd,

    touchstart: dragStart,
    touchmove: drag,
    touchend: dragEnd,
    touchcancel: dragEnd
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
