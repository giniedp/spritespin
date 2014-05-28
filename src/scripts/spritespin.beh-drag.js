(function ($, SpriteSpin) {
  "use strict";

  function dragStart(e) {
    var data = $(this).spritespin('data');
    SpriteSpin.updateInput(e, data);
    data.dragging = true;
  }

  function dragEnd() {
    var $this = $(this), data = $this.spritespin('data');
    SpriteSpin.resetInput(data);
    data.dragging = false;
  }

  function drag(e) {
    var dFrame, dLane, lane, frame, $this = $(this), data = $this.spritespin('data');
    if (data.dragging) {
      SpriteSpin.updateInput(e, data);

      if (data.orientation === 'horizontal') {
        dFrame = data.ndX * data.frames * data.sense;
        dLane = data.ndY * data.lanes * (data.senseLane || data.sense);
      } else {
        dFrame = data.ndY * data.frames * data.sense;
        dLane = data.ndX * data.lanes * (data.senseLane || data.sense);
      }

      frame = Math.floor(data.clickframe + dFrame);
      lane = Math.floor(data.clicklane + dLane);
      SpriteSpin.updateFrame(data, frame, lane);
      data.animate = false;
      SpriteSpin.stopAnimation(data);
    }
  }

  SpriteSpin.registerModule('drag', {
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
