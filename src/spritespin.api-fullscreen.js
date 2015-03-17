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

  var SpriteSpin = window.SpriteSpin;
  var changeEvent = fn.fullscreenchange + '.' + SpriteSpin.namespace;

  function unbindChangeEvent(){
    $(document).unbind(changeEvent);
  }

  function bindChangeEvent(callback){
    unbindChangeEvent();
    $(document).bind(changeEvent, callback);
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
      bindChangeEvent(function(){
        if (isFullscreen()){
          // ENTER
          data.width = window.screen.width;
          data.height = window.screen.height;
          data.source = opts.source || oSource;
          SpriteSpin.boot(data);
        } else {
          // EXIT
          unbindChangeEvent();
          data.width = oWidth;
          data.height = oHeight;
          data.source = oSource;
          SpriteSpin.boot(data);
        }
      });
      requestFullscreen(data.target[0]);
    }
  });

}(window.jQuery || window.Zepto || window.$));
