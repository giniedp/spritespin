(function ($, SpriteSpin) {
  "use strict";

  var floor = Math.floor;

  function drawSprite(data){
    var index = data.lane * data.frames + data.frame;

    var x = data.frameWidth * (index % data.framesX);
    var y = data.frameHeight * floor(index / data.framesX);

    if (data.renderer === 'canvas'){
      var w = data.canvas[0].width / data.canvasRatio;
      var h = data.canvas[0].height / data.canvasRatio;
      data.context.clearRect(0, 0, w, h);
      data.context.drawImage(data.images[0], x, y, data.frameWidth, data.frameHeight, 0, 0, w, h);
      return;
    }

    x = -floor(x * data.scaleWidth);
    y = -floor(y * data.scaleHeight);

    if (data.renderer === 'background') {
      data.stage.css({
        "background-image"    : ["url('", data.source[0], "')"].join(""),
        "background-position" : [x, "px ", y, "px"].join("")
      });
    } else {
      $(data.images).css({ top: y, left: x, "max-width" : 'initial' });
    }
  }

  function drawFrames(data){
    var index = data.lane * data.frames + data.frame;

    var img = data.images[index];
    if (data.renderer === 'canvas'){
      if (img && img.complete !== false){
        var w = data.canvas[0].width / data.canvasRatio;
        var h = data.canvas[0].height / data.canvasRatio;
        data.context.clearRect(0, 0, w, h);
        data.context.drawImage(img, 0, 0, w, h);
      }
    } else if (data.renderer === 'background') {
      data.stage.css({
        "background-image" : ["url('", data.source[index], "')"].join(""),
        "background-position" : [0, "px ", 0, "px"].join("")
      });
    } else {
      $(data.images).hide();
      $(data.images[index]).show();
    }
  }

  SpriteSpin.registerModule('360', {

    onLoad: function(e, data){
      var w, h;

      // calculate scaling if we are in responsive mode
      if (data.width && data.frameWidth) {
        data.scaleWidth = data.width / data.frameWidth;
      } else {
        data.scaleWidth = 1;
      }
      if (data.height && data.frameHeight) {
        data.scaleHeight = data.height / data.frameHeight;
      } else {
        data.scaleHeight = 1;
      }

      // assume that the source is a spritesheet, when there is only one image given
      data.sourceIsSprite = data.images.length === 1;

      // clear and enable the stage container
      data.stage.empty().css({ "background-image" : 'none' }).show();

      if (data.renderer === 'canvas')
      {
        var w = data.canvas[0].width / data.canvasRatio;
        var h = data.canvas[0].height / data.canvasRatio;
        data.context.clearRect(0, 0, w, h);
        data.canvas.show();
      }
      else if (data.renderer === 'background')
      {
        // prepare rendering frames as background images

        if (data.sourceIsSprite){
          w = floor(data.sourceWidth * data.scaleWidth);
          h = floor(data.sourceHeight * data.scaleHeight);
        } else {
          w = floor(data.frameWidth * data.scaleWidth);
          h = floor(data.frameHeight * data.scaleHeight);
        }
        var background = [w, "px ", h, "px"].join("");

        data.stage.css({
          "background-repeat"   : "no-repeat",
          // set custom background size to enable responsive rendering
          "-webkit-background-size" : background, /* Safari 3-4 Chrome 1-3 */
          "-moz-background-size"    : background, /* Firefox 3.6 */
          "-o-background-size"      : background, /* Opera 9.5 */
          "background-size"         : background  /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
        });
      }
      else if (data.renderer === 'image')
      {
        // prepare rendering frames as image elements
        if (data.sourceIsSprite){
          w = floor(data.sourceWidth * data.scaleWidth);
          h = floor(data.sourceHeight * data.scaleHeight);
        } else {
          w = h = '100%';
        }
        $(data.images).appendTo(data.stage).css({
          width: w,
          height: h,
          position: 'absolute'
        });
      }
    },

    onDraw: function(e, data){
      if (data.sourceIsSprite){
        drawSprite(data);
      } else{
        drawFrames(data);
      }
    }
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
