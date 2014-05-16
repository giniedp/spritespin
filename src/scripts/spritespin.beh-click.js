(function ($, SpriteSpin) {
  "use strict";

  SpriteSpin.registerModule('click', {

    mouseup: function (e) {
      var $this = $(this), data = $this.data('spritespin');
      SpriteSpin.updateInput(e, data);

      var half, pos;
      if (data.orientation === "horizontal") {
        half = data.target.innerWidth() / 2;
        pos = data.currentX - data.target.offset().left;
      } else {
        half = data.target.innerHeight() / 2;
        pos = data.currentY - data.target.offset().top;
      }
      if (pos > half) {
        $this.spritespin("next");
      } else {
        $this.spritespin("prev");
      }
    }

  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));