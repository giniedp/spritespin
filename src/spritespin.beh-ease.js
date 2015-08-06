(function ($, SpriteSpin) {
  "use strict";

  function init(e, data){
    data.easeAbortAfterMs = Math.max(data.easeAbortAfterMs || 250, 0);
    data.easeDamping = Math.max(Math.min(data.easeDamping || 0.9, 0.999), 0);
    data.easeSamples = Math.max(data.easeSamples || 5, 1);
    data.easeUpdateTime = Math.max(data.easeUpdateTime || data.frameTime, 16);
    data.easeScope = { samples: [], steps: [] };
  }

  function update(e, data) {
    if (data.dragging) sampleInput(data, data.easeScope);
  }

  function end(e, data) {
    var ease = data.easeScope;
    if (!data.dragging) sampleInput(data, ease);
    var last, sample, samples = ease.samples;
    var lanes = 0, frames = 0, time = 0;

    for(var i = 0; i < samples.length; i += 1) {
      sample = samples[i];
      if (last) {
        var dt = sample.time - last.time;
        if (dt > data.easeAbortAfterMs) {
          lanes = frames = time = 0;
        } else {
          frames += sample.frame - last.frame;
          lanes += sample.lane - last.lane;
          time += dt;
        }
      }
      last = sample;
    }
    samples.length = 0;
    
    if (time <= 0) return;

    ease.ms = data.easeUpdateTime;
    ease.laneStep = lanes / time * ease.ms;
    ease.frameStep = frames / time * ease.ms;
    ease.lane = data.lane;
    ease.lanes = 0;
    ease.frame = data.frame;
    ease.frames = 0;
    loop(data, ease);
  }

  function sampleInput(data, ease) {
    if (ease.timeout) {
      window.clearTimeout(ease.timeout);
      delete ease.timeout;
    }

    ease.samples.push({
      time: new Date().getTime(),
      frame: data.dragFrame,
      lane: data.dragLane
    });
    while (ease.samples.length > data.easeSamples) {
      ease.samples.shift();
    }
  }

  function loop(data, ease) {
    ease.timeout = window.setTimeout(function(){
      tick(data, ease);
    }, ease.ms);
  }

  function tick(data, ease){
    ease.lanes += ease.laneStep;
    ease.frames += ease.frameStep;
    ease.laneStep *= data.easeDamping;
    ease.frameStep *= data.easeDamping;
    var frame = Math.floor(ease.frame + ease.frames);
    var lane = Math.floor(ease.lane + ease.lanes);
    SpriteSpin.updateFrame(data, frame, lane);
    if (data.dragging) {
      return;
    }
    if (Math.abs(ease.frameStep) > 0.005 || Math.abs(ease.laneStep) > 0.005) {
      loop(data, ease);
    }
  }

  SpriteSpin.registerModule('ease', {
    onLoad: init,

    mousemove: update,
    mouseup: end,
    mouseleave: end,

    touchmove: update,
    touchend: end,
    touchcancel: end
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
