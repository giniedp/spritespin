(function ($, SpriteSpin) {
  "use strict";

  function click(e, data) {
    if (data.loading || !data.stage.is(':visible')) return;
    SpriteSpin.updateInput(e, data);

    var half, pos, target = data.target, offset = target.offset();
    if (data.orientation === "horizontal") {
      half = target.innerWidth() / 2;
      pos = data.currentX - offset.left;
    } else {
      half = target.innerHeight() / 2;
      pos = data.currentY - offset.top;
    }
    SpriteSpin.updateFrame(data, data.frame + (pos > half ? 1 : -1));
  }

  SpriteSpin.registerModule('click', {
    mouseup: click,
    touchend: click
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));