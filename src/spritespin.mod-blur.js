(function ($, SpriteSpin) {
  "use strict";

  function init(e, data) {
    var scope = scopeFrom(data);
    var css = SpriteSpin.calculateInnerLayout(data);
    scope.canvas[0].width = data.width * data.canvasRatio;
    scope.canvas[0].height = data.height * data.canvasRatio;
    scope.canvas.css(css).show();
    scope.context.scale(data.canvasRatio, data.canvasRatio);
    data.target.append(scope.canvas);
  }

  function destroy(e, data) {
    var scope = scopeFrom(data)
    data.target.remove(data)
    delete data.blurScope
  }

  function onFrame(e, data) {
    var scope = scopeFrom(data);
    trackFrame(data, scope)
    if (scope.timeout == null) loop(data, scope);
  }

  function scopeFrom(data) {
    data.blurScope = data.blurScope || {};
    var scope = data.blurScope;
    scope.canvas = scope.canvas || $("<canvas class='blur-layer'></canvas>");
    scope.context = scope.context || scope.canvas[0].getContext("2d");
    scope.steps = scope.steps || [];
    scope.fadeTime = Math.max(data.blurFadeTime || 200, 1);
    scope.frameTime = Math.max(data.blurFrameTime || data.frameTime, 16);
    scope.trackTime = null;
    scope.cssBlur = !!data.blurCss;
    return scope;
  }

  function trackFrame(data, scope) {
    var d = Math.abs(data.frame - data.lastFrame); // distance between frames
    if (d >= data.frames / 2) d = data.frames - d; // get shortest distance
    scope.steps.unshift({
      index: data.lane * data.frames + data.frame,
      live: 1,
      step: scope.frameTime / scope.fadeTime,
      d: d
    });
  }

  var toRemove = []
  function removeOldFrames(frames) {
    toRemove.length = 0;
    var i;
    for (i = 0; i < frames.length; i += 1) {
      if (frames[i].alpha <= 0) toRemove.push(i);
    }
    for (i = 0; i < toRemove.length; i += 1) {
      frames.splice(toRemove[i], 1);
    }
  }

  function loop(data, scope) {
    scope.timeout = window.setTimeout(function(){
      tick(data, scope);
    }, scope.frameTime);
  }

  function killLoop(data, scope) {
    window.clearTimeout(scope.timeout);
    scope.timeout = null;
  }

  function applyCssBlur(canvas, d) {
    d = Math.min(Math.max((d / 2) - 4, 0), 1.5);
    canvas.css({
      '-webkit-filter': 'blur(' + d + 'px)',
      'filter': 'blur(' + d + 'px)'
    });
  }

  function drawFrame(data, scope, step) {
    var context = scope.context;
    var index = step.index;
    var img = (data.sourceIsSprite ? data.images[0] : data.images[index]);

    if (step.alpha <= 0) return;
    if (!img || img.complete === false) return

    context.globalAlpha = step.alpha;
    if (data.sourceIsSprite){
      var x = data.frameWidth * (index % data.framesX);
      var y = data.frameHeight * Math.floor(index / data.framesX);
      context.drawImage(img, x, y, data.frameWidth, data.frameHeight, 0, 0, data.width, data.height);
    } else {
      context.drawImage(img, 0, 0, data.width, data.height);
    }
  }

  function tick(data, scope) {
    killLoop(data, scope);
    if (!scope.context) return;

    var i, step, context = scope.context, d = 0;
    context.clearRect(0, 0, data.width, data.height);
    for (i = 0; i < scope.steps.length; i += 1) {
      step = scope.steps[i];
      step.live = Math.max(step.live - step.step, 0);
      step.alpha = Math.max(step.live - 0.25, 0);
      drawFrame(data, scope, step);
      d += step.alpha + step.d;
    }
    if (scope.cssBlur) {
      applyCssBlur(scope.canvas, d)
    }
    removeOldFrames(scope.steps);
    if (scope.steps.length) {
      loop(data, scope);
    }
  }

  SpriteSpin.registerModule('blur', {
    onLoad: init,
    onFrameChanged: onFrame
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
