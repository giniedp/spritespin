(function($) {
  "use strict";

  var Spin = window.SpriteSpin;

  var clamp = Spin.clamp;
  var inRange = Spin.inRange;
  var inArray = Spin.inArray;
  var chainFunction = Spin.chainFunction;

  function laneLoadOrder(start, total) {
    start = clamp(start, 0, total - 1);
    var result = [];
    var i, current = start;
    for (i = 0; i < total; i += 1){
      if (i % 2){
        current += i;
      } else {
        current -= i;
      }
      if (inRange(current, 0, total-1) && !inArray(current, result)) {
        result.push(current);
      }
    }
    for (i = start; i < total; i += 1){
      if (!inArray(i, result)) result.push(i);
    }
    for (i = start; i >= 0; i -= 1){
      if (!inArray(i, result)) result.push(i);
    }
    return result;
  }

  var Loader = function(opts){
    var loader = this;
    // convert opts.source to an array of strings
    this.src = (typeof opts.source === 'string') ? [opts.source] : opts.source;

    // Number of frames to load before call the complete callback
    this.totalCount = this.src.length;
    this.targetCount = opts.preloadCount || this.src.length;
    this.loadedCount = 0;

    // Loading may start on specific lane
    this.startLane = opts.lane || 0;
    this.totalLanes = opts.lanes || 1;
    this.framesPerLane = this.src.length / this.totalLanes;
    this.minLane = this.startLane;
    this.maxLane = this.startLane;

    this.onComplete = opts.complete || $.noop;
    this.onPreload = chainFunction(opts.initiated, function(){
      loader.next();
    });
    this.onLoad = chainFunction(opts.progress, function(progress){
      if (loader.canceled) {
        return;
      }
      var lane = progress.lane;
      var image = progress.image;
      var images = loader.queue[lane];
      Spin.removeFromArray(image, images);
      if (images.length == 0) {
        loader.next();
      }
    });

    this.queue = {};
    this.lanes = laneLoadOrder(this.startLane, this.totalLanes);
  };

  var proto = Loader.prototype;

  proto.tick = function(image){
    var loader = this;
    loader.loadedCount += 1;
    if ((loader.loadedCount % loader.framesPerLane) == 0){
      loader.minLane = Math.min(loader.minLane, this.lane);
      loader.maxLane = Math.max(loader.maxLane, this.lane);
    }
    loader.onLoad({
      image: image,
      lane: image.lane,
      index: image.index,
      frame: image.frame,
      loaded: loader.loadedCount,
      total: loader.src.length,
      minLane: loader.minLane,
      maxLane: loader.maxLane,
      percent: Math.round((loader.loadedCount / loader.totalCount) * 100),
      percentPreload: Math.min(Math.round((loader.loadedCount / loader.targetCount) * 100), 100)
    });
    loader.firstLoaded = loader.firstLoaded || (image === loader.images[loader.startLane * loader.framesPerLane]);
    if (!loader.completed && (loader.loadedCount >= loader.targetCount) && loader.firstLoaded) {
      loader.completed = true;
      loader.onComplete(loader.images.splice(0));
    }
  };

  proto.abort = function(){
    this.canceled = true;
    this.cleanup();
  };

  proto.cleanup = function(){
    this.lanes.length = 0;
  };

  proto.next = function(){
    var lane = this.lanes.shift();
    var queue = (this.queue[lane] || []).slice(0);
    var i, img;
    for (i = 0; i < queue.length; i += 1){
      img = queue[i];
      img.src = this.src[img.index];
    }
  };

  Spin.Preload = function(options){
    var loader = new Loader(options);
    loader.load();
  };

}(window.jQuery || window.Zepto || window.$));
