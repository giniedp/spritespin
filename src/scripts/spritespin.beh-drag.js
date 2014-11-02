(function ($, SpriteSpin) {
  "use strict";

  function dragStart(e) {
    var data = $(this).spritespin('data');
    SpriteSpin.updateInput(e, data);
    data.dragging = true;
  }

  function dragEnd(e) {
    var $this = $(this), data = $this.spritespin('data');
    SpriteSpin.resetInput(data);
    data.dragging = false;
  }

  function drag(e) {
    var dFrame, dLane, lane, frame, $this = $(this), data = $this.spritespin('data');
    if (data.dragging) {
      SpriteSpin.updateInput(e, data);

      var angle = 0;
      if (typeof data.orientation === 'number') {
        angle = (Number(data.orientation) || 0) * Math.PI / 180;
      } else if (data.orientation === 'horizontal') {
        angle = 0;
      } else {
        angle = Math.PI / 2;
      }
      var sn = Math.sin(angle);
      var cs = Math.cos(angle);
      var x = data.ndX * cs - data.ndY * sn;
      var y = data.ndX * sn + data.ndY * cs;

      dFrame = x * data.frames * data.sense;
      dLane = y * data.lanes * (data.senseLane || data.sense);

      frame = Math.floor(data.clickframe + dFrame);
      lane = Math.floor(data.clicklane + dLane);
      SpriteSpin.updateFrame(data, frame, lane);
      data.animate = false;
      SpriteSpin.stopAnimation(data);

      if (((data.orientation === 'horizontal') && (data.dX < data.dY)) ||
          ((data.orientation === 'vertical') && (data.dX < data.dY))) {
        e.preventDefault();
      }
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

  SpriteSpin.registerModule('move', {
    mousemove: function(e){
      dragStart.call(this, e);
      drag.call(this, e);
    },
    mouseleave: dragEnd,

    touchstart: dragStart,
    touchmove: drag,
    touchend: dragEnd,
    touchcancel: dragEnd
  });
}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
