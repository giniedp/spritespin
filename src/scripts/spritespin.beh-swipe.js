(function ($, SpriteSpin) {
  "use strict";

  function dragStart(e) {
    var $this = $(this), data = $this.spritespin('data');
    SpriteSpin.updateInput(e, data);
    data.onDrag = true;
  }

  function dragEnd() {
    var $this = $(this), data = $this.spritespin('data');
    data.onDrag = false;
    SpriteSpin.resetInput(data);
  }

  function drag(e) {
    var $this = $(this), data = $this.spritespin('data');
    if (data.onDrag) {
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
        data.onDrag = false;
      } else if (d < -s) {
        frame = data.frame + 1;
        data.onDrag = false;
      }

      $this.spritespin("update", frame);  // update to frame
      $this.spritespin("animate", false); // stop animation
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
