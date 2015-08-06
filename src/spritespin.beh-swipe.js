(function ($, SpriteSpin) {
  "use strict";

  function init(e, data) {
    data.swipeFling = data.swipeFling || 10;
    data.swipeSnap = data.swipeSnap || 0.50;
  }

  function start(e, data) {
    if (!data.loading && !data.dragging){
      SpriteSpin.updateInput(e, data);
      data.dragging = true;
    }
  }

  function update(e, data) {
    if (!data.dragging) return;
    SpriteSpin.updateInput(e, data);
    var frame = data.frame;
    var lane = data.lane;
    SpriteSpin.updateFrame(data, frame, lane);
  }

  function end(e, data) {
    if (!data.dragging) return;
    data.dragging = false;

    var frame = data.frame;
    var lane = data.lane;
    var snap = data.swipeSnap;
    var fling = data.swipeFling;
    var dS, dF;
    if (data.orientation === "horizontal") {
      dS = data.ndX;
      dF = data.ddX;
    } else {
      dS = data.ndY;
      dF = data.ddY;
    }

    if (dS > snap || dF > fling) {
      frame = data.frame - 1;
    } else if (dS < -snap || dF < -fling) {
      frame = data.frame + 1;
    }

    SpriteSpin.resetInput(data);
    SpriteSpin.updateFrame(data, frame, lane);
    SpriteSpin.stopAnimation(data);
  }

  SpriteSpin.registerModule('swipe', {
    onLoad: init,
    mousedown: start,
    mousemove: update,
    mouseup: end,
    mouseleave: end,

    touchstart: start,
    touchmove: update,
    touchend: end,
    touchcancel: end
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
