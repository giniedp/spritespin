(function ($, SpriteSpin) {
  "use strict";

  var floor = Math.floor;

  SpriteSpin.registerModule('panorama', {

    onLoad: function(e, data){
      data.stage.empty().show();
      data.frames = data.sourceWidth;
      if (data.orientation === "horizontal"){
        data.scale = data.height / data.sourceHeight;
        data.frames = data.sourceWidth;
      } else {
        data.scale = data.width / data.sourceWidth;
        data.frames = data.sourceHeight;
      }
      var w = floor(data.sourceWidth * data.scale);
      var h = floor(data.sourceHeight * data.scale);
      var background = [w, "px ", h, "px"].join("");
      data.stage.css({
        "background-image"        : ["url('", data.source[0], "')"].join(""),
        "background-repeat"       : "repeat-both",
        // set custom background size to enable responsive rendering
        "-webkit-background-size" : background, /* Safari 3-4 Chrome 1-3 */
        "-moz-background-size"    : background, /* Firefox 3.6 */
        "-o-background-size"      : background, /* Opera 9.5 */
        "background-size"         : background  /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
      });
    },

    // The function was stripped to do only necessary CSS updates
    onDraw: function(e, data){
      var x = 0, y = 0;
      if (data.orientation === "horizontal"){
        x = -floor((data.frame % data.frames) * data.scale);
      } else {
        y = -floor((data.frame % data.frames) * data.scale);
      }
      data.stage.css({
        "background-position" : [x, "px ", y, "px"].join("")
      });
    }
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));