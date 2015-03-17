
(function($) {
  "use strict";

  // The namespace that is used for data storage and event binding
  var name = 'spritespin';

  // Event names that are recognized by SpriteSpin. A module may implement any of these and they will be bound
  // to the target element on which the plugin is called.
  var modEvents = [
    'mousedown', 'mousemove', 'mouseup', 'mouseenter', 'mouseover', 'mouseleave', 'dblclick',
    'touchstart', 'touchmove', 'touchend', 'touchcancel',
    'selectstart', 'gesturestart', 'gesturechange', 'gestureend'];
  var preventEvents = ['dragstart'];

  // The SpriteSpin object. This object wraps the core logic of SpriteSpin
  var Spin = {};

  /**
   * @module SpriteSpin
   * @type {object}
   */
  window.SpriteSpin = Spin;

  /**
   * The namespace that is used to bind functions to DOM events and set the data object to DOM elements
   * @type {string}
   */
  Spin.namespace = name;

  /**
   * Collection of modules that can be used to extend the functionality of SpriteSpin.
   * @type {object}
   */
  Spin.mods = {};

  /**
   * Default set of SpriteSpin options. This also represents the majority of data attributes that are used during the
   * lifetime of a SpriteSpin instance. The data is stored inside the target DOM element on which the plugin is called.
   * @type {object}
   */
  Spin.defaults = {
    source            : undefined,    // Stitched source image or array of files
    width             : undefined,    // actual display width
    height            : undefined,    // actual display height
    frames            : undefined,    // Total number of frames
    framesX           : undefined,    // Number of frames in one row of sprite sheet (if source is a spritesheet)
    lanes             : 1,            // Number of 360 sequences. Used for 3D like effect.
    sizeMode          : undefined,    //

    module            : '360',        // The presentation module to use
    behavior          : 'drag',       // The interaction module to use
    renderer          : 'canvas',     // The rendering mode to use

    lane              : 0,            // The initial sequence number to play
    frame             : 0,            // Initial (and current) frame number
    frameTime         : 40,           // Time in ms between updates. 40 is exactly 25 FPS
    animate           : true,         // If true starts the animation on load
    reverse           : false,        // If true animation is played backward
    loop              : true,         // If true loops the animation
    stopFrame         : 0,            // Stops the animation at this frame if loop is disabled

    wrap              : true,         // If true wraps around the frame index on user interaction
    wrapLane          : false,        // If true wraps around the lane index on user interaction
    sense             : 1,            // Interaction sensitivity used by behavior implementations
    senseLane         : undefined,    // Interaction sensitivity used by behavior implementations
    orientation       : 'horizontal', // Preferred axis for user interaction
    detectSubsampling : true,         // Tries to detect whether the images are downsampled by the browser.
    scrollThreshold   : 50,           // Number of pixels the user must drag within a frame to enable page scroll (for touch devices)
    preloadCount      : undefined,    // Number of frames to preload. If nothing is set, all frames are preloaded.

    onInit            : undefined,    // Occurs when plugin has been initialized, but before loading the source files
    onProgress        : undefined,    // Occurs when any source file has been loaded
    onLoad            : undefined,    // Occurs when all source files have been loaded
    onFrame           : undefined,    // Occurs when the frame number has been updated (e.g. during animation)
    onDraw            : undefined     // Occurs when all update is complete and frame can be drawn
  };

  // Internal Helper Functions
  // ----------

  // converts the given number to string and pads it to match at least the given length.
  // The pad value is added in front of the string. This padNumber(4, 5, 0) would convert 4 to '00004'
  function padNumber(num, length, pad){
    num = String(num);
    while (num.length < length){
      num = String(pad) + num;
    }
    return num;
  }

  // clamps the given value by the given min and max values
  function clamp(value, min, max){
    return (value > max ? max : (value < min ? min : value));
  }
  Spin.clamp = clamp;

  function wrap(value, min, max, size){
    while (value > max){ value -= size; }
    while (value < min){ value += size; }
    return value;
  }
  Spin.wrap = wrap;

  // prevents default action on the given event
  function prevent(e){
    e.preventDefault();
    return false;
  }

  function log(){
    if (window.console && window.console.log){
      window.console.log.apply(window.console, arguments);
    }
  }

  // Binds on the given target and event the given function.
  // The SpriteSpin namespace is attached to the event name
  function bind(target, event, func){
    if (func) {
      target.bind(event + '.' + name, func);
    }
  }

  // Unbinds all SpriteSpin events from given target element
  function unbind(target){
    target.unbind('.' + name);
  }

  // Loads a set of image files. Yields the progress and the completion of the load operation.
  function load(opts){
    // convert opts.source to an array of strings
    var src = (typeof opts.source === 'string') ? [opts.source] : opts.source;
    var i, count = 0, img, images = [], targetCount = (opts.preloadCount || src.length);
    var completed = false, firstLoaded = false;
    var tick = function(){
      count += 1;
      if (typeof opts.progress === 'function'){
        opts.progress({
          index: $.inArray(this, images),
          loaded: count,
          total: src.length,
          percent: Math.round((count / src.length) * 100)
        });
      }
      firstLoaded = firstLoaded || (this === images[0]);
      if (!completed && (count >= targetCount) && firstLoaded && (typeof opts.complete === 'function')) {
        completed = true;
        opts.complete(images);
      }
    };
    for (i = 0; i < src.length; i += 1 ) {
      img = new Image();
      images.push(img);
      // currently no care about error or aborting transfers
      img.onload = img.onabort = img.onerror = tick;
      img.src = src[i];
    }
    if (typeof opts.initiated === 'function'){
      opts.initiated(images);
    }
  }

  // Idea taken from https://github.com/stomita/ios-imagefile-megapixel
  // Detects whether the image has been sub sampled by the browser and does not have its original dimensions.
  // This method unfortunately does not work for images that have transparent background.
  function detectSubsampling(img, size) {
    var iw = (size || img).width;
    var ih = (size || img).height;

    // sub sampling happens on images above 1 megapixel
    if (iw * ih <= 1024 * 1024) {
      return false;
    }

    var canvas;
    canvas = document.createElement('canvas');
    if (!canvas || !canvas.getContext){
      return false;
    }

    var context = canvas.getContext('2d');
    if (!context){
      return false;
    }

    // set canvas to 1x1 pixel size and fill it with magenta color
    canvas.width = canvas.height = 1;
    context.fillStyle = "#FF00FF";
    context.fillRect(0, 0, 1, 1);
    // render the image with a negative offset to the left so that it would
    // fill the canvas pixel with the top right pixel of the image.
    context.drawImage(img, -iw + 1, 0);

    // check color value to confirm image is covering edge pixel or not.
    // if color still magenta, the image is assumed to be sub sampled.
    try {
      var dat = context.getImageData(0, 0, 1, 1).data;
      return (dat[0] === 255) && (dat[1] === 0) && (dat[2] === 255);
    }
    catch(err) {
      // avoids cross origin exception for chrome when code runs without a server
      log(err.message, err.stack);
      return false;
    }
  }

  // gets the original width and height of an image element
  function naturalSize(image){
    // for browsers that support naturalWidth and naturalHeight properties
    if (image.naturalWidth != null) {
      return {
        width: image.naturalWidth,
        height: image.naturalHeight
      };
    }

    // browsers that do not support naturalWidth and naturalHeight properties we have to fall back to the width and
    // height properties. However, the image might have a css style applied so width and height would return the
    // css size. We have to create a new Image object that is free of css rules and grab the values from that objet.
    // Here we assume that the src has already been downloaded, so no onload callback is needed.
    var img = new Image();
    img.src = image.src;
    return {
      width: img.width,
      height: img.height
    };
  }

  // Public Helper Functions
  // ----------

  /**
   * Generates an array of source strings
   * - path is a source string where the frame number of the file name is exposed as '{frame}'
   * - start indicates the first frame number
   * - end indicates the last frame number
   * - digits is the number of digits used in the file name for the frame number
   * @example
   *      sourceArray('http://example.com/image_{frame}.jpg, { frame: [1, 3], digits: 2 })
   *      // -> [ 'http://example.com/image_01.jpg', 'http://example.com/image_02.jpg', 'http://example.com/image_03.jpg' ]
   * @param path
   * @param opts
   * @returns {Array}
   */
  Spin.sourceArray = function(path, opts){
    var fStart = 0, fEnd = 0, lStart = 0, lEnd = 0, digits = opts.digits || 2;
    if (opts.frame) {
      fStart = opts.frame[0];
      fEnd = opts.frame[1];
    }
    if (opts.lane) {
      lStart = opts.lane[0];
      lEnd = opts.lane[1];
    }
    var i, j, temp, result = [];
    for (i = lStart; i <= lEnd; i+=1){
      for (j = fStart; j <= fEnd; j+=1){
        temp = path.replace("{lane}", padNumber(i, digits, 0));
        temp = temp.replace("{frame}", padNumber(j, digits, 0));
        result.push(temp);
      }
    }
    return result;
  };

  /**
   * Measures the image frames that are used in the given data object
   * @param {object} data
   */
  Spin.measureSource = function(data){
    var img = data.images[0];
    var size = naturalSize(img);

    if (data.images.length === 1){

      data.sourceWidth = size.width;
      data.sourceHeight = size.height;
      if (data.detectSubsampling && detectSubsampling(img, size)){
        data.sourceWidth /= 2;
        data.sourceHeight /= 2;
      }

      // calculate the number of frames packed in a row
      // assume tightly packed images without any padding pixels
      data.framesX = data.framesX || data.frames;

      // calculate size of a single frame
      if (!data.frameWidth || !data.frameHeight){
        if (data.framesX){
          data.frameWidth = Math.floor(data.sourceWidth / data.framesX);
          var framesY = Math.ceil((data.frames * data.lanes) / data.framesX);
          data.frameHeight = Math.floor(data.sourceHeight / framesY);
        } else {
          data.frameWidth = size.width;
          data.frameHeight = size.height;
        }
      }
    } else {
      data.sourceWidth = data.frameWidth = size.width;
      data.sourceHeight = data.frameHeight = size.height;
      if (detectSubsampling(img, size)){
        data.sourceWidth = data.frameWidth = size.width / 2;
        data.sourceHeight = data.frameHeight = size.height / 2;
      }
      data.frames = data.frames || data.images.length;
    }
  };

  /**
   * Resets the input state of the SpriteSpin data.
   * @param {object} data
   */
  Spin.resetInput = function(data){
    data.startX = data.startY = undefined;      // initial touch/click position
    data.currentX = data.currentY = undefined;  // touch/click position in current frame
    data.oldX = data.oldY = undefined;          // touch/click position in last frame
    data.dX = data.dY = data.dW = 0;            // drag direction from start to current frame
    data.ddX = data.ddY = data.ddW = 0;         // drag direction from previous to current frame
  };

  /**
   * Updates the input state of the SpriteSpin data using the given mouse or touch event.
   * @param {*} e
   * @param {object} data
   */
  Spin.updateInput = function(e, data){
    // jQuery Event normalization does not preserve the 'event.touches'
    // try to grab touches from the original event
    if (e.touches === undefined && e.originalEvent !== undefined){
      e.touches = e.originalEvent.touches;
    }

    // cache positions from previous frame
    data.oldX = data.currentX;
    data.oldY = data.currentY;

    // get current touch or mouse position
    if (e.touches !== undefined && e.touches.length > 0){
      data.currentX = e.touches[0].clientX || 0;
      data.currentY = e.touches[0].clientY || 0;
    } else {
      data.currentX = e.clientX || 0;
      data.currentY = e.clientY || 0;
    }
    // Fix old position.
    if (data.oldX === undefined || data.oldY === undefined){
      data.oldX = data.currentX;
      data.oldY = data.currentY;
    }

    // Cache the initial click/touch position and store the frame number at which the click happened.
    // Useful for different behavior implementations. This must be restored when the click/touch is released.
    if (data.startX === undefined || data.startY === undefined){
      data.startX = data.currentX;
      data.startY = data.currentY;
      data.clickframe = data.frame;
      data.clicklane = data.lane;
    }

    // Calculate the vector from start position to current pointer position.
    data.dX = data.currentX - data.startX;
    data.dY = data.currentY - data.startY;

    // Calculate the vector from last frame position to current pointer position.
    data.ddX = data.currentX - data.oldX;
    data.ddY = data.currentY - data.oldY;

    // Normalize vectors to range [-1:+1]
    data.ndX = data.dX / data.width;
    data.ndY = data.dY / data.height;

    data.nddX = data.ddX / data.width;
    data.nddY = data.ddY / data.height;
  };

  /**
   * Updates the frame number of the SpriteSpin data. Performs an auto increment if no frame number is given.
   * @param {object} data
   * @param {number} [frame]
   * @param {number} [lane]
   */
  Spin.updateFrame = function(data, frame, lane){

    if (frame !== undefined){
      data.frame = Number(frame);
    } else if (data.animation) {
      data.frame += (data.reverse ? -1 : 1);
    }

    if (data.animation){
      // wrap the frame value to fit in range [0, data.frames]
      data.frame = wrap(data.frame, 0, data.frames - 1, data.frames);
      // stop animation if loop is disabled and the stopFrame is reached
      if (!data.loop && (data.frame === data.stopFrame)){
        Spin.stopAnimation(data);
      }
    } else if (data.wrap){
      // wrap/clamp the frame value to fit in range [0, data.frames]
      data.frame = wrap(data.frame, 0, data.frames - 1, data.frames);
    } else {
      data.frame = clamp(data.frame, 0, data.frames - 1);
    }
    if (lane !== undefined){
      data.lane = lane;
      if (data.wrapLane){
        data.lane = wrap(data.lane, 0, data.lanes - 1, data.lanes);
      } else {
        data.lane = clamp(data.lane, 0, data.lanes - 1);
      }
    }

    data.target.trigger("onFrame", data);
    data.target.trigger("onDraw", data);
  };

  /**
   * Stops the running animation on given SpriteSpin data.
   * @param {object} data
   */
  Spin.stopAnimation = function(data){
    data.animate = false;
    if (data.animation){
      window.clearInterval(data.animation);
      data.animation = null;
    }
  };

  /**
   * Starts animation on given SpriteSpin data if animation is enabled.
   * @param {object} data
   */
  Spin.setAnimation = function(data){
    if (data.animate){
      Spin.requestFrame(data);
    } else {
      Spin.stopAnimation(data);
    }
  };

  Spin.requestFrame = function(data){
    if (data.animation){
      // another frame has been already requested
      return;
    }
    // cache the tick function
    if (data.frameFunction === undefined){
      data.frameFunction = function(){
        try {
          Spin.updateFrame(data);
        } catch(ignore){
          // The try catch block is a hack for Opera Browser
          // Opera sometimes rises an exception here and
          // stops performing the script
        }
      };
    }
    //
    data.animation = window.setInterval(data.frameFunction, data.frameTime);
  };

  /**
   * Replaces module names on given SpriteSpin data and replaces them with actual implementations.
   * @param {object} data
   */
  Spin.setModules = function(data){
    var i, modName, mod;
    for(i = 0; i < data.mods.length; i += 1){
      modName = data.mods[i];
      if (typeof modName === 'string'){
        mod = Spin.mods[modName];
        if (mod){
          data.mods[i] = mod;
        } else {
          $.error("No module found with name " + modName);
        }
      }
    }
  };

  Spin.calculateInnerLayout = function(data){
    // outer container size
    var w = Math.floor(data.width || data.frameWidth || data.target.innerWidth());
    var h = Math.floor(data.height || data.frameHeight || data.target.innerHeight());
    var a = w / h;

    // inner container size
    var w1 = data.frameWidth || w;
    var h1 = data.frameHeight || h;
    var a1 = w1 / h1;

    // resulting layout
    var css = {
      width    : '100%',
      height   : '100%',
      top      : 0,
      left     : 0,
      bottom   : 0,
      right    : 0,
      position : 'absolute',
      overflow : 'hidden'
    };

    // calculate size
    var mode = data.sizeMode;
    if (!mode || mode == 'scale'){
      return css;
    }

    if (mode == 'original') {
      css.width = w1;
      css.height = h1;
    } else if (mode == 'fit') {
      if (a1 >= a) {
        css.width = w;
        css.height = w / a1;
      } else {
        css.height = h;
        css.width = h * a1;
      }
    } else if (mode == 'fill') {
      if (a1 >= a) {
        css.height = h;
        css.width = h * a1;
      } else {
        css.width = w;
        css.height = w / a1;
      }
    }

    css.width = css.width|0;
    css.height = css.height|0;

    // position in center
    css.top = ((h - css.height) / 2)|0;
    css.left = ((w - css.width) / 2)|0;
    css.right = css.left;
    css.bottom = css.top;
    return css;
  };

  /**
   * Applies css attributes to layout the SpriteSpin containers.
   * @param {object} data
   */
  Spin.setLayout = function(data){
    // disable selection
    data.target
      .attr('unselectable', 'on')
      .css({
        '-ms-user-select': 'none',
        '-moz-user-select': 'none',
        '-khtml-user-select': 'none',
        '-webkit-user-select': 'none',
        'user-select': 'none'
      });

    var w = Math.floor(data.width || data.frameWidth || data.target.innerWidth());
    var h = Math.floor(data.height || data.frameHeight || data.target.innerHeight());
    data.target.css({
      width    : w,
      height   : h,
      position : 'relative',
      overflow : 'hidden'
    });

    var css = Spin.calculateInnerLayout(data);
    data.stage.css(css).hide();
    if (data.canvas){
      data.canvas[0].width = w;
      data.canvas[0].height = h;
      data.canvas.css(css).hide();
    }
  };

  /**
   * (re)binds all spritespin events on the target element
   * @param data
   */
  Spin.setEvents = function(data){
    var i, j, mod, target = data.target;

    // Clear all SpriteSpin events on the target element
    unbind(target);

    // disable all default browser behavior on the following events
    // mainly prevents image drag operation
    for (j = 0; j < preventEvents.length; j += 1){
      bind(target, preventEvents[j],  prevent);
    }

    // Bind module functions to SpriteSpin events
    for (i = 0; i < data.mods.length; i += 1){
      mod = data.mods[i];

      for (j = 0; j < modEvents.length; j += 1){
        bind(target, modEvents[j],  mod[modEvents[j]]);
      }

      // bind
      bind(target, 'onInit',     mod.onInit);
      bind(target, 'onProgress', mod.onProgress);
      bind(target, 'onLoad',     mod.onLoad);
      bind(target, 'onFrame',    mod.onFrame);
      bind(target, 'onDraw',     mod.onDraw);
    }

    // bind auto start function to load event.
    bind(target, 'onLoad', function(e, data){
      Spin.setAnimation(data);
    });

    // bind all user events that have been passed on initialization
    bind(target, 'onInit',     data.onInit);
    bind(target, 'onProgress', data.onProgress);
    bind(target, 'onLoad',     data.onLoad);
    bind(target, 'onFrame',    data.onFrame);
    bind(target, 'onDraw',     data.onDraw);
  };

  /**
   * Runs the boot process. (re)creates modules, (re)sets the layout, (re)binds all events and loads source images.
   * @param {object} data
   */
  Spin.boot = function(data){
    Spin.setModules(data);
    Spin.setLayout(data);
    Spin.setEvents(data);
    data.target.addClass('loading').trigger('onInit', data);
    data.loading = true;
    load({
      source: data.source,
      preloadCount: data.preloadCount,
      progress: function(progress){
        data.target.trigger('onProgress', [progress, data]);
      },
      complete: function(images){
        data.images = images;
        data.loading = false;
        Spin.measureSource(data);
        data.stage.show();
        data.target
          .removeClass('loading')
          .trigger('onLoad', data)
          .trigger('onFrame', data)
          .trigger('onDraw', data);
      }
    });
  };

  /**
   * Initializes the target element with spritespin data.
   * @param {object} options
   */
  Spin.create = function(options){
    var $this = options.target;
    var data  = $this.data(name);

    if (!data){
      // SpriteSpin is not initialized
      // Create default settings object and extend with given options
      data = $.extend({}, Spin.defaults, options);

      // ensure that there is anything set as a source
      data.source = data.source || [];

      // if image tags are contained inside this DOM element
      // use these images as the source files
      $this.find('img').each(function(){
        data.source.push($(this).attr('src'));
      });

      // build inner html
      // <div>
      //   <div class='spritespin-stage'></div>
      //   <canvas class='spritespin-canvas'></canvas>
      // </div>
      $this
        .empty()
        .addClass("spritespin-instance")
        .append("<div class='spritespin-stage'></div>");

      // add the canvas element if canvas rendering is enabled and supported
      if (data.renderer === 'canvas'){
        var canvas = $("<canvas class='spritespin-canvas'></canvas>")[0];
        if (!!(canvas.getContext && canvas.getContext('2d'))){
          data.canvas = $(canvas);
          data.context = canvas.getContext("2d");
          $this.append(data.canvas);
          $this.addClass('with-canvas');
        } else {
          // fallback to image rendering mode
          data.renderer = 'image';
        }
      }

      // setup references to DOM elements
      data.target = $this;
      data.stage = $this.find(".spritespin-stage");

      // store the data
      $this.data(name, data);
    } else {
      // just update the data object
      $.extend(data, options);
    }

    // convert string source to array of strings
    if (typeof data.source === 'string'){
      data.source = [data.source];
    }

    // behavior and module attributes tell us what additional modules must be loaded.
    if (data.mods){
      delete data.behavior;
      delete data.module;
    }
    if (data.behavior || data.module){
      data.mods = [];
      if (data.behavior){
        data.mods.push(data.behavior);
      }
      if (data.module){
        data.mods.push(data.module);
      }

      delete data.behavior;
      delete data.module;
    }

    Spin.boot(data);
  };

  /**
   * Stops running animation, unbinds all events and deletes the data on the target element of the given data object.
   * @param {object} data The spritespin data object.
   */
  Spin.destroy = function(data){
    if (data){
      Spin.stopAnimation(data);
      unbind(data.target);
      data.target.removeData(name);
    }
  };

  /**
   * Registers a module implementation as an available extension to SpriteSpin.
   * Use this to add custom Rendering or Updating modules that can be addressed with the 'module' option.
   * @param {string} name the name of the module
   * @param {object} [module] the module implementation
   * @returns {object} the given module
   */
  Spin.registerModule = function(name, module){
    if (Spin.mods[name]){
      $.error('Module name is already taken: ' + name);
    }
    module = module || {};
    Spin.mods[name] = module;
    return module;
  };

  /**
   *
   * @param data
   * @class SpriteSpin.Api
   * @constructor
   */
  Spin.Api = function(data){
    this.data = data;
  };

  /**
   * Helper method that allows to extend the api with more methods.
   * Receives an object with named functions that are extensions to the API.
   * @param methods
   * @returns {SpriteSpin.Api.prototype}
   */
  Spin.extendApi = function(methods){
    var key, api = Spin.Api.prototype;
    for(key in methods) {
      if (methods.hasOwnProperty(key)) {
        if (api[key]){
          $.error('API method is already defined: ' + key);
        } else {
          api[key] = methods[key];
        }
      }
    }
    return api;
  };

  /**
   * Instantiates or updates already created instances of SpriteSpin on the nodes in target
   * @param {object|string} obj
   * @param {*} [value]
   * @returns {*}
   */
  $.fn.spritespin = function(obj, value) {
    if (obj === "data"){
      return this.data(name);
    }
    if (obj === "api"){
      var data = this.data(name);
      data.api = data.api || new Spin.Api(data);
      return data.api;
    }
    if (obj === "destroy"){
      return $(this).each(function(){
        Spin.destroy($(this).data(name));
      });
    }
    if (arguments.length === 2 && typeof obj === 'string'){
      var tmp = {};
      tmp[obj] = value;
      obj = tmp;
    }
    if (typeof obj === 'object') {
      obj.target = obj.target || $(this);
      Spin.create(obj);
      return obj.target;
    }

    return $.error( 'Invalid call to spritespin' );
  };

}(window.jQuery || window.Zepto || window.$));
