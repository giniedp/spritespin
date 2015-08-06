(function ($, SpriteSpin) {
  "use strict";

  function init(e, data) {
    data.blurCanvas = data.blurCanvas || $("<canvas class='blur-layer'></canvas>");
    data.blurContext = data.blurCanvas[0].getContext("2d");
    data.blurSteps = data.blurSteps || [];
    data.blurEffectTime = Math.max(data.blurEffectTime || 240, 0);
    data.blurUpdateTime = Math.max(data.blurUpdateTime || data.frameTime, 16);
    if (data.blurCss == null) {
      data.blurCss = true;
    }

    var canvas = data.blurCanvas;
    var css = SpriteSpin.calculateInnerLayout(data);
    canvas[0].width = data.width;
    canvas[0].height = data.height;
    canvas.css(css).show();
    data.target.append(canvas);
  }

  function addFrame(e, data){
    var d = Math.abs(data.frame - data.lastFrame);
    data.blurSteps.unshift({
      frame: data.frame,
      lane: data.lane,
      t: data.blurEffectTime,
      d: d
    });

    if (!data.blurTimeout) {
      loop(data);
    }
  }

  function loop(data) {
    data.blurTimeout = window.setTimeout(function(){ tick(data); }, data.blurUpdateTime);
  }

  function tick(data) {
    delete data.blurTimeout;
    if (!data.blurContext) {
      return;
    }

    var animation, i, context = data.blurContext, d = 0;
    var toRemove = [];
    context.clearRect(0, 0, data.width, data.height);
    for (i = 0; i < data.blurSteps.length; i += 1) {

      animation = data.blurSteps[i];
      animation.t -= data.blurUpdateTime;
      if (animation.t < 0) {
        animation.t = 0;
        toRemove.push(animation);
      }

      var index = data.lane * data.frames + animation.frame;
      var img = data.images[index];
      
      if (img && img.complete !== false){
        context.globalAlpha = Math.max(0, animation.t / data.blurEffectTime - 0.25);
        d += context.globalAlpha + animation.d;
        if (data.sourceIsSprite){
          var x = data.frameWidth * (index % data.framesX);
          var y = data.frameHeight * Math.floor(index / data.framesX);
          data.context.drawImage(data.images[0], x, y, data.frameWidth, data.frameHeight, 0, 0, data.width, data.height);
        } else{
          context.drawImage(img, 0, 0, data.width, data.height);
        }
      }
    }

    if (data.blurCss) {
      d = Math.min(Math.max((d / 2) - 4, 0), 1.5);
      data.blurCanvas.css({
        '-webkit-filter': 'blur(' + d + 'px)',
        'filter': 'blur(' + d + 'px)'
      });
    }
    
    for (i = 0; i < toRemove.length; i += 1) {
      index = $.inArray(toRemove[i], data.blurSteps);
      if (index >= 0) {
        data.blurSteps.splice(index, 1);
      }
    }

    if (data.blurSteps.length) {
      loop(data);
    }
  }

  SpriteSpin.registerModule('blur', {
    onLoad: init,
    onFrameChanged: addFrame
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
