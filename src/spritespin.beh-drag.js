(function ($, SpriteSpin) {
  "use strict";

  function dragStart(e) {
    var data = $(this).spritespin('data');
    if (data.loading || data.dragging || !data.stage.is(':visible')){
      return;
    }
    data.dragFrame = data.frame || 0;
    data.dragLane = data.lane || 0;
    SpriteSpin.updateInput(e, data);
    data.dragging = true;
  }

  function dragEnd(e) {
    var $this = $(this), data = $this.spritespin('data');
    data.dragging = false;
    if (data.stage.is(':visible')){
      SpriteSpin.resetInput(data);
    }
  }

  function drag(e) {
    var lane, frame, $this = $(this), data = $this.spritespin('data');
    if (!data.dragging) {
      return;
    }

    SpriteSpin.updateInput(e, data);

    // dont do anything if the drag distance exceeds the scroll threshold.
    // this allows to use touch scroll on mobile devices.
    if (Math.abs(data.ddX) + Math.abs(data.ddY) > data.scrollThreshold){
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
    // clamp accumulated values if wrap is disabled
    if (!data.wrap){
      data.dragFrame = Math.min(data.dragFrame, data.frames);
      data.dragFrame = Math.max(data.dragFrame, 0);
    }
    if (!data.wrapLane){
      data.dragLane = Math.min(data.dragLane, data.lanes);
      data.dragLane = Math.max(data.dragLane, 0);
    }

    frame = Math.floor(data.dragFrame);
    lane = Math.floor(data.dragLane);
    SpriteSpin.updateFrame(data, frame, lane);
    // Stop the running animation (auto frame update) if there is any.
    SpriteSpin.stopAnimation(data);
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
