(function ($, SpriteSpin) {
  "use strict";

  SpriteSpin.registerModule('hold', {

    mousedown: function (e) {
      var $this = $(this), data = $this.spritespin('data');
      SpriteSpin.updateInput(e, data);
      data.onDrag = true;
      $this.spritespin("animate", true);
    },

    mousemove: function (e) {
      var $this = $(this), data = $this.spritespin('data');

      if (data.onDrag) {
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
      }
    },

    mouseup: function () {
      var $this = $(this), data = $this.spritespin('data');
      SpriteSpin.resetInput(data);
      data.onDrag = false;
      $this.spritespin("animate", false);
    },

    mouseleave: function () {
      var $this = $(this), data = $this.spritespin('data');
      SpriteSpin.resetInput(data);
      data.onDrag = false;
      $this.spritespin("animate", false);
    },

    onFrame: function () {
      var $this = $(this);
      $this.spritespin("animate", true);
    }
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));