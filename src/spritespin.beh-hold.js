(function ($, SpriteSpin) {
  "use strict";

  function startAnimation(e) {
    var $this = $(this), data = $this.spritespin('data');
    if (data.loading){
      return;
    }
    SpriteSpin.updateInput(e, data);
    data.dragging = true;
    $this.spritespin("api").startAnimation();
  }

  function stopAnimation(e) {
    var $this = $(this), data = $this.spritespin('data');
    SpriteSpin.resetInput(data);
    data.dragging = false;
    $this.spritespin("api").stopAnimation();
  }

  function updateInput(e) {
    var $this = $(this), data = $this.spritespin('data');

    if (data.dragging) {
      SpriteSpin.updateInput(e, data);

      var half, delta;
      if (data.orientation === "horizontal") {
        half = (data.target.innerWidth() / 2);
        delta = (data.currentX - data.target.offset().left - half) / half;
      } else {
        half = (data.height / 2);
        delta = (data.currentY - data.target.offset().top - half) / half;
      }
      data.reverse = delta < 0;
      delta = delta < 0 ? -delta : delta;
      data.frameTime = 80 * (1 - delta) + 20;

      if (((data.orientation === 'horizontal') && (data.dX < data.dY)) ||
        ((data.orientation === 'vertical') && (data.dX < data.dY))) {
        e.preventDefault();
      }
    }
  }

  SpriteSpin.registerModule('hold', {

    mousedown: startAnimation,
    mousemove: updateInput,
    mouseup: stopAnimation,
    mouseleave: stopAnimation,

    touchstart: startAnimation,
    touchmove: updateInput,
    touchend: stopAnimation,
    touchcancel: stopAnimation,

    onFrame: function () {
      $(this).spritespin("api").startAnimation();
    }
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
