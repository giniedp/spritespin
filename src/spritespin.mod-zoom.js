(function ($, SpriteSpin) {
  "use strict";

  function updateInput(e, data){
    e.preventDefault();

    data.dragging = false;

    if (!e.touches && e.originalEvent){
      e.touches = e.originalEvent.touches;
    }

    var x, y;
    // get current touch or mouse position
    if (e.touches && e.touches.length){
      x = e.touches[0].clientX || 0;
      y = e.touches[0].clientY || 0;
    } else {
      x = e.clientX || 0;
      y = e.clientY || 0;
    }

    data.zoomX = x / data.width;
    data.zoomY = y / data.height;
    data.zoomX = data.zoomX > 1 ? 1 : (data.zoomX < 0 ? 0 : data.zoomX);
    data.zoomY = data.zoomY > 1 ? 1 : (data.zoomY < 0 ? 0 : data.zoomY);

    SpriteSpin.updateFrame(data);
  }

  function onclick(e){
    e.preventDefault();

    var data = $(this).spritespin('data');
    var now = new Date().getTime();

    if (!data.zoomClickTime){
      data.zoomClickTime = now;
      return;
    }

    var timeDelta = now - data.zoomClickTime;
    if(timeDelta > 500){
      data.zoomClickTime = now;
      return;
    }

    data.zoomClickTime = 0;
    if ($(this).spritespin('api').toggleZoom()){
      updateInput(e, data);
    }
  }

  function onmove(e){
    var data = $(this).spritespin('data');
    if (!data.zoomStage.is(':visible')){
      return;
    }
    updateInput(e, data);
  }


  SpriteSpin.registerModule('zoom', {
    mousedown: onclick,
    touchstart: onclick,
    mousemove: onmove,
    touchmove: onmove,
    onInit: function(e, data){
      if (!data.zoomStage){
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
    },
    onDraw: function(e, data){
      var index = data.lane * data.frames + data.frame;
      var source = data.source[index];
      if (data.zoomSource){
        source = data.zoomSource[index];
      }
      if (!source){
        return;
      }
      var x = data.zoomX;
      var y = data.zoomY;
      if (x == null || y == null){
        x = data.zoomX = 0.5;
        y = data.zoomY = 0.5;
      }
      data.zoomStage.css({
        "background-repeat"   : "no-repeat",
        "background-image"    : ["url('", source, "')"].join(""),
        "background-position" : [(x * 100)|0, "% ", (y * 100)|0, "%"].join("")
      });
    }
  });

  SpriteSpin.extendApi({
    toggleZoom: function(){
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
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
