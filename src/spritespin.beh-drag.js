(function ($, SpriteSpin) {
  "use strict";

  SpriteSpin.registerModule('drag', {

    mousedown: function (e) {
      var data = $(this).spritespin('data');
      SpriteSpin.updateInput(e, data);
      data.dragging = true;
    },

    mousemove: function (e) {
      var d, dFrame, frame, $this = $(this), data = $this.spritespin('data');
      if (data.dragging) {
        SpriteSpin.updateInput(e, data);

        if (data.orientation === 'horizontal') {
          d = data.dX / data.width;
        } else {
          d = data.dY / data.height;
        }

        dFrame = d * data.frames * data.sense;
        frame = Math.floor(data.clickframe + dFrame);
        SpriteSpin.updateFrame(data, frame);
        data.animate = false;
        SpriteSpin.stopAnimation(data);
      }
    },

    mouseup: function () {
      var $this = $(this), data = $this.spritespin('data');
      SpriteSpin.resetInput(data);
      data.dragging = false;
    },

    mouseleave: function () {
      var $this = $(this), data = $this.spritespin('data');
      SpriteSpin.resetInput(data);
      data.dragging = false;
    }
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
