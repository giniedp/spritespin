(function ($, SpriteSpin) {
  "use strict";

  function onCreate(e, data) {
    if (data.zoomStage) return
    data.zoomStage = $("<div class='spritezoom-stage'></div>")
      .css({
        width    : '100%',
        height   : '100%',
        top      : 0,
        left     : 0,
        bottom   : 0,
        right    : 0,
        position : 'absolute'
      }).appendTo(data.target).hide();
  }

  function onDestroy(e, data) {
    if (!data.zoomStage) return
    data.zoomStage.remove()
  }

  function updateInput(e, data){
    e.preventDefault();

    // hack into drag/move module and disable dragging
    // prevents frame change during zoom mode
    data.dragging = false;

    // access touch points from original event
    if (!e.touches && e.originalEvent){
      e.touches = e.originalEvent.touches;
    }

    // grab touch/cursor position
    var x, y, dx, dy;
    if (e.touches && e.touches.length){
      x = e.touches[0].clientX || 0;
      y = e.touches[0].clientY || 0;
    } else {
      x = e.clientX || 0;
      y = e.clientY || 0;
    }

    // normalize cursor position into [0:1] range
    x /= data.width;
    y /= data.height;

    if (data.zoomPX == null){
      data.zoomPX = x;
      data.zoomPY = y;
    }
    if (data.zoomX == null){
      data.zoomX = x;
      data.zoomY = y;
    }

    // calculate move delta since last frame and remember current position
    dx = x - data.zoomPX;
    dy = y - data.zoomPY;
    data.zoomPX = x;
    data.zoomPY = y;

    // invert drag direction for touch events to enable 'natural' scrolling
    if (e.type.match(/touch/)){
      dx = -dx;
      dy = -dy;
    }

    // accumulate display coordinates
    data.zoomX = SpriteSpin.clamp(data.zoomX + dx, 0, 1);
    data.zoomY = SpriteSpin.clamp(data.zoomY + dy, 0, 1);

    SpriteSpin.updateFrame(data);
  }

  function onDraw(e, data) {
    // calculate the frame index
    var index = data.lane * data.frames + data.frame;

    // get the zoom image. Use original frames as fallback. This won't work for spritesheets
    var source = (data.zoomSource || data.source)[index];
    if (!source) {
      $.error("'zoomSource' option is missing or it contains unsufficient number of frames.")
      return;
    }

    // get display position
    var x = data.zoomX;
    var y = data.zoomY;
    // fallback to centered position
    if (x == null || y == null){
      x = data.zoomX = 0.5;
      y = data.zoomY = 0.5;
    }
    // scale up from [0:1] to [0:100] range
    x = (x * 100)|0;
    y = (y * 100)|0;
    // update background image and position
    data.zoomStage.css({
      "background-repeat"   : "no-repeat",
      "background-image"    : ["url('", source, "')"].join(""),
      "background-position" : [x, "% ", y, "%"].join("")
    });
  }

  function onClick(e, data){
    e.preventDefault();

    // simulate double click

    var clickTime = new Date().getTime();
    if (!data.zoomClickTime) {
      data.zoomClickTime = clickTime;
      return;
    }

    var timeDelta = clickTime - data.zoomClickTime;
    var doubleClickTime = data.zoomDoubleClickTime || 500;
    if(timeDelta > doubleClickTime) {
      data.zoomClickTime = clickTime;
      return;
    }

    data.zoomClickTime = 0;
    if ($(this).spritespin('api').toggleZoom()){
      updateInput(e, data);
    }
  }

  function onMove(e, data){
    if (!data.zoomStage.is(':visible')) return;
    updateInput(e, data);
  }

  function toggleZoom(){
    var data = this.data;
    if (!data.zoomStage){
      $.error('zoom module is not initialized or is not available.');
      return false;
    }
    if (data.zoomStage.is(':visible')){
      data.zoomStage.fadeOut();
      data.stage.fadeIn();
    } else {
      data.zoomStage.fadeIn();
      data.stage.fadeOut();
      return true;
    }
    return false;
  }

  SpriteSpin.registerModule('zoom', {
    mousedown: onClick,
    touchstart: onClick,
    mousemove: onMove,
    touchmove: onMove,

    onInit: onCreate,
    onDestroy: onDestroy,
    onDraw: onDraw
  });

  SpriteSpin.extendApi({
    toggleZoom: toggleZoom
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
