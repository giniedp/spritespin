(function ($) {
  "use strict";

  // https://github.com/sindresorhus/screenfull.js/blob/gh-pages/src/screenfull.js
  var fn = (function () {
    var val;
    var valLength;

    var fnMap = [
      [
        'requestFullscreen',
        'exitFullscreen',
        'fullscreenElement',
        'fullscreenEnabled',
        'fullscreenchange',
        'fullscreenerror'
      ],
      // new WebKit
      [
        'webkitRequestFullscreen',
        'webkitExitFullscreen',
        'webkitFullscreenElement',
        'webkitFullscreenEnabled',
        'webkitfullscreenchange',
        'webkitfullscreenerror'

      ],
      // old WebKit (Safari 5.1)
      [
        'webkitRequestFullScreen',
        'webkitCancelFullScreen',
        'webkitCurrentFullScreenElement',
        'webkitCancelFullScreen',
        'webkitfullscreenchange',
        'webkitfullscreenerror'

      ],
      [
        'mozRequestFullScreen',
        'mozCancelFullScreen',
        'mozFullScreenElement',
        'mozFullScreenEnabled',
        'mozfullscreenchange',
        'mozfullscreenerror'
      ],
      [
        'msRequestFullscreen',
        'msExitFullscreen',
        'msFullscreenElement',
        'msFullscreenEnabled',
        'MSFullscreenChange',
        'MSFullscreenError'
      ]
    ];

    var i = 0;
    var l = fnMap.length;
    var ret = {};

    for (; i < l; i++) {
      val = fnMap[i];
      if (val && val[1] in document) {
        for (i = 0, valLength = val.length; i < valLength; i++) {
          ret[fnMap[0][i]] = val[i];
        }
        return ret;
      }
    }

    return false;
  })();

  function requestFullscreen(e){
    e = e || document.documentElement;
    e[fn.requestFullscreen]();
  }

  function exitFullscreen(){
    return document[fn.exitFullscreen]();
  }

  function fullscreenEnabled(){
    return document[fn.fullscreenEnabled];
  }

  function fullscreenElement(){
    return document[fn.fullscreenElement];
  }

  function isFullscreen(){
    return !!fullscreenElement();
  }

  var changeEvent = fn.fullscreenchange + '.' + SpriteSpin.namespace + '-fullscreen';
  function unbindChangeEvent(){
    $(document).unbind(changeEvent);
  }

  function bindChangeEvent(callback){
    unbindChangeEvent();
    $(document).bind(changeEvent, callback);
  }

  var orientationEvent = 'orientationchange.' + SpriteSpin.namespace + '-fullscreen';
  function unbindOrientationEvent() {
    $(window).unbind(orientationEvent)
  }
  function bindOrientationEvent(callback) {
    unbindOrientationEvent()
    $(window).bind(orientationEvent, callback);
  }

  SpriteSpin.extendApi({
    fullscreenEnabled: fullscreenEnabled,
    fullscreenElement: fullscreenElement,
    exitFullscreen: exitFullscreen,
    toggleFullscreen: function(opts){
      if (isFullscreen()) {
        this.requestFullscreen(opts)
      } else {
        this.exitFullscreen()
      }
    },
    requestFullscreen: function(opts){
      opts = opts || {};
      var api = this;
      var data = api.data;
      var oWidth = data.width;
      var oHeight = data.height;
      var oSource = data.source;
      var oSize = data.sizeMode;
      var oResponsive = data.responsive;
      var enter = function() {
        data.width = window.screen.width;
        data.height = window.screen.height;
        data.source = opts.source || oSource;
        data.sizeMode = opts.sizeMode || 'fit';
        data.responsive = false;
        SpriteSpin.boot(data);
      }
      var exit = function() {
        data.width = oWidth;
        data.height = oHeight;
        data.source = oSource;
        data.sizeMode = oSize;
        data.responsive = oResponsive;
        SpriteSpin.boot(data);
      }

      bindChangeEvent(function(){
        if (isFullscreen()){
          enter();
          bindOrientationEvent(enter);
        } else {
          unbindChangeEvent();
          unbindOrientationEvent();
          exit();
        }
      });
      requestFullscreen(data.target[0]);
    }
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
