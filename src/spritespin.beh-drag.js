(function ($, SpriteSpin) {
  "use strict";

  function dragStart(e, data) {
    if (data.loading || data.dragging || !data.stage.is(':visible')) return;
    data.dragFrame = data.frame || 0;
    data.dragLane = data.lane || 0;
    data.dragging = true;
    SpriteSpin.updateInput(e, data);
  }

  function dragEnd(e, data) {
    if (data.dragging) {
      data.dragging = false;
      SpriteSpin.resetInput(data);
    }
  }

  function drag(e, data) {
    if (!data.dragging) return;
    SpriteSpin.updateInput(e, data);

    // dont do anything if the drag distance exceeds the scroll threshold.
    // this allows to use touch scroll on mobile devices.
    if ((Math.abs(data.ddX) + Math.abs(data.ddY)) > data.scrollThreshold) {
      data.dragging = false;
      SpriteSpin.resetInput(data);
      return;
    }

    // disable touch scroll
    e.preventDefault();

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
    var x = ((data.nddX * cs - data.nddY * sn) * data.sense) || 0;
    var y = ((data.nddX * sn + data.nddY * cs) * (data.senseLane || data.sense)) || 0;

    // accumulate
    data.dragFrame += data.frames * x;
    data.dragLane += data.lanes * y;

    var frame = Math.floor(data.dragFrame);
    var lane = Math.floor(data.dragLane);
    SpriteSpin.updateFrame(data, frame, lane);
    SpriteSpin.stopAnimation(data);
  }

  SpriteSpin.registerModule('drag', {
    mousedown: dragStart,
    mousemove: drag,
    mouseup: dragEnd,

    documentmousemove: drag,
    documentmouseup: dragEnd,

    touchstart: dragStart,
    touchmove: drag,
    touchend: dragEnd,
    touchcancel: dragEnd
  });

  SpriteSpin.registerModule('move', {
    mousemove: function(e, data){
      dragStart.call(this, e, data);
      drag.call(this, e, data);
    },
    mouseleave: dragEnd,

    touchstart: dragStart,
    touchmove: drag,
    touchend: dragEnd,
    touchcancel: dragEnd
  });
}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
