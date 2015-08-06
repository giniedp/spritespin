(function ($, SpriteSpin) {
  "use strict";

  function click(e, data) {
    if (data.loading || !data.stage.is(':visible')){
      return;
    }
    SpriteSpin.updateInput(e, data);

    var half, pos, target = data.target, offset = target.offset();
    if (data.orientation === "horizontal") {
      half = target.innerWidth() / 2;
      pos = data.currentX - offset.left;
    } else {
      half = target.innerHeight() / 2;
      pos = data.currentY - offset.top;
    }
    if (pos > half) {
      SpriteSpin.updateFrame(data, data.frame + 1);
    } else {
      SpriteSpin.updateFrame(data, data.frame - 1);
    }
  }

  SpriteSpin.registerModule('click', {
    mouseup: click,
    touchend: click
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));